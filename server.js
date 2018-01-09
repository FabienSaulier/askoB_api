import restify from 'restify'
import routes from './routes'
import logger from './lib/logger'
import cors from './lib/cors'
import db from './model/db.js'

const server = restify.createServer()
server.use(restify.plugins.bodyParser())
server.use(restify.plugins.queryParser())
server.pre(cors.preflight)
server.use(cors.actual)

server.listen(process.env.PORT || 3000, () => {
  logger.info('Server is listening on port 3000');
});

// plug server to the routes
routes(server);
