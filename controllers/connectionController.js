const Doctor = require('../models/doctorModel');
const Patient = require('../models/patientModel');

exports.checkDuplicates = async (req, res, next) => {
  if (!req.body.role)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'Role is required in request body'
    });
  if (!req.body.username)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'Username is required in request body'
    });

  try {
    if (req.body.role === 'doctor') {
      const patient = await Patient.findOne({
        username: req.body.username,
        requests: { $in: req.query.username }
      });

      if (patient) {
        return res.status(400).json({
          code: 400,
          status: 'fail',
          message: 'You already sent a request to this user!'
        });
      }
    } else {
      const doctor = await Doctor.findOne({
        username: req.body.username,
        requests: { $in: req.query.username }
      });

      if (doctor) {
        return res.status(400).json({
          code: 400,
          status: 'fail',
          message: 'You already sent a request to this user!'
        });
      }
    }

    if (req.body.role === 'doctor') {
      const doctor = await Doctor.findOne({
        username: req.query.username,
        requests: { $in: req.body.username }
      });

      if (doctor) {
        return res.status(400).json({
          code: 400,
          status: 'fail',
          message: 'This user already sent you a request!'
        });
      }
    } else {
      const patient = await Patient.findOne({
        username: req.query.username,
        requests: { $in: req.body.username }
      });

      if (patient) {
        return res.status(400).json({
          code: 400,
          status: 'fail',
          message: 'This user already sent you a request!'
        });
      }
    }

    if (req.body.role === 'doctor') {
      const doctor = await Doctor.findOne({
        username: req.query.username,
        patients: { $in: req.body.username }
      });

      if (doctor) {
        return res.status(400).json({
          code: 400,
          status: 'fail',
          message: 'You already have this user as a patient!'
        });
      }
    } else {
      const doctor = await Doctor.findOne({
        username: req.body.username,
        patients: { $in: req.query.username }
      });

      if (doctor) {
        return res.status(400).json({
          code: 400,
          status: 'fail',
          message: 'You are already signed to this doctor!'
        });
      }
    }

    return next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

exports.sendRequest = async (req, res) => {
  let user;

  try {
    if (req.body.role === 'doctor') {
      user = await Patient.findOne({ username: req.body.username });

      user.requests.push(req.query.username);

      await user.save();

      return res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Request sent successfully!'
      });
    } else {
      user = await Doctor.findOne({ username: req.body.username });

      if (user.requests) user.requests.push(req.query.username);

      await user.save();

      return res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Request sent successfully!'
      });
    }
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

exports.getRequests = async (req, res) => {
  try {
    let requests;
    if (req.params.role === 'doctor') {
      const doctor = await Doctor.findOne({ username: req.query.username });

      requests = await Patient.find({
        username: { $in: doctor.requests }
      });
    } else {
      const patient = await Patient.findOne({
        username: req.query.username
      });

      requests = await Doctor.find({
        username: { $in: patient.requests }
      });
    }

    requests.forEach((request) => {
      request.__v = undefined;
      request.jwt = undefined;
      request.password = undefined;
      request.requests = undefined;
      request.patients = undefined;
      request.connCode = undefined;

      return request;
    });
    return res.status(200).json({
      code: 200,
      status: 'success',
      requests
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

exports.acceptRequest = async (req, res) => {
  if (!req.body.role)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'Role is required in request body!'
    });

  if (!req.body.acceptTo)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'acceptTo is required in request body!'
    });

  try {
    let user;
    if (req.body.role === 'doctor') {
      user = await Doctor.findOne({ username: req.query.username });
      const accepted = await Patient.findOne({ username: req.body.acceptTo });

      if (accepted) {
        user.patients.push(req.body.acceptTo);
        await user.save();

        await Doctor.updateOne(
          { username: req.query.username },
          { $pullAll: { requests: [req.body.acceptTo] } }
        );

        patient = await Patient.findOne({ username: req.body.acceptTo });
        patient.doctors.push(req.query.username);
        await patient.save();

        return res.status(200).json({
          code: 200,
          status: 'success',
          message: 'Request accepted!'
        });
      } else {
        return res.status(404).json({
          code: 404,
          status: 'fail',
          message: 'User deleted'
        });
      }
    } else {
      user = await Patient.findOne({ username: req.query.username });

      const doc = await Doctor.findOne({ username: req.body.acceptTo });

      if (doc) {
        doc.patients.push(req.query.username);
        await doc.save();

        user.doctors.push(req.body.acceptTo);
        await user.save();

        await Patient.updateOne(
          { username: req.query.username },
          { $pullAll: { requests: [req.body.acceptTo] } }
        );

        return res.status(200).json({
          code: 200,
          status: 'success',
          message: 'Request accepted!'
        });
      } else {
        return res.status(404).json({
          code: 404,
          status: 'fail',
          message: 'User deleted'
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

exports.declineRequest = async (req, res) => {
  if (!req.body.role)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'Role is required in request body!'
    });

  if (!req.body.declineTo)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'declineTo is required in request body!'
    });

  try {
    if (req.body.role === 'doctor') {
      await Doctor.updateOne(
        { username: req.query.username },
        { $pullAll: { requests: [req.body.declineTo] } }
      );
    } else {
      await Patient.updateOne(
        { username: req.query.username },
        { $pullAll: { requests: [req.body.declineTo] } }
      );
    }
    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Request declined!'
    });
  } catch (err) {
    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

exports.acceptAll = async (req, res) => {
  try {
    const doc = await Doctor.findOne({ username: req.query.username });
    if (!doc.requests)
      return res.status(404).json({
        code: 404,
        status: 'fail',
        message: "This user doesn't have any requests yet!"
      });

    for (const patient of doc.requests) {
      const pat = await Patient.findOne({ username: patient });
      pat.doctors.push(req.query.username);

      await pat.save();
    }

    doc.patients = doc.patients.concat(doc.requests);
    doc.requests = [];

    await doc.save();

    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'All requests accepted!'
    });
  } catch (err) {
    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

exports.declineAll = async (req, res) => {
  try {
    const doc = await Doctor.findOne({ username: req.query.username });
    doc.requests = [];
    await doc.save();

    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'All requests declined!'
    });
  } catch (err) {
    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

exports.deleteFriend = async (req, res) => {
  if (!req.body.role || !req.body.toDelete)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'Check your request body and try again!'
    });

  try {
    let doctor, patient;

    if (req.body.role === 'doctor') {
      doctor = await Doctor.findOne({ username: req.query.username });
      patient = await Patient.findOne({ username: req.body.toDelete });

      const patientIndex = doctor.patients.indexOf(req.body.toDelete);
      if (patientIndex > -1) {
        doctor.patients.splice(patientIndex, 1);
      }

      const doctorIndex = patient.doctors.indexOf(req.query.username);
      if (doctorIndex > -1) {
        patient.doctors.splice(doctorIndex, 1);
      }
    } else if (req.body.role === 'patient') {
      doctor = await Doctor.findOne({ username: req.body.toDelete });
      patient = await Patient.findOne({ username: req.query.username });

      const patientIndex = doctor.patients.indexOf(req.query.username);
      if (patientIndex > -1) {
        doctor.patients.splice(patientIndex, 1);
      }

      const doctorIndex = patient.doctors.indexOf(req.body.toDelete);
      if (doctorIndex > -1) {
        patient.doctors.splice(doctorIndex, 1);
      }
    }

    await doctor.save();
    await patient.save();

    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Success!'
    });

    // patient.symptoms = patient.symptoms.filter((el) => el != null);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Internal server error'
    });
  }
};
