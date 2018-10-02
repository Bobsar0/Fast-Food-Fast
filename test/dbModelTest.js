import { expect } from 'chai';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import DB from '../server/api/models/dbModel';

dotenv.config();

describe('Database Model', () => {
  const pool = new Pool();
  before(() => {
    pool.on('connect', () => {
    });
  });
  after(() => {
    pool.end();
  });
  const db = new DB(pool);
  it('creates a new model', () => {
    expect(db).to.be.an.instanceof(DB);
  });
  it('takes in connection pool as a paramater', () => {
    expect(db).to.have.property('pool');
  });
});
