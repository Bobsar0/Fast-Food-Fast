import { expect } from 'chai';
import dotenv from 'dotenv';
import Auth from '../server/api/models/authmodel';

describe('Auth', () => {
  it('creates a new model', () => {
    expect(new Auth()).to.be.an.instanceof(Auth);
  });
  it('takes in password paramater', () => {
    expect(new Auth()).to.have.property('password');
  });

  describe('Hash Password Method', () => {
    it('returns hashed password of type string', () => {
      const auth = new Auth();
      expect(auth.hashPassword('aaB?0cd')).to.be.a('string');
      expect(auth.hashPassword('aaB?0cd')).to.has.lengthOf(60);
    });
  });

  describe('Compare Password Method', () => {
    it('returns false if passwords are not equal', () => {
      const auth = new Auth('aaB?0ce');
      const password = 'ASHCJCJVKV';
      expect(auth.comparePassword(password)).to.equal(false);
    });
    it('returns true if passwords are equal', () => {
      const auth = new Auth('aaB?0cd');
      expect(auth.comparePassword(auth.hashPassword('aaB?0cd'))).to.equal(true);
    });
  });

  describe('Generate token', () => {
    dotenv.config();
    process.env.SECRET = 'some secret';
    it('returns a valid token', () => {
      const user = new Auth('aaB?0cd');
      expect(user.generateToken('1', 'user').length).to.be.gt(1);
      expect(user.generateToken('1')).to.be.a('string');
    });
  });
});
