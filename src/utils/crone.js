const cron = require('node-cron');
const { queryLowStockProduct } = require('../services/product.services');
const { sendLowStockEmail } = require('./mailHelper');

cron.schedule('0 0 * * *', async () => {
  try {
    const lowStockProducts = await queryLowStockProduct();
    await sendLowStockEmail('udittiwariut1211@gmail.com', lowStockProducts);
  } catch (err) {
    console.error('Error in cleanup job:', err);
  }
});
