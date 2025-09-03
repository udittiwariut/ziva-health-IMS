const mongoose = require('mongoose');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { toJSON, paginate } = require('./plugins/index');

const categoriesSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
});

categoriesSchema.statics.getCategoryIdFromName = async function (categoryName) {
  const category = await this.findOne({ name: categoryName.trim() }).lean();
  if (!category) throw new ApiError(httpStatus.BAD_REQUEST, `Invalid Category`);
  return category._id;
};
categoriesSchema.plugin(toJSON);
categoriesSchema.plugin(paginate);

const CategoriesSchema = mongoose.model('Categories', categoriesSchema);

module.exports = CategoriesSchema;
