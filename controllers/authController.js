const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('./validation');
const Patient = require('../models/patientModel');
const Doctor = require('./../models/doctorModel');

exports.register = async (req, res, next) => {
  // Validate the user
  console.log('Request body:', req.body);
  const { error } = registerValidation(req.body);

  const validationError = error;
  //console.log(error);
  if (validationError) {
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: validationError.details[0].message
    });
  }

  if (req.body.password !== req.body.passwordConfirm) {
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: "The two passwords don't match"
    });
  }

  // Checking if the user already exists in the DB
  const patientUsernameExists = await Patient.findOne({
    username: req.body.username
  });
  let doctorUsernameExists;
  if (!patientUsernameExists)
    doctorUsernameExists = await Doctor.findOne({
      username: req.body.username
    });

  if (patientUsernameExists || doctorUsernameExists)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'Username already exists'
    });

  // Hashing the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const token = jwt.sign(
    { username: req.body.username },
    process.env.JWT_SECRET
  );

  try {
    let saved;
    const dataObj = {
      name: req.body.name,
      username: req.body.username,
      gender: req.body.gender,
      age: req.body.age,
      phone: req.body.phone,
      password: hashedPassword,
      jwt: token,
      institution: req.body.institution,
      specialization: req.body.specialization
    };
    if (req.body.role === 'patient') {
      dataObj.institution = undefined;
      dataObj.specialization = undefined;

      const patient = new Patient(dataObj);
      saved = await patient.save();
      saved.password = undefined;
    } else {
      // connCode = Math.floor(100000 + Math.random() * 900000);
      // dataObj.connCode = connCode;

      const doctor = new Doctor(dataObj);
      saved = await doctor.save();
      saved.password = undefined;

      return res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Success!',
        role: 'doctor',
        token
      });
    }

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Success!',
      role: 'patient',
      token
    });
  } catch (err) {
    res.status(400).json({
      code: 400,
      status: 'fail',
      message: err
    });
    console.log(err);
  }

  next();
};

exports.login = async (req, res, next) => {
  console.log('Request body:', req.body);

  // Validate the user
  const { error } = loginValidation(req.body);
  const validationError = error;

  if (validationError) {
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: validationError.details[0].message
    });
  }

  const patient = await Patient.findOne({ username: req.body.username });
  let doctor;
  if (!patient) doctor = await Doctor.findOne({ username: req.body.username });

  if (!patient && !doctor)
    return res.status(401).json({
      code: 401,
      status: 'fail',
      message: 'Invalid credentials'
    });

  const password = doctor ? doctor.password : patient.password;
  const validPass = await bcrypt.compare(req.body.password, password);
  if (!validPass)
    return res.status(401).json({
      code: 401,
      status: 'fail',
      message: 'Invalid credentials'
    });

  // Creating and assigning a token
  const token = jwt.sign(
    { username: req.body.username },
    process.env.JWT_SECRET
  );

  if (patient)
    await Patient.updateOne({ username: req.body.username }, { jwt: token });
  else await Doctor.updateOne({ username: req.body.username }, { jwt: token });

  const connCode = doctor ? doctor.connCode : undefined;
  const resObj = {
    code: 200,
    status: 'succes',
    message: 'You are now logged in',
    name: patient ? patient.name : doctor.name,
    phone: patient ? patient.phone : doctor.phone,
    role: patient ? 'patient' : 'doctor',
    status: patient ? patient.status : undefined,
    institution: doctor ? doctor.institution : undefined,
    specialization: doctor ? doctor.specialization : undefined,
    age: patient ? patient.age : undefined,
    gender: patient ? patient.gender : undefined,
    token
  };
  if (connCode !== undefined) resObj.connCode = connCode;
  res.status(200).json(resObj);

  next();
};

exports.delete = async (req, res) => {
  if (!req.body.role)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'Role is required in request body'
    });

  try {
    if (req.body.role === 'patient') {
      const patient = await Patient.findOneAndDelete({
        username: req.query.username
      });

      if (patient.doctors)
        for (const doc of patient.doctors) {
          await Doctor.updateOne(
            { username: doc },
            { $pull: { patients: { $in: [req.query.username] } } }
          );
        }
    } else if (req.body.role === 'doctor') {
      const doctor = await Doctor.findOneAndDelete({
        username: req.query.username
      });

      if (doctor.patients)
        for (const patient of doctor.patients) {
          await Patient.updateOne(
            { username: patient },
            { $pull: { doctors: { $in: [req.query.username] } } }
          );
        }
    }
    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'User deleted successfully!'
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Internal server error'
    });
  }
};
