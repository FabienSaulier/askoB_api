import restify from 'restify'
import routes from './routes'
import logger from './lib/logger'
import db from './model/db.js'
import cors from './lib/cors'

var server = restify.createServer()
server.use(restify.plugins.bodyParser())
server.use(restify.plugins.queryParser())
server.pre(cors.preflight)
server.use(cors.actual)

server.listen(process.env.PORT || 3000, function() {
  logger.info('Server is listening on port 3000');
});

// plug server to the routes
routes(server);
