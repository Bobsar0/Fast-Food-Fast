import express from 'express';

// OrdersController intance must be created and passed from outside
export default (orders) => {
  const server = express();

  server.get('/orders', (req, res) => orders.index().then(() => res.sendStatus(200)));

  return server;
};
