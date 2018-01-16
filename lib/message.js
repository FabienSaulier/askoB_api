import _ from 'lodash'
import Recastai from 'recastai'

import Answers from '../model/answer'
import config from '../config/config'
import logger from '../lib/logger'
import Entities from '../model/entity'


const clientRecast = new Recastai(config.RECAST_DEV_ACCESS_TOKEN)

export function analyseMessage(message) {
  const messageText = message.text
  const quickReply = message.quick_reply
  logger.info('receivedMessage: ', JSON.stringify(messageText))
  if (quickReply) {
    logger.debug('is a quick reply: ', quickReply.payload)
    return quickReply
  }
  // is a text message
  const recast = clientRecast.request
  return recast.analyseText(messageText, { language: 'fr' })
}

/**
 * findAnswer - find an answer in database
 *
 * @param  string intent
 * @param  [[string]] entitiesAndValues
 * @param  int passageCount
 * @return Answer
 */
export async function findAnswer(intent, entitiesAndValues, passageCount = 1) {
  if (intent && intent.slug === 'greetings') { return Answers.findOneRandomByIntent('greetings') }
  if (intent && intent.slug === 'goodbye') { return Answers.findOneRandomByIntent('goodbye') }
  if (intent && intent.slug === 'insult') { return Answers.findOneRandomByIntent('insult') }

  logger.info('search on ', entitiesAndValues)
  const query = buildCriteria(entitiesAndValues)
  const answers = await Answers.find(query)
  logger.info('answers: ', answers.map(a => a.name))

  if (isUnique(answers)) {
    logger.info('unique match: ', answers[0].name)
    return answers[0]
  }

  if (areSeveral(answers)) {
    const dimension = (entitiesAndValues.length + 1) - passageCount // 1 is the modifier for array
    const answersFiltered = filterAnswers(answers, dimension)
    if (answersFiltered.length === 1) { return answersFiltered[0] }
    if (answersFiltered.length > 1) { return buildAnswerWithQuickReplies(answersFiltered) }
  }

  if (canExploseEntities(entitiesAndValues[0])) { return findAnswer(intent, exploseArrays(entitiesAndValues), passageCount + 1) }


  logger.info(`No Answer after ${passageCount} passage`)
  return Answers.findOneRandomByIntent('unknow')
}


/**
 * filterAnswers - filter answers
 *
 * @param  {} answers   description
 * @param  {integer} dimension the dimension of the input "entitiesAndValues"
 * @return {} filtered answers
 */
function filterAnswers(answers, dimension) {
  logger.debug('filtre sur les réponses qui ont dimensions ', dimension)
  const answersWithoutPrecise = filterPrecise(answers, dimension)
  const answersWithProperDimension = filterDimension(answersWithoutPrecise, dimension)
  if (answersWithProperDimension.length > 0) { return answersWithProperDimension }
  return answersWithoutPrecise
}

/**
 * filterPrecise - remove precise Answer if they have a higher dimension than input
 *
 * @param  {[]} answers
 * @param  {integer} dimension
 * @return {[]} answers filtered
 */
function filterPrecise(answers, dimension) {
  return answers.filter(answer => !(dimension < answer.entities.length && answer.precise))
}

/**
 * filterDimension - remove answers of differents dimensions
 *
 * @param  {[]} answers
 * @param  {integer} dimension
 * @return {[]} answers filtered
 */
function filterDimension(answers, dimension) {
  return answers.filter(answer => answer.entities.length === dimension)
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
 * explose oll the arrays inside an array
 *
 * @param  {[[String]]} entities
 * @return {[[String]]}
 */
function exploseArrays(entitiesAndValues) {
  let explosedEntities = []
  entitiesAndValues.forEach((entities) => {
    explose(entities).forEach((explodedE) => { explosedEntities.push(explodedE) })
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
function explose(entities) {
  const explodedEntities = []
  for (let i = 0; i < entities.length; i++) {
    explodedEntities[i] = []
    for (let j = 0; j < entities.length; j++) {
      if (i !== j) { explodedEntities[i].push(entities[j]) }
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
function removeDuplicates(explodedEntities) {
  const minLength = explodedEntities[0].length
  const entitieswithDuplicates = []
  explodedEntities.forEach((entities) => {
    const uniqueSetOfEntities = Array.from(new Set(entities.sort()))
    // si length < it means an entity was present several times, if a false [entity], we ignore it
    if (uniqueSetOfEntities.length === minLength) { entitieswithDuplicates.push(uniqueSetOfEntities) }
  })
  const withoutDuplicates = _.uniqWith(entitieswithDuplicates, _.isEqual)
  return withoutDuplicates
}

/**
 * canExploseEntities - can explose an array
 * @param  {[String]} entities
 * @return {boolean}
 */
function canExploseEntities(entitiesAndValues) {
  // il faut que la taille d'une liste soit plus grande que 1 pour exploser
  if (entitiesAndValues.length > 1) { return true }
  return false
}

export async function getAnswerById(answerId) {
  const answer = await Answers.findOne({ _id: answerId })
  if (answer.length === 0) { return { text: 'Désolé, je ne sais pas encore répondre à cette question! 🐰' } }
  return answer
}

/**
 * get the entities
 * return [String]
 */
export function getEntities(result) {
  let keys = Object.keys(result.entities)
  const valueToExclude = ['pronoun', 'person', 'number', 'emoji']
  keys = keys.filter(key => !valueToExclude.includes(key))
  keys = keys.map(key => key.toUpperCase())
  return keys
}

/**
 * get the values of the pertinent entities.
 * return [String]
 */
export async function getEntitiesValues(result) {
  const entitiesValues = []
  const res = await Entities.find({ areValuesPertinent: true }, { slug: true, _id: false })
  const entValToConsider = []
  res.forEach(r => entValToConsider.push(r.slug))
  const keys = Object.keys(result.entities)
  keys.forEach((key) => {
    if (entValToConsider.includes(key)) {
      const valsData = result.entities[key]
      valsData.forEach(valData => entitiesValues.push(valData.value))
    }
  })
  return entitiesValues
}

function isUnique(answers) {
  if (answers.length === 1) { return true }
  return false
}

function areSeveral(answers) {
  if (answers.length > 1) { return true }
  return false
}

function buildCriteria(entitiesArrays) {
  const query = { $or: [] }
  entitiesArrays.forEach((entities) => {
    const criteria = { entities: { $all: entities } }
    query.$or.push(criteria)
  })
  return query
}
