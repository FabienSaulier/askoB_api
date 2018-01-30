import flattenMongooseValidationError from 'flatten-mongoose-validation-error'
import errs from 'restify-errors'

import Tests from '../model/test'
import logger from '../lib/logger'
import * as Message from '../lib/message'

export default(server) => {

  server.get('/test/analyse/:userInput', (req, res) => {
    const { userInput } = req.params
    Message.analyseMessage({text:userInput})
    .then(
      async (result) => {
        const intent = result.intent()
        const entities = Message.getEntities(result)
        const entitiesValues = await Message.getEntitiesValues(result)
        const entitiesAndValues = entities.concat(entitiesValues)
        res.send(200, entitiesAndValues)
      },
      (error) => {
        logger.fatal(error)
      },
    )
  })

  server.get('/test/findanswer/:userInput', async (req, res) => {
    let { userInput } = req.params
    const result = await Message.analyseMessage({text:userInput})
    const entitiesAndValues = await extractTags(result)
    Message.findAnswer(result.intent(), [entitiesAndValues])
    .then(
      (answer) => {
        res.send(200, answer)
      },
      (error) => {
        logger.fatal(error)
      },
    )
  })

  async function extractTags(recastData){
    const entities = Message.getEntities(recastData)
    const entitiesValues = await Message.getEntitiesValues(recastData)
    return entities.concat(entitiesValues)
  }

  // get all tests from a species
  server.get('/test/species/:species', (req, res) => {
    const { species } = req.params
    Tests.find({ species }).sort({ name: 1 })
      .then(
        (result) => {
          res.send(200, result)
        },
        (error) => {
          logger.fatal(error)
        },
      )
  })

  // Update and Create an test.
  server.put('/test/', (req, res, next) => {
    const inputTest = req.body
    logger.debug("sauvegarde d'un nouveau test", inputTest)
    if (inputTest && inputTest._id) {
      Tests.update({ _id: inputTest._id }, inputTest, { runValidators: true }, (err) => {
        if (err) {
          res.send(buildErrorMsg(err))
          return next()
        }
        res.send(200)
        return next()
      })
    } else {
      Tests.create(inputTest, (err) => {
        if (err) {
          res.send(buildErrorMsg(err))
          return next()
        }
        res.send(200)
        return next()
      })
    }
  })

  /**
  * Delete a test.
  * */
  server.del('/test/:id', (req, res, next) => {
    const { id } = req.params
    logger.info('Delete test %s ', id)
    Tests.remove({ _id: id }, (err) => {
      if (err) return logger.error(err)
      res.send(200)
      return next()
    })
  })

  function buildErrorMsg(err) {
    const e = flattenMongooseValidationError(err, ' - ')
    logger.warn(e)
    const error = new errs.UnprocessableEntityError({ message: e })
    return error
  }
}
