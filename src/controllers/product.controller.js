const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const {
  queryProducts,
  createProduct,
  updateProduct,
  queryLowStockProduct,
  updateStock,
} = require('../services/product.services');
const convertToObjectId = require('../utils/convertToObjectId');
const { Categories } = require('../models');

const getProducts = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['search', 'category', 'minPrice', 'maxPrice']);

  const query = {};

  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }

  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }

  if (filters.category) {
    const category_id = await Categories.findOne({ name: filters.category }, { category_id: 1 });
    query.category_id = category_id;
  }

  const products = await queryProducts(query);

  res.send(products);
});

const createNewProduct = catchAsync(async (req, res) => {
  const product = await createProduct(req.body);

  res.status(httpStatus.CREATED).send(product);
});

const updateProductById = catchAsync(async (req, res) => {
  const product = await updateProduct(req.params.id, req.body);

  res.send(product);
});

const getLowStockProducts = catchAsync(async (req, res) => {
  const product = await queryLowStockProduct();

  res.send(product);
});

const updateProductStock = catchAsync(async (req, res) => {
  const product = await updateStock(req.params.id, req.body);

  res.send(product);
});

module.exports = {
  getProducts,
  createNewProduct,
  updateProductById,
  getLowStockProducts,
  updateProductStock,
};
