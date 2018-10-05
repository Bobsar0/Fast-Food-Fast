import express from 'express';
import logger from 'morgan';
import AuthC from './controllers/authController';

// OrdersController intance must be created and passed from outside
export default (orderC, userC, menuC) => {
  const server = express();
  const prefix = '/api/v1';

  /** TOP LEVEL MIDDLEWARES ** */
  server.use(logger('dev'));
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  // GET /orders
  server.get(`${prefix}/orders`, AuthC.verifyAdminToken, (_req, res) => orderC.read().then(result => res.status(200).json(result)));

  // GET /orders:orderId
  server.get(`${prefix}/orders/:orderId`, AuthC.verifyAdminToken, (req, res) => {
    orderC.read(req)
      .then(result => res.status(200).json(result))
      .catch(() => res.status(404).json({ Error: { status: `${res.statusCode}`, msg: 'Order Not Found' } }));
  });

  // POST /orders
  server.post(`${prefix}/orders`, AuthC.verifyToken, (req, res) => {
    // Validate request
    // The line below was adapted from this source: https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
      return res.status(400).json({ status: 400, message: 'Sorry, order content cannot be empty' });
    }
    if (!req.body.name) {
      return res.status(400).json({ status: 400, message: 'Sorry, name of order cannot be empty' });
    }
    if (!req.body.price) {
      return res.status(400).json({ status: 400, message: 'Sorry, price of order cannot be empty' });
    }
    return orderC.create(req)
      .then(result => res.status(201).json({ result }))
      .catch(err => res.status(400).json({ err }));
  });

  // PUT /orders/:orderId
  server.put(`${prefix}/orders/:orderId`, AuthC.verifyAdminToken, (req, res) => {
    orderC.updateStatus(req)
      .then(result => res.status(200).json(result))
      .catch(err => res.status(404).json({ status: err.status, msg: err.error || err.message }));
  });

  // DELETE /orders/:orderId
  server.delete(`${prefix}/orders/:orderId`, (req, res) => orderC.delete(req.params.orderId)
    .then(result => res.status(200).json(result))
    .catch(() => res.sendStatus(404)));

  // ****** USER ROUTES **** //
  // SIGNUP /user
  server.post(`${prefix}/auth/signup`, (req, res) => userC.create(req)
    .then(result => res.status(result.status).json(result))
    .catch(err => res.status(err.status)
      .json({ status: err.status, msg: err.error || err.message })));

  // LOGIN /user
  server.post(`${prefix}/auth/login`, (req, res) => userC.login(req)
    .then(result => res.status(result.status).json(result))
    .catch(err => res.status(err.status).json({ status: err.status, msg: err.error })));

  // GET all order-history by userId
  server.get(`${prefix}/users/:userId/orders`, AuthC.verifyToken, (req, res) => userC.findOrdersByUserId(req)
    .then(result => res.status(result.status).json(result))
    .catch(err => res.status(err.status)
      .json({ status: err.status, msg: err.message || err.error })));

  // ****** MENU ROUTES **** //
  // GET /orders
  server.get(`${prefix}/menu`, AuthC.verifyToken, (_req, res) => menuC.read().then(result => res.status(200).json(result)));
  server.post(`${prefix}/menu`, AuthC.verifyAdminToken, (req, res) => {
    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
      return res.status(400).json({ status: 400, message: 'Sorry, menu content cannot be empty' });
    }
    if (!req.body.name) {
      return res.status(400).json({ status: 400, message: 'Sorry, name of food item cannot be empty' });
    }
    if (!req.body.price) {
      return res.status(400).json({ status: 400, message: 'Sorry, price of food item cannot be empty' });
    }
    if (!req.body.genre) {
      return res.status(400).json({ status: 400, message: 'Sorry, genre of food item cannot be empty' });
    }
    return menuC.create(req)
      .then(result => res.status(result.status).json({ result }))
      .catch(err => res.status(400).json({ err }));
  });

  server.get('/', (req, res) => res.status(200).json({ message: 'Welcome to Fast Food Fast' }));

  // CATCH ALL OTHER ROUTES
  server.get('*', (req, res) => res.status(404).json({ message: 'Welcome to Fast Food Fast', error: 'Sorry, this route is not available' }));
  server.post('*', (req, res) => res.status(404).json({ message: 'Welcome to Fast Food Fast', error: 'Sorry, this route is not available' }));

  return server;
};
