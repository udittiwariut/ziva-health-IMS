const express = require('express');
const docsRoute = require('./docs.route');
const config = require('../config/config');
const productRoutes = require('./product.route');
const orderRoutes = require('./order.route');
const cartRoutes = require('./cart.route');
const userRoutes = require('./user.route');

const router = express.Router();

const ROUTES = [
  {
    path: '/product',
    route: productRoutes,
  },

  {
    path: '/orders',
    route: orderRoutes,
  },

  {
    path: '/cart',
    route: cartRoutes,
  },

  {
    path: '/users',
    route: userRoutes,
  },
];

const devRoutes = [
  {
    path: '/docs',
    route: docsRoute,
  },
];

ROUTES.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
