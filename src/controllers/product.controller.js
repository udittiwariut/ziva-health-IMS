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

const getProducts = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['name', 'price', 'category_id', 'minPrice', 'maxPrice']);

  const query = {};

  if (filters.name) {
    query.name = { $regex: filters.name, $options: 'i' };
  }

  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = filters.minPrice;
    if (filters.maxPrice) query.price.$lte = filters.maxPrice;
  }

  if (filters.category_id) {
    query.category_id = convertToObjectId(filters.category_id);
  }

  if (filters.minStock || filters.maxStock) {
    query.stock_quantity = {};
    if (filters.minStock) query.stock_quantity.$gte = filters.minStock;
    if (filters.maxStock) query.stock_quantity.$lte = filters.maxStock;
  }
  const products = await queryProducts(filters, undefined);

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
