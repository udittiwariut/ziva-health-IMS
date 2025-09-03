const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOrder = {
  body: Joi.object({
    user_id: Joi.string().required().custom(objectId).messages({
      'any.required': 'user_id is required',
    }),

    total: Joi.number().positive().precision(2).required().messages({
      'number.base': 'Total must be a number',
      'number.positive': 'Total must be greater than 0',
      'any.required': 'Total amount is required',
    }),

    status: Joi.string().valid('pending', 'confirmed', 'cancelled').default('pending').messages({
      'any.only': 'Status must be one of [pending, confirmed, cancelled]',
    }),
  }),
};

module.exports = {
  createOrder,
};
