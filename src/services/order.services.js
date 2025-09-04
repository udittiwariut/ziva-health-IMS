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

const createNewOrder = async (userId) => {
  if (!Users.isValidUserId(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid User Id');
  }
  const user = await Users.findOne({ _id: convertToObjectId(userId) });
  if (user.cart.length === 0) throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is Empty');

  await purchaseQueue.add('placeOrder', { userId }, { removeOnComplete: true, removeOnFail: true });
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
  await Promise.all[
    Orders.updateOne(
      { _id: convertToObjectId(orderId) },
      { $set: { status: 'cancelled' } },
      updateProductStock(orderId, 'restock')
    )
  ];
};

// id can be userId or OrderId

module.exports = {
  getOrderById,
  createNewOrder,
  updateProductStock,
  fullFillOrder,
  cancelOrder,
};
