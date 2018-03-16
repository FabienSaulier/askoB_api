import Answers from '../model/answer'
import logger from '../lib/logger'

export default(server) => {
  /**
  * Send all answers of a species.
  * */
  server.get('/species/:species', (req, res) => {
    const { species } = req.params

    Answers.find({ species }).sort({ name: 1 })
      .then(
        (result) => {
          res.send(200, result)
        },
        (error) => {
          logger.fatal(error)
        },
      )
  })

  /**
  * Send all answers
  * */
  server.get('/species', (req, res) => {
    Answers.find({}).sort({ name: 1 })
      .then(
        (result) => {
          res.send(200, result)
        },
        (error) => {
          logger.fatal(error)
        },
      )
  })

  /**
   * TODO a del ?
  * Send all answers of a species corresponding to the intent.
  * */
  server.get('/species/:species/intent/:intent', (req, res) => {
    const { species, intent } = req.params

    Answers.find({ species, intent }).sort({ name: 1 })
      .then(
        (result) => {
          res.send(200, result)
        },
        (error) => {
          logger.fatal(error)
        },
      )
  })
}
