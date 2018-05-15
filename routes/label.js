import errs from 'restify-errors'
import _ from 'lodash'
import Labels from '../model/label'
import logger from '../lib/logger'

export default(server) => {

  /**
  * get all the labels
  * */
  server.get('/labels', async (req, res) => {
    const labels = await Labels.find({}).sort( { name: 1 } )
    res.send(200, labels)
  })

  /**
  * add a label
  * */
  server.put('/labels', async (req, res) => {
    const {name} = req.body
    try{
      await Labels.create({ name: name })
      res.send(200)
    } catch(e){
      const err = new errs.UnprocessableEntityError({ message: e.errmsg })
      res.send( err)
    }
  })

}
