import express from 'express';
import path from 'path';

// OrdersController intance must be created and passed from outside
export default (orders) => {
  const server = express();
  const prefix = '/api/v1';

  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  // GET /orders
  server.get(`${prefix}/orders/`, (req, res) => orders.index().then(result => res.status(200).json(result)));
  server.get(`${prefix}/orders/`, (req, res) => orders.index().then(result => res.status(200).send(result)));

  // GET /orders:orderId
  server.get(`${prefix}/orders/:orderId`, (req, res) => orders.read(req.params.orderId)
    .then(result => res.status(200).send(result))
    .catch(() => res.sendStatus(404)));

  // POST /orders
  server.post(`${prefix}/orders/`, (req, res) => orders.create(req.body.order).then(result => res.status(201).json(result)));
  // PUT /orders/:orderId
  server.post(`${prefix}/orders/:orderId`, (req, res) => orders.update(req.params.orderId, req.body.order)
    .then(result => res.status(200).json(result))
    .catch(() => res.sendStatus(404)));

  // DELETE /orders/:orderId
  server.delete(`${prefix}/orders/:orderId`, (req, res) => orders.cancel(req.params.orderId)
    .then(() => res.status(200).json({ orderId: req.params.orderId }))
    .catch(() => res.sendStatus(404)));

  // ==========POWER FRONT-END PAGES===============//
  const dirName = '/UI/templates';
  server.use(express.static(path.join(__dirname, '/UI')));

  server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, dirName, '/index.html'));
  });
  server.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, dirName, '/index.html'));
  });
  server.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, `${dirName}/menu.html`));
  });

  server.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, `${dirName}/signup.html`));
  });
  server.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, `${dirName}/login.html`));
  });
  server.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, `${dirName}/admin.html`));
  });

  return server;
};
