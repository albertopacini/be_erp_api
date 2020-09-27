require('dotenv').config();
const { connect: mssqlLoader } = require('./mssql');
const { connect: mongodbLoader } = require('./mongodb');
const Order = require('../services/Order');

async function initDataSource() {
  await mssqlLoader();
  await mongodbLoader();
  Order.syncDataSources();
}