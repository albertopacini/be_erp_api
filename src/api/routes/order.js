const { Router } = require('express');
const Order = require('../../services/Order');

const router = Router();

module.exports = (app) => {
  app.use('/orders', router);

  router.get('/', async (req, res, next) => {
    try {
      const data = await Order.getOrders(req.query, req.query.page, req.query.rows);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/sync', async (req, res, next) => {
    try {
      const data = await Order.syncDataSources();;
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

};