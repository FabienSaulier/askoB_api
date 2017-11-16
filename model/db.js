import logger from '../lib/logger'
import mongoose from 'mongoose'

mongoose.connect('mongodb://'+process.env.mongodbuser+':'+process.env.mongodbpassword+'@'+process.env.mongodburl, {useMongoClient: true});
var db = mongoose.connection;
db.on('error', function(error) {
  logger.error('Connection error: %s', error);
});
db.once('open', function() {
  logger.info("connected to db");
});
