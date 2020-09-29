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
      .query`SELECT DISTINCT TOP 20 ShipCity,ShipCountry FROM Orders WHERE ShipCity LIKE @q OR ShipCountry LIKE @q;`;

    return companies.recordsets[0].map(i => ({
      value: i.ShipCity,
      label: `${i.ShipCity}, ${i.ShipCountry}`
    }));
  }

  static async findCountriesByName(query) {
    const companies = await pool()
      .request()
      .input('q', `%${query}%`)
      .query`SELECT DISTINCT TOP 20 ShipCountry FROM Orders WHERE ShipCountry LIKE @q;`;

    return companies.recordsets[0].map(i => ({
      value: i.ShipCountry,
      label: i.ShipCountry
    }));
  }

  static async findProductsByName(query) {
    const companies = await pool()
      .request()
      .input('q', `%${query}%`)
      .query`SELECT DISTINCT TOP 20 ProductId,ProductName FROM Products WHERE ProductName LIKE @q;`;

    return companies.recordsets[0].map(i => ({
      value: i.ProductId,
      label: i.ProductName
    }));
  }

}