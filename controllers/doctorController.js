const Patient = require('../models/patientModel');
const Doctor = require('./../models/doctorModel');

exports.getPatients = async (req, res) => {
  // if (!req.params.username)
  //   return res.status(400).json({
  //     code: 400,
  //     status: 'fail',
  //     message: '"username" is required'
  //   });

  try {
    const doctor = await Doctor.findOne({ username: req.query.username });
    if (!doctor)
      return res.status(404).json({
        code: 404,
        status: 'fail',
        message: 'Doctor not found'
      });

    if (doctor.patients.length === 0)
      return res.status(200).json({
        code: 200,
        status: 'success',
        patients: []
      });

    // let patientsObj = {};
    let patients = await Patient.find({
      username: { $in: doctor.patients }
    });
    patients.forEach((patient) => {
      patient.__v = undefined;
      patient.jwt = undefined;
      patient.password = undefined;
      patient.requests = undefined;

      // patientsObj[patient.username] = patient;
      // patientsObj[patient.username].username = undefined;

      return patient;
    });

    return res.status(200).json({
      code: 200,
      status: 'success',
      patients: patients
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

exports.updateStatus = async (req, res) => {
  if (!req.body.status)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'Status must pe specified!'
    });

  try {
    await Patient.updateOne(
      { username: req.params.patient },
      { status: req.body.status }
    );

    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Patient status updated successfully!'
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
