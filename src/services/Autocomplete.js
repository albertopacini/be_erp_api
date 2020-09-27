const { pool } = require('../loaders/mssql');

module.exports = class Autocomplete {

  static async findOrderById(query) {
    const customers = await pool()
      .request()
      .input('q', `%${query}%`)
      .query`SELECT TOP 20 OrderId FROM Orders WHERE OrderId LIKE @q;`;

    return customers.recordsets[0].map(i => ({
      value: i.OrderId,
      label: i.OrderId
    }));
  }

  static async findCustomersByName(query) {
    const customers = await pool()
      .request()
      .input('q', `%${query}%`)
      .query`SELECT TOP 20 CustomerID,ContactName FROM Customers WHERE ContactName LIKE @q;`;

    return customers.recordsets[0].map(i => ({
      value: i.CustomerID,
      label: i.ContactName
    }));
  }

  static async findCompaniesByName(query) {
    const companies = await pool()
      .request()
      .input('q', `%${query}%`)
      .query`SELECT DISTINCT TOP 20 CompanyName FROM Customers WHERE CompanyName LIKE @q;`;

    return companies.recordsets[0].map(i => ({
      value: i.CompanyName,
      label: i.CompanyName
    }));
  }

  static async findCitiesByName(query) {
    const companies = await pool()
      .request()
      .input('q', `%${query}%`)
      .query`SELECT DISTINCT TOP 20 City,Country FROM Customers WHERE City LIKE @q OR Country LIKE @q;`;

    return companies.recordsets[0].map(i => ({
      value: i.City,
      label: `${i.City}, ${i.Country}`
    }));
  }

}