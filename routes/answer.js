import flattenMongooseValidationError from 'flatten-mongoose-validation-error'
import errs from 'restify-errors'
import _ from 'lodash'

import Answers from '../model/answer'
import logger from '../lib/logger'

export default(server) => {
  /**
  * Send an answer
  * */
  server.get('/answer/:id', (req, res) => {
    const { id } = req.params
    Answers.findOne({ _id: id })
      .then(
        (result) => {
          res.send(200, result)
        },
        (error) => {
          logger.error(error)
        },
      )
  })

  /**
  * get answers by name
  * */
  server.get('/answers/name/', async (req, res) => {
    const answers = await Answers.find({
        species: req.query.species,
        name: { $in: req.query.names}
    }).exec()
    res.send(200, answers)
  })

  /**
  * Delete an answer.
  * */
  server.del('/answer/:id', (req, res, next) => {
    const { id } = req.params
    logger.info('Delete answer %s ', id)
    Answers.remove({ _id: id }, (err) => {
      if (err) return logger.error(err)
      res.send(200)
      return next()
    })
  })

  // Update and Create an asnwer.
  server.put('/answer/', (req, res, next) => {
    const inputAnswer = req.body
    logger.info("sauvegarde d'une nouvelle reponse", inputAnswer)
    if (inputAnswer && inputAnswer._id) {
      Answers.update({ _id: inputAnswer._id }, inputAnswer, { runValidators: true }, (err) => {
        if (err) {
          logger.error(err)
          res.send(buildErrorMsg(err))
          return next()
        }
        res.send(200)
        return next()
      })
    } else {
      Answers.create(inputAnswer, (err) => {
        if (err) {
          logger.error(err)
          res.send(buildErrorMsg(err))
          return next()
        }
        res.send(200)
        return next()
      })
    }
  })

  /**
   * get the general answers corresponding to the intent and
   * return One of them at random
   */
  server.get('/answer/general/:intent', (req, res) => {
    const { intent } = req.params
    Answers.find({ intent })
      .then(
        (result) => {
          const randomIndex = _.random(0, result.length - 1)
          res.send(200, result[randomIndex])
        },
        (error) => {
          logger.error(error)
        },
      )
  })

  function buildErrorMsg(err) {
    const e = flattenMongooseValidationError(err, ' - ')
    logger.warn(e)
    const error = new errs.UnprocessableEntityError({ message: e })
    return error
  }
}
