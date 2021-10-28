const httpStatus = require('http-status');
const { omit } = require('lodash');
const APIError = require('../../errors/api-error');
const Investment = require('../../models/investment.model');
const User = require('../../models/user.model');
const StartUp = require('../../models/startup.model');
const Update = require('../../models/startup.update.model');

exports.getInvestmentByUserId = async (req, res, next) => {
  try {
    const { id } = req.query;
    const investments = await Investment.find({ unit_holder_id: id });
    const transformedInvestments = await Promise.all(investments.map( async (investment) =>  {
        investment = investment.transform();
        investment.company_detail = await StartUp.findById(investment.company_id);
        investment.update_detail = await Update.find({ company_id: investment.company_id });
      return investment; 
    }));

    return res.json(transformedInvestments);
  } catch (error) {
    next(error);
  }
}

exports.getDownloadFile = async (req, res, next) => {
  const { id } = req.body;
  Update.findById(id).then( response => {
    console.log(response);
    var file_names = response.attachment.split('/');
    var file_name = file_names[file_names.length - 1]

    res.download(response.attachment, file_name);
  });
}
