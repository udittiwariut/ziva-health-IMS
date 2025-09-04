const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins/index');

const orderItemsSchema = mongoose.Schema(
  {
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price_at_time: { type: Number, required: true },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

orderItemsSchema.plugin(toJSON);
orderItemsSchema.plugin(paginate);

const OrderItems = mongoose.model('OrderItems', orderItemsSchema);

module.exports = OrderItems;
