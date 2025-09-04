const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { updateCartItem, addToCart, queryCartItem, removeItem } = require('../services/cart.services');

const getUserCart = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const cartItem = await queryCartItem(userId);
  if (!cartItem) res.send([]);
  res.send(cartItem);
});

const updateCart = catchAsync(async (req, res) => {
  const { userId, productId } = req.params;
  const query = pick(req.query, ['qtyChange']);
  if (query.qtyChange) {
    const numChange = query.qtyChange === 'INC' ? 1 : -1;
    const item = await updateCartItem(userId, productId, numChange);
    if (item.quantity === 0) {
      res.status(httpStatus.NO_CONTENT);
      return;
    }
    res.send(item);
  } else {
    const newItem = await addToCart(userId, productId);
    if (newItem.quantity === 1) {
      res.status(httpStatus.CREATED).send(newItem);
      return;
    }
    res.send(newItem);
  }
});

const removeItemFromCart = catchAsync(async (req, res) => {
  const { userId, productId } = req.params;

  await removeItem(userId, productId);

  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getUserCart,
  updateCart,
  removeItemFromCart,
};
