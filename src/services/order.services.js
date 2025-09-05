const httpStatus = require('http-status');
const { Orders, Users, OrderItems, CartItem } = require('../models');
const ApiError = require('../utils/ApiError');
const convertToObjectId = require('../utils/convertToObjectId');
const { updateProduct } = require('./product.services');
const { purchaseQueue } = require('../utils/purchaseQueue');

const getOrderById = async (id) => {
  const orderId = convertToObjectId(id);
  if (!orderId) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Order Id');
  return Orders.findById(orderId);
};

const fetchUserOrder = async (userId, status) => {
  if (!Users.isValidUserId(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid User Id');
  }

  const orderDocs = await Orders.find({ user_id: convertToObjectId(userId), status: status.toLowerCase() }, { _id: 1 });

  const orderIds = orderDocs.map((doc) => doc._id);

  const orders = await OrderItems.aggregate([
    {
      $match: {
        order_id: { $in: orderIds },
        isDeleted: false,
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $addFields: {
        taxRate: 0.12,
        itemTotalWithoutTax: { $multiply: ['$quantity', '$price_at_time'] },
      },
    },
    {
      $addFields: {
        itemTotalWithTax: {
          $multiply: ['$itemTotalWithoutTax', { $add: [1, '$taxRate'] }],
        },
      },
    },
    {
      $project: {
        _id: 1,
        quantity: 1,
        product_id: 1,
        order_id: 1,
        price_at_time: 1,
        'product.name': 1,
        'product.sku': 1,
        itemTotalWithoutTax: 1,
        itemTotalWithTax: 1,
        taxRate: 1,
        createdAt: 1,
      },
    },
    {
      $group: {
        _id: '$order_id',
        items: { $push: '$$ROOT' },
        totalPriceWithoutTax: { $sum: '$itemTotalWithoutTax' },
        totalPriceWithTax: { $sum: '$itemTotalWithTax' },
        taxRate: { $first: '$taxRate' },
        orderDate: { $first: '$createdAt' },
      },
    },
    {
      $addFields: {
        orderStatus: status,
        itemsCount: { $size: '$items' },
      },
    },
    { $sort: { orderDate: -1 } },
  ]);

  return orders;
};

const createNewOrder = async (userId) => {
  if (!Users.isValidUserId(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid User Id');
  }
  const user = await Users.findOne({ _id: convertToObjectId(userId) });
  if (user.cart.length === 0) throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is Empty');

  const job = await purchaseQueue.add('placeOrder', { userId }, { removeOnComplete: 60 * 10, removeOnFail: 60 * 10 });
  return job.id;
};

const fullFillOrder = async (orderId) => {
  await Orders.updateOne({ _id: convertToObjectId(orderId) }, { $set: { status: 'confirmed' } });
};

const updateProductStock = async (id, action = 'reserve', session = null) => {
  const aggregateCond = [];
  let collection;
  if (action === 'reserve') {
    collection = CartItem;
    aggregateCond.push({
      $match: {
        user_id: convertToObjectId(id),
        isDeleted: false,
      },
    });
  } else {
    collection = OrderItems;
    aggregateCond.push({
      $match: {
        order_id: convertToObjectId(id),
        isDeleted: false,
      },
    });
  }

  const cartItems = await collection.aggregate([
    ...aggregateCond,
    {
      $lookup: {
        from: 'products',
        localField: 'product_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        _id: 1,
        quantity: 1,
        product_id: 1,
        'product.stock_quantity': 1,
      },
    },
  ]);

  if (!cartItems.length) {
    throw new Error('No order found');
  }

  const updates = cartItems.map((cartItem) => {
    let newStock;

    if (action === 'reserve') {
      newStock = cartItem.product.stock_quantity - cartItem.quantity;
    } else if (action === 'restock') {
      newStock = cartItem.product.stock_quantity + cartItem.quantity;
    } else {
      throw new Error("Invalid action. Use 'reserve' or 'restock'");
    }

    return updateProduct(
      cartItem.product_id,
      {
        stock_quantity: newStock,
      },
      session
    );
  });

  await Promise.all(updates);
};

const cancelOrder = async (orderId) => {
  await Promise.all([
    Orders.updateOne({ _id: convertToObjectId(orderId) }, { $set: { status: 'cancelled' } }),
    updateProductStock(orderId, 'restock'),
  ]);
};

const checkOrderStatus = async (jobId) => {
  const job = await purchaseQueue.getJob(jobId);

  if (!job) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order Not Found');
  }

  const state = await job.getState();
  if (state === 'completed') {
    return { status: state, message: 'Order Placed Successfully', orderId: job.returnvalue.id };
  }

  if (state === 'failed') {
    throw new ApiError(httpStatus.BAD_REQUEST, job.failedReason);
  }

  return { status: state, message: 'Please wait order is processing' };
};

module.exports = {
  getOrderById,
  createNewOrder,
  updateProductStock,
  fullFillOrder,
  cancelOrder,
  checkOrderStatus,
  fetchUserOrder,
};
