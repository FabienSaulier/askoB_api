import httpRequest from 'request'
import Answers from '../model/answer'
import config from '../config/config'
import recastai from 'recastai'
import logger from '../lib/logger'
import FacebookMessage from '../model/facebookMessage'
import Entities from '../model/entity'

let clientRecast = new recastai(config.RECAST_DEV_ACCESS_TOKEN);

export function analyseMessage(message){
  const messageId = message.mid;
  const messageText = message.text;
  const quickReply = message.quick_reply;
  logger.info("receivedMessage: ",JSON.stringify(messageText));
  if(quickReply){
    logger.debug("is a quik reply leading to answer._id: ", quickReply.payload);
    return quickReply;
  }
  else if(messageText){
    let recast = clientRecast.request
    return recast.analyseText(messageText)
  }
}


function logResult(answers, passageCount){
  if(passageCount ==1){
    logger.info("Exact Match")
  }else{
    logger.info("Partial Match -",passageCount)
  }
}

function isUnique(answers){
  if(answers.length == 1)
    return true
  return false
}

function areSeveral(answers){
  if(answers.length > 1)
    return true
  return false
}

function buildQuickReplies(answers){
  logger.info("TODO buildQuickReplies")
}

export async function findAnswer(intent, entitiesAndValues, passageCount){
  if(!passageCount)
    passageCount = 1

  if(intent && intent.slug == 'greetings')
    return {text: "Bonjour, \n Je suis KANZI et je veux t'aider à mieux comprendre ton LAPIN 🐰. Quel genre d'informations souhaites-tu ?"}

  logger.info("search on ",entitiesAndValues)

  const answers = await Answers.find({ entities: ------------------------------------
    -
    -
    -{ $all:entitiesAndValues}})

  if(isUnique(answers)){
    logResult(answers, passageCount)
    return answers
  }

  if(areSeveral(answers)){
    logResult(answers, passageCount)
    return buildQuickReplies(answers)
  }

  if(canExploseEntities(entitiesAndValues)){
    passageCount++
    return findAnswer(intent, explose(entitiesAndValues), passageCount)
  }

  logger.info("No Answer after "+passageCount+" passage")
  return {text: "Désolé, je ne sais pas encore répondre à cette question! 🐰"}
}


function explose(entitiesAndValues){
  const set = new Set(entitiesAndValues)

  pour chaque Element : exploser
  puis virer les doublons

}

function canExploseEntities(entitiesAndValues){
  if(entitiesAndValues[0].length == 1)
    return false
  return true
}


export async function findRightAnswer(intent, entities, entitiesValues, secondPass){

  if(intent && intent.slug == 'greetings')
    return {text: "Bonjour, \n Je suis KANZI et je veux t'aider à mieux comprendre ton LAPIN 🐰. Quel genre d'informations souhaites-tu ?"}

  if(entitiesValues.length > 0)
    logger.info("search on ",entities," with ",entitiesValues)
  else
    logger.info("search on ",entities," with no values")


  const answers = await Answers.find({ entities: { $all:entities}})
  if(answers.length == 0){
    logger.warn("no anwser found for ",entities)
    if(secondPass){
      return {text: "Désolé, je ne sais pas encore répondre à cette question! 🐰"}
    } else{
      const filteredEntities = await removeFilteredEntities(entities)
      return findRightAnswer(intent, filteredEntities,entitiesValues, true )
    }
  }

  const constPerfectAnswer = getAnswerWhichMatchEntitiesAndValues(answers, entities, entitiesValues)
  if(constPerfectAnswer){
    logger.info("It's a Perfect Match!");
    return constPerfectAnswer
  }
  else{
    const entitiesValues = []
    const generalAnswer = getAnswerWhichMatchEntitiesAndValues(answers, entities, entitiesValues)
    if(generalAnswer){
      logger.info("Got generic answer with NO entities values");
      return generalAnswer
    }
    else{
      logger.info("No generic answer found (with no values)")
      const partialAnswer = getAnswerPartial(answers, entities)
      if(partialAnswer){
        logger.info("Partial match - answer: "+partialAnswer.entities+" recast wanted: "+entities)
        return partialAnswer
      }
      else{
        logger.info("No partial answer found (with no values)")
        if(secondPass)
        return {text: "Désolé, je ne sais pas encore répondre à cette question! 🐰"}
        else{
          const filteredEntities = await removeFilteredEntities(entities)
          return findRightAnswer(intent, filteredEntities,entitiesValues, true )
        }
      }
    }
  }
}

