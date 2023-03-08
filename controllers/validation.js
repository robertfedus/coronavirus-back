// Validation
const Joi = require('@hapi/joi');

// Register validation
const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    username: Joi.string().min(4).required(),
    gender: Joi.string(),
    age: Joi.string(),
    phone: Joi.string().min(5).required(),
    password: Joi.string().min(6).required(),
    passwordConfirm: Joi.string().min(6).required(),
    role: Joi.string().min(6).max(7).required(),
    institution: Joi.string().min(1).max(255),
    specialization: Joi.string().min(1).max(255)
  });

  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(4).required(),
    password: Joi.string().min(6).required()
  });

  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
