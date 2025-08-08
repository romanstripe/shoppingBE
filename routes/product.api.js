const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const productController = require('../controllers/product.controller');

router.post(
  '/',
  authController.authenticate,
  authController.checkAdminPermission,
  productController.createProduct
);
//admin 인지 확인하기

router.get('/', productController.getProducts);

router.put(
  '/:id',
  authController.authenticate,
  authController.checkAdminPermission,
  productController.updateProducts
);

router.delete(
  '/:id',
  authController.authenticate,
  authController.checkAdminPermission,
  productController.deleteProducts
);

router.get('/:id', productController.getProductDetail);

module.exports = router;
