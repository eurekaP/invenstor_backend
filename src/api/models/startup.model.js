/* eslint-disable linebreak-style */
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');
const APIError = require('../utils/APIError');
const { env, jwtSecret, jwtExpirationInterval } = require('../../config/vars');

const startupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  website: {
    type: String,
    required:true,
  },
  logo: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
});

/**
 * Methods
 */
 startupSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'website', 'logo', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
startupSchema.statics = {

  
  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({
    page = 1, perPage = 30, id, name, website,
  }) {
    const options = omitBy({
      id, name, website,
    }, isNil);

    return this.find()
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef Admin
 */
module.exports = mongoose.model('StartUp', startupSchema);
