import axios from 'axios'

import config from '../config/config'
import logger from '../lib/logger'

export default(server) => {
  /**
  * get all entities
  * */
  server.get('/nlp/entities/:species', (req, res) => {
    const { species } = req.params
    let botSlug = ''
    let recastAccess = ''
    if(species === 'chien'){
      botSlug = config.RECAST_BOT_SLUG_CHIEN
      recastAccess = config.RECAST_DEV_ACCESS_TOKEN_CHIEN
    }else{
      botSlug = config.RECAST_BOT_SLUG
      recastAccess = config.RECAST_DEV_ACCESS_TOKEN
    }
    const nlpUrl =   `https://api.recast.ai/v2/users/${config.RECAST_USER_SLUG}/bots/${botSlug}/entities`
    axios.get(
    nlpUrl,
      {
        headers:
          { Authorization: `Token ${recastAccess}` },
      },
    )
      .then((response) => {
        res.send(200, response.data.results)
      })
      .catch((error) => {
        logger.error(error)
        res.send(500, error)
      })
  })
}
