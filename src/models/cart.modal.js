const mongoose = require('mongoose');

const { toJSON } = require('./plugins/index');

const cartItemSchema = mongoose.Schema(
  {
    user_id: { type: mongoose.Types.ObjectId, ref: 'Users', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

cartItemSchema.plugin(toJSON);

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
