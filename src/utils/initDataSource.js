require('dotenv').config();
const { connect: mssqlLoader } = require('../loaders/mssql');
const { connect: mongodbLoader } = require('../loaders/mongodb');
const Order = require('../services/Order');

async function initDataSource() {
  await mssqlLoader();
  await mongodbLoader();
  Order.syncDataSources();
}