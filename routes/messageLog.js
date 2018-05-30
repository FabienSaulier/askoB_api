import errs from 'restify-errors'
import _ from 'lodash'
import MessageLog from '../model/messageLog'
import logger from '../lib/logger'

export default(server) => {

  /**
  * get all the messages type TEXT given the request
  * */
  server.get('/message-log/text', async (req, res) => {
    let { dateOne, dateTwo, species, statuts } = req.query
    let dbQuery = {}
    dbQuery.inputType = 'TEXT'

    if(species && species.length > 0)
      dbQuery.nlp = { $in : species}

    if(statuts && statuts.length > 0)
      dbQuery.answerStatus = { $in : statuts}
    // only return UNDEFINED, can't return other statuts: pb $or and $text query
    if(statuts && statuts.includes('UNDEFINED'))
      dbQuery.answerStatus = { "$exists" : false }

    if(dateOne && dateTwo){
      dbQuery.receivedAt = {
        $gte: new Date(dateOne),
        $lte: new Date(dateTwo),
      }
    }
    const msgLogs = await MessageLog.find(dbQuery).exec()
    res.send(200, msgLogs)
  })

  /**
  * get all the messages type TEXT
  * */
  server.get('/message-log/text/all', async (req, res) => {
    const messagesLog = await MessageLog.find({inputType:'TEXT'})
    res.send(200, messagesLog)
  })

  /**
   * update a messageLog Answer Status
   */
  server.put('/message-log/reviewMessageLog/', (req, res, next) => {
    const {_id, answerStatus, corrected} = req.body
    console.log(req.body)
    MessageLog.update({_id: _id },
      { $set:
        {
          'answerStatus': answerStatus,
          'isCorrected': corrected,
        }
      }).exec()

  })

}
