const { connect: mssqlLoader } = require('./mssql');
const { connect: mongodbLoader } = require('./mongodb');
const expressLoader = require('./express');

module.exports = {
  default: async (app) => {
    await mssqlLoader(app);
    await mongodbLoader(app);
    expressLoader(app);
  }
}