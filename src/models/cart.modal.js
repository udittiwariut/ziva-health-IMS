const mongoose = require('mongoose');

const { toJSON } = require('./plugins/index');

const cartItemSchema = mongoose.Schema(
  {
    user_id: { type: mongoose.Types.ObjectId, ref: 'Users', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

cartItemSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

function autoPopulateProduct(next) {
  this.populate('product_id');
  next();
}

cartItemSchema.pre('find', autoPopulateProduct);
cartItemSchema.pre('findOne', autoPopulateProduct);

cartItemSchema.plugin(toJSON);

cartItemSchema.post('save', async function (doc, next) {
  await doc.populate('product_id');
  next();
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
