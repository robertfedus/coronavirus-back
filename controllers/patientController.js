const Patient = require('../models/patientModel');
const Doctor = require('./../models/doctorModel');

exports.getStatus = async (req, res) => {
  try {
    const patient = await Patient.findOne({ username: req.params.patient });
    if (!patient)
      return res.status(404).json({
        code: 404,
        status: 'fail',
        message: 'Patient not found'
      });

    if (patient.status)
      return res.status(200).json({
        code: 200,
        status: 'succes',
        patientStatus: patient.status
      });
    else
      return res.status(404).json({
        code: 404,
        status: 'fail',
        message: "This patient doesn't have a status set yet"
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: err
    });
  }
};

exports.addSymptom = async (req, res) => {
  if (!req.body.symptom)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'Symptom is required in the request body!'
    });

  try {
    const patient = await Patient.findOne({ username: req.query.username });
    patient.symptoms.push(req.body.symptom);

    await patient.save();

    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Symptom added!'
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

exports.getSymptoms = async (req, res) => {
  try {
    const patient = await Patient.findOne({ username: req.params.patient });
    const { symptoms } = patient;

    return res.status(200).json({
      code: 200,
      status: 'success',
      symptoms: symptoms ? symptoms : [],
      status: patient.status ? patient.status : undefined
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

exports.getDoctors = async (req, res) => {
  try {
    const patient = await Patient.findOne({ username: req.query.username });

    let doctors = await Doctor.find({
      username: { $in: patient.doctors }
    });
    console.log(doctors);
    doctors.forEach((doctor) => {
      doctor.__v = undefined;
      doctor.jwt = undefined;
      doctor.password = undefined;
      doctor.requests = undefined;
      doctor.patients = undefined;

      // patientsObj[patient.username] = patient;
      // patientsObj[patient.username].username = undefined;

      return doctor;
    });
    return res.status(200).json({
      code: 200,
      status: 'success',
      doctors: patient.doctors ? doctors : []
    });
  } catch (err) {
    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Internal server error'
    });
  }
};
