import _ from 'lodash'
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


  if(user.question_species === undefined || (user.question_species != 'lapin' && user.question_species != 'chien' && user.question_species != 'chat')){
      answer = await Answers.findChooseSpeciesAnswer()
  } else{
    const entities = Message.getEntities(msgData)
    const entitiesValues = await Message.getEntitiesValues(msgData, user.question_species)
    const entitiesAndValues = entities.concat(entitiesValues)

    let answers = await Message.findAnswer(user.question_species, [entitiesAndValues])
    answers =  await addTransitionToOtherSpeciesAnswers(answers, entitiesAndValues, user.question_species)

    if(answers.length > 1)
      answer = await buildAnswerWithQuickReplies(answers)
    else
      answer = answers[0]
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
      label: answer.quickReplyLabel_fr ? answer.quickReplyLabel_fr : answer.name,
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

 async function addTransitionToOtherSpeciesAnswers(answers, entitiesValues, currentSpecies){
  if(_.includes(entitiesValues, "ESPECE_NL") || _.includes(entitiesValues, "ESPECE_NC") || _.includes(entitiesValues, "ESPECES_NC")){
    let species = _.intersection(entitiesValues, ['chien', 'chat', 'lapin'])
    species = _.without(species, currentSpecies )
    for(let species of species){
      let a = await Answers.findMenuSpecies(species)
      const emoji = (species) => {
        switch (species) {
          case 'chien':
            return '🐶'
            break;
          case 'chat':
            return '🐱'
            break;
          case 'lapin':
            return '🐇'
            break;
          default:
        }
      }
      a.quickReplyLabel_fr = "Changer d'espèce "+emoji(species)
      answers.push(a)
    }
  }
  return answers
}
