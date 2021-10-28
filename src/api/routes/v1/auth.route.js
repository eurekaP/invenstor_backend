const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/user/auth.controller');
const oAuthLogin = require('../../middlewares/auth').oAuth;
const {
  login,
  register,
  oAuth,
  refresh,
  sendPasswordReset,
  passwordReset,
  passwordUpdation,
} = require('../../validations/auth.validation');
const { authorize, LOGGED_USER } = require('../../middlewares/auth');

const router = express.Router();

router.route('/register')
  .post(validate(register), controller.register);

router.route('/user-login')
  .post(validate(login), controller.user_login);

router.route('/change-password')
  .post(authorize(LOGGED_USER), validate(passwordUpdation), controller.changePassword);

router.route('/user-refresh-token')
  .post(validate(refresh), controller.refresh);

router.route('/user-send-password-reset')
  .post(validate(sendPasswordReset), controller.sendPasswordReset);

router.route('/validate-token')
  .post(controller.validateToken);

router.route('/user-reset-password')
  .post(validate(passwordUpdation), controller.changePassword);

// router.route('/google')
//   .post(validate(oAuth), oAuthLogin('google'), controller.oAuth);

module.exports = router;
