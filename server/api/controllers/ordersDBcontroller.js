
export default class OrderDBController {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create an order
   * @param {object} order
   * @returns {object} order object
   */

  async create(req) {
    // The line below was adapted from this source: https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
      return { status: 'fail', statusCode: 400, message: 'Sorry, order content cannot be empty' };
    }
    const {
      name, quantity, cartArray, address, phone,
    } = req.body;
    let values = [];

    // FOR QUICK ORDER OF SINGLE FOOD
    try {
      if (Object.keys(req.body).length === 4 && name && quantity && address && phone) {
        if (!name.trim() || typeof name.trim() !== 'string') {
          const err = { code: 400, message: 'Please enter a valid name for your food' };
          throw err;
        }
        if (typeof quantity !== 'number') {
          const err = { code: 400, message: 'Please enter quantity in integer format' };
          throw err;
        }

        const foodName = name.trim().toUpperCase();
        const res = await this.db.query('SELECT * from menu WHERE name = $1', [foodName]);

        if (res.rowCount === 0) {
          const err = { code: 404, message: `Sorry, ${foodName} is not available in stock. Contact us on 08146509343 if needed urgently` };
          throw err;
        }
        const totalPrice = Number(res.rows[0].price) * Number(quantity);
        values = [
          JSON.stringify(foodName),
          quantity,
          totalPrice,
          'NEW',
          address,
          phone,
          req.user.userId,
          new Date(),
          new Date(),
        ];
      // FOR ORDERS IN CART
      } else if (Object.keys(req.body).length === 3 && cartArray && address && phone) {
        let totalQty = 0;
        let totalPrice = 0;
        const { rows } = await this.db.query('SELECT * FROM menu');
        const foodNames = [];

        rows.forEach((row) => {
          foodNames.push(row.name);
        });

        await cartArray.forEach((food) => {
          if (!food.name || typeof food.name !== 'string' || !food.name.trim()) {
            const err = { code: 400, message: 'Your cart object must have a \'name\' key of value type string' };
            throw err;
          }
          if (!food.quantity || typeof food.quantity !== 'number') {
            const err = { code: 400, message: 'Your cart object must have a \'quantity\' key of value type integer > 0' };
            throw err;
          }
          const foodName = food.name.trim().toUpperCase();
          if (foodNames.indexOf(foodName) === -1) {
            const err = { code: 404, message: `Sorry, ${foodName} is not available in stock. Contact us on 08146509343 if needed urgently` };
            throw err;
          }
          const index = foodNames.indexOf(foodName);
          totalQty += Number(food.quantity);
          totalPrice += Number(rows[index].price) * Number(food.quantity);
          food.name = foodName;
        });
        values = [
          JSON.stringify(cartArray),
          totalQty,
          totalPrice,
          'NEW',
          address,
          phone,
          req.user.userId,
          new Date(),
          new Date(),
        ];
      } else {
        return { status: 'fail', statusCode: 400, message: 'Please place your order in the correct format. Refer to the API docs for more info.' };
      }

      const insertQuery = `INSERT INTO orders(food, quantity, price, status, address, phone, userid, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
      returning *`;
      const { rows } = await this.db.query(insertQuery, values);
      rows[0].food = JSON.parse(rows[0].food);
      return {
        status: 'success', statusCode: 201, message: 'Order created successfully', order: rows[0],
      };
    } catch (error) {
      return { status: 'fail', statusCode: error.code || 500, message: error.message };
    }
  }

  /**
   * Admin Get All orders or specific order
   * @param {number || undefined} id
   * @returns {object} orders array if id is undefined or order object otherwise
   */
  async read(req) {
    let data = {};
    let message = '';
    if (!req) {
      const getAllQuery = 'SELECT * FROM orders';
      const { rows, rowCount } = await this.db.query(getAllQuery);
      data = { orders: rows, totalOrders: rowCount };
      message = 'Orders retrieved successfully';
    } else {
      const getQuery = 'SELECT * FROM orders WHERE orderid = $1';
      const { rows } = await this.db.query(getQuery, [req.params.orderId]);
      [data] = rows;
      if (!data) {
        throw new Error(`Order with id ${req.params.orderId} not found`);
      }
      message = 'Order retrieved successfully';
    }
    return {
      status: 'success', statusCode: 200, message, data,
    };
  }

  /**
   * Update An Order
   * @param {number} id
   * @param {object} attrs
   * @returns {object} updated order
   */
  async updateStatus(req) {
    const findOneQuery = 'SELECT * FROM orders WHERE orderId=$1';
    const { rows } = await this.db.query(findOneQuery, [req.params.orderId]);
    if (!rows[0]) {
      return ({ status: 'fail', statusCode: 404, message: `Order with id ${req.params.orderId} not found` });
    }
    const updateStatusQuery = `UPDATE orders
      SET status=$1, modified_date= $2
      WHERE orderid=$3 returning *`;

    let { status } = req.body;

    if (!status || !status.trim()) {
      return ({ status: 'fail', statusCode: 400, message: 'Please update order status' });
    }
    status = status.trim().toUpperCase();

    if (Object.keys(req.body).length > 1) {
      return ({ status: 'fail', statusCode: 400, message: 'Please update only order status' });
    }
    if (status !== 'NEW' && status !== 'PROCESSING' && status !== 'CANCELLED' && status !== 'COMPLETE') {
      return ({ status: 'fail', statusCode: 400, message: 'Status can only be updated to NEW, PROCESSING, CANCELLED or COMPLETE' });
    }
    if (status === rows[0].status) {
      return ({
        status: 'success', statusCode: 200, message: 'Order status was not modified', order: rows[0],
      });
    }
    const values = [
      status,
      new Date(),
      req.params.orderId,
    ];
    try {
      const response = await this.db.query(updateStatusQuery, values);
      return {
        status: 'success', statusCode: 200, message: 'Status updated successfully', order: response.rows[0],
      };
    } catch (error) {
      return { status: 'fail', statusCode: 500, message: error.message };
    }
  }
}
