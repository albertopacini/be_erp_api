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

  static async createOrder({ customerId, requiredDate, shippedDate, shippingName, shipVia, freight, shippingAddress, shippingCity, shippingPostalCode, shippingRegion, shippingCountry }, orderItems) {

    const order = await pool()
      .request()
      .input('customerId', customerId)
      .input('employeeId', 1) // TODO: Set employee from request.
      .input('orderDate', new Date())
      .input('requiredDate', requiredDate || null)
      .input('shippedDate', shippedDate || null)
      .input('shipVia', shipVia || null)
      .input('freight', freight || null)
      .input('shippingName', shippingName || null)
      .input('shippingAddress', shippingAddress || null)
      .input('shippingCity', shippingCity || null)
      .input('shippingPostalCode', shippingPostalCode || null)
      .input('shippingRegion', shippingRegion || null)
      .input('shippingCountry', shippingCountry || null)
      .query`INSERT INTO Orders 
      ( CustomerID,
        EmployeeID,
        OrderDate,
        RequiredDate,
        ShippedDate,
        ShipVia,
        freight,
        ShipName,
        ShipAddress,
        ShipCity,
        ShipRegion,
        ShipPostalCode,
        ShipCountry) 
      VALUES 
      ( @customerId,
        @employeeId,
        @orderDate,
        @requiredDate,
        @shippedDate,
        @shipVia,
        @freight,
        @shippingName,
        @shippingAddress,
        @shippingCity,
        @shippingRegion,
        @shippingPostalCode,
        @shippingCountry);SELECT SCOPE_IDENTITY() AS id;`

    //TODO: Create order items here.    
    Order.syncDataSources();
    return order.recordset[0];
  }

  static async createOrderItem(orderId, items) {
    //TODO: Insert order items
  }

  static async cloneOrder(orderId) {
    const order = await pool()
      .request()
      .input('orderId', orderId)
      .query`SELECT * FROM Orders WHERE OrderId = @orderId`;
    if (order.recordset[0]) {
      return Order.createOrder({
        customerId: order.recordset[0].CustomerID,
        requiredDate: order.recordset[0].OrderDate,
        shippedDate: order.recordset[0].ShippedDate,
        shippingName: order.recordset[0].ShipName,
        shipVia: order.recordset[0].ShipVia,
        freight: order.recordset[0].Freight,
        shippingAddress: order.recordset[0].ShipAddress,
        shippingCity: order.recordset[0].ShipCity,
        shippingRegion: order.recordset[0].ShipRegion,
        shippingPostalCode: order.recordset[0].ShipPostalCode,
        ShipCountry: order.recordset[0].ShipCountry,
      })
    }

  }

  static async syncDataSources() {
    try {
      const lastSyncRecord = await Order._getLastSyncRecord();
      const ordersRawData = await Order._retrieveRawOrders(lastSyncRecord);
      const ordersDetailsRawData = await Order._retrieveRawOrdersDetails(lastSyncRecord);
      const formattedRows = Order._formatRawData(ordersRawData, ordersDetailsRawData);
      await mongo().collection('orders').insertMany(formattedRows);
    } catch (e) {
      throw new Error(`Order: Failed to sync data sources in "syncDataSources" method. \n${e}`);
    }
  }

  static async _getLastSyncRecord() {
    const lastRecord = await mongo().collection('orders').find().sort({ orderId: -1 }).limit(1).toArray();
    return (lastRecord && lastRecord.length) ? lastRecord[0].orderId : 0;
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
      'cities': 'shipping.city',
      'countries': 'shipping.country',
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

  static async _retrieveRawOrdersDetails(lastSyncId) {
    return pool()
      .request()
      .input('lastSyncId', lastSyncId)
      .query`SELECT 
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
      INNER JOIN [Categories] ON Categories.CategoryID = [Products].CategoryID WHERE OrderID > @lastSyncId`;
  }

  static async _retrieveRawOrders(lastSyncId) {
    return pool()
      .request()
      .input('lastSyncId', lastSyncId)
      .query`SELECT 
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
    INNER JOIN Customers ON Customers.CustomerId = Orders.CustomerId WHERE OrderID > @lastSyncId`
  }

}