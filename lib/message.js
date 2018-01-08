import Answers from '../model/answer'
import config from '../config/config'
import recastai from 'recastai'
import logger from '../lib/logger'
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
    return Answers.findOneRandomByIntent('greetings')
  if(intent && intent.slug == 'goodbye')
    return Answers.findOneRandomByIntent('goodbye')

  logger.info("search on ",entitiesAndValues)
  const query = buildCriteria(entitiesAndValues)
  const answers = await Answers.find(query)
  logger.info("answers: ", answers.map(a => a.name))

  if(isUnique(answers)){
    logger.info("unique match: ",answers[0].name)
    return answers[0]
  }

  if(areSeveral(answers)){
    const answersFiltered = filterAnswers(answers, entitiesAndValues.length - passageCount + 1)
    if(answersFiltered.length == 1)
      return answersFiltered[0]
    if(answersFiltered.length > 1)
      return buildAnswerWithQuickReplies(answersFiltered)
  }

  if(canExploseEntities(entitiesAndValues[0])){
    passageCount++
    return findAnswer(intent, exploseArrays(entitiesAndValues), passageCount)
  }

  logger.info("No Answer after "+passageCount+" passage")
  return Answers.findOneRandomByIntent('unknow')
}


/**
 * filterAnswers - filter answers
 *
 * @param  {} answers   description
 * @param  {integer} dimension the dimension of the input "entitiesAndValues"
 * @return {} filtered answers
 */
function filterAnswers(answers, dimension){
  logger.debug("filtre sur les réponses qui ont dimensions ",dimension)
  const answersWithoutPrecise = filterPrecise(answers, dimension)
  const answersWithProperDimension = filterDimension(answersWithoutPrecise, dimension)
  if(answersWithProperDimension.length > 0)
    return answersWithProperDimension
  return answersWithoutPrecise
}

/**
 * filterPrecise - remove precise Answer if they have a higher dimension than input
 *
 * @param  {[]} answers
 * @param  {integer} dimension
 * @return {[]} answers filtered
 */
function filterPrecise(answers, dimension){
  return answers.filter(answer => !(dimension < answer.entities.length && answer.precise) )
}

/**
 * filterDimension - remove answers of differents dimensions
 *
 * @param  {[]} answers
 * @param  {integer} dimension
 * @return {[]} answers filtered
 */
function filterDimension(answers, dimension){
  return answers.filter(answer => answer.entities.length == dimension)
}

/**
 * buildAnswerWithQuickReplies - build a multiplematch answer with quick replies
 *
 * @param  {} answers a list of answers
 * @return {}         an answer with quickreplies
 */
async function buildAnswerWithQuickReplies(answers){
  const qrAnswer = await Answers.findOneRandomByIntent("multipleMatch")
  let answerWithQR = {
    'text' : qrAnswer.text,
    'children': []
  }
  answers.forEach(function(answer){
    answerWithQR.children.push({
      "label": answer.quickReplyLabel? answer.quickReplyLabel : answer.name,
      "_id": answer._id
    })
  })
  return answerWithQR
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
        const valsData = result.entities[key]
        valsData.forEach(valData => entitiesValues.push(valData.value))
      }
  })
  return entitiesValues
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

function buildCriteria(entitiesArrays){
  let query = {$or:[]}
  entitiesArrays.forEach((entities)=>{
    const criteria = {entities: {$all:entities}}
    query.$or.push(criteria)
  })
  return query
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
