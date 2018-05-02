import httpRequest from 'request'
import requestP from 'request-promise'
import config from '../config/config'
import logger from '../lib/logger'
import Users from '../model/user'
import Answers from '../model/answer'
import * as ANSWERS_ID from '../lib/answersID'

export async function run(event, user) {

  if(event.postback.payload === 'RESET_P2P'){
    await Users.resetP2P(user)
    event.postback.payload = ANSWERS_ID.ANSWER_MENU_P2P_ID // intro p2p
  }
  // refresh user for new informtions
  user = await Users.getUserInfos(user.senderID)

  // cas reprise de weight_loss
  if(user.question_species === 'autres' && user.animals[0] && user.animals[0].id_weigh_loss_answer_step){
    return await Answers.findOne({_id:user.animals[0].id_weigh_loss_answer_step})
  } else{
    return await Answers.findOne({_id:event.postback.payload})
  }

}
