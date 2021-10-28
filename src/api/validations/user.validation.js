const Joi = require('joi');
const User = require('../models/user.model');

module.exports = {

  // GET /v1/users
  listUsers: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      name: Joi.string(),
      email: Joi.string()
    },
  },

  // POST /v1/users
  createUser: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(128).required(),
      name: Joi.string().max(128).required(),
    },
  },

  // PUT /v1/users/:userId
  replaceUser: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(128).required(),
      name: Joi.string().max(128),
    },
    params: {
      userId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },

  // PATCH /v1/users/:userId
  updateUser: {
    body: {
      email: Joi.string().email(),
      password: Joi.string().min(6).max(128),
      name: Joi.string().max(128),
    },
    params: {
      userId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },

  // POST /v1/users/change-password
  changePassword: {
    body: {
      id: Joi.string()
        .required(),
      password: Joi.string()
        .required()
        .min(6)
        .max(128),
    }
  }
};
