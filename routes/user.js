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
  * get specifics users
  * */
  server.get('/user/search/', async (req, res) => {
    let { createdAtBegin, createdAtEnd, species, userLastName, label } = req.query
    let dbQuery = {}
    if(species){
      if(species[0] === 'aucune'){
        dbQuery.question_species = {}
        dbQuery.question_species.$exists = false
      } else
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
    if(label){
      dbQuery.labels = { $all: [label] }
    }
    const users = await Users.find(dbQuery).exec()
    res.send(200, users)
  })

  server.patch('users/label/:label_name', async (req, res) => {
    const labelName = req.params.label_name
    const usersId = req.body.params.usersId
    let result
    if(labelName)
      result = await Users.updateMany( {_id: { $in: usersId}} , {$push: { labels: labelName} }).exec()
    else
      result = await Users.updateMany( {_id: { $in: usersId}} , {$set: { labels: []} }).exec()
    res.send(200)
  })

}
