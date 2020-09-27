const sql = require('mssql');
let pool;

module.exports = {
  connect: async () => {
    pool = await sql.connect(`mssql://${process.env.MSSQL_USERNAME}:${process.env.MSSQL_PASSWORD}@${process.env.MSSQL_HOST}/${process.env.MSSQL_DATABASE}`);
  },
  pool: () => pool
}