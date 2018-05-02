import httpRequest from 'request'
import requestP from 'request-promise'
import config from '../config/config'
import logger from '../lib/logger'
import Users from '../model/user'
import Answers from '../model/answer'
import * as ANSWERS_ID from '../lib/answersID'
import * as Behaviour from '../lib/behaviour'
import * as MessageHandler from '../lib/messageHandler'

export async function run(event, user) {

  logger.info("received text: ",event.message.text)
  if(event.message.text == '⬆️' || event.message.text == '🏠'){
    await Users.setLastAnswer(user, {})
    user = await Users.getUserInfos(senderID)
  }

  // if Behaviour: run it then send the followup answer
  if(user.last_answer && user.last_answer.expectedBehaviour){

    await Behaviour.runBehaviour(user.last_answer.expectedBehaviour, user, event.message)
    // refresh user for new informtions
    user = await Users.getUserInfos(senderID)
    if(user.last_answer.nextAnswer)
      answer = await Answers.findOne({_id: user.last_answer.nextAnswer})
    else
      return await MessageHandler.getAndBuildAnswer(event.message, user)
  } else{
      return await MessageHandler.getAndBuildAnswer(event.message, user)
  }
}
