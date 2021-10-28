const httpStatus = require('http-status');
const { omit } = require('lodash');
const APIError = require('../../errors/api-error');
const Investment = require('../../models/investment.model');
const User = require('../../models/user.model');
const StartUp = require('../../models/startup.model');
exports.createInvestment = async (req, res, next) => {
  try {
    const investment = await new Investment(req.body).save();
    const investmentTransformed = investment.transform();
    res.status(httpStatus.CREATED);
    return res.json({ investment: investmentTransformed });
  } catch (error) {
    return next(error);
  }
}

exports.getAllInvestment = async (req, res, next) => {
  try {
    const investments = await Investment.list(req.body);
    const transformedInvestments = await Promise.all(investments.map( async (investment) =>  {
        investment = investment.transform();
        investment.user_detail = await User.findById(investment.unit_holder_id);
        investment.company_detail = await StartUp.findById(investment.company_id);
      return investment; 
    }));

    return res.json(transformedInvestments);
  } catch (error) {
    next(error);
  }
}

exports.getInvestmentByUserId = async (req, res, next) => {
  try {
    const { id } = req.query;
    const investments = await Investment.find({ unit_holder_id: id });
    const transformedInvestments = await Promise.all(investments.map( async (investment) =>  {
        investment = investment.transform();
        investment.user_detail = await User.findById(investment.unit_holder_id);
        investment.company_detail = await StartUp.findById(investment.company_id);
      return investment; 
    }));

    return res.json(transformedInvestments);
  } catch (error) {
    next(error);
  }
}

exports.updateInvestment = async (req, res, next) => {
  const existInvestment = await Investment.findById(req.body.id);
  const updateData = omit(req.body, ['id']);
  const investment = Object.assign(existInvestment, updateData);

  investment.save()
    .then((savedInvestment) => res.json(savedInvestment.transform()))
    .catch((e) => next(e));
};

exports.deleteInvesment = async (req, res, next) => {
  try {
    const { id } = req.body;
    const investment = await Investment.findById(id);
    await investment.remove();
    res.status(httpStatus.OK);
    return res.json('Investment is deleted');
  } catch (error) {
    console.log(error);
    return next(error);
  }
}
