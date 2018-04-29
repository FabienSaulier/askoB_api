import errs from 'restify-errors'
import _ from 'lodash'
import MessageLog from '../model/messageLog'
import logger from '../lib/logger'

export default(server) => {

  /**
  * get all the messages
  * */
  server.get('/message-log/all/', async (req, res) => {
    const messagesLog = await MessageLog.find({})
    res.send(200, messagesLog)
  })

}
