const { Worker } = require('bullmq');
const OrderItems = require('../models/orderItems.model');
const convertToObjectId = require('./convertToObjectId');
const { Orders, Users } = require('../models');
const { updateProductStock } = require('../services/order.services');
const { queryCartItem } = require('../services/cart.services');
const CartItem = require('../models/cart.modal');
const config = require('../config/config');
const { cancelQueue } = require('./purchaseQueue');
const mongoose = require('mongoose');

const DELAY = 10 * 60 * 1000;

const processOrderWorker = new Worker(
  'purchaseQueue',
  async (job) => {
    if (job.name === 'placeOrder') {
      const { userId } = job.data;

      const { items, totalPrice } = await queryCartItem(userId);

      const item = items.find((item) => item.quantity > item.stock);

      if (item) throw new Error(`One or more Products on the cart are out of stock ${item.product.sku}`);

      const newOrder = new Orders({
        user_id: convertToObjectId(userId),
        total: totalPrice,
      });

      const orderItems = items.map((item) => {
        return {
          product_id: item.product_id,
          order_id: newOrder._id,
          price_at_time: item.product.price,
          quantity: item.quantity,
        };
      });

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        await OrderItems.insertMany(orderItems, { session });
        await CartItem.updateMany({ user_id: convertToObjectId(userId) }, { $set: { isDeleted: true } }, { session });
        await newOrder.save({ session });
        await updateProductStock(userId, 'reserve', session);
        await Users.updateOne({ _id: convertToObjectId(userId) }, { $set: { cart: [] } }, { session });
        await session.commitTransaction();

        session.endSession();

        await cancelQueue.add('cancelOrder', { orderId: newOrder._id }, { delay: DELAY });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(`Reject: Error while placing order ${error}.`);
      }
    }
  },
  { connection: config.redis }
);

const timeOutOrderWorker = new Worker(
  'cancelQueue',
  async (job) => {
    if (job.name === 'cancelOrder') {
      const { orderId } = job.data;

      const order = await Orders.findOne({ _id: convertToObjectId(orderId) });
      if (order && order.status === 'pending') {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          await updateProductStock(orderId, 'restock', session);
          await Orders.updateOne({ _id: orderId }, { $set: { isDeleted: true } }, { session });
          await OrderItems.updateMany({ order_id: orderId }, { $set: { isDeleted: true } }, { session });
          console.log('Canaled');

          await session.commitTransaction();
          session.endSession();
        } catch (error) {
          await session.abortTransaction();
          session.endSession();
          throw new Error('Reject: Error while removing pending order .');
        }
      }
    }
  },
  { connection: config.redis }
);

[processOrderWorker, timeOutOrderWorker].forEach((worker) => {
  worker.on('error', (error) => {
    console.log(console.log(error));
  });

  worker.on('completed', (job, err) => {
    console.log(`Yoooooo Job ${job?.id} [${job?.name}] completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`🔥 Job ${job?.id} [${job?.name}] failed:`, err.message);
  });
});

module.exports = {
  timeOutOrderWorker,
  processOrderWorker,
};
