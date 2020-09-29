const { pool } = require('../loaders/mssql');

module.exports = class Customer {

  static async findShippingAddressByCustomerId(customerId) {
    if (!customerId) {
      throw new Error('Customer: wrong argument customerId in "findShippingAddressByCustomerId" method;');
    }
    const customer = await pool()
      .request()
      .input('customerId', customerId)
      .query`SELECT CompanyName,ContactName,Address,City,Region,PostalCode,Country FROM Customers WHERE CustomerID = @customerId;`;

    return (customer.recordsets[0].length) ? customer.recordsets[0][0] : null;
  }

}