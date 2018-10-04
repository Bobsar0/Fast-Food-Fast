import UsersController from '../server/api/controllers/usersController';

describe('UsersController', () => {
  const userC = new UsersController();
  it('creates a new model', () => {
    userC.should.be.an.instanceof(UsersController);
  });
  it('takes in db and user model instance as paramaters', () => {
    userC.should.have.property('db');
    userC.should.have.property('user');
  });
});
