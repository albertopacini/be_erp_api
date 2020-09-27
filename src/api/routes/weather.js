const { Router } = require('express');
const Weather = require('../../services/Weather');

const router = Router();

module.exports = (app) => {
  app.use('/weather', router);

  router.get('/', async (req, res, next) => {
    try {
      const data = await Weather.getWeatherForecast(req.query.place);
      res.json(data);
    } catch (e) {
      next(e);
    }
  });

};