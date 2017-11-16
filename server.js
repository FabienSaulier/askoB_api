import restify from 'restify'
import routes from './routes'
import mongoose from 'mongoose'
import winston from 'winston'
import config from '../config/config'

winston.level = config.LOV_LEVEL

mongoose.connect('mongodb://'+process.env.mongodbuser+':'+process.env.mongodbpassword+'@'+process.env.mongodburl, {useMongoClient: true});
var db = mongoose.connection;
db.on('error', winston.error('connection error: 'error));
db.once('open', function() {
  winston.info('connected to db');
});


var server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());


/////   CORS  /////////////
import  corsMiddleware from 'restify-cors-middleware';
const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['*'],
  allowHeaders: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Type']
})

server.pre(cors.preflight)
server.use(cors.actual)



server.listen(process.env.PORT || 3000, function() {
	 winston.info(`Server is listening on port 3000`);
});


// plug server to the routes
routes(server);

module.exports = server;
