import logger from '../lib/logger'
import restify from 'restify'

export default(server) => {
  /**
  * http://restify.com/docs/plugins-api/#servestatic
  * */
//console.log(__dirname)
  server.get(/\/?.*/, restify.plugins.serveStatic({
            directory: './webview/',
            default: 'index.html',
            match: /^((?!.js).)*$/   // we should deny access to the application source
     }));
}
