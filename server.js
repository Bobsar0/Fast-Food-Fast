import express from 'express';

// OrdersController intance must be created and passed from outside
export default (orders) => {
  const server = express();

  server.get('/orders', (req, res) => orders.index().then(result => res.status(200).send(result)));

  return server;
};
