const mongoose = require('mongoose');
const { toJSON } = require('./plugins/index');

const ordersSchema = mongoose.Schema(
  {
    user_id: { type: mongoose.Types.ObjectId, ref: 'Users', required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ordersSchema.plugin(toJSON);

const OrdersSchema = mongoose.model('Orders', ordersSchema);

module.exports = OrdersSchema;
