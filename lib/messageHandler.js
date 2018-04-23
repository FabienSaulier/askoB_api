import config from '../config/config'
import logger from '../lib/logger'
import * as Message from '../lib/message'
import FacebookMessageText from '../model/facebookMessageText'
import FacebookMessageGif from '../model/facebookMessageGif'
import FacebookMessageCarouselProfilMorpho from '../model/facebookMessageCarouselProfilMorpho'
import FacebookMessageVideo from '../model/facebookMessageVideo'
import FacebookMessageShareButton from '../model/facebookMessageShareButton'
import * as ANSWERS_ID from '../lib/answersID'
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
    if(user.question_species === undefined || (user.question_species != 'lapin' && user.question_species != 'chien' && user.question_species != 'chat')){
        answer = await Answers.getChooseSpeciesAnswer()
    } else{
      const entities = Message.getEntities(msgData)
      const entitiesValues = await Message.getEntitiesValues(msgData, user.question_species)
      const entitiesAndValues = entities.concat(entitiesValues)
      let answers = await Message.findAnswer(user.question_species, [entitiesAndValues])

      answers = addTransitionToOtherSpeciesAnswers(answers, entitiesAndValues)

      if(answers.length && answers.length > 1)
        answer = await buildAnswerWithQuickReplies(answers)
      else
        answer = answers
    }
  }
  incrementAnswerDisplayCount(answer._id)
  return answer
}

export function sendAnswer(answer, user){
  const fbMsg = new FacebookMessageText(answer, user)
  FacebookApiWrapper.postTofacebook(fbMsg.getMessage())

  if(answer._id == '5ab3b8407b089d002c6fc156'){
    const fbMsgVideo = new FacebookMessageVideo(answer, user)
    FacebookApiWrapper.postTofacebook(fbMsgVideo.getMessage())
  }

  if(answer._id == '5aa6b30de8160e43b4605dc3'){
    const fbMsgCarousel = new FacebookMessageCarouselProfilMorpho(answer, user)
    FacebookApiWrapper.postTofacebook(fbMsgCarousel.getMessage())
  }

  if(answer.intent == 'goodbye'){
    const fbMsgShareBtn = new FacebookMessageShareButton(answer, user)
    FacebookApiWrapper.postTofacebook(fbMsgShareBtn.getMessage())
  }

  if (answer.gifId) {
    const fbMsgGif = new FacebookMessageGif(answer, user)
    FacebookApiWrapper.postTofacebook(fbMsgGif.getMessage())
  }
}

/**
 * buildAnswerWithQuickReplies - build a multiplematch answer with quick replies
 *
 * @param  {} answers a list of answers
 * @return {}         an answer with quickreplies
 */
async function buildAnswerWithQuickReplies(answers) {
  const qrAnswer = await Answers.findOneRandomByIntent('multipleMatch')
  const answerWithQR = {
    text_fr: qrAnswer.text_fr,
    children: [],
  }
  answers.forEach((answer) => {
    answerWithQR.children.push({
      label: answer.quickReplyLabel_fr ? answer.quickReplyLabel_fr : answer.name,,
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

function addTransitionToOtherSpeciesAnswers(answers, entitiesValues){
  logger.info("addTransitionToOtherSpeciesAnswers :",entitiesValues)

  return answers
}

/**
 * setUserQuestionSpecies - description
 * @param  {event} event facebook event
 * @param  {type} user
 */
export async function setUserQuestionSpecies(event, user){
  if(!event.postback.payload)
    return

  switch (event.postback.payload) {
    case ANSWERS_ID.ANSWER_MENU_RABBIT_ID:
    // need to await otherwise the operation doesn't complete ??
      await  Users.updateQuestionSpecies(user, 'lapin')
      break
    case ANSWERS_ID.ANSWER_MENU_DOG_ID:
      await Users.updateQuestionSpecies(user, 'chien')
      break
    case ANSWERS_ID.ANSWER_MENU_CAT_ID:
      await Users.updateQuestionSpecies(user, 'chat')
      break
      case ANSWERS_ID.ANSWER_MENU_P2P_ID:
      await Users.updateQuestionSpecies(user, 'autres')
      break
    default:
      logger.warn("undefined payload: ",event.postback.payload)
  }
}
