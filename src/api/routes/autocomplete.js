const { Router } = require('express');
const Autocomplete = require('../../services/Autocomplete');

const router = Router();

module.exports = (app) => {
  app.use('/autocomplete', router);

  router.get('/customers', async (req, res, next) => {
    try {
      const data = await Autocomplete.findCustomersByName(req.query.q);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/orders', async (req, res, next) => {
    try {
      const data = await Autocomplete.findOrderById(req.query.q);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/companies', async (req, res, next) => {
    try {
      const data = await Autocomplete.findCompaniesByName(req.query.q);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/cities', async (req, res, next) => {
    try {
      const data = await Autocomplete.findCitiesByName(req.query.q);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/countries', async (req, res, next) => {
    try {
      const data = await Autocomplete.findCountriesByName(req.query.q);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

};