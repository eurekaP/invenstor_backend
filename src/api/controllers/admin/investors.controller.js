const httpStatus = require('http-status');
const { omit } = require('lodash');
const User = require('../../models/user.model');
const Investment = require('../../models/investment.model');
const StartUp = require('../../models/startup.model');
const _  = require('lodash');
const sendgridEmailProvider = require('../../services/emails/sendgridEmailProvider');

exports.createUser = async (req, res, next) => {
    try {
      req.body.role = "user";
      const user = await new User(req.body).save();
      const userTransformed = user.transform();
      res.status(httpStatus.CREATED);

      const data = {
        receiver: user.email,
        sender: 'ashpeak@titangrid.com',
        templateName: 'user_created',
        username: user.name,
        login_url: 'localhost:3001/login'
      }
      sendgridEmailProvider.sendEmail(data);
      return res.json({ user: userTransformed });
    } catch (error) {
      console.log(error);
      return next(User.checkDuplicateEmail(error));
    }
}

exports.getAllUser = async (req, res, next) => {
  try {

    const users = await User.list(req.body);

    const transformedUsers = await Promise.all(users.map( async (user) => {
      var startup_list = [];
      user = user.transform();
      user.investments = await Investment.find({ unit_holder_id: user.id });

      for(var i = 0; i < user.investments.length; i ++){
        startup_list.push(user.investments[i].company_id);
      }

      user.startups = _.uniq(startup_list).length;
      return user;
    }));

    res.json(transformedUsers);
  } catch (error) {
    next(error);
  }
}

exports.updateUser = async (req, res, next) => {
  const existUser = await User.findById(req.body.id);
  const updateData = omit(req.body, ['id']);
  const user = Object.assign(existUser, updateData);

  user.save()
    .then((savedUser) => res.json(savedUser.transform()))
    .catch((e) => next(User.checkDuplicateEmail(e)));
};

exports.changeUserPassword = async (req, res, next) => {
  try {
    const { id, password } = req.body;
    const user = await User.findById(id);
    user.password = password;
    await user.save();
    // emailProvider.sendPasswordChangeEmail(user);
    res.status(httpStatus.OK);
    return res.json('Password Updated');
  } catch (error) {
    console.log(error);
    return next(error);
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id);
    await user.remove();
    res.status(httpStatus.OK);
    return res.json('User is deleted');
  } catch (error) {
    return next(error);
  }
}
