const httpStatus = require('http-status');
const moment = require('moment-timezone');
const { omit } = require('lodash');
const User = require('../../models/user.model');
const Admin = require('../../models/admin.model');
const RefreshToken = require('../../models/refreshToken.model');
const PasswordResetToken = require('../../models/passwordResetToken.model');
const { jwtExpirationInterval } = require('../../../config/vars');
const APIError = require('../../errors/api-error');
const sendgridEmailProvider = require('../../services/emails/sendgridEmailProvider');

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

/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.register = async (req, res, next) => {
  try {
    const userData = omit(req.body, 'role');
    const user = await new User(userData).save();
    const userTransformed = user.transform();
    const token = generateTokenResponse(user, user.token());
    res.status(httpStatus.CREATED);
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(User.checkDuplicateEmail(error));
  }
};

exports.user_login = async (req, res, next) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body);
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
    const user = await User.findById(id);
    user.password = password;
    await user.save();
    res.status(httpStatus.OK);
    return res.json('Password Updated');
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

/**
 * login with an existing user or creates a new one if valid accessToken token
 * Returns jwt token
 * @public
 */
exports.oAuth = async (req, res, next) => {
  try {
    const { user } = req;
    const accessToken = user.token();
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};

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

exports.sendPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).exec();

    if (user) {
      const passwordResetObj = await PasswordResetToken.generate(user);
      const reset_password_url = 'localhost:3000/forgotpass_change?token=' + passwordResetObj.resetToken;
      const data = {
        receiver: passwordResetObj.userEmail,
        sender: 'ashpeak@titangrid.com',
        templateName: 'password_reset',
        reset_password_url: reset_password_url,
        username: passwordResetObj.userName
      }
      sendgridEmailProvider.sendEmail(data);
      
      res.status(httpStatus.OK);
      return res.json('success');
    }
    throw new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'No account found with that email',
    });
  } catch (error) {
    return next(error);
  }
};

exports.validateToken = async (req, res, next) => {
  try {
    var resData = {};
    const { resetToken } = req.body;
    const resetTokenObject = await PasswordResetToken.findOneAndRemove({
      resetToken: resetToken
    });

    if (!resetTokenObject) {
      resData = {
        condition: false,
        text: 'Cannot find matching reset token'
      };

      res.status(httpStatus.OK);
      return res.json(resData);
    } else if (moment().isAfter(resetTokenObject.expires)) {
      resData = {
        condition: false,
        text: 'Reset token is expired'
      };

      res.status(httpStatus.OK);
      return res.json(resData);
    } else {
      resData = {
        condition: true, 
        text: 'Please enter new password',
        userdata: {
          userId: resetTokenObject.userId,
          userEmail: resetTokenObject.userEmail
        }
      }
  
      res.status(httpStatus.OK);
      return res.json(resData);
    }
  } catch (error) {
    return next(error);
  }
}
