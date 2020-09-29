const { Router } = require('express');
const Product = require('../../services/Product');
const router = Router();

module.exports = (app) => {
  app.use('/products', router);

  router.get('/:product_id', async (req, res, next) => {
    try {
      const data = await Product.findProductById(req.params.product_id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

};