import express from 'express';
import path from 'path';
import compression from 'compression';
import logger from 'morgan';

// OrdersController intance must be created and passed from outside
export default (orderC) => {
  const server = express();
  const prefix = '/api/v1';

  /** TOP LEVEL MIDDLEWARES ** */
  // log requests to console
  server.use(logger('dev'));
  // parse requests of content-type - application/json
  server.use(express.json());
  // parse requests of content-type - application/x-www-form-urlencoded
  server.use(express.urlencoded({ extended: true }));

  // GET /orders
  server.get(`${prefix}/orders`, (_req, res) => orderC.read().then(result => res.status(200).json(result)));

  // GET /orders:orderId
  server.get(`${prefix}/orders/:orderId`, (req, res) => {
    orderC.read(req.params.orderId)
      .then(result => res.status(200).json(result))
      .catch(() => res.status(404).json({ Error: { status: `${res.statusCode}`, msg: 'Order Not Found' } }));
  });

  // POST /orders
  server.post(`${prefix}/orders`, (req, res) => {
    // kill the connection if someone tries to flood the RAM
    let body = '';
    req.on('data', (data) => {
      body += data;
      if (body.length > 1e6) {
        // Nuke request if flood attack or faulty client
        req.connection.destroy();
        return res.status(400).json({ warning: 'Please reduce content. You are flooding my server!' });
      }
    });
    // Validate request
    if (req.body === {}) {
      return res.status(400).json({ message: 'Sorry, order content cannot be empty' });
    }
    if (!req.body.name) {
      return res.status(400).json({ message: 'Sorry, name of order cannot be empty' });
    }
    if (!req.body.userAddr) {
      return res.status(400).json({ message: 'Sorry, your delivery address cannot be empty' });
    }
    orderC.create(req.body)
      .then((result) => {
        if (result === undefined) {
          return res.status(400).json({ message: 'Sorry invalid order request' });
        }
        res.status(201).json(result);
      });
  });

  // PUT /orders/:orderId
  server.put(`${prefix}/orders/:orderId`, (req, res) => {
    // kill the connection if someone tries to flood the RAM
    let body = '';
    req.on('data', (data) => {
      body += data;
      if (body.length > 1e6) {
        // Nuke request if flood attack or faulty client
        req.connection.destroy();
        return res.status(400).json({ warning: 'Please reduce content. You are flooding my server!' });
      }
    });
    orderC.update(req.params.orderId, req.body)
      .then(result => res.status(200).json(result))
    // Catch general error if uncaught by controller
      .catch(() => res.status(404).json({ Error: { status: `${res.statusCode}`, msg: 'Order not found' } }));
  });

  // DELETE /orders/:orderId
  server.delete(`${prefix}/orders/:orderId`, (req, res) => orderC.delete(req.params.orderId)
    .then(result => res.status(200).json(result))
    .catch(() => res.sendStatus(404)));

  // ==========POWER FRONT-END PAGES===============//
  // Compress the routes
  server.use(compression());

  const dirName = '/UI/templates';
  server.use(express.static(path.join(__dirname, '/UI')));

  server.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, dirName, '/index.html'));
  });
  server.get('/index', (_req, res) => {
    res.sendFile(path.join(__dirname, dirName, '/index.html'));
  });
  server.get('/menu', (_req, res) => {
    res.sendFile(path.join(__dirname, `${dirName}/menu.html`));
  });

  server.get('/signup', (_req, res) => {
    res.sendFile(path.join(__dirname, `${dirName}/signup.html`));
  });
  server.get('/login', (_req, res) => {
    res.sendFile(path.join(__dirname, `${dirName}/login.html`));
  });
  server.get('/admin', (_req, res) => {
    res.sendFile(path.join(__dirname, `${dirName}/admin.html`));
  });

  return server;
};
