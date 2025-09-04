const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins/index');
const convertToObjectId = require('../utils/convertToObjectId');

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    stock_quantity: { type: Number, required: true, default: 0 },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categories', required: true },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

productSchema.statics.isDuplicateSku = async function (sku, excludeUserId) {
  const query = { sku: sku.trim() };

  if (excludeUserId) {
    query._id = { $ne: convertToObjectId(excludeUserId) };
  }

  const product = await this.findOne(query);
  return !!product;
};

productSchema.plugin(toJSON);
productSchema.plugin(paginate);

// productSchema.options.toJSON.transform = function (doc, ret) {
//   // keep changes from base plugin
//   if (ret.category_id) {
//     ret.category = ret.category_id;
//     delete ret.category_id;
//   }
//   return ret;
// };

function autoPopulateCategory(next) {
  this.populate('category_id');
  next();
}

productSchema.pre('find', autoPopulateCategory);
productSchema.pre('findOne', autoPopulateCategory);
productSchema.pre('findOneAndUpdate', autoPopulateCategory);

productSchema.post('save', async function (doc, next) {
  await doc.populate('category_id');
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
