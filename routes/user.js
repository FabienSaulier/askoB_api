import errs from 'restify-errors'
import _ from 'lodash'
import Users from '../model/user'
import logger from '../lib/logger'

export default(server) => {

  /**
  * get all the messages
  * */
  server.get('/user/all/', async (req, res) => {
    const users = await Users.find({})
    res.send(200, users)
  })

  /**
  * get all the messages
  * */
  server.get('/user/search/', async (req, res) => {
    console.log(req.query)
    const users = await Users.find({
      "createdAt": {
        $gte: new Date(req.query.createdAtBegin),
        $lte: new Date(req.query.createdAtEnd),
        },
      "question_species" : {
        $in: req.query.species
      }
    }).exec()
    res.send(200, users)
  })

}
