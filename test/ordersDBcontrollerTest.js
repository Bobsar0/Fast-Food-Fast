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
  connectionString: process.env.DB_URL_TEST,
});
pool.on('connect', () => {
});

const db = new DB(pool);

chai.use(chaiHttp);

describe('Order Endpoints', () => {
  const auth = new AuthModel();
  const userM = new User();
  const userC = new UsersController(db, userM, auth);
  const orderC = new OrdersDBController(db);
  const menuC = new MenuController(db);

  let adminToken = '';
  let userToken = '';
  let id = '';
  let orderId = '';

  before((done) => {
    // Uncomment the 2 lines below when running for the first time to create tables
    // db.createUsersTable();
    // db.createOrdersTable();
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

  it('creates a new model', () => {
    orderC.should.be.an.instanceof(OrdersDBController);
  });
  it('takes in db and user model instance as paramaters', () => {
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
    it('rejects name parameter of null value', (done) => {
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/orders')
        .set({ 'x-access-token': userToken })
        .send({ name: ' ' })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.should.have.property('status').eql('fail');
          res.body.should.have.property('message').eql('Please enter the name of your order');
          done();
        });
    });
    it('rejects price parameter of null value', (done) => {
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/orders')
        .set({ 'x-access-token': userToken })
        .send({ name: 'Chicken', quantity: 3 })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.should.have.property('status').eql('fail');
          res.body.should.have.property('message').eql('Please enter the price of your order');
          done();
        });
    });
    it('rejects quantity parameter of null value', (done) => {
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/orders')
        .set({ 'x-access-token': userToken })
        .send({ name: 'Chicken', price: 3 })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.should.have.property('status').eql('fail');
          res.body.should.have.property('message').eql('Please enter the quantity of your order');
          done();
        });
    });
    it('rejects price/quantity of invalid format', (done) => {
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/orders')
        .set({ 'x-access-token': userToken })
        .send({ name: 'Chicken', quantity: 'x', price: 'y' })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.should.have.property('status').eql('fail');
          res.body.should.have.property('message').eql('Please enter price/quantity in integer format');
          done();
        });
    });
    const newOrder = { name: JSON.stringify(['chicken', 'salad']), quantity: 2, price: 1500 };

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
    it('should allow a logged-in user to successfully create a new order', (done) => {
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
          res.body.order.should.have.property('orderid').eql(orderId);
          res.body.order.should.have.property('userid').eql(id);
          res.body.order.should.have.property('name').eql(newOrder.name);
          res.body.order.should.have.property('quantity').eql(newOrder.quantity);
          res.body.order.should.have.property('price').eql(newOrder.price);
          res.body.order.should.have.property('status').eql('NEW');
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
          res.body.should.have.property('message').eql('Please provide a valid token');
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
          res.body.should.have.property('result');
          done();
        });
    });
  });

  describe('GET A SPECIFIC ORDER (GET /order/orderId)', () => {
    it('does not retrieve an order with invalid token', (done) => {
      chai.request(server(orderC, userC, menuC))
        .get(`/api/v1/orders/${orderId}`)
        .end((err, res) => {
          res.status.should.equal(401);
          res.body.should.have.property('status').eql('fail');
          res.body.should.have.property('message').eql('Please provide a valid token');
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
        .get('/api/v1/orders/1000000')
        .set({ 'x-access-token': adminToken })
        .end((err, res) => {
          res.status.should.equal(404);
          res.body.should.have.property('status').eql('fail');
          res.body.should.have.property('message').eql('Order with id 1000000 not found');
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
          res.body.should.have.property('result');
          done();
        });
    });
  });
});
