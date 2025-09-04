const express = require('express');
const orderController = require('../controllers/order.controller');

const orderValidation = require('../validations/order.validation');
const validate = require('../middlewares/validate');

const router = express.Router();

router.route('/:userId').post(validate(orderValidation.createOrder), orderController.createOrder);

router.route('/:orderId/status').put(validate(orderValidation.updateOrderStatus), orderController.updateOrderStatus);
router.route('/:orderId').get(validate(orderValidation.getOrderDetailById), orderController.getOrderDetailById);

module.exports = router;
