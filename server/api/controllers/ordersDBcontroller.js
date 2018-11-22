/* eslint-disable max-len */
/* eslint-disable object-curly-newline */
/* eslint-disable no-param-reassign */
import dotenv from 'dotenv';
// import emailService from '../helpers/email';
// import smsClient from '../helpers/sms';

dotenv.config();

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
          req.user.email,
          req.user.userId,
          req.user.username,
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
          req.user.email,
          req.user.userId,
          req.user.username,
          new Date(),
          new Date(),
        ];
      } else {
        return { status: 'fail', statusCode: 400, message: 'Please place your order in the correct format. Refer to the API docs for more info.' };
      }
      const insertQuery = `INSERT INTO orders(food, quantity, price, status, address, phone, email, userid, username, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      returning *`;
      const { rows } = await this.db.query(insertQuery, values);
      rows[0].food = JSON.parse(rows[0].food);
      // const { orderid, userid, username, food, price, email } = rows[0];

      // let items = '';
      // if (typeof food === 'object') {
      //   food.forEach((item) => {
      //     let p = '';
      //     if (food.indexOf(item) + 1 === food.length) {
      //       p = `<b>${item.quantity}x ${item.name}</b>.`;
      //     } else {
      //       p = `<b>${item.quantity}x ${item.name}</b>;`;
      //     }
      //     items += p;
      //   });
      // } else {
      //   items = `<b>${food}</b>`;
      // }

      // const mailOptions = {
      //   from: emailService.credentials.auth.user,
      //   to: email,
      //   subject: `Your order #${userid}FFF${orderid} has been confirmed!`,
      //   html: `<h1 style="font-size: 60px;  text-align: center;"><a href="https://fast-food-fast-bobsar0.herokuapp.com" style="color: #212121; text-decoration: none;">Fast<span style="color: goldenrod">-Food-</span>Fast!</a></h1>
      //   Dear ${username}, <br><p>Your order #${userid}FFF${orderid} has been successfully confirmed.<p>

      //   <p>Order details:<p>
      //   <ul><li>Food: ${items}</li><li>Total Quantity: <b>${rows[0].quantity}</b></li><li>Total Price: <b>NGN ${price}.00</b></li></ul>
      //   <p>Your food will be packaged and shipped as soon as possible. Once the status changes, you will receive a notification email.</p>
      //   <p>For any queries, please contact us on 08146509343.</p>
      //   <p>Thank you.</p>
      //   <p>Kind regards,<p>
      //   <p><i>FastFoodFast Team</i><p>
      //   `,
      // };
      // emailService.transporter.sendMail(mailOptions, (err, info) => {
      //   console.log('sending mail...');
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     console.log('Email sent:', info.response);
      //   }
      // });
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
      message = `${rowCount} Orders retrieved successfully`;
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
      SET status=$1, reason=$2, modified_date= $3
      WHERE orderid=$4 returning *`;

    let { status } = req.body;
    const { reason } = req.body;

    if (!status || !status.trim()) {
      return ({ status: 'fail', statusCode: 400, message: 'Please update order status' });
    }
    status = status.trim().toUpperCase();

    if (status !== 'NEW' && status !== 'PROCESSING' && status !== 'CANCELLED' && status !== 'COMPLETE') {
      return ({ status: 'fail', statusCode: 400, message: 'Status can only be updated to NEW, PROCESSING, CANCELLED or COMPLETE' });
    }
    if (status === 'CANCELLED' && (!reason || !reason.trim())) {
      return ({ status: 'fail', statusCode: 400, message: 'Please provide a reason for order cancellation' });
    }
    if (status === rows[0].status) {
      return ({
        status: 'success', statusCode: 200, message: 'Order status was not modified', order: rows[0],
      });
    }
    const values = [
      status,
      reason,
      new Date(),
      req.params.orderId,
    ];
    try {
      // const { email, food, quantity, price, address, phone, userid, orderid, username } = rows[0];
      const response = await this.db.query(updateStatusQuery, values);
      // const id = `#${userid}FFF${orderid}`;
      // // SEND EMAIL
      // let msg = '';
      // let body = `Your order status has been updated to ${status}. Please contact us on 08146509343 for any queries`;
      // if (status === 'CANCELLED') {
      //   status = '<span style="color:red">CANCELLED</span>';
      //   msg = `Your order was cancelled due to ${reason}. We sincerely apologize for any inconvenience and will call you soon on ${phone} with further details.
      //   <p>Meanwhile you can continue to check out other food items at <a href="https://fast-food-fast.herokuapp.com">our website</a>.</p>`;
      //   body = `Your order ${id} has been cancelled due to ${reason}. We apologize for any inconvenience. Please contact us on 08146509343 for any queries`;
      // } else if (status === 'COMPLETE') {
      //   status = '<span style="color:green">COMPLETE</span>';
      //   msg = `<p>Your order ${id} will be delivered to ${address} within 1hr.</p>`;
      //   body = `${msg}. Please keep a total of NGN${price}.00 ready for collection.`;
      // }
      // const mailOptions = {
      //   from: emailService.credentials.auth.user,
      //   to: email,
      //   subject: 'Your order status has been updated!',
      //   html: `<h1 style="font-size: 60px;  text-align: center;"><a href="https://fast-food-fast-bobsar0.herokuapp.com" style="color: goldenrod; text-decoration: none;">Fast<span style="color: #212121">-Food-</span>Fast!</a></h1>
      //   Dear ${username}, <br><p>The status of your order ${id} has been updated to <b>${status}</b>.</p>
      //   <p>Order details:</p>
      //   <ul><li>Food: <b>${food}</b></li><li>Quantity: <b>${quantity}</b></li><li>Price: <b>NGN${price}.00</b></li></ul>
      //   ${msg}
      //   <p>Thank you.</p>
      //   <p>Kind regards,<p>
      //   <p><i>FastFoodFast Team</i><p>`,
      // };
      // emailService.transporter.sendMail(mailOptions, (err, info) => {
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     console.log('Email sent:', info.response);
      //   }
      // });

      // SEND SMS
      // smsClient.messages
      //   .create({
      //     body: body.toUpperCase(),
      //     from: process.env.PHONE,
      //     to: `+234${phone.slice(1)}`,
      //   })
      //   .then(message => console.log('SMS sent successfully', message.sid))
      //   .catch(err => console.log('err in sms delivery:', err))
      //   .done();

      return {
        status: 'success', statusCode: 200, message: 'Status updated successfully', order: response.rows[0],
      };
    } catch (error) {
      return { status: 'fail', statusCode: 500, message: error.message };
    }
  }
}
