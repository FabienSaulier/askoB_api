import errs from 'restify-errors'
import _ from 'lodash'
import MessageLog from '../model/messageLog'
import logger from '../lib/logger'

export default(server) => {

  /**
  * get all the messages type TEXT
  * */
  server.get('/message-log/all/text', async (req, res) => {
    const messagesLog = await MessageLog.find({inputType:'TEXT'})
    res.send(200, messagesLog)
  })


  /**
   * update a Message log
   */
  server.put('/message-log/reviewMessageLog/', (req, res, next) => {
    const {_id, answerIsCorrect, isCorrected} = req.body
    if(answerIsCorrect != undefined){
      MessageLog.update({_id: _id },
        { $set:
          {
            'answerIsCorrect': answerIsCorrect,
            'isCorrected': isCorrected
          }
        }).exec()
    }
    else
      MessageLog.update({_id: _id } , { $unset: { 'answerIsCorrect': '' }}).exec()
  })

}
