const express = require('express');

const validate = require('../middlewares/validate');
const { userIdParams } = require('../validations/user.validation');
const { getOrders, getCartItemCount } = require('../controllers/user.controller');

const router = express.Router();

router.route('/:userId/orders').get(validate(userIdParams), getOrders);

router.route('/:userId/cartCount').get(validate(userIdParams), getCartItemCount);

module.exports = router;
