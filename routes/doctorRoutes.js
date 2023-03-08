const express = require('express');
const doctorController = require('./../controllers/doctorController');
const { privateRoute } = require('./privateRoute');

const router = express.Router();

router.get('/getPatients', privateRoute, doctorController.getPatients);
router.put(
  '/updateStatus/:patient',
  privateRoute,
  doctorController.updateStatus
);

module.exports = router;
