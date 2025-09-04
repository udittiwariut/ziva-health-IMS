const express = require('express');

const validate = require('../middlewares/validate');
const { getOrdersHistory } = require('../validations/user.validation');
const { getOrders } = require('../controllers/user.controller');

const router = express.Router();

router.route('/:userId/orders').get(validate(getOrdersHistory), getOrders);

module.exports = router;