export async function getAnswerById(answerId){
  const answer = await Answers.findOne({'_id':answerId});
  if(answer.length == 0)
    return {text:"Désolé, je ne sais pas encore répondre à cette question! 🐰"}
  return answer
}

function getAnswerPartial(answers, entities){
  const answersWithoutEntValues = answers.filter((answer) => answer.entValues.length == 0)
  if(answersWithoutEntValues){
    let bestAnswerIndex = 0
    answersWithoutEntValues.forEach((answer, index) => {
      if(answer.entities.length <= answers[bestAnswerIndex])
        bestAnswerIndex == index
    })
    return answersWithoutEntValues[bestAnswerIndex]
  }
  return null
}

function getAnswerWhichMatchEntitiesAndValues(answers, entities, entitiesValues){
  let answerMatchEntities = answers.filter((answer) => areArrayEqual(answer.entities, entities))
  if(answerMatchEntities){
    const result = answerMatchEntities.filter((answer) => areArrayEqual(answer.entValues, entitiesValues))
    if(result.length >1){
      logger.error("There are 2 answers similar, can't choose: ", result, entities, entitiesValues);
      return null
    } else
      return result.pop()
  }
  return null
}

/**
 * get the entities
 * return [String]
 */
export function getEntities(result){
  let keys = Object.keys(result.entities)
  const valueToExclude = ['pronoun', 'person', 'number', 'emoji']
  keys = keys.filter(key => !valueToExclude.includes(key))
  keys = keys.map(key => key.toUpperCase())
  return keys
}

async function removeFilteredEntities(entities){
  let entToFilter = await Entities.getEntitiesName()
  let entListName = []
  entToFilter.forEach((r) => {entListName.push(r.name)})
  logger.info("Remove entities ",entListName)
  let result = []
  entities.forEach((e)=>{
    if(!entListName.includes(e))
      result.push(e)
  })
  return result
}

/**
 * get the values of the pertinent entities.
 * return [String]
 */
export async function getEntitiesValues(result){
  let entitiesValues = [];
  let res = await Entities.find({areValuesPertinent:true}, {slug:true, _id:false})
  let entValToConsider = []
  res.forEach((r)  => entValToConsider.push(r.slug))
  const keys = Object.keys(result.entities)
  keys.forEach((key) => {
      if(entValToConsider.includes(key)){
        const values = result.entities[key]
        entitiesValues.push(values[0].value)
      }
  })
  return entitiesValues
}

/**
 * Return true if array are equals
 */
function areArrayEqual(array1, array2){
  const res = (array1.length == array2.length) && array1.every(function(element) {
      return array2.includes(element)
  });
  return res
}

 export function postTofacebook(messageData) {
   httpRequest({
     uri: config.FB_MESSAGE_URL+config.ACCESS_TOKEN,
     method: 'POST',
     json: messageData
   }, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       logger.debug("posted to Facebook",);
     } else {
       logger.error("Unable to send message: ", body.error);
     }
   });
}

export function sendTypingOn(recipientId) {
 logger.debug("send typing_on");
 var data = {
   recipient: {
     id: recipientId
   },
   sender_action:"typing_on"
 };
 httpRequest({
   uri: config.FB_MESSAGE_URL+config.ACCESS_TOKEN,
   method: 'POST',
   json: data
 }, function (error, response, body) {
   if (!error && response.statusCode == 200) {
     // ok
   } else {
     logger.error("Unable to send message: %s : %s ",response.body.error.type, response.body.error.message);
   }
 });
}
