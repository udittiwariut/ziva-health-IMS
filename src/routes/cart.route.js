const express = require('express');
const cartController = require('../controllers/cart.controller');

const cartValidation = require('../validations/cart.validation');
const validate = require('../middlewares/validate');

const router = express.Router();

router.route('/:userId').get(cartController.getUserCart).post(validate(cartValidation.getCart), cartController.getUserCart);

router
  .route('/:userId/:productId')
  .put(validate(cartValidation.updateCart), cartController.updateCart)
  .delete(validate(cartValidation.removeItem), cartController.removeItemFromCart);

module.exports = router;
