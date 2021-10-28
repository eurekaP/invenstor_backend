const express = require('express');
const controller = require('../../controllers/admin/admin.controller');
const authController = require('../../controllers/admin/admin.auth.controller');
const investorController = require('../../controllers/admin/investors.controller');
const startupController = require('../../controllers/admin/startup.controller');
const investmentController = require('../../controllers/admin/admin.investment.controller');
const { login } = require('../../validations/auth.validation');
const validate = require('express-validation');
const { createUser, changePassword } = require('../../validations/user.validation');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');

const router = express.Router();

router.route('/auth/login')
      .post(validate(login), authController.admin_login);

router.route('/auth/change-password')
      .post(authorize(ADMIN), validate(changePassword), authController.changePassword);

router.route('/investor/add')
      .post(authorize(ADMIN), validate(createUser), investorController.createUser);

router.route('/investor/update')
      .post(authorize(ADMIN), investorController.updateUser);

router.route('/investor/update-password')
      .post(authorize(ADMIN), investorController.changeUserPassword);

router.route('/investor/remove')
      .post(authorize(ADMIN), investorController.deleteUser);

router.route('/investor/all')
      .get(authorize(ADMIN), investorController.getAllUser);

router.route('/startup/add')
      .post(authorize(ADMIN), startupController.createStartup);

router.route('/startup/all')
      .get(authorize(ADMIN), startupController.getAllStartup);

router.route('/startup/update')
      .post(authorize(ADMIN), startupController.updateStartup);

router.route('/startup/update-file')
      .post(authorize(ADMIN), startupController.updateStartupWithFile);

router.route('/startup/remove')
      .post(authorize(ADMIN), startupController.deleteStartup);

router.route('/startup/get-company-by-user')
      .get(authorize(ADMIN), startupController.getStartupByUserId);

router.route('/update/add-update')
      .post(authorize(ADMIN), startupController.createUpdate);

router.route('/update/get-updates')
      .get(authorize(ADMIN), startupController.getUpdateByStartupId);

router.route('/update/download')
      .post(authorize(ADMIN), startupController.getDownloadFile);

router.route('/update/get-update-by-id')
      .get(authorize(ADMIN), startupController.getUpdateById);

router.route('/investment/add')
      .post(authorize(ADMIN), investmentController.createInvestment);

router.route('/investment/all')
      .get(authorize(ADMIN), investmentController.getAllInvestment);

router.route('/investment/get-investment-by-user')
      .get(authorize(ADMIN), investmentController.getInvestmentByUserId);

router.route('/investment/update')
      .post(authorize(ADMIN), investmentController.updateInvestment);

router.route('/investment/remove')
      .post(authorize(ADMIN), investmentController.deleteInvesment);     

router.route('/')
      .get(controller.getAdmins);

module.exports = router;
