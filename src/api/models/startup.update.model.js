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

const updateSchema = new mongoose.Schema({
  company_id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String,
    required:true,
  },
  content: {
    type: String,
    required: true
  },
  content_html: {
    type: String,
    required: true
  },
  attachment: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true,
});

/**
 * Methods
 */
  updateSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'company_id', 'title', 'date', 'content', 'content_html', 'attachment'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
updateSchema.statics = {

  
  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({
    page = 1, perPage = 30, id, company_id, title, date, content, content_html, attachment
  }) {
    const options = omitBy({
      id, company_id, title, date, content, content_html, attachment
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
module.exports = mongoose.model('Update', updateSchema);
