const { Router } = require('express');
const Customer = require('../../services/Customer');

const router = Router();

module.exports = (app) => {
  app.use('/customers', router);

  router.get('/:customer_id', async (req, res, next) => {
    try {
      const data = await Customer.findShippingAddressByCustomerId(req.params.customer_id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

};