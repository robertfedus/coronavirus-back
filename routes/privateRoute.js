const jwt = require('jsonwebtoken');
const Patient = require('../models/patientModel');
const Doctor = require('./../models/doctorModel');

exports.privateRoute = async function(req, res, next) {
  const token = req.query.jwt;
  if (!token || !req.query.username)
    return res.status(401).json({
      code: 401,
      status: 'fail',
      message: 'Access denied'
    });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const patient = await Patient.findOne({
      username: req.query.username,
      jwt: token
    });
    const doctor = await Doctor.findOne({
      username: req.query.username,
      jwt: token
    });

    if (!patient && !doctor) {
      return res.status(401).json({
        code: 401,
        status: 'fail',
        message: 'Access denied'
      });
    }
    //req.user = verified;
  } catch (err) {
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'Invalid token'
    });
  }

  next();
};
