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
  connectionString: 'postgres://cfsezloo:oA41pLZTXNtBIR_vxJHO-ZXqwHM0lAzR@tantor.db.elephantsql.com:5432/cfsezloo',
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
    it('does not create user account with null username, email or password', (done) => {
      const user = { username: 'bobo' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('Please input username, email and password');
          done();
        });
    });
    it('does not create user account with invalid username', (done) => {
      const user = { username: ' ', email: 'bob@gmail.com', password: 'Abc!23' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('Please input valid username');
          done();
        });
    });
    it('does not create user account with invalid email', (done) => {
      const user = { username: 'bobo', email: 'bobo@g', password: 'Password!2' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('Please enter a valid email address');
          done();
        });
    });

    it('does not create user account with password that does not contain an uppercase letter', (done) => {
      const user = { username: 'bobo', email: 'bobo@gmail.com', password: 'password!2' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('Your password must contain at least one uppercase letter');
          done();
        });
    });

    it('does not create user account with password that does not contain a lowercase letter', (done) => {
      const user = { username: 'bobo', email: 'bobo@gmail.com', password: 'PASSWORD!2' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('Your password must contain at least one lowercase letter');
          done();
        });
    });

    it('does not create user account with password that does not contain a number', (done) => {
      const user = { username: 'bobo', email: 'bobo@gmail.com', password: 'Password!' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('Your password must contain at least one number');
          done();
        });
    });
    it('does not create user account with password that does not contain a special character', (done) => {
      const user = { username: 'bobo', email: 'bobo@gmail.com', password: 'Password12' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('Your password must contain at least one of these special characters: @, $, !, %, *, ?, &');
          done();
        });
    });

    it('does not create user account with password that does not contain up to six characters', (done) => {
      const user = { username: 'bobo', email: 'bobo@gmail.com', password: 'Pas!2' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('Your password must be composed of at least 6 characters');
          done();
        });
    });

    it('catches all other errors', (done) => {
      const user = {
        username: 'bobo', email: 'bobo@gmail.com', password: 'Pass!2', phone: '012345678901234567890',
      };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(500);
          res.body.status.should.equal('fail');
          res.body.should.have.property('error');
          done();
        });
    });

    it('it should successfully create a user account with valid credentials', (done) => {
      const user = {
        username: 'Bobo', email: 'BOBO@gmail.com', password: 'Password!2', phone: '0123456789',
      };
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
          res.body.user.should.have.property('phone').eql('0123456789');
          res.body.user.should.have.property('createdDate');
          res.body.user.should.have.property('modifiedDate');
          res.body.should.have.property('token');
          done();
        });
    });

    it('does not create user account with already existing username', (done) => {
      const user = {
        username: 'Bobo', email: 'bob@gmail.com', password: 'Abc!23',
      };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(409);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('Username bobo already exists');
          done();
        });
    });
    it('does not create user account with already existing email address', (done) => {
      const user = { username: 'B', email: 'bobo@gmail.com', password: 'Abc!23' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(409);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('Email address bobo@gmail.com already exists');
          done();
        });
    });
    it('does not create user account with already existing phone number', (done) => {
      const user = {
        username: 'bobsar', email: 'bobsar@gmail.com', password: 'Abc!23', phone: '0123456789',
      };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(409);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('Phone number 0123456789 already exists');
          done();
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should not login a user with null or incorrect username or email and password', (done) => {
      const user = { usernameEmail: 'foo', password: 'bar' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/login')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.should.have.property('message').eql('The credentials you provided are incorrect');
          done();
        });
    });
    it('should not login with empty request body', (done) => {
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/login')
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('Please login with either (username or email) and password');
          done();
        });
    });
    it('should not login a user with any information other than username/email and password', (done) => {
      const user = { usernameEmail: 'foo', password: 'bar', role: 'admin' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/login')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('Please login with either (username or email) and password');
          done();
        });
    });

    it('should not login a user with correct username/email but incorrect password', (done) => {
      const user = { usernameEmail: 'bobo', password: 'bar' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/login')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('The credentials you provided are incorrect');
          done();
        });
    });

    it('should successfully login an existing user with valid username and password', (done) => {
      const user = { usernameEmail: 'bobo', password: 'Password!2' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/login')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.status.should.equal('success');
          res.body.should.have.property('message').eql('Login successful');
          res.body.should.have.property('user');
          res.body.should.have.property('token');
          done();
        });
    });

    it('should successfully login an existing user with valid email and password', (done) => {
      const user = { usernameEmail: 'bobo@gmail.com', password: 'Password!2' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/login')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.status.should.equal('success');
          res.body.should.have.property('message').eql('Login successful');
          res.body.should.have.property('user');
          res.body.should.have.property('token');
          done();
        });
    });
  });

  describe('GET /users/userId/orders', () => {
    it('it returns failure message for invalid userId', (done) => {
      chai.request(server(orderC, userC, menuC))
        .get('/api/v1/users/10000/orders')
        .set({ 'x-access-token': testToken })
        .end((err, res) => {
          res.status.should.equal(404);
          res.body.status.should.equal('fail');
          res.body.should.have.property('message').eql('User not found');
          done();
        });
    });
    it('it returns failure message for null token', (done) => {
      chai.request(server(orderC, userC, menuC))
        .get('/api/v1/users/10000/orders')
        .end((err, res) => {
          res.status.should.equal(401);
          res.body.should.have.property('error');
          res.body.error.status.should.equal('fail');
          res.body.error.should.have.property('message').eql('Token is not provided');
          done();
        });
    });
    it('catches all other errors', (done) => {
      chai.request(server(orderC, userC, menuC))
        .get(`/api/v1/users/${id}/orders`)
        .set({ 'x-access-token': 'invalid' })
        .end((err, res) => {
          res.status.should.equal(500);
          res.body.should.have.property('error');
          res.body.error.status.should.equal('fail');
          res.body.error.should.have.property('message').eql('jwt malformed');
          done();
        });
    });
    it('should GET the order history of a particular user', (done) => {
      chai.request(server(orderC, userC, menuC))
        .get(`/api/v1/users/${id}/orders`)
        .set({ 'x-access-token': testToken })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.status.should.equal('success');
          res.body.should.have.property('orders');
          res.body.should.have.property('message').eql('User has not made an order yet');
          done();
        });
    });
  });
});
