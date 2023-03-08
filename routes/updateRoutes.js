const express = require('express');
const updateController = require('./../controllers/updateController');
const { privateRoute } = require('./privateRoute');

const router = express.Router();

router.patch('/account/:field', privateRoute, updateController.account);
router.patch('/symptom/:index', privateRoute, updateController.deleteSymptom);
router.patch('/age', privateRoute, updateController.updateAge);
router.patch('/institution', privateRoute, updateController.updateInstitution);
router.patch(
  '/specialization',
  privateRoute,
  updateController.updateSpecialization
);
router.patch('/gender', privateRoute, updateController.updateGender);

module.exports = router;
