const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOrder = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
};

const updateOrderStatus = {
  params: Joi.object().keys({
    orderId: Joi.required().custom(objectId),
  }),
  query: Joi.object().keys({
    status: Joi.string().valid('confirmed', 'cancelled').required(),
  }),
};

const getOrderDetailById = {
  params: Joi.object().keys({
    orderId: Joi.required().custom(objectId),
  }),
};

const getOrderStatus = {
  params: Joi.object().keys({
    id: Joi.required(),
  }),
};

const getUserOrder = {
  params: Joi.object().keys({
    userId: Joi.required(),
  }),
};
module.exports = {
  createOrder,
  updateOrderStatus,
  getOrderDetailById,
  getOrderStatus,
  getUserOrder,
};
