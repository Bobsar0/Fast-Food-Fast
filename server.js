import express from 'express';

const server = express();

// Server always responds with the empty object for now. Content
// is not tested yet, just server availability.
server.get('/orders', (req, res) => res.send({}));

export default server;
