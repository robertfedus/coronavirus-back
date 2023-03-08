const express = require('express');
const connectionController = require('./../controllers/connectionController');
const { privateRoute } = require('./privateRoute');

const router = express.Router();

// prettier-ignore
router.post('/sendRequest', privateRoute, connectionController.checkDuplicates, connectionController.sendRequest);
// prettier-ignore
router.get('/getRequests/:role', privateRoute, connectionController.getRequests);
router.post('/acceptRequest', privateRoute, connectionController.acceptRequest);
// prettier-ignore
router.patch('/declineRequest', privateRoute, connectionController.declineRequest);
router.post('/acceptAll', privateRoute, connectionController.acceptAll);
router.patch('/declineAll', privateRoute, connectionController.declineAll);
router.patch('/deleteFriend', privateRoute, connectionController.deleteFriend);

module.exports = router;
