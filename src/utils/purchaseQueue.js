const { Queue } = require('bullmq');
const config = require('../config/config');

const purchaseQueue = new Queue('purchaseQueue', { connection: config.redis });
const cancelQueue = new Queue('cancelQueue', { connection: config.redis });

module.exports = {
  purchaseQueue,
  cancelQueue,
};
