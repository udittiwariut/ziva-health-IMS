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
      {
        $unwind: '$product',
      },
      {
        $addFields: {
          itemTotal: { $multiply: ['$quantity', '$product.price'] },
        },
      },
      {
        $project: {
          _id: 1,
          quantity: 1,
          product_id: 1,
          'product.stock_quantity': 1,
          'product.price': 1,
          'product.sku': 1,
          itemTotal: 1,
        },
      },
      {
        $group: {
          _id: null,
          items: { $push: '$$ROOT' },
          totalPrice: { $sum: '$itemTotal' },
        },
      },
    ]);

    return cartItems[0];
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

const removeItem = async (userId, productId) => {
  await CartItem.updateOne(
    { user_id: convertToObjectId(userId), product_id: convertToObjectId(productId) },
    { $set: { isDeleted: true } }
  );
  await Users.findByIdAndUpdate(userId, { $pull: { cart: productId } });
};

const updateCartItem = async (userId, productId, qtyChange) => {
  const isValidUserId = await Users.isValidUserId(userId);

  if (!isValidUserId) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid User Id`);
  }

  const cartItems = await getCartItem(userId, productId);

  const product = await getProductById(productId);

  if (!product) throw new ApiError(httpStatus.BAD_REQUEST, 'Product not found');

  if (!cartItems) throw new ApiError(httpStatus.BAD_REQUEST, `CartItem Item Not found`);

  Object.assign(cartItems, { quantity: cartItems.quantity + qtyChange });

  if (cartItems.quantity === 0) {
    await removeItem(userId, productId);
  } else if (cartItems.quantity > product.availableStock)
    throw new ApiError(httpStatus.BAD_REQUEST, `Stock Un-available ${product.name}`);
  else {
    await cartItems.save();
  }

  return cartItems;
};

const addToCart = async (userId, productId) => {
  const cartItems = await getCartItem(userId, productId);
  const product = await getProductById(productId);

  if (!product) throw new ApiError(httpStatus.BAD_REQUEST, 'Product not found');

  if (cartItems) {
    const item = await updateCartItem(userId, productId, 1);
    return item;
  }

  if (product.availableStock === 0) throw new ApiError(httpStatus.BAD_REQUEST, `Stock Un-available ${product.name}`);

  const cartItem = new CartItem({
    quantity: 1,
    product_id: product.id,
    user_id: convertToObjectId(userId),
  });

  const savedItem = await cartItem.save();

  await addItemToUserCartArray(userId, cartItem._id);

  return savedItem;
};

module.exports = {
  queryCartItem,
  updateCartItem,
  removeItem,
  addToCart,
};
