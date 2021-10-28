const httpStatus = require('http-status');
const moment = require('moment-timezone');
const Admin = require('../../models/admin.model');
const RefreshToken = require('../../models/refreshToken.model');
const { jwtExpirationInterval } = require('../../../config/vars');
/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken) {
  const tokenType = 'Bearer';
  const refreshToken = RefreshToken.generate(user).token;
  const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  };
}

exports.admin_login = async (req, res, next) => {
  try {
    const { user, accessToken } = await Admin.findAndGenerateToken(req.body);
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { id, password } = req.body;
    const admin = await Admin.findById(id);
    admin.password = password;
    await admin.save();
    res.status(httpStatus.OK);
    return res.json('Password Updated');
  } catch (error) {
    console.log(error);
    return next(error);
  }
}

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
  try {
    const { email, refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOneAndRemove({
      userEmail: email,
      token: refreshToken,
    });
    const { user, accessToken } = await User.findAndGenerateToken({ email, refreshObject });
    const response = generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

