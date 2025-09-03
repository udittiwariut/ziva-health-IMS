const express = require('express');
const orderController = require('../controllers/order.controller');

const orderValidation = require('../validations/order.validation');
const validate = require('../middlewares/validate');

const router = express.Router();

router.route('/').post(validate(orderValidation.createOrder), orderController.createOrder);

module.exports = router;
