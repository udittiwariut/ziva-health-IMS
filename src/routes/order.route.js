const express = require('express');
const orderController = require('../controllers/order.controller');

const orderValidation = require('../validations/order.validation');
const validate = require('../middlewares/validate');

const router = express.Router();

router
  .route('/:userId')
  .post(validate(orderValidation.createOrder), orderController.createOrder)
  .get(validate(orderValidation.getUserOrder), orderController.getUserOrder);

router.route('/:orderId/status').put(validate(orderValidation.updateOrderStatus), orderController.updateOrderStatus);
router.route('/:id/order-status').get(validate(orderValidation.getOrderStatus), orderController.getOrderStatus);

module.exports = router;
