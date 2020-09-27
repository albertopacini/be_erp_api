const { MongoClient } = require('mongodb');
let db;

module.exports = {
  /**
   * Connect to the Mongo database
   */
  connect: async () => {
    const client = new MongoClient(`mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await client.connect();
    db = client.db();
  },

  mongo: () => db
};