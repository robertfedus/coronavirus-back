const express = require('express');
const patientController = require('./../controllers/patientController');
const { privateRoute } = require('./privateRoute');

const router = express.Router();

router.get('/getStatus/:patient', patientController.getStatus);
router.get('/symptom/:patient', privateRoute, patientController.getSymptoms);
router.post('/symptom', privateRoute, patientController.addSymptom);
router.get('/getDoctors', privateRoute, patientController.getDoctors);

module.exports = router;
