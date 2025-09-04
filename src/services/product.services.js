const httpStatus = require('http-status');
const { Products, Categories } = require('../models');
const ApiError = require('../utils/ApiError');
const convertToObjectId = require('../utils/convertToObjectId');

const queryProducts = async (filter, options = undefined) => {
  const products = await Products.find(filter);

  return products;
};

const createProduct = async (productBody) => {
  const categoryId = await Categories.getCategoryIdFromName(productBody.categoryName);

  if (!categoryId) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid Category Name`);
  }
  if (await Products.isDuplicateSku(productBody.sku)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `SKU '${productBody.sku}' already exists. Please use a unique SKU.`);
  }
  const product = new Products({
    name: productBody.name.trim(),
    sku: productBody.sku.trim(),
    price: Number(productBody.price),
    stock_quantity: productBody.stock_quantity,
    category_id: categoryId,
  });

  const savedProduct = await product.save();
  return savedProduct;
};

const getProductById = async (id) => {
  const productId = convertToObjectId(id);
  if (!productId) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Order Id');
  return Products.findById(productId);
};

const updateProduct = async (productId, updateBody, session = null) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product not found');
  }
  if (updateBody.sku && (await Products.isDuplicateSku(updateBody.sku, productId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, `SKU '${updateBody.sku}' already exists. Please use a unique SKU.`);
  }
  if (updateBody.categoryName) {
    const categoryId = await Categories.getCategoryIdFromName(updateBody.categoryName);
    if (!categoryId) throw new ApiError(httpStatus.BAD_REQUEST, `Invalid Category Name`);
    // eslint-disable-next-line no-param-reassign
    updateBody.category_id = categoryId;
  }

  Object.assign(product, updateBody);
  const savedProduct = await product.save({ session });
  return savedProduct;
};

const queryLowStockProduct = async () => {
  const products = await Products.find({ stock_quantity: { $lt: 10 } });
  return products;
};

const updateStock = async (productId, updateStockBody) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product not found');
  }

  Object.assign(product, updateStockBody);
  const savedProduct = await product.save();
  return savedProduct;
};

module.exports = {
  queryProducts,
  getProductById,
  createProduct,
  updateProduct,
  queryLowStockProduct,
  updateStock,
};
