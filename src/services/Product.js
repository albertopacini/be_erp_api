const { pool } = require('../loaders/mssql');

module.exports = class Product {

  static async findProductById(productId) {
    if (!productId) {
      throw new Error('Product: wrong argument productId in "findProductById" method;');
    }
    const rawProducts = await pool()
      .request()
      .input('productId', productId)
      .query`SELECT ProductID,ProductName,UnitPrice,UnitsInStock FROM Products WHERE ProductId = @productId;`;

    const products = [];
    rawProducts.recordsets.forEach(recordset => {
      recordset.forEach(e => {
        products.push({
          id: e.ProductID,
          name: e.ProductName,
          price: e.UnitPrice,
          maxQuantity: e.UnitsInStock
        });
      })
    });
    return products.length ? products[0] : null;
  }

}