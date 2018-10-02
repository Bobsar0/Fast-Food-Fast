import { expect } from 'chai';
import Validator from '../server/api/models/userValidator';

describe('Validator', () => {
  it('creates a new model', () => {
    expect(new Validator()).to.be.an.instanceof(Validator);
  });
  it('takes in email and password as paramaters', () => {
    expect(new Validator()).to.have.property('email');
    expect(new Validator()).to.have.property('password');
  });

  describe('checks for valid email', () => {
    it('returns false for invalid email', () => {
      const email = 'bob';
      const user = new Validator(email, '');
      expect(user.isValidEmail()).to.equal(false);
    });
    it('returns true for valid email', () => {
      const email = 'bob@gmail.com';
      const user = new Validator(email, '');
      expect(user.isValidEmail()).to.equal(true);
    });
  });
});
