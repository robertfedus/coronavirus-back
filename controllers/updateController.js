const bcrypt = require('bcrypt');

const Doctor = require('../models/doctorModel');
const Patient = require('../models/patientModel');

exports.account = async (req, res) => {
  if (!req.body.role) {
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: '"role" is required'
    });
  }

  if (!req.query.username) {
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: '"username" query variable is required in the URL!'
    });
  }

  if (!req.body.username && req.params.field === 'username') {
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: '"username" is required in the request body!'
    });
  }

  if (!req.body.phone && req.params.field === 'phone') {
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: '"phone" is required'
    });
  }

  if (req.body.phone && req.body.phone.length < 5)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'Phone number should be at least 5 characters long'
    });

  if (req.body.password && req.body.password.length < 6)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'Password should be at least 6 characters long'
    });

  if (
    (!req.body.password || !req.body.passwordConfirm) &&
    req.params.field === 'password'
  ) {
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: '"password" and "passwordConfirm" are required'
    });
  }

  if (req.body.password !== req.body.passwordConfirm)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: "The two passwords don't match"
    });

  let user;
  if (req.body.role === 'patient') user = 'patient';
  else user = 'doctor';

  if (!user)
    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Internal server error'
    });

  if (req.params.field === 'username') {
    try {
      if (user === 'doctor') {
        const doc = await Doctor.findOne({ username: req.body.username });

        if (doc)
          return res.status(401).json({
            code: 401,
            status: 'fail',
            message: 'That username is already taken!'
          });

        await Doctor.updateOne(
          { username: req.query.username },
          { username: req.body.username }
        );
      } else {
        const pat = await Patient.findOne({ username: req.body.username });

        if (pat)
          return res.status(401).json({
            code: 401,
            status: 'fail',
            message: 'That username is already taken!'
          });
        await Patient.updateOne(
          { username: req.query.username },
          { username: req.body.username }
        );
      }

      return res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Username updated successfully!'
      });
    } catch (err) {
      console.log(err);

      return res.status(500).json({
        code: 500,
        status: 'fail',
        message: 'Internal server error'
      });
    }
  }

  if (req.params.field === 'name') {
    try {
      if (user === 'doctor')
        await Doctor.updateOne(
          { username: req.query.username },
          { name: req.body.name }
        );
      else
        await Patient.updateOne(
          { username: req.query.username },
          { name: req.body.name }
        );

      return res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Name updated successfully!'
      });
    } catch (err) {
      console.log(err);

      return res.status(500).json({
        code: 500,
        status: 'fail',
        message: 'Internal server error'
      });
    }
  }

  if (req.params.field === 'phone') {
    try {
      if (user === 'doctor')
        await Doctor.updateOne(
          { username: req.query.username },
          { phone: req.body.phone }
        );
      else
        await Patient.updateOne(
          { username: req.query.username },
          { phone: req.body.phone }
        );

      return res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Phone number updated successfully!'
      });
    } catch (err) {
      console.log(err);

      return res.status(500).json({
        code: 500,
        status: 'fail',
        message: 'Internal server error'
      });
    }
  }

  if (req.params.field === 'password') {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    try {
      if (user === 'doctor') {
        const doc = await Doctor.findOne({ username: req.query.username });
        const validPass = await bcrypt.compare(
          req.body.oldPassword,
          doc.password
        );
        if (!validPass)
          return res.status(401).json({
            code: 401,
            status: 'fail',
            message: 'Old password is incorrect'
          });
      } else {
        const pat = await Patient.findOne({ username: req.query.username });
        const validPass = await bcrypt.compare(
          req.body.oldPassword,
          pat.password,
          () => console.log('Requested pass update')
        );
        if (!validPass)
          return res.status(401).json({
            code: 401,
            status: 'fail',
            message: 'Old password is incorrect'
          });
      }

      if (user === 'doctor')
        await Doctor.updateOne(
          { username: req.query.username },
          { password: hashedPassword }
        );
      else
        await Patient.updateOne(
          { username: req.query.username },
          { password: req.body.hashedPassword }
        );

      return res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Password updated successfully!'
      });
    } catch (err) {
      console.log(err);

      return res.status(500).json({
        code: 500,
        status: 'fail',
        message: 'Internal server error'
      });
    }
  }
};

exports.deleteSymptom = async (req, res) => {
  if (!req.body.patient || !req.body.role)
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: 'Invalid request body'
    });

  try {
    if (req.body.role === 'doctor') {
      const doc = await Doctor.findOne({ username: req.query.username });

      if (!doc.patients.includes(req.body.patient))
        return res.status(401).json({
          code: 401,
          status: 'fail',
          message: 'This doctor is not assigned to the specified patient.'
        });
    } else if (
      req.body.patient !== req.query.username &&
      req.body.role === 'patient'
    ) {
      return res.status(401).json({
        code: 401,
        status: 'fail',
        message: "You can't change symptoms to other patients!"
      });
    }

    const patient = await Patient.findOne({
      username: req.body.patient
    }).lean();

    if (patient.symptoms) {
      delete patient.symptoms[parseInt(req.params.index)];

      patient.symptoms = patient.symptoms.filter((el) => el != null);

      await Patient.updateOne(
        { username: req.body.patient },
        { symptoms: patient.symptoms }
      );
    }

    return res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Symptom updated successfully!'
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

exports.updateAge = async (req, res) => {
  try {
    if (req.body.age) {
      await Patient.updateOne(
        { username: req.query.username },
        { age: req.body.age }
      );

      return res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Age updated successfully!'
      });
    } else throw new Error();
  } catch {
    console.log(err);
    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

exports.updateInstitution = async (req, res) => {
  try {
    if (req.body.institution) {
      await Doctor.updateOne(
        { username: req.query.username },
        { institution: req.body.institution }
      );

      return res.status(200).json({
        code: 200,
        stauts: 'succes',
        message: 'Institution updated successfully!'
      });
    } else throw new Error();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

exports.updateSpecialization = async (req, res) => {
  try {
    if (req.body.specialization) {
      await Doctor.updateOne(
        { username: req.query.username },
        { specialization: req.body.specialization }
      );

      return res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Specialization updated successfully!'
      });
    } else throw new Error();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Internal server error'
    });
  }
};

exports.updateGender = async (req, res) => {
  try {
    if (req.body.gender) {
      await Patient.updateOne(
        { username: req.query.username },
        { gender: req.body.gender }
      );

      return res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Gender updated successfully!'
      });
    } else throw new Error();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Internal server error'
    });
  }
};
