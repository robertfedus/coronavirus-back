const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    max: 255
  },
  username: {
    type: String,
    unique: true,
    required: true,
    min: 4,
    max: 15
  },
  phone: {
    type: String,
    required: true,
    min: 5,
    max: 255
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024
  },
  institution: {
    type: String,
    required: true,
    max: 255,
    default: 'Hospital'
  },
  specialization: {
    type: String,
    required: true,
    max: 255,
    default: 'Doctor'
  },
  patients: {
    type: Array,
    default: null
  },
  jwt: {
    type: String
  },
  requests: {
    type: Array,
    default: null
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
