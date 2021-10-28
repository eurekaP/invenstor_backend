const mongoose = require('mongoose');
const logger = require('./logger');
const { mongo, env } = require('./vars');
const Admin = require('./../api/models/admin.model');
// set mongoose Promise to Bluebird
mongoose.Promise = Promise;

// Exit application on error
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

// print mongoose logs in dev env
if (env === 'development') {
  mongoose.set('debug', true);
}

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
exports.connect = () => {
  mongoose
    .connect(mongo.uri, {
      useCreateIndex: true,
      keepAlive: 1,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(async () => {
      console.log('mongoDB connected...');
      const existAdmin = await Admin.findOne({email: "zeusbackforyou@gmail.com"});
      if(!existAdmin)
      {
        const admin = new Admin({
            email: "zeusbackforyou@gmail.com",
            password: "aaaaaa",
            name: "Administrator",
            role:"admin"
          });
          admin.save();
        }
    });
  return mongoose.connection;
};
