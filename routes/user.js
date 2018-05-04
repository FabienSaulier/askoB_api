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

}
