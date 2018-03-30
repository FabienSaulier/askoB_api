import config from '../config/config'
import logger from '../lib/logger'
import * as Message from '../lib/message'

import * as FacebookApiWrapper from '../lib/facebookApiWrapper'
import * as MessageHandler from '../lib/messageHandler'
import Answers from '../model/answer'
import Users from '../model/user'
import * as Behaviour from '../lib/behaviour'

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

    // Make sure this is a page subscription
    if (data.object === 'page') {
      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach((entry) => {

        if (!entry.messaging) { return }

        // Iterate over each messaging event
        entry.messaging.forEach( async (event) => {

          const senderID = event.sender.id
          await FacebookApiWrapper.sendMarkSeen(senderID)
          await FacebookApiWrapper.sendTypingOn(senderID)
          let user = await getUserInfos(senderID)

          let answer = undefined
          // handle postback  Q chien / Q lapin / Assistance p2p
          if(event.postback){

            if(event.postback.payload === 'RESET_P2P'){
              await Users.resetP2P(user)
              event.postback.payload = "5aa0394eba59e85b24e839d0" // intro p2p
            }

            await MessageHandler.setUserQuestionSpecies(event, user)
            // refresh user for new informtions
            user = await getUserInfos(senderID)
            logger.info(user)

            // cas reprise de weight_loss
            if(user.question_species === 'autres' && user.animals[0] && user.animals[0].id_weigh_loss_answer_step){
              answer = await Answers.findOne({_id:user.animals[0].id_weigh_loss_answer_step})
            } else{
              answer = await Answers.findOne({_id:event.postback.payload})
            }
            MessageHandler.sendAnswer(answer, user)
          }

          else if (event.message && event.message.text) { // check if it is an Actual message
            logger.info(user)
            logger.info(event.message)
            if(event.message.text == '⬆️' || event.message.text == '🏠'){
              await Users.setLastAnswer(user, {})
              user = await getUserInfos(senderID)
            }

            // if Behaviour: run it then send the followup answer
            if(user.last_answer && user.last_answer.expectedBehaviour){

              await Behaviour.runBehaviour(user.last_answer.expectedBehaviour, user, event.message)
              // refresh user for new informtions
              user = await getUserInfos(senderID)
              if(user.last_answer.nextAnswer)
                answer = await Answers.findOne({_id: user.last_answer.nextAnswer})
              else
                answer = await MessageHandler.getAndBuildAnswer(event.message, user)
              MessageHandler.sendAnswer(answer, user)

            } else{
              answer = await MessageHandler.getAndBuildAnswer(event.message, user)
              MessageHandler.sendAnswer(answer, user)
            }
          } else {
            logger.warn("message unknown: ",event);
          }

          if(user.question_species === 'autres'){
            Users.setIdWeighLossAnswerStep(user, answer._id)
          }
          Users.setLastAnswer(user, answer)

          FacebookApiWrapper.sendTypingOff(senderID)
        })

        // Assume all went well. Send 200, otherwise, the request will time out and will be resent
        res.send(200)
      })

    } else {
      logger.warn('received a non page data: ', data.object)
      logger.warn('data: ', data)
    }
  })
}

async function getUserInfos(senderID){
  let user = await Users.getUser(senderID)
  if(!user){
    user = await FacebookApiWrapper.getUserInfo(senderID)
    user.senderID = senderID
    user = await Users.create(user)
  }
  return user
}
