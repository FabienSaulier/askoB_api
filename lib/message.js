import httpRequest from 'request'
import Answers from '../model/answer'
import config from '../config/config'
import recastai from 'recastai'
import logger from '../lib/logger'
import FacebookMessage from '../model/facebookMessage'
import Entities from '../model/entity'
import _ from 'lodash'


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


function buildCriteria(entitiesArrays){
  let query = {$or:[]}
  entitiesArrays.forEach((entities)=>{
    const criteria = {entities: {$all:entities}}
    query.$or.push(criteria)
  })
  return query
}

/**
 * findAnswer - find an answer in database
 *
 * @param  string intent
 * @param  [[string]] entitiesAndValues
 * @param  int passageCount
 * @return Answer
 */
export async function findAnswer(intent, entitiesAndValues, passageCount = 1){

  if(intent && intent.slug == 'greetings')
    return {text: "Bonjour, \n Je suis KANZI et je veux t'aider à mieux comprendre ton LAPIN 🐰. Quel genre d'informations souhaites-tu ?"}

  logger.info("search on ",entitiesAndValues)
  const query = buildCriteria(entitiesAndValues)
  const answers = await Answers.find(query) //({ entities:{ $all:entitiesAndValues}})
  logger.info("answers: ", answers.forEach(a => a.name))
  if(isUnique(answers)){
    logResult(answers, passageCount)
    return answers.pop()
  }

  if(areSeveral(answers)){
    logResult(answers, passageCount)
    logger.info("severals answer: build quick replies")

    let proposeQuickRepliesAnswer = {
      'text' : 'Que voulez-vous comme information? 🐰',
      'children': []
    }

    answers.forEach(function(answer){
      proposeQuickRepliesAnswer.children.push({
        "label": answer.name,
        "_id": answer._id
      })
    })

    return proposeQuickRepliesAnswer
  }

  if(canExploseEntities(entitiesAndValues[0])){
    passageCount++
    return findAnswer(intent, exploseArrays(entitiesAndValues), passageCount)
  }

  logger.info("No Answer after "+passageCount+" passage")
  return {text: "Désolé, je ne sais pas encore répondre à cette question! 🐰"}
}


function logResult(answers, passageCount){
  if(passageCount ==1){
    logger.info("Exact Match")
  }else{
    logger.info("Partial Match -",passageCount)
  }
}

/**
 * explose oll the arrays inside an array
 *
 * @param  {[[String]]} entities
 * @return {[[String]]}
 */
function exploseArrays(entitiesAndValues){
  let explosedEntities = []
  entitiesAndValues.forEach((entities) => {
    explose(entities).forEach((explodedE)=>{explosedEntities.push(explodedE)})
  })
  explosedEntities = removeDuplicates(explosedEntities)
  return explosedEntities
}

/**
 * explose an array into severals
 * ex: ['A','B','C'] => [['A','B'],['A','C'],['B','C']]
 *
 * @param  {[String]} entities, entities.length > 1
 * @return {[[String]]}
 */
function explose(entities){
  let explodedEntities = []
  for(let i = 0 ; i<entities.length ; i++){
    explodedEntities[i] = []
    for(let j = 0 ; j<entities.length ; j++){
      if(i != j)
        explodedEntities[i].push(entities[j])
    }
  }
  return explodedEntities
}

/**
 * remove duplicates arrays contained in explodedEntities
 *
 * @param  {[['String']]} explodedEntities with duplicates
 * @return {[['String']]} explodedEntities without duplicates
 */
function removeDuplicates(explodedEntities){
  const minLength = explodedEntities[0].length
  let entitieswithDuplicates = []
  explodedEntities.forEach((entities) => {
    const uniqueSetOfEntities = Array.from(new Set(entities.sort()))
    if(uniqueSetOfEntities.length == minLength) // si length < it means an entity was present several times, if a false [entity], we ignore it
      entitieswithDuplicates.push(uniqueSetOfEntities)
  })
  const withoutDuplicates = _.uniqWith(entitieswithDuplicates, _.isEqual)
  return withoutDuplicates
}

/**
 * canExploseEntities - can explose an array
 * @param  {[String]} entities
 * @return {boolean}
 */
function canExploseEntities(entitiesAndValues){
  // il faut que la taille d'une liste soit plus grande que 1 pour exploser
  if(entitiesAndValues.length > 1)
    return true
  return false
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
