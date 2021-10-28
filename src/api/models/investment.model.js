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

const investmentSchema = new mongoose.Schema({
  unit_holder_id: {
    type: String,
    required:true,
  },
  company_id: {
    type: String,
    trim: true,
    default: '',
    required: true,
  },
  issue_date: {
    type: String,
    required: true,
  },
  units: {
    type: String,
    trim: true,
    default: '',
    required: true,
  },
  class_of_unit: {
    type: String,
    trim: true,
    default: '',
    required: true,
  },
  shares: {
    type: String,
    trim: true,
    default: '',
    required: true,
  },
  underlying_share_class: {
    type: String,
    trim: true,
    default: '',
    required: true,
  }
}, {
  timestamps: true,
});

/**
 * Methods
 */
 investmentSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'unit_holder_id', 'company_id', 'issue_date', 'units', 'class_of_unit', 'shares', 'underlying_share_class', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
investmentSchema.statics = {

  
  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({
    page = 1, perPage = 30, id, unit_holder_id, company_id, issue_date, units, class_of_unit, shares, underlying_share_class
  }) {
    const options = omitBy({
      id, unit_holder_id, company_id, issue_date, units, class_of_unit, shares, underlying_share_class
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
module.exports = mongoose.model('Investment', investmentSchema);
