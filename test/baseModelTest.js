import { expect } from 'chai';
import BaseModel from '../models/baseModel';

describe('Models', () => {
  it('should create a new model', () => {
    const UserModel = new BaseModel();
    expect(UserModel).to.be.an.instanceof(BaseModel);
  });
});
