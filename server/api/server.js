import express from 'express';
import logger from 'morgan';

// OrdersController intance must be created and passed from outside
export default (orderC, userC) => {
  const server = express();
  const prefix = '/api/v1';

  /** TOP LEVEL MIDDLEWARES ** */
  server.use(logger('dev'));
  server.use(express.json());
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
    return orderC.create(req.body)
      .then((result) => {
        if (result === undefined) {
          return res.status(400).json({ message: 'Sorry invalid order request' });
        }
        return res.status(201).json(result);
      })
      .catch(() => res.sendStatus(404));
  });

  // PUT /orders/:orderId
  server.put(`${prefix}/orders/:orderId`, (req, res) => {
    orderC.update(req.params.orderId, req.body)
      .then(result => res.status(200).json(result))
      .catch(() => res.status(404).json({ Error: { status: `${res.statusCode}`, msg: 'Order not found' } }));
  });

  // DELETE /orders/:orderId
  server.delete(`${prefix}/orders/:orderId`, (req, res) => orderC.delete(req.params.orderId)
    .then(result => res.status(200).json(result))
    .catch(() => res.sendStatus(404)));

  // ****** USER ROUTES **** //
  // CREATE /user
  server.post(`${prefix}/auth/signup`, (req, res) => userC.create(req)
    .then(result => res.status(result.status).json(result))
    .catch(err => res.status(err.status).json({ status: err.status, msg: err.error })));

  return server;
};
