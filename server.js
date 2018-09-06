import express from 'express';

// OrdersController intance must be created and passed from outside
export default (orders) => {
  const server = express();

  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  server.get('/orders', (req, res) => orders.index().then(result => res.status(200).send(result)));
  server.get('/orders/:orderId', (req, res) => orders.read(req.params.orderId)
    .then(result => res.status(200).send(result))
    .catch(() => res.sendStatus(404)));

  server.post('/orders', (req, res) => orders.create(req.body.order).then(result => res.status(201).send(result)));
  server.post('/orders/:orderId', (req, res) => orders.update(req.params.orderId, req.body.order)
    .then(result => res.status(200).send(result)));
  return server;
};
