const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/user.controller');
const investmentController = require('../../controllers/user/user.investment.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
const {
  listUsers,
  createUser,
  replaceUser,
  updateUser,
} = require('../../validations/user.validation');

const router = express.Router();
router.param('userId', controller.load);

router.route('/investment/get-investment-by-user')
      .get(authorize(LOGGED_USER), investmentController.getInvestmentByUserId);

router.route('/investment/download')
      .post(authorize(LOGGED_USER), investmentController.getDownloadFile);

router.route('/')
  .get(authorize(ADMIN), validate(listUsers), controller.list)
  .post(authorize(ADMIN), validate(createUser), controller.create);

router.route('/profile')
  .get(authorize(), controller.loggedIn);

router.route('/:userId')
  .get(authorize(LOGGED_USER), controller.get)
  .put(authorize(LOGGED_USER), validate(replaceUser), controller.replace)
  .patch(authorize(LOGGED_USER), validate(updateUser), controller.update)
  .delete(authorize(LOGGED_USER), controller.remove);

module.exports = router;
