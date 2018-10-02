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

  describe('Email Validator', () => {
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

  describe('Password Validator', () => {
    it('returns false for password that does not contain an uppercase letter', () => {
      const user = new Validator('', 'aa1!hhh');
      expect(user.isValidPassword()).to.equal('Your password must contain at least one uppercase letter');
    });
    it('returns false for password that does not contain an lowercase letter', () => {
      const user = new Validator('', 'ABC224!');
      expect(user.isValidPassword()).to.equal('Your password must contain at least one lowercase letter');
    });
    it('returns false for password that does not contain a special character', () => {
      const user = new Validator('', 'ABcc123');
      expect(user.isValidPassword()).to.equal('Your password must contain at least one of these special characters: @, $, !, %, *, ?, &');
    });
    it('returns false for password that does not contain up to six characters', () => {
      const user = new Validator('', 'aS1!0');
      expect(user.isValidPassword().length).to.be.gte(6);
    });
    it('returns true for a valid password', () => {
      const user = new Validator('', 'Ab!2340');
      expect(user.isValidPassword()).to.equal('true');
    });
  });

  describe('Hash Password Method', () => {
    it('returns hashed password of type string', () => {
      const user = new Validator('bob@gmail.com', 'aaB?0cd');
      expect(user.hashedPassword).to.be.a('string');
    });
  });

  describe('Compare Password Method', () => {
    it('returns false if passwords are not equal', () => {
      const user = new Validator('bob@gmail.com', 'aaB?0ce');
      const password = 'ASHCJCJVKV';
      expect(user.comparePassword(password)).to.equal(false);
    });
    it('returns true if passwords are equal', () => {
      const user = new Validator('bob@gmail.com', 'aaB?0cd');
      expect(user.comparePassword(user.hashedPassword)).to.equal(true);
    });
  });
});
