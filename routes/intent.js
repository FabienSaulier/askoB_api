import Answers from '../model/answer'
import logger from '../lib/logger'

export default(server) => {
  /**
  * Send all general answers of a species
  * */
  server.get('/generalitents/:species', (req, res) => {
    const { species } = req.params
    const generalIntents = ['greetings', 'goodbye']
    Answers.find({ species, intent: { $in: generalIntents } })
      .then(
        (result) => {
          res.send(200, result)
        },
        (error) => {
          logger.fatal(error)
        },
      )
  })

  server.get('/intent/:intent', (req, res) => {
    const { intent } = req.params
    Answers.find({ intent })
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
