const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('../api');

module.exports = (app) => {
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use('/', routes());

  // Catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.code = 'NotFound';
    err.status = 404;
    next(err);
  });

  // Error handler
  app.use((err, req, res, next) => {
    if (!err.status || err.status > 499) {
      return res.sendStatus(err.status || 500);
    }

    res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        status: err.status
      }
    });
  });
};