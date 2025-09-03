const httpStatus = require('http-status');
const { Orders, Users } = require('../models');
const ApiError = require('../utils/ApiError');
const convertToObjectId = require('../utils/convertToObjectId');
const covertToFlot = require('../utils/covertToFlot');

const getOrderById = async (id) => {
  const orderId = convertToObjectId(id);
  if (!orderId) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Order Id');
  return Orders.findById(orderId);
};

const createNewOrder = async (productBody) => {
  if (!Users.isValidUserId(productBody.user_id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid User Id');
  }
  const order = new Orders({
    user_id: convertToObjectId(productBody.user_id),
    total: covertToFlot(productBody.total),
  });

  const savedOrder = await order.save();
  return savedOrder;
};
module.exports = {
  getOrderById,
  createNewOrder,
};
