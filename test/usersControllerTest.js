import chai from 'chai';
import chaiHttp from 'chai-http';
import { Pool } from 'pg';
import DB from '../server/api/models/dbModel';
import UsersController from '../server/api/controllers/usersController';
import server from '../server/api/server';
import AuthModel from '../server/api/models/authModel';
import UserModel from '../server/api/models/userModel';
import OrdersDBController from '../server/api/controllers/ordersDBcontroller';
import MenuController from '../server/api/controllers/menuController';

const pool = new Pool({
  connectionString: process.env.DB_URL_TEST,
});
pool.on('connect', () => {
});
const db = new DB(pool);

chai.use(chaiHttp);

describe('User Endpoints', () => {
  const auth = new AuthModel();
  const userM = new UserModel();
  const userC = new UsersController(db, userM, auth);
  const orderC = new OrdersDBController(db);
  const menuC = new MenuController(db);
  let testToken = '';
  let id = '';

  before((done) => {
    // Uncomment the 2 lines below when running for the first time to create tables
    // db.createUsersTable();
    // db.createOrdersTable();
    db.deleteRows('users');
    done();
  });
  after(() => {
    pool.end();
  });
  it('creates a new model', () => {
    userC.should.be.an.instanceof(UsersController);
  });
  it('takes in db and user model instance as paramaters', () => {
    userC.should.have.property('db');
    userC.should.have.property('user');
  });

  describe('POST /auth/signup', () => {
    it('it should successfully create a user account', (done) => {
      const user = { username: 'bobo', email: 'bobo@gmail.com', password: 'Password!2' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          const { userId } = res.body.user;
          id = userId;
          const { token } = res.body;
          testToken = token;
          res.status.should.equal(201);
          res.body.should.have.property('message').eql('Signup successful');
          res.body.user.should.have.property('email').eql('bobo@gmail.com');
          res.body.user.should.have.property('username').eql('bobo');
          res.body.user.should.have.property('createdDate');
          res.body.user.should.have.property('modifiedDate');
          res.body.should.have.property('token');
          done();
        });
    });
  });

  describe('POST /auth/login', () => {
    it('it should not login a user with incorrect credentials', (done) => {
      const user = { username: 'foo', password: 'bar' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/login')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.should.have.property('message').eql('The credentials you provided are incorrect');
          done();
        });
    });

    it('it should successfully login an existing user with username and password', (done) => {
      const user = { username: 'bobo', password: 'Password!2' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/login')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.should.have.property('message').eql('Login successful');
          res.body.should.have.property('token');
          done();
        });
    });

    it('it should successfully login an existing user with email and password', (done) => {
      const user = { email: 'bobo@gmail.com', password: 'Password!2' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/login')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.should.have.property('message').eql('Login successful');
          res.body.should.have.property('token');
          done();
        });
    });
  });

  describe('GET /users/userId/orders', () => {
    it('it should GET the order history of a particular user', (done) => {
      chai.request(server(orderC, userC, menuC))
        .get(`/api/v1/users/${id}/orders`)
        .set({ 'x-access-token': testToken })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.status.should.equal('success');
          res.body.should.have.property('message');
          done();
        });
    });
  });
});
