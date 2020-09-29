const express = require('express');
const router = express.Router;
const weatherRoutes = require('./routes/weather');
const orderRoutes = require('./routes/order');
const customerRoutes = require('./routes/customer');
const productRoutes = require('./routes/product');
const autocompleteRoutes = require('./routes/autocomplete');

module.exports = () => {
  const app = router();
  weatherRoutes(app);
  orderRoutes(app);
  autocompleteRoutes(app);
  customerRoutes(app);
  productRoutes(app);
  return app;
};