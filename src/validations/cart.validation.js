const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getCart = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
};

const updateCart = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
    productId: Joi.required().custom(objectId),
  }),
  query: Joi.object().keys({
    qtyChange: Joi.string().valid('INC', 'DEC').messages({
      'any.only': 'Status must be one of ["INC", "DEC"]',
    }),
  }),
};

const removeItem = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
    productId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  getCart,
  updateCart,
  removeItem,
};
