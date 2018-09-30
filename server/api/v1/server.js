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
      .catch(err => res.status(404).json({ status: 404, msg: err.message }));
  });

  // POST /orders
  server.post(`${prefix}/orders`, (req, res, next) => {
    // kill the connection if someone tries to flood the RAM
    let body = '';
    req.on('data', (data) => {
      body += data;
      if (body.length > 1e6) {
        // Nuke request if flood attack or faulty client
        req.connection.destroy();
        return res.status(400).json({ warning: 'Please reduce content. You are flooding my server!' });
      }
      return next();
    });
    // Validate request
    // The line below was adapted from this source: https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
      return res.status(400).json({ status: 400, message: 'Sorry, order content cannot be empty' });
    }
    // if (req.body.constructor !== Object) {
    //   return res.status(400).json({ status: 400, message: 'Bad REQ' });
    // }
    if (!req.body.name) {
      return res.status(400).json({ status: 400, message: 'Sorry, name of order cannot be empty' });
    }
    if (!req.body.price) {
      return res.status(400).json({ status: 400, message: 'Sorry, price of order cannot be empty' });
    }
    if (!req.body.userAddr) {
      return res.status(400).json({ status: 400, message: 'Sorry, your delivery address cannot be empty' });
    }
    return orderC.create(req.body)
      .then(order => res.status(201).json({ message: 'order created successfully', order }))
      .catch(err => res.status(400).json(err));
  });

  // PUT /orders/:orderId
  server.put(`${prefix}/orders/:orderId`, (req, res, next) => {
    // kill the connection if someone tries to flood the RAM
    let body = '';
    req.on('data', (data) => {
      body += data;
      if (body.length > 1e6) {
        // Nuke request if flood attack or faulty client
        req.connection.destroy();
        return res.status(400).json({ warning: 'Please reduce content. You are flooding my server!' });
      }
      return next();
    });
    orderC.update(req.params.orderId, req.body)
      .then(result => res.status(200).json(result))
    // Catch general error if uncaught by controller
      .catch(err => res.status(404).json({ status: 404, msg: err.message }));
  });

  // DELETE /orders/:orderId
  server.delete(`${prefix}/orders/:orderId`, (req, res) => orderC.delete(req.params.orderId)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(404).json({ status: 404, msg: err.message })));

  // ==========POWER FRONT-END PAGES===============//
  // Compress the routes
  server.use(compression());

  const uiPath = path.join(__dirname, '../../../UI');
  server.use(express.static(uiPath));

  server.get('/', (_req, res) => {
    res.sendFile(`${uiPath}/templates/index.html`);
  });
  server.get('/index', (_req, res) => {
    res.sendFile(`${uiPath}/templates/index.html`);
  });
  server.get('/menu', (_req, res) => {
    res.sendFile(`${uiPath}/templates/menu.html`);
  });

  server.get('/signup', (_req, res) => {
    res.sendFile(`${uiPath}/templates/signup.html`);
  });
  server.get('/login', (_req, res) => {
    res.sendFile(`${uiPath}/templates/login.html`);
  });
  server.get('/admin', (_req, res) => {
    res.sendFile(`${uiPath}/templates/admin.html`);
  });
  server.get('/history', (_req, res) => {
    res.sendFile(`${uiPath}/templates/history.html`);
  });

  return server;
};
