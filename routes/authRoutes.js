const express = require('express');
const authController = require('./../controllers/authController');
const { privateRoute } = require('./privateRoute');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/delete', privateRoute, authController.delete);

module.exports = router;
