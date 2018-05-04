import logger from '../lib/logger'
import Users from '../model/user'
import Answers from '../model/answer'
import * as ANSWERS_ID from '../lib/answersID'
import MessageLog from '../model/messageLog'

export async function run(event, user) {

  user =  await Users.updateUserQuestionSpecies(event.postback.payload, user)

  if(event.postback.payload === 'RESET_P2P'){
    await Users.resetP2P(user)
    event.postback.payload = ANSWERS_ID.ANSWER_MENU_P2P_ID // intro p2p
  }

  // refresh user for new informtions cause of resetP2P method
  user = await Users.getUserInfos(user.senderID)

  let answer = {}

  // cas reprise de weight_loss
  if(user.question_species === 'autres' && user.animals[0] && user.animals[0].id_weigh_loss_answer_step)
    answer = await Answers.findOne({_id:user.animals[0].id_weigh_loss_answer_step})

  answer = await Answers.findOne({_id:event.postback.payload})

  MessageLog.createAndSave(user, ANSWERS_ID.getAnswerNameFromId(event.postback.payload), "POSTBACK", [answer])
  return answer
}
