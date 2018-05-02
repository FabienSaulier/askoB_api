import config from '../config/config'
import logger from '../lib/logger'
import * as Message from '../lib/message'

import * as FacebookApiWrapper from '../lib/facebookApiWrapper'
import * as MessageHandler from '../lib/messageHandler'
import * as ProcessPostbackInput from '../lib/processPostbackInput'
import * as ProcessTextInput from '../lib/processTextInput'
import * as ProcessQuickReplyInput from '../lib/processQuickReplyInput'
import Answers from '../model/answer'
import Users from '../model/user'
import MessageLog from '../model/messageLog'
import * as Behaviour from '../lib/behaviour'
import * as ANSWERS_ID from '../lib/answersID'

/**
* Facebook entries point
* */
export default(server) => {

  /**
  * Method for api validation purpose
  * */
  server.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
      logger.info('Validating webhook')
      res.sendRaw(200, req.query['hub.challenge'])
    } else {
      logger.error('Failed webhook validation. Make sure the validation tokens match.')
      res.send(403)
    }
  })

  /**
  * Entry point of users messages
  * */
  server.post('/webhook', (req, res) => {
    const data = req.body

    if(!isPageSubscription(data)) { return }

    // Iterate over each entry - there may be multiple if batched
    // https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/
    data.entry.forEach((entry) => {

      if (!entry.messaging) { return }

      // Iterate over each messaging event
      entry.messaging.forEach( async (event) => {

        const senderID = event.sender.id
        await FacebookApiWrapper.sendMarkSeen(senderID)
        await FacebookApiWrapper.sendTypingOn(senderID)

        // Process User Input
        const inputType = getInputType(event)
        logger.info("input: ",inputType)


        let user = await Users.getUserInfos(senderID)
        await MessageHandler.updateUserQuestionSpecies(event, user)
        let answer = undefined
        let userInput = undefined


        switch (inputType) {
          case "POSTBACK":
            answer = await ProcessPostbackInput.run(event, user)
            console.log("call fb wrapper ",answer)
            MessageHandler.sendAnswer(answer, user)
            break

          case "QUICK_REPLY":
            answer = await ProcessQuickReplyInput.run(event, user)
            console.log("call fb wrapper ",answer)
            MessageHandler.sendAnswer(answer, user)
            break

          case "TEXT":
            answer = await ProcessTextInput.run(event, user)
            console.log("call fb wrapper ",answer)
            MessageHandler.sendAnswer(answer, user)
            break

          default:
            logger.warn("unknown input type for the event ",event)
        }


        if(user.question_species === 'autres'){
          Users.setIdWeighLossAnswerStep(user, answer._id)
        }

        Users.setLastAnswer(user, answer)
        MessageLog.createAndSave(user, userInput, answer)



        FacebookApiWrapper.sendTypingOff(senderID)
      })

      // Assume all went well. Send 200, otherwise, the request will time out and will be resent
      res.send(200)
    })

  })
}


// check if this is a page subscription
function isPageSubscription(data){
  if (data.object != 'page') {
    logger.warn('received a non page data: ', data.object)
    logger.warn('data: ', data)
    return false
  }
  return true
}

// return type of the input the user send to Kanzi: text, QR (qr buttons), postback (getstarted, menu)
function getInputType(event){
  if(event.postback)
    return "POSTBACK"
  else if(event.message.quick_reply)
    return "QUICK_REPLY"
  else if(event.message.text)
    return "TEXT"

  logger.error("input type unknown ",event)
  return "UNKNOWN"
}
