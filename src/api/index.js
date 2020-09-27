const express = require('express');
const router = express.Router;
const weatherRoutes = require('./routes/weather');
const orderRoutes = require('./routes/order');
const autocompleteRoutes = require('./routes/autocomplete');

module.exports = () => {
  const app = router();
  weatherRoutes(app);
  orderRoutes(app);
  autocompleteRoutes(app);
  return app;
};