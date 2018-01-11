import flattenMongooseValidationError from 'flatten-mongoose-validation-error'
import errs from 'restify-errors'
import _ from 'lodash'

import Tests from '../model/test'
import logger from '../lib/logger'

export default(server) => {
  /**
  * Send an test
  * */
  server.get('/test/:id', (req, res) => {
    const { id } = req.params
    Tests.findOne({ _id: id })
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

  // Update and Create an test.
  server.put('/test/', (req, res, next) => {
    const inputTest = req.body
    logger.info("sauvegarde d'un nouveau test", inputTest)
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

  function buildErrorMsg(err) {
    const e = flattenMongooseValidationError(err, ' - ')
    logger.warn(e)
    const error = new errs.UnprocessableEntityError({ message: e })
    return error
  }
}
