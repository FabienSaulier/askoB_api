import flattenMongooseValidationError from 'flatten-mongoose-validation-error'
import errs from 'restify-errors'

import Tests from '../model/test'
import logger from '../lib/logger'
import karma from 'karma'

export default(server) => {
  // get all tests from a species
  server.get('/test/:species', (req, res) => {
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

  server.get('/test/:species/launch', (req, res) => {


    var Server = karma.Server
    var server = new Server({port: 9876}, function(exitCode) {

      if (!exitCode) {
  console.log('\tTests ran successfully.\n');
  // rerun with a different configuration
  next();
} else {
  // just exit with the error code
  next(exitCode);
}

console.log('Karma has exited with ' + exitCode)
process.exit(exitCode)

    })

    server.start()
    res.send(200)

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
