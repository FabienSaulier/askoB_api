import config from '../config/config'
import logger from '../lib/logger'
import axios from 'axios'


export default(server) => {

  /**
  * get all entities
  **/
  server.get('/nlp/entities', function(req, res, next) {
    axios.get("https://api.recast.ai/v2/users/"+config.RECAST_USER_SLUG+"/bots/"+config.RECAST_BOT_SLUG+"/entities",
      {headers:
          { 'Authorization': 'Token '+config.RECAST_DEV_ACCESS_TOKEN }
      }
    )
    .then((response) => {
      res.send(200, response.data.results);
    })
    .catch((error) => {
      logger.error(error);
      res.send(500, error);
    });
  });

}
