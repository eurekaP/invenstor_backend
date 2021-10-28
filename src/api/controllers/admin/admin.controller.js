const httpStatus = require('http-status');
const { Mongoose } = require('mongoose');
const Admin = require('../../models/admin.model');

exports.getAdmins = (req, res, next) => {
    Admin.find()
      .then((admin) => {
        res.status(httpStatus.OK).json(admin)
      })
      .catch(e => next(e));
  };
  
  exports.getAdminById = (req, res, next) => {
    Admin.findById(req.params.adminId)
      .then((admin) => {
        res.status(httpStatus.OK).json(admin)
      })
      .catch(e => next(e));
  };
  
  exports.createAdmin = async (req, res, next) => {
    try {
      new Admin(req.body).save().then(result => {
        res.status(httpStatus.OK).json(result);
      });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
    }
  };
  
  exports.updateAdmin = async (req, res, next) => {
    try {
      await Admin.findByIdAndUpdate(req.params.adminId, req.body);
      res.status(httpStatus.OK).json('ok');
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
    }
  };
  
  exports.getFilterAdmin = (req, res, next) => {
    const fullName = req.params.filterValue;
    const firstName = fullName.split(' ')[0];
    const lastName = fullName.split(' ')[1];
  
    Admin.find({ firstName, lastName })
      .then((admin) => {
        res.status(httpStatus.OK).json(admin)
      })
      .catch(e => next(e));
  };
  