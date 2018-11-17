import express from 'express';
import logger from 'morgan';
import path from 'path';
import upload from './helpers/upload';
import AuthC from './controllers/authController';

export default (orderC, userC, menuC) => {
  const server = express();
  const prefix = '/api/v1';

  /** TOP LEVEL MIDDLEWARES ** */
  server.use(logger('dev'));
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  // GET /orders
  server.get(`${prefix}/orders`, AuthC.verifyAdminToken, (_req, res) => orderC.read().then(result => res.status(result.statusCode).json(result))
    .catch(err => res.status(500).json({ status: 'fail', message: err.error || err.message })));

  // GET /orders:orderId
  server.get(`${prefix}/orders/:orderId`, AuthC.verifyAdminToken, (req, res) => {
    orderC.read(req).then(result => res.status(result.statusCode).json(result))
      .catch(err => res.status(404)
        .json({ status: 'fail', message: err.error || err.message }));
  });

  // POST /orders
  server.post(`${prefix}/orders`, AuthC.verifyToken, (req, res) => orderC.create(req)
    .then(result => res.status(result.statusCode).json(result))
    .catch(err => res.status(err.statusCode || 500)
      .json({ status: 'fail', error: err.message || err.error })));
  // PUT /orders/:orderId
  server.put(`${prefix}/orders/:orderId`, AuthC.verifyAdminToken, (req, res) => {
    orderC.updateStatus(req)
      .then(result => res.status(result.statusCode).json(result))
      .catch(err => res.status(400)
        .json({ status: 'fail', message: err.error || err.message }));
  });

  // DELETE /orders/:orderId
  server.delete(`${prefix}/orders/:orderId`, (req, res) => orderC.delete(req.params.orderId)
    .then(result => res.status(200).json(result))
    .catch(() => res.sendStatus(404)));

  // ****** USER ROUTES **** //
  // SIGNUP /user
  server.post(`${prefix}/auth/signup`, (req, res) => userC.create(req)
    .then(result => res.status(result.statusCode).json(result))
    .catch(err => res.status(err.statusCode || 500)
      .json({ status: 'fail', error: err.message || err.error })));

  // LOGIN /user
  server.post(`${prefix}/auth/login`, (req, res) => userC.login(req)
    .then(result => res.status(result.statusCode).json(result))
    .catch(err => res.status(err.statusCode || 500)
      .json({ status: 'fail', error: err.message || err.error })));

  // GET all order-history by userId
  server.get(`${prefix}/users/:userId/orders`, AuthC.verifyToken, (req, res) => userC.findOrdersByUserId(req)
    .then(result => res.status(result.statusCode).json(result))
    .catch(err => res.status(err.statusCode || 500)
      .json({ status: err.statusCode, error: err.error || err.message })));

  server.get(`${prefix}/users`, AuthC.verifyAdminToken, (_req, res) => userC.read().then(result => res.status(result.statusCode).json(result))
    .catch(err => res.status(500).json({ status: 'fail', message: err.error || err.message })));


  // ****** MENU ROUTES **** //
  server.get(`${prefix}/menu`, AuthC.verifyToken, (_req, res) => menuC.read()
    .then(result => res.status(result.statusCode).json(result))
    .catch(err => res.status(err.statusCode || 500).json(err)));

  server.post(`${prefix}/menu`, AuthC.verifyAdminToken, upload.single('img'), (req, res) => menuC.create(req)
    .then(result => res.status(result.statusCode).json(result))
    .catch(err => res.status(err.statusCode || 500).json(err)));

  server.put(`${prefix}/menu/:foodId`, AuthC.verifyAdminToken, upload.single('img'), (req, res) => {
    menuC.update(req)
      .then(result => res.status(result.statusCode).json(result))
      .catch(err => res.status(err.statusCode || 500)
        .json({ status: 'fail', message: err.error || err.message }));
  });

  server.delete(`${prefix}/menu/:foodId`, AuthC.verifyAdminToken, (req, res) => menuC.delete(req)
    .then(result => res.status(result.statusCode).json(result))
    .catch(err => res.status(err.statusCode || 500).json(err)));


  server.get('/api/v1', (req, res) => res.status(200).json({ message: 'Welcome to API version 1 of FastFoodFast' }));

  // ==========POWER FRONT-END PAGES===============//
  const uiPath = path.join(__dirname, '../../UI');
  server.use(express.static(uiPath));
  server.use('/uploads', express.static('uploads'));

  server.get('/', (_req, res) => {
    res.sendFile(`${uiPath}/templates/index.html`);
  });
  server.get('/index', (_req, res) => {
    res.sendFile(`${uiPath}/templates/index.html`);
  });
  server.get('/userIndex', (_req, res) => {
    res.sendFile(`${uiPath}/templates/userIndex.html`);
  });

  server.get('/menu', (_req, res) => {
    res.sendFile(`${uiPath}/templates/menu.html`);
  });
  server.get('/userMenu', (_req, res) => {
    res.sendFile(`${uiPath}/templates/userMenu.html`);
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

  // CATCH ALL OTHER ROUTES
  server.get('*', (req, res) => res.status(404).json({ message: 'Welcome to Fast Food Fast', error: 'Sorry, this route is not available' }));
  server.post('*', (req, res) => res.status(404).json({ message: 'Welcome to Fast Food Fast', error: 'Sorry, this route is not available' }));

  return server;
};
