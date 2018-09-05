import 'babel-polyfill';
import supertest from 'supertest';
import server from '../server';

describe('server', () => {
  const request = supertest(server);

  // checks that server returns success response when 'GET /orders' is performed
  // response content is not verified here yet.
  describe('GET /orders', () => it('responds with OK', () => request
    .get('/orders')
    .expect(200)));
});
