const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProduct = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      'string.empty': 'Product name is required',
      'string.min': 'Product name must be at least 2 characters',
      'any.required': 'Product name is required',
    }),

    sku: Joi.string().trim().min(3).max(50).required().messages({
      'string.empty': 'SKU is required',
      'any.required': 'SKU is required',
    }),

    price: Joi.number().positive().precision(2).required().messages({
      'number.base': 'Price must be a number',
      'number.positive': 'Price must be greater than 0',
      'any.required': 'Price is required',
    }),

    stock_quantity: Joi.number().integer().min(0).default(0).messages({
      'number.base': 'Stock quantity must be a number',
      'number.min': 'Stock quantity cannot be negative',
    }),

    categoryName: Joi.string().required().messages({
      'any.required': 'Category Name is required',
    }),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().trim().min(2).max(100).messages({
      'string.empty': 'Product name is required',
      'string.min': 'Product name must be at least 2 characters',
    }),

    sku: Joi.string().trim().min(3).max(50).messages({
      'string.empty': 'SKU is required',
    }),

    price: Joi.number().positive().precision(2).messages({
      'number.base': 'Price must be a number',
      'number.positive': 'Price must be greater than 0',
    }),

    stock_quantity: Joi.number().integer().min(0).default(0).messages({
      'number.base': 'Stock quantity must be a number',
      'number.min': 'Stock quantity cannot be negative',
    }),
    categoryName: Joi.string(),
  }),
};

const updateProductStock = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    stock_quantity: Joi.number().integer().min(0).default(0).messages({
      'number.base': 'Stock quantity must be a number',
      'number.min': 'Stock quantity cannot be negative',
    }),
  }),
};

module.exports = {
  createProduct,
  updateProduct,
  updateProductStock,
};
