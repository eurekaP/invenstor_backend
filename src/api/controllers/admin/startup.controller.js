var path = require('path');
var appDir = path.dirname('package.json');

const httpStatus = require('http-status');
const { omit } = require('lodash');
const APIError = require('../../errors/api-error');
const StartUp = require('../../models/startup.model');
const Update = require('../../models/startup.update.model');
const Investment = require('../../models/investment.model');
const _ = require('lodash');

exports.createStartup = async (req, res, next) => {
    try {
        //todo upload and save image file here
        if (!req.files.files || Object.keys(req.files.files).length === 0) {
            return next(new APIError({
                status: httpStatus.CONFLICT,
                message: 'Picture File is not uploaded'
            }));
        }

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        const logo = req.files.files;
        const uploadPath = appDir + '/uploads/Logo/' + logo.name;

        // Use the mv() method to place the file somewhere on your server
        logo.mv(uploadPath, async (err) => {
            if (err)
            return next( new APIError({
                message: 'File Upload Failed',
                status: httpStatus.INTERNAL_SERVER_ERROR,
            }));

            // const createReq = omit(req.body, 'logo_file');
            var createReq = req.body;
            createReq.logo = uploadPath;
            const startup = await new StartUp(createReq).save();
            const startupTransformed = startup.transform();
            res.status(httpStatus.CREATED);
            return res.json({ startup: startupTransformed });    
        });
    } 
    catch (error) {
        return next(error);
    }
}

exports.getAllStartup = async (req, res, next) => {
  try {
    const startups = await StartUp.list(req.body);
    const transformedStartUps = await Promise.all(startups.map( async (startup) => {
        startup = startup.transform();
        startup.updates = await Update.find({ company_id: startup.id });
      return startup;
    }));

    res.json(transformedStartUps);
  } catch (error) {
    next(error);
  }
}

exports.getStartupByUserId = async (req, res, next) => {
  try {
    const { id } = req.query;
    var startup_arr = [];
    const startups = await StartUp.list(req.body);
    const investments = await Investment.find({ unit_holder_id: id });
    const transformedStartUps = await Promise.all(startups.map( async (startup) => {
      startup = startup.transform();
      startup.updates = await Update.find({ company_id: startup.id });

      for(var i = 0; i < investments.length; i ++){
        if(investments[i].company_id === startup.id){
          startup_arr.push(startup);
        }
      }

      return startup_arr;
    }));

    res.json(_.uniq(transformedStartUps[0]));
  } catch (error) {
    console.log(error);
    next(error);
  }
}

exports.updateStartup = async (req, res, next) => {
  const existStartup = await StartUp.findById(req.body.id);
  const updateData = omit(req.body, ['id']);
  const startup = Object.assign(existStartup, updateData);

  startup.save()
    .then((savedStartUp) => res.json(savedStartUp.transform()))
    .catch((e) => next(e));
};

exports.updateStartupWithFile = async (req, res, next) => {
  try {
    //todo upload and save image file here
    if (!req.files.files || Object.keys(req.files.files).length === 0) {
        return next(new APIError({
            status: httpStatus.CONFLICT,
            message: 'Picture File is not uploaded'
        }));
    }

    const logo = req.files.files;
    const uploadPath = appDir + '/uploads/Logo/' + logo.name;

    logo.mv(uploadPath, async (err) => {
        if (err)
        return next( new APIError({
            message: 'File Upload Failed',
            status: httpStatus.INTERNAL_SERVER_ERROR,
        })); 

        const existStartup = await StartUp.findById(req.body.id);
        req.body.logo = uploadPath;
        const updateData = omit(req.body, ['id']);
        const startup = Object.assign(existStartup, updateData);
        startup.save()
          .then((savedStartUp) => res.json(savedStartUp.transform()))
          .catch((e) => next(e));
    });
  } 
  catch (error) {
      return next(error);
  }
};

exports.createUpdate = async (req, res, next) => {
  try {
      var createReq = req.body;
      var attachmentUploadPath = '';
      if(createReq.id){
        if(req.files && req.files.attachment){
          if (req.files.attachment && Object.keys(req.files.attachment).length > 0) {
            var attachmentFile = req.files.attachment;
            attachmentUploadPath = appDir + '/uploads/Attachment/' + attachmentFile.name;
            createReq.attachment = attachmentUploadPath;

            attachmentFile.mv(attachmentUploadPath, async (err) => {
              if (err)
              return next( new APIError({
                  message: 'Attachment File Upload Failed',
                  status: httpStatus.INTERNAL_SERVER_ERROR,
              }));
            });
          }

          const startupUpdate = await Update.findByIdAndUpdate(createReq.id, omit(createReq, ['id']));
          const startupUpdateTransformed = startupUpdate.transform();
          res.status(httpStatus.CREATED);
          return res.json({ startupUpdate: startupUpdateTransformed });
        } else if(!req.files) {
          
          if(req.body.attachment === 'empty'){
            createReq.attachment = '';
          }

          const startupUpdate = await Update.findByIdAndUpdate(createReq.id, omit(createReq, ['id']));
          const startupUpdateTransformed = startupUpdate.transform();
          res.status(httpStatus.CREATED);
          return res.json({ startupUpdate: startupUpdateTransformed }); 
        }
      } else {
        if(req.files && req.files.attachment){
          if (req.files.attachment && Object.keys(req.files.attachment).length > 0) {
            var attachmentFile = req.files.attachment;
            attachmentUploadPath = appDir + '/uploads/Attachment/' + attachmentFile.name;
            createReq.attachment = attachmentUploadPath;

            attachmentFile.mv(attachmentUploadPath, async (err) => {
              if (err)
              return next( new APIError({
                  message: 'Attachment File Upload Failed',
                  status: httpStatus.INTERNAL_SERVER_ERROR,
              }));
            });
          }

          const startupUpdate = await new Update(createReq).save();
          const startupUpdateTransformed = startupUpdate.transform();
          res.status(httpStatus.CREATED);
          return res.json({ startupUpdate: startupUpdateTransformed });
        } else if(!req.files) {
          if(req.body.attachment === 'empty'){
            createReq.attachment = '';
          }

          const startupUpdate = await new Update(createReq).save();
          const startupUpdateTransformed = startupUpdate.transform();
          res.status(httpStatus.CREATED);
          return res.json({ startupUpdate: startupUpdateTransformed });
        }
      }
  } 
  catch (error) {
    console.log(error);
    return next(error);
  }
}

exports.getUpdateByStartupId = async (req, res, next) => {
  try {
    const { company_id } = req.query;
    const update = await Update.find({ company_id: company_id});

    const transformedUpdates = await Promise.all(update.map( async (update) => {
      update = update.transform();
      update.company_detail = await StartUp.findById(company_id);
      return update;
    }));

    res.json(transformedUpdates);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

exports.getUpdateById = async (req, res, next) => {
  try {
    const { id } = req.query;
    const update = await Update.findById(id);
    res.json(update.transform());
  } catch (error) {
    console.log(error);
    next(error);
  }
}

exports.getDownloadFile = async (req, res, next) => {
  const { id } = req.body;
  Update.findById(id).then( response => {
    var file_names = response.attachment.split('/');
    var file_name = file_names[file_names.length - 1]

    res.download(response.attachment, file_name);
  });
}

exports.deleteStartup = async (req, res, next) => {
  try {
    const { id } = req.body;
    const startUp = await StartUp.findById(id);
    await startUp.remove();
    res.status(httpStatus.OK);
    return res.json('Startup is deleted');
  } catch (error) {
    return next(error);
  }
}
