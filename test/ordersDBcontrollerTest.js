import chai from 'chai';
import chaiHttp from 'chai-http';
import { Pool } from 'pg';
import DB from '../server/api/models/dbModel';
import UsersController from '../server/api/controllers/usersController';
import server from '../server/api/server';
import AuthModel from '../server/api/models/authModel';
import User from '../server/api/models/userModel';
import OrdersDBController from '../server/api/controllers/ordersDBcontroller';
import MenuController from '../server/api/controllers/menuController';

const pool = new Pool({
  connectionString: 'postgres://cfsezloo:oA41pLZTXNtBIR_vxJHO-ZXqwHM0lAzR@tantor.db.elephantsql.com:5432/cfsezloo',
});
pool.on('connect', () => {
});

const db = new DB(pool);

chai.use(chaiHttp);

describe('Order and Menu Endpoints', () => {
  const auth = new AuthModel();
  const userM = new User();
  const userC = new UsersController(db, userM, auth);
  const orderC = new OrdersDBController(db);
  const menuC = new MenuController(db);

  let adminToken = '';
  // let admin2Token = '';
  // let admin2Id = '';
  let userToken = '';
  let id = '';
  let orderId = '';

  before((done) => {
    // Uncomment the 3 lines below when running for the first time to create tables
    // db.createUsersTable();
    // db.createOrdersTable();
    // db.createMenuTable();
    db.deleteRows('menu');
    const admin = new User(
      'testAdmin', 'admin@gmail.com', 'Password!2', '080000000', 'Andela Epic tower',
    );
    admin.password = auth.hashPassword(admin.password);
    const createQuery = `INSERT INTO
    users(username, email, password, phone, address, role, created_date, modified_date)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8)
    returning *`;
    const values = [
      admin.username,
      admin.email,
      admin.password,
      admin.phone,
      admin.address,
      'admin',
      new Date(),
      new Date(),
    ];
    db.query(createQuery, values)
      .then((res) => {
        console.log('admin created successfully');
        adminToken = auth.generateToken(res.rows[0].userid, res.rows[0].role);
      })
      .catch(err => console.log('err in creating admin', err));

    const testUser = {
      username: 'BoboUser', email: 'user@gmail.com', password: 'Password!2', phone: '01234567890',
    };
    chai.request(server(orderC, userC, menuC))
      .post('/api/v1/auth/signup')
      .send(testUser)
      .end((err, res) => {
        const { user, token } = res.body;
        userToken = token;
        const { userId } = user;
        id = userId;
        done();
      });
  });
  after(() => {
    db.deleteRows('users');
    db.deleteRows('orders');
    pool.end();
  });

  /* ********** MENU ENDPOINTS ************* */
  describe('Menu Endpoints', () => {
    const path = '/api/v1/menu';
    it('creates a new model', () => {
      menuC.should.be.an.instanceof(MenuController);
    });
    it('takes in db instance as paramaters', () => {
      orderC.should.have.property('db');
    });

    describe('ADD MEAL TO MENU (POST /menu)', () => {
      it('does not grant access to non-admins', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post(path)
          .set({ 'x-access-token': userToken })
          .end((err, res) => {
            res.status.should.equal(403);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('statusCode').eql(403);
            res.body.should.have.property('message').eql('Sorry, only admins are authorized');
            done();
          });
      });
      it('rejects null token', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post(path)
          .end((err, res) => {
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Please provide a token');
            done();
          });
      });
      it('rejects invalid token', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post(path)
          .set({ 'x-access-token': adminToken.slice(0, adminToken.length - 1) })
          .end((err, res) => {
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('invalid signature');
            done();
          });
      });
      it('rejects null request body', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post(path)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Sorry, menu content cannot be empty');
            done();
          });
      });
      it('rejects name parameter of null value', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post(path)
          .set({ 'x-access-token': adminToken })
          .send({ name: ' ' })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Please enter the name of your menu item');
            done();
          });
      });
      it('rejects price parameter of null value', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post(path)
          .set({ 'x-access-token': adminToken })
          .send({ name: 'Meatpie', genre: 'snacks' })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Please enter the price of your menu item');
            done();
          });
      });
      it('rejects price of invalid format', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post(path)
          .set({ 'x-access-token': adminToken })
          .send({
            name: 'Meatpie', price: 'y', genre: 'SNACK', img: 'img_url',
          })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Please enter price in integer format');
            done();
          });
      });
      it('rejects genre parameter of null value', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post(path)
          .set({ 'x-access-token': adminToken })
          .send({ name: 'Meatpie', price: 300, genre: ' ' })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Please enter the genre of your menu item');
            done();
          });
      });
      it('rejects genre parameter of invalid value', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post(path)
          .set({ 'x-access-token': adminToken })
          .send({ name: 'Meatpie', price: 300, genre: 'smallChops' })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Food genre must be either MEAL, SNACK, DRINK or COMBO');
            done();
          });
      });
      it('rejects img parameter of null value', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post(path)
          .set({ 'x-access-token': adminToken })
          .send({ name: 'Meatpie ', price: 300, genre: ' snack' })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Please enter an image url for your item');
            done();
          });
      });
      it('should allow an admin to successfully create a new menu item', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post(path)
          .set({ 'x-access-token': adminToken })
          .send({
            name: 'Meatpie ', price: 300, genre: ' snack', img: 'img_url',
          })
          .end((err, res) => {
            res.status.should.equal(201);
            res.body.should.have.property('status').eql('success');
            res.body.should.have.property('message').eql('New menu item added successfully');
            res.body.should.have.property('product');
            res.body.product.should.have.property('name').eql('MEATPIE');
            res.body.product.should.have.property('genre').eql('snack');
            res.body.product.should.have.property('price').eql(300);
            res.body.product.should.have.property('img').eql('img_url');
            res.body.product.should.have.property('isavailable').eql(true);
            done();
          });
      });
    });

    // GET ALL MENU ITEMS
    describe('GET ALL MENU ITEMS (GET /menu)', () => {
      it('does not retrieve orders with null/invalid token', (done) => {
        chai.request(server(orderC, userC, menuC))
          .get(path)
          .end((err, res) => {
            res.status.should.equal(401);
            res.body.should.have.property('error');
            res.body.error.should.have.property('status').eql('fail');
            res.body.error.should.have.property('message').eql('Token is not provided');
            done();
          });
      });
      it('should allow a logged in user to successfully GET all menu items', (done) => {
        chai.request(server(orderC, userC, menuC))
          .get(path)
          .set({ 'x-access-token': userToken })
          .end((err, res) => {
            res.status.should.equal(200);
            res.body.should.have.property('status').eql('success');
            res.body.should.have.property('message').eql('Menu items retrieved successfully');
            res.body.should.have.property('products');
            res.body.should.have.property('productCount').eql(res.body.products.length);
            done();
          });
      });
    });
  });

  describe('Order Endpoints', () => {
    it('creates a new model', () => {
      orderC.should.be.an.instanceof(OrdersDBController);
    });
    it('takes in db instance as paramaters', () => {
      orderC.should.have.property('db');
    });

    describe('PLACE AN ORDER (POST /orders)', () => {
      it('rejects null request body', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post('/api/v1/orders')
          .set({ 'x-access-token': userToken })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Sorry, order content cannot be empty');
            done();
          });
      });
      it('rejects request with incorrect parameters', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post('/api/v1/orders')
          .set({ 'x-access-token': userToken })
          .send({ gibberish: 'xyz' })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Please place your order in the correct format. Refer to the API docs for more info.');
            done();
          });
      });
      it('rejects name parameter of null/invalid value for buy-now order', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post('/api/v1/orders')
          .set({ 'x-access-token': userToken })
          .send({
            name: ' ', quantity: 2, address: 'et', phone: '08123456789',
          })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Please enter a valid name for your food');
            done();
          });
      });
      it('rejects name parameter of null/invalid value for Add-to-Cart order', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post('/api/v1/orders')
          .set({ 'x-access-token': userToken })
          .send({
            cartArray: [{
              name: '', quantity: '2',
            },
            {
              name: 'Duck', quantity: '1',
            }],
            address: 'ET',
            phone: '08123456789',
          })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Your cart object must have a \'name\' key of value type string');
            done();
          });
      });
      it('rejects quantity of invalid format', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post('/api/v1/orders')
          .set({ 'x-access-token': userToken })
          .send({
            name: 'Meatpie', quantity: 'x', address: 'et', phone: '08123456789',
          })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Please enter quantity in integer format');
            done();
          });
      });
      it('rejects quantity parameter of null/invalid value for Add-to-Cart order', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post('/api/v1/orders')
          .set({ 'x-access-token': userToken })
          .send({
            cartArray: [{
              name: 'Meatpie', quantity: 'x',
            }],
            address: 'ET',
            phone: '08123456789',
          })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Your cart object must have a \'quantity\' key of value type integer > 0');
            done();
          });
      });
      it('rejects food not on the menu for a buy-now order', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post('/api/v1/orders')
          .set({ 'x-access-token': userToken })
          .send({
            name: ' Chicken', quantity: 2, address: 'ET', phone: '08123456789',
          })
          .end((err, res) => {
            res.status.should.equal(404);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Sorry, CHICKEN is not available in stock. Contact us on 08146509343 if needed urgently');
            done();
          });
      });
      it('rejects food not on the menu for an Add-to-Cart order', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post('/api/v1/orders')
          .set({ 'x-access-token': userToken })
          .send({
            cartArray: [{
              name: 'Blah', quantity: 2,
            },
            {
              name: 'Duck', quantity: 1,
            }],
            address: 'ET',
            phone: '08123456789',
          })
          .end((err, res) => {
            res.status.should.equal(404);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Sorry, BLAH is not available in stock. Contact us on 08146509343 if needed urgently');
            done();
          });
      });
      const newOrder = {
        name: 'meatpie', quantity: 2, address: 'Andela', phone: '+2348123456789',
      };

      it('rejects invalid token', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post('/api/v1/orders')
          .set({ 'x-access-token': userToken.slice(0, userToken.length - 1) })
          .send(newOrder)
          .end((err, res) => {
            res.body.should.have.property('error');
            res.body.error.should.have.property('status').eql('fail');
            res.body.error.should.have.property('message').eql('invalid signature');
            done();
          });
      });
      it('should allow a logged-in user to successfully create an immediate (buy-now) order', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post('/api/v1/orders')
          .set({ 'x-access-token': userToken })
          .send(newOrder)
          .end((err, res) => {
            const { orderid } = res.body.order;
            orderId = orderid;
            res.status.should.equal(201);
            res.body.should.have.property('status').eql('success');
            res.body.should.have.property('message').eql('Order created successfully');
            res.body.should.have.property('order');
            res.body.order.should.have.property('orderid').eql(orderid);
            res.body.order.should.have.property('userid').eql(id);
            res.body.order.should.have.property('food').eql('MEATPIE');
            res.body.order.should.have.property('quantity').eql(newOrder.quantity);
            res.body.order.should.have.property('price').eql(600);
            res.body.order.should.have.property('status').eql('NEW');
            res.body.order.should.have.property('address').eql('Andela');
            res.body.order.should.have.property('phone').eql('+2348123456789');
            done();
          });
      });

      it('should allow a logged-in user to successfully create an order based on items in cart', (done) => {
        chai.request(server(orderC, userC, menuC))
          .post('/api/v1/orders')
          .set({ 'x-access-token': userToken })
          .send({ cartArray: [{ name: 'Meatpie', quantity: 1 }, { name: 'meatpie', quantity: 2 }], address: 'ET', phone: '08123456789' })
          .end((err, res) => {
            const { orderid } = res.body.order;
            res.status.should.equal(201);
            res.body.should.have.property('status').eql('success');
            res.body.should.have.property('message').eql('Order created successfully');
            res.body.should.have.property('order');
            res.body.order.should.have.property('orderid').eql(orderid);
            res.body.order.should.have.property('userid').eql(id);
            res.body.order.should.have.property('food');
            res.body.order.should.have.property('quantity').eql(3);
            res.body.order.should.have.property('price').eql(900);
            res.body.order.should.have.property('status').eql('NEW');
            res.body.order.should.have.property('address').eql('ET');
            res.body.order.should.have.property('phone').eql('08123456789');
            done();
          });
      });
    });
    // *************** GET /orders *************************/
    describe('GET ALL ORDERS /orders', () => {
      it('does not retrieve orders with invalid token', (done) => {
        chai.request(server(orderC, userC, menuC))
          .get('/api/v1/orders')
          .end((err, res) => {
            res.status.should.equal(401);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Please provide a token');
            done();
          });
      });
      it('does not grant access to non-admins', (done) => {
        chai.request(server(orderC, userC, menuC))
          .get('/api/v1/orders')
          .set({ 'x-access-token': userToken })
          .end((err, res) => {
            res.status.should.equal(403);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('statusCode').eql(403);
            res.body.should.have.property('message').eql('Sorry, only admins are authorized');
            done();
          });
      });
      it('should allow an admin to  successfully GET all orders', (done) => {
        chai.request(server(orderC, userC, menuC))
          .get('/api/v1/orders')
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            res.status.should.equal(200);
            res.body.should.have.property('status').eql('success');
            res.body.should.have.property('message').eql('Orders retrieved successfully');
            res.body.should.have.property('data');
            res.body.data.should.have.property('orders');
            res.body.data.should.have.property('totalOrders').eql(res.body.data.orders.length);
            done();
          });
      });
    });

    describe('GET A SPECIFIC ORDER (GET /order/orderId)', () => {
      it('does not retrieve an order with null token', (done) => {
        chai.request(server(orderC, userC, menuC))
          .get(`/api/v1/orders/${orderId}`)
          .end((err, res) => {
            res.status.should.equal(401);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Please provide a token');
            done();
          });
      });
      it('does not grant access to non-admins', (done) => {
        chai.request(server(orderC, userC, menuC))
          .get(`/api/v1/orders/${orderId}`)
          .set({ 'x-access-token': userToken })
          .end((err, res) => {
            res.status.should.equal(403);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('statusCode').eql(403);
            res.body.should.have.property('message').eql('Sorry, only admins are authorized');
            done();
          });
      });
      it('rejects request with invalid orderId', (done) => {
        chai.request(server(orderC, userC, menuC))
          .get('/api/v1/orders/ab')
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            res.status.should.equal(404);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('invalid input syntax for integer: "ab"');
            done();
          });
      });
      it('rejects request with non-existent orderId', (done) => {
        chai.request(server(orderC, userC, menuC))
          .get('/api/v1/orders/100000000')
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            res.status.should.equal(404);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Order with id 100000000 not found');
            done();
          });
      });
      it('should allow an admin to successfully GET a specific order', (done) => {
        chai.request(server(orderC, userC, menuC))
          .get(`/api/v1/orders/${orderId}`)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            res.status.should.equal(200);
            res.body.should.have.property('status').eql('success');
            res.body.should.have.property('message').eql('Order retrieved successfully');
            res.body.should.have.property('data');
            done();
          });
      });
    });

    describe('UPDATE STATUS (PUT /orders/orderId)', () => {
      it('does not retrieve an order with null token', (done) => {
        chai.request(server(orderC, userC, menuC))
          .put(`/api/v1/orders/${orderId}`)
          .end((err, res) => {
            res.status.should.equal(401);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Please provide a token');
            done();
          });
      });
      it('does not grant access to non-admins', (done) => {
        chai.request(server(orderC, userC, menuC))
          .put(`/api/v1/orders/${orderId}`)
          .set({ 'x-access-token': userToken })
          .end((err, res) => {
            res.status.should.equal(403);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('statusCode').eql(403);
            res.body.should.have.property('message').eql('Sorry, only admins are authorized');
            done();
          });
      });
      it('rejects request with invalid orderId', (done) => {
        chai.request(server(orderC, userC, menuC))
          .put('/api/v1/orders/xyz')
          .set({ 'x-access-token': adminToken })
          .send({ status: 'PROCESSING' })
          .end((err, res) => {
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('invalid input syntax for integer: "xyz"');
            done();
          });
      });
      it('rejects request with non-existent orderId', (done) => {
        chai.request(server(orderC, userC, menuC))
          .put('/api/v1/orders/10000000')
          .set({ 'x-access-token': adminToken })
          .send({ status: 'PROCESSING' })
          .end((err, res) => {
            res.status.should.equal(404);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Order with id 10000000 not found');
            done();
          });
      });
      it('rejects request with null status parameter', (done) => {
        chai.request(server(orderC, userC, menuC))
          .put(`/api/v1/orders/${orderId}`)
          .set({ 'x-access-token': adminToken })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Please update order status');
            done();
          });
      });
      it('rejects request that contains any other order parameter', (done) => {
        chai.request(server(orderC, userC, menuC))
          .put(`/api/v1/orders/${orderId}`)
          .set({ 'x-access-token': adminToken })
          .send({ status: 'PROCESSING', price: 100 })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Please update only order status');
            done();
          });
      });
      it('rejects request that contains invalid update action', (done) => {
        chai.request(server(orderC, userC, menuC))
          .put(`/api/v1/orders/${orderId}`)
          .set({ 'x-access-token': adminToken })
          .send({ status: 'DANCING' })
          .end((err, res) => {
            res.status.should.equal(400);
            res.body.should.have.property('status').eql('fail');
            res.body.should.have.property('message').eql('Status can only be updated to NEW, PROCESSING, CANCELLED or COMPLETE');
            done();
          });
      });
      it('returns error message status parameter of the same order status value', (done) => {
        chai.request(server(orderC, userC, menuC))
          .put(`/api/v1/orders/${orderId}`)
          .set({ 'x-access-token': adminToken })
          .send({ status: 'NEW' })
          .end((err, res) => {
            res.status.should.equal(200);
            res.body.should.have.property('status').eql('success');
            res.body.should.have.property('message').eql('Order status was not modified');
            done();
          });
      });
      it('should allow an admin to successfully update an order', (done) => {
        chai.request(server(orderC, userC, menuC))
          .put(`/api/v1/orders/${orderId}`)
          .set({ 'x-access-token': adminToken })
          .send({ status: 'PROCESSING' })
          .end((err, res) => {
            res.status.should.equal(200);
            res.body.should.have.property('status').eql('success');
            res.body.should.have.property('message').eql('Status updated successfully');
            res.body.should.have.property('order');
            res.body.order.should.have.property('status').eql('PROCESSING');
            done();
          });
      });
    });
  });
});
