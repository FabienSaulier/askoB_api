import _ from 'lodash'
import Recastai from 'recastai'

import Answers from '../model/answer'
import config from '../config/config'
import logger from '../lib/logger'
import Entities from '../model/entity'


const clientRecast = new Recastai(config.RECAST_DEV_ACCESS_TOKEN)

export function analyseMessage(message, species) {
  const messageText = message.text
  const quickReply = message.quick_reply
  logger.info('receivedMessage ('+species+'): ', JSON.stringify(messageText))
  // If this is a quick reply, no need to use recast to analyse the text
  if (quickReply) {
    logger.debug('is a quick reply: ', quickReply.payload)
    return quickReply
  }

  let clientRecast = {}
  if(species === 'chien')
    clientRecast = new Recastai(config.RECAST_DEV_ACCESS_TOKEN_CHIEN)
  else
    clientRecast = new Recastai(config.RECAST_DEV_ACCESS_TOKEN)
  const recast = clientRecast.request
  return recast.analyseText(messageText, { language: 'fr' })
}


/**
 * findAnswer - find an answer in database
 * @param  string species - we look for the answers of this species
 * @param  string intent
 * @param  [[string]] entitiesAndValues
 * @return Answer
 */
export async function findAnswer(species, intent, entitiesAndValues) {
  if (intent && intent.slug === 'greetings') { return Answers.findOneRandomByIntent('greetings') }
  if (intent && intent.slug === 'goodbye') { return Answers.findOneRandomByIntent('goodbye') }
  if (intent && intent.slug === 'insult') { return Answers.findOneRandomByIntent('insult') }

  logger.info('search on ', entitiesAndValues)
  const query = buildCriteria(species, entitiesAndValues)
  let answers = await Answers.find(query)
  logger.info('answers: ', answers.map(a => a.name))

  if(answers.length > 0){
    const dimension = entitiesAndValues[0].length
    answers = filterAnswers(answers, dimension)
  }

  if (isUnique(answers)) {
    logger.info('unique match: ', answers[0].name)
    return answers[0]
  }

  if (answers.length > 1) { return answers }

  if (canExploseEntities(entitiesAndValues[0])) { return findAnswer(species, intent, exploseArrays(entitiesAndValues)) }

  return  getNoAnswerFound(species)
}


/**
 * getNoAnswerFound - get the appropriate "no answer"
 * @return {Answer}  a no answer found type Answer
 */
async function getNoAnswerFound(species){
  logger.info(`No Answer found`)
  if(species === undefined || species == ''){
    const NO_SPECIES_SELECTED_ID = '5aabe4443d934c2094927e3a'
    return await Answers.findOne({_id: NO_SPECIES_SELECTED_ID})
  } else if(species === 'autres'){
    return Answers.dontUseNLP
  } else
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
  try{
    const answer = await Answers.findOne({ _id: answerId })
    if (answer.length === 0) { return { text: 'Désolé, je ne sais pas encore répondre à cette question! 🐰' } }
    return answer
  } catch (error){
    logger.error(error)
    return { text: 'Désolé, je ne sais pas encore répondre à cette question! 🐰' }
  }
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
export async function getEntitiesValues(result, species) {
  const entitiesValues = []
  const res = await Entities.find({ areValuesPertinent: true, species : species }, { slug: true, _id: false })
  const entValToConsider = []
  res.forEach(r => entValToConsider.push(r.slug))
  const keys = Object.keys(result.entities)
  keys.forEach((key) => {
    if (entValToConsider.includes(key)) {
      const valsData = result.entities[key]
      if(key === 'color'){ // color est un cas particulier avec rgb, raw
        valsData.forEach(valData => entitiesValues.push(valData.raw))
      } else {
        valsData.forEach(valData => entitiesValues.push(valData.value))
      }
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

function buildCriteria(species, entitiesArrays) {
  const entitiesCriteria = { $or: [] }
  entitiesArrays.forEach((entities) => {
    const criteria = { entities: { $all: entities } }
    entitiesCriteria.$or.push(criteria)
  })
  const query = { $and: [ {species:species} , entitiesCriteria] }
  return query
}
