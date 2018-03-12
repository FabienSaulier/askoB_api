import config from '../config/config'
import logger from '../lib/logger'
import * as Message from '../lib/message'
import FacebookMessageText from '../model/facebookMessageText'
import FacebookMessageGif from '../model/facebookMessageGif'

import * as FacebookApiWrapper from '../lib/facebookApiWrapper'
import Answers from '../model/answer'
import Users from '../model/user'


export async function getAndBuildAnswer(message, user) {

  const msgData = await Message.analyseMessage(message, user.question_species)
  let answer = {}

  if (msgData.payload) { // case of a quick reply
    const payload = JSON.parse(msgData.payload)
    if (payload.siblings) {
      answer = await Answers.findOneRandomByIntent('sibling')
      answer.children = payload.siblings
    } else {
      answer = await Message.getAnswerById(payload.id)
    }
  } else {
    const intent = msgData.intent()
    const entities = Message.getEntities(msgData)
    const entitiesValues = await Message.getEntitiesValues(msgData, user.question_species)
    const entitiesAndValues = entities.concat(entitiesValues)
    const answers = await Message.findAnswer(user.question_species, intent, [entitiesAndValues])

    if(answers.length && answers.length > 1)
      answer = await buildAnswerWithQuickReplies(answers)
    else
      answer = answers
  }

  incrementAnswerDisplayCount(answer._id)
  return answer
}

export function sendAnswer(answer, user){
  const fbMsg = new FacebookMessageText(answer, user)
  FacebookApiWrapper.postTofacebook(fbMsg.getMessage())
  if (answer.gifId) {
    const fbMsgGif = new FacebookMessageGif(answer, user)
    FacebookApiWrapper.postTofacebook(fbMsgGif.getMessage())
  }
}


/**
TODO a del ??????
 * buildAnswerWithQuickReplies - build a multiplematch answer with quick replies
 *
 * @param  {} answers a list of answers
 * @return {}         an answer with quickreplies
 */
async function buildAnswerWithQuickReplies(answers) {
  console.log("buildAnswerWithQuickReplies")
  const qrAnswer = await Answers.findOneRandomByIntent('multipleMatch')
  const answerWithQR = {
    text: qrAnswer.text,
    children: [],
  }
  answers.forEach((answer) => {
    answerWithQR.children.push({
      label: answer.quickReplyLabel ? answer.quickReplyLabel : answer.name,
      _id: answer._id,
    })
  })
  return answerWithQR
}

/**
 * incrementAnswerDisplayCount
 *
 * @param  {String} answerId answer to increment
 */
function incrementAnswerDisplayCount(answerId){
  Answers.update({_id: answerId}, { $inc: { displayCount: 1} } )
  .then(
    (result) => {
      // ok
    },
    (error) => {
      logger.error(error)
    },
  )
}


export async function handleSpecificUserActions(event, user){
  const payload = getPayLoad(event)
  if(!payload)
    return

  const QUESTION_RABBIT = '5aa038faba59e85b24e839cd'
  const QUESTION_DOG = '5aa03928ba59e85b24e839ce'
  const MENU_PERTE_POIDS = '5aa0394eba59e85b24e839d0'

  switch (payload) {
    case QUESTION_RABBIT:
    // need to await otherwise the operation doesn't complete ??
      await  Users.updateQuestionSpecies(user, 'lapin')
      break
    case QUESTION_DOG:
      await Users.updateQuestionSpecies(user, 'chien')
      break
      case MENU_PERTE_POIDS:
      // do nothing
      break
    default:
      logger.warn("undefined payload: ",payload)
  }

}

function getPayLoad(event){
  if(event.postback.payload)
    return event.postback.payload
  else
    return null
}