import errs from 'restify-errors'
import _ from 'lodash'
import MessageLog from '../model/messageLog'
import logger from '../lib/logger'

export default(server) => {

  /**
  * get all the messages
  * */
  server.get('/message-log/all/text', async (req, res) => {
    const messagesLog = await MessageLog.find({inputType:'TEXT'})
    res.send(200, messagesLog)
  })

  server.put('/message-log/validAnswer/', (req, res, next) => {
    const {_id, answerIsCorrect} = req.body
    if(answerIsCorrect)
      MessageLog.update({_id: _id } , { $set: { 'answerIsCorrect': answerIsCorrect }}).exec()
    else
      MessageLog.update({_id: _id } , { $unset: { 'answerIsCorrect': '' }}).exec()
  })

}
