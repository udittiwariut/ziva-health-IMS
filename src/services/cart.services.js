const httpStatus = require('http-status');
const { CartItem, Users } = require('../models');
const ApiError = require('../utils/ApiError');
const convertToObjectId = require('../utils/convertToObjectId');
const { getProductById } = require('./product.services');

const queryCartItem = async (userId) => {
  try {
    const isValidUserId = await Users.isValidUserId(userId);

    if (!isValidUserId) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid User Id`);
    }

    const cartItems = await CartItem.aggregate([
      {
        $match: {
          user_id: convertToObjectId(userId),
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
          itemTotalWithoutTax: { $multiply: ['$quantity', '$product.price'] },
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
          'product.stock_quantity': 1,
          'product.price': 1,
          'product.name': 1,
          'product.sku': 1,
          itemTotalWithoutTax: 1,
          itemTotalWithTax: 1,
          taxRate: 1,
        },
      },
      {
        $group: {
          _id: null,
          items: { $push: '$$ROOT' },
          totalPriceWithoutTax: { $sum: '$itemTotalWithoutTax' },
          totalPriceWithTax: { $sum: '$itemTotalWithTax' },
          taxRate: { $first: '$taxRate' },
        },
      },
      {
        $addFields: {
          itemsCount: { $size: '$items' },
        },
      },
    ]);

    const formatedRes = cartItems[0];

    const obj = {
      items: [],
      totalPriceWithoutTax: 0,
      totalPriceWithTax: 0,
      taxRate: 0,
    };

    if (formatedRes) {
      obj['items'] = formatedRes.items;
      obj['totalPriceWithTax'] = formatedRes.totalPriceWithTax;
      obj['totalPriceWithoutTax'] = formatedRes.totalPriceWithoutTax;
      obj['taxRate'] = formatedRes.taxRate;
    }

    return obj;
  } catch (error) {
    console.log(error);
  }
};

const getCartItem = async (userId, productId) => {
  return CartItem.findOne({
    user_id: convertToObjectId(userId),
    product_id: convertToObjectId(productId),
    isDeleted: false,
  });
};

const addItemToUserCartArray = async (userId, cartItemId) => {
  return Users.findByIdAndUpdate(userId, { $push: { cart: cartItemId } });
};

const removeItem = async (userId, cartItemId) => {
  const filter = {
    _id: convertToObjectId(cartItemId),
    isDeleted: false,
  };

  const update = { $set: { isDeleted: true } };

  const cartRes = await CartItem.updateOne(filter, update);

  if (cartRes.matchedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found or already removed');
  }

  await Users.findByIdAndUpdate(userId, { $pull: { cart: convertToObjectId(cartItemId) } });

  return { removed: true, cartItemId };
};

const updateCartItem = async (userId, productId, qtyChange) => {
  const isValidUserId = await Users.isValidUserId(userId);
  if (!isValidUserId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid User Id');
  }

  const cartItem = await getCartItem(userId, productId);
  if (!cartItem) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart item not found');
  }

  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product not found');
  }

  const newQty = cartItem.quantity + qtyChange;

  if (newQty <= 0) {
    await removeItem(userId, cartItem.id);
    return { removed: true, productId };
  }

  if (newQty > product.stock_quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Stock unavailable for ${product.name}`);
  }

  cartItem.quantity = newQty;
  await cartItem.save();

  return cartItem;
};

const addToCart = async (userId, productId) => {
  const cartItems = await getCartItem(userId, productId);
  const product = await getProductById(productId);

  if (!product) throw new ApiError(httpStatus.BAD_REQUEST, 'Product not found');

  if (cartItems) {
    await updateCartItem(userId, productId, 1);
    return { message: 'Item Quantity Increase' };
  }

  if (product.stock_quantity === 0) throw new ApiError(httpStatus.BAD_REQUEST, `Stock Un-available ${product.name}`);

  const cartItem = new CartItem({
    quantity: 1,
    product_id: product.id,
    user_id: convertToObjectId(userId),
  });

  await cartItem.save();

  await addItemToUserCartArray(userId, cartItem._id);

  return { message: 'Item Added to Cart' };
};

module.exports = {
  queryCartItem,
  updateCartItem,
  removeItem,
  addToCart,
};
