const { pool } = require('../loaders/mssql');
const { mongo } = require('../loaders/mongodb');

module.exports = class Order {

  static async getOrders(filters, skip = 0, limit = 30) {
    try {

      const conditions = Order._formatFilterConditions(filters);
      const count = await mongo()
        .collection('orders')
        .count(conditions);

      const results = await mongo()
        .collection('orders')
        .find(conditions)
        .skip(parseInt(skip > 0 ? ((skip - 1) * limit) : 0))
        .limit(parseInt(limit))
        .toArray();

      return { count, results }
    } catch (e) {
      throw new Error(`Order: Failed to sync data sources in "syncDataSources" method. \n${e}`);
    }
  }

  static async syncDataSources() {
    try {
      const ordersRawData = await Order._retrieveRawOrders();
      const ordersDetailsRawData = await Order._retrieveRawOrdersDetails();
      const formattedRows = Order._formatRawData(ordersRawData, ordersDetailsRawData);
      await mongo().collection('orders').insertMany(formattedRows);
    } catch (e) {
      throw new Error(`Order: Failed to sync data sources in "syncDataSources" method. \n${e}`);
    }
  }

  static _formatRawData(ordersRawData, ordersDetailRawData) {
    let results = {};
    Array.isArray(ordersRawData.recordsets) && ordersRawData.recordsets.forEach(recordSet => {
      recordSet.forEach(e => {
        results[e.OrderId] = {
          orderId: e.OrderId,
          orderDate: new Date(e.OrderDate),
          shipping: {
            date: new Date(e.ShippedDate),
            name: e.ShipName || '',
            address: e.ShipAddress || '',
            city: e.ShipCity || '',
            region: e.ShipRegion || '',
            postalCode: e.ShipPostalCode || '',
            country: e.ShipCountry || '',

          },
          customer: {
            id: e.CustomerId,
            name: e.ContactName,
            company: e.CompanyName,
            address: e.Address,
            city: e.City,
            region: e.Region,
            postalCode: e.PostalCode,
            country: e.Country,
            phone: e.Phone,
            fax: e.Fax,
          },
          summary: [],
          amount: 0
        }
      });
    });

    Array.isArray(ordersDetailRawData.recordsets) && ordersDetailRawData.recordsets.forEach(recordSet => {
      recordSet.forEach(e => {
        if (results[e.OrderID]) {
          const amount = e.Discount ? (e.Quantity * e.UnitPrice - (e.Quantity * e.UnitPrice * e.Discount)) : e.Quantity * e.UnitPrice;
          results[e.OrderID].summary.push({
            product: e.ProductName,
            category: e.CategoryName,
            supplier: e.CompanyName,
            quantity: e.Quantity,
            unitPrice: e.UnitPrice,
            discount: e.Discount,
            amount: amount,
          });
          results[e.OrderID].amount += amount;
        }
      });
    });

    return Object.values(results);
  }

  static _formatFilterConditions(filters) {
    const conditions = {};
    const sourceMap = {
      'orders': 'orderId',
      'customers': 'customer.id',
      'companies': 'customer.company',
      'cities': 'customer.city',
      'countries': 'customer.country',
    };
    for (let key in filters) {
      if (sourceMap[key]) {
        let filterValues = filters[key].split("|");
        filterValues = filterValues
          .filter((i) => {
            return i !== '';
          }).map(i => (
            key === 'orders' ? parseInt(i) : i
          ));
        if (filterValues.length) {
          conditions[sourceMap[key]] = { "$in": filterValues }
        }
      }
    }

    return conditions;
  }

  static async _retrieveRawOrdersDetails() {
    return pool().query`SELECT 
    [Order Details].OrderID,
    [Order Details].UnitPrice,
    [Order Details].Quantity,
    [Order Details].Discount,
    [Products].[ProductName],
    [Products].QuantityPerUnit,
    Suppliers.CompanyName,
    Categories.CategoryName 
      FROM [Order Details] 
      INNER JOIN [Products] ON Products.ProductID = [Order Details].ProductID
      INNER JOIN [Suppliers] ON Suppliers.SupplierID = [Products].SupplierID
      INNER JOIN [Categories] ON Categories.CategoryID = [Products].CategoryID`;
  }

  static async _retrieveRawOrders(filters) {
    return pool().query`SELECT 
    Orders.OrderId,
    Orders.OrderDate,
    Orders.ShippedDate,      
    Orders.ShipName,
    Orders.ShipAddress,
    Orders.ShipCity,
    Orders.ShipRegion,
    Orders.ShipPostalCode,
    Orders.ShipCountry,
    Customers.CustomerId,
    Customers.ContactName,
    Customers.CompanyName,
    Customers.ContactTitle,
    Customers.Address,
    Customers.City,
    Customers.Region,
    Customers.PostalCode,
    Customers.Country,
    Customers.Phone,
    Customers.Fax
    FROM Orders 
    INNER JOIN Customers ON Customers.CustomerId = Orders.CustomerId`
  }

}