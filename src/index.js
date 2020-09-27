require('dotenv').config();
const express = require('express');
const loaders = require('./loaders');

async function startServer() {
  const app = express();

  try {
    await loaders.default(app);
  } catch (e) {
    process.exit(1);
  }

  app.listen(process.env.PORT, err => {
    if (err) {
      process.exit(1);
    }
    console.log(`
      ################################################
      🛡️  Server listening on port: ${process.env.PORT} 🛡️ 
      ################################################
    `);
  });
}

startServer();