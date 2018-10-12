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

  before((done) => {
    // Uncomment the 2 lines below when running for the first time to create tables
    // db.createUsersTable();
    // db.createOrdersTable();
    // db.deleteRows('orders');
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

    const user = {
      username: 'BoboUser', email: 'user@gmail.com', password: 'Password!2', phone: '01234567890',
    };
    chai.request(server(orderC, userC, menuC))
      .post('/api/v1/auth/signup')
      .send(user)
      .end((err, res) => {
        const { token } = res.body;
        userToken = token;
        done();
      });
  });
  after(() => {
    db.deleteRows('users');
    pool.end();
  });
  it('creates a new model', () => {
    orderC.should.be.an.instanceof(OrdersDBController);
  });
  it('takes in db and user model instance as paramaters', () => {
    orderC.should.have.property('db');
  });

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
    it('should successfully allow an admin to GET all orders', (done) => {
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
});
