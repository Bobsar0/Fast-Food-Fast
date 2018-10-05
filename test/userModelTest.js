import { expect } from 'chai';
import UserModel from '../server/api/models/userModel';

describe('User Model', () => {
  const user = new UserModel();
  it('creates a new model', () => {
    expect(user).to.be.an.instanceof(UserModel);
  });
  it('takes in proper paramaters', () => {
    expect(user).to.have.property('email');
    expect(user).to.have.property('password');
    expect(user).to.have.property('phone');
    expect(user).to.have.property('address');
    expect(user).to.have.property('role');
    expect(user).to.have.property('password');
  });
});
