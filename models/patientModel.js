const mongoose = require('mongoose');

const pacientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    max: 255
  },
  username: {
    type: String,
    required: true,
    min: 4,
    max: 15,
    unique: true
  },
  gender: {
    type: String,
    // required: true,
    enum: ['M', 'F', 'O']
  },
  age: {
    type: String
    // required: true
  },
  phone: {
    type: String,
    required: true,
    min: 5,
    max: 255
  },
  status: {
    type: String,
    min: 1,
    max: 30,
    default: 'Asymptomatic'
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024
  },
  jwt: {
    type: String
  },
  doctors: {
    type: Array,
    default: null
  },
  requests: {
    type: Array,
    default: null
  },
  symptoms: {
    type: Array,
    default: null
  }
});

module.exports = mongoose.model('Patient', pacientSchema);
