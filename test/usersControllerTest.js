import chai from 'chai';
import chaiHttp from 'chai-http';
import { Pool } from 'pg';
import DB from '../server/api/models/dbModel';
import UsersController from '../server/api/controllers/usersController';

const pool = new Pool({
  connectionString: process.env.DB_URL_TEST,
});
pool.on('connect', () => {
});
const db = new DB(pool);

chai.use(chaiHttp);

describe('UsersController', () => {
  beforeEach((done) => { // Before each test we empty the database
    db.dropUsersTable();
    db.createUsersTable();
    done();
  });
  after(() => {
    pool.end();
  });
  const userC = new UsersController();
  it('creates a new model', () => {
    userC.should.be.an.instanceof(UsersController);
  });
  it('takes in db and user model instance as paramaters', () => {
    userC.should.have.property('db');
    userC.should.have.property('user');
  });

  // describe('/POST Signup', () => {
  //   it('it should successfully create a user account', (done) => {
  //     const user = { username: 'bobo', email: 'bob2@gmail.com', password: 'ghGh23!'};
  //     chai.request(app)
  //       .post('/api/v1/auth/signup')
  //       .send(user)
  //       .end((err, res) => {
  //         console.log('res:::', res.body);
  //         res.body.user.should.have.property('username');
  //         res.body.user.should.have.property('email');
  //         res.body.user.should.have.property('password');
  //         done();
  //       });
  //   });
  // });
});
