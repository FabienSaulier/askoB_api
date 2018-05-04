import _ from 'lodash'
import logger from '../lib/logger'
import Users from '../model/user'
import Answers from '../model/answer'
import * as ANSWERS_ID from '../lib/answersID'
import * as Behaviour from '../lib/behaviour'
import MessageLog from '../model/messageLog'
import * as Message from '../lib/message'

export async function run(event, user) {

  logger.info("received text: ",event.message.text)
  const userInput = event.message.text

  if(event.message.text == '⬆️' || event.message.text == '🏠'){
    user = await Users.setLastAnswer(user, {})
  }

  // if Behaviour: run it then send the followup answer
  if(user.last_answer && user.last_answer.expectedBehaviour){

    await Behaviour.runBehaviour(user.last_answer.expectedBehaviour, user, event.message)
    // refresh user for new informtions
    user = await Users.getUserInfos(user.senderID)
    if(user.last_answer.nextAnswer)
      return await Answers.findOne({_id: user.last_answer.nextAnswer})
  }

  const answers =  await getAnswers(event.message, user)

  MessageLog.createAndSave(user, userInput, "TEXT", answers)

  if(answers.length > 1)
    return await buildAnswerWithQuickReplies(answers)
  else{
    Answers.incrementAnswerDisplayCount(answers[0]._id)
    return answers[0]
  }

}


async function getAnswers(message, user) {

  const msgData = await Message.analyseMessage(message, user.question_species)

  if(user.question_species === undefined || (user.question_species != 'lapin' && user.question_species != 'chien' && user.question_species != 'chat')){
      return await Answers.findChooseSpeciesAnswer()
  }

  const entities = Message.getEntities(msgData)
  const entitiesValues = await Message.getEntitiesValues(msgData, user.question_species)
  const entitiesAndValues = entities.concat(entitiesValues)

  let answers = await Message.findAnswer(user.question_species, [entitiesAndValues])
  answers =  await addTransitionToOtherSpeciesAnswers(answers, entitiesAndValues, user.question_species)
  return answers
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
