const express = require('express');
const { productController } = require('../controllers');

const productValidation = require('../validations/product.validation');
const validate = require('../middlewares/validate');

const router = express.Router();

router
  .route('/')
  .get(productController.getProducts)
  .post(validate(productValidation.createProduct), productController.createNewProduct);

router.route('/:id').put(validate(productValidation.updateProduct), productController.updateProductById);

router.route('/:id/stock').put(validate(productValidation.updateProductStock), productController.updateProductStock);

router.route('/:id/fulfill').post(validate(productValidation.updateProductStock), productController.updateProductById);

router.route('/low-stock').get(productController.getLowStockProducts);

module.exports = router;
