import express from 'express';

// OrdersController intance must be created and passed from outside
export default (orders) => {
  const server = express();
  const prefix = '/api/v1';

  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  // GET /orders
  server.get(`${prefix}/orders/`, (req, res) => orders.index().then(result => res.status(200).send(result)));
  // GET /orders:orderId
  server.get(`${prefix}/orders/:orderId`, (req, res) => orders.read(req.params.orderId)
    .then(result => res.status(200).send(result))
    .catch(() => res.sendStatus(404)));

  // POST /orders
  server.post(`${prefix}/orders/`, (req, res) => orders.create(req.body.order).then(result => res.status(201).send(result)));
  // PUT /orders/:orderId
  server.post(`${prefix}/orders/:orderId`, (req, res) => orders.update(req.params.orderId, req.body.order)
    .then(result => res.status(200).send(result))
    .catch(() => res.sendStatus(404)));

  // DELETE /orders/:orderId
  server.delete(`${prefix}/orders/:orderId`, (req, res) => orders.del(req.params.orderId)
    .then(() => res.status(200).send({ orderId: req.params.orderId }))
    .catch(() => res.sendStatus(404)));
  return server;
};
