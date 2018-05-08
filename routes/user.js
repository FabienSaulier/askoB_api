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
    const { createdAtBegin, createdAtEnd, species, userLastName } = req.query
    console.log(req.query)
    let dbQuery = {}
    if(species){
      dbQuery.question_species = { $in : species}
    }
    if(userLastName){
      dbQuery.last_name = userLastName
    }
    if(createdAtBegin && createdAtEnd){
      dbQuery.createdAt = {
        $gte: new Date(createdAtBegin),
        $lte: new Date(createdAtEnd),
      }
    }
console.log(dbQuery)
    const users = await Users.find(dbQuery).exec()
    res.send(200, users)
  })

}
