import chai from 'chai';
import chaiHttp from 'chai-http';
import { Pool } from 'pg';
import DB from '../../server/api/models/dbModel';
import UsersController from '../../server/api/controllers/usersController';
import server from '../../server/api/server';
import AuthModel from '../../server/api/models/authModel';
import UserModel from '../../server/api/models/userModel';
import OrdersDBController from '../../server/api/controllers/ordersDBcontroller';
import MenuController from '../../server/api/controllers/menuController';

const pool = new Pool({
  connectionString: process.env.DB_URL_TEST,
});
pool.on('connect', () => {
});
const db = new DB(pool);

chai.use(chaiHttp);

describe('API endpointsUsersController', () => {
  const auth = new AuthModel();
  const userM = new UserModel();
  const userC = new UsersController(db, userM, auth);
  const orderC = new OrdersDBController(db);
  const menuC = new MenuController(db);
  beforeEach((done) => {
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

  describe('/POST Signup', () => {
    it('it should successfully create a user account', (done) => {
      const user = { username: 'bobo', email: 'bob2@gmail.com', password: 'Password!2' };
      chai.request(server(orderC, userC, menuC))
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.status.should.equal(201);
          res.body.should.have.property('message').eql('Signup successful');
          res.body.user.should.have.property('email').eql('bob2@gmail.com');
          res.body.user.should.have.property('username').eql('bobo');
          res.body.user.should.have.property('createdDate');
          res.body.user.should.have.property('modifiedDate');
          res.body.should.have.property('token');
          done();
        });
    });
  });
});
