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

  router.post('/', async (req, res, next) => {
    try {
      const data = await Order.createOrder(req.body.order, req.body.orderItems);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.post('/clone/:order_id', async (req, res, next) => {
    try {
      const data = await Order.cloneOrder(req.params.order_id);
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