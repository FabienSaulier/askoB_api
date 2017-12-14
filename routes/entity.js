import Entities from '../model/entity'
import logger from '../lib/logger'
import config from '../config/config'
import axios from 'axios'
import _object from 'lodash/object'

export default(server) => {

  // Look for entities at recast, if new, save them to Kanzi api
  // Then return the list of entities
  server.get('/entities/', function(req, res, next){

    let recastEntities = []
    let kanziSavedEntities = []

    getRecastEntities()
    .then(response => {
      recastEntities = response.data.results
      recastEntities = recastEntities.map(entity => {
       return  _object.mapKeys(entity, function(value, key){
           return (key === 'id' ? '_id': key)
         })
       })
      return getKanziSavedEntities()
    })
    .then(ent => {
      kanziSavedEntities = ent
      const entitiesToSave = findDifferents(recastEntities, kanziSavedEntities)
      return Entities.create(entitiesToSave)
    })
    .then( () => {
      return getKanziSavedEntities()
    })
    .then( entities =>
      res.send(200, entities)
    )
    .catch(error => logger.error(error))

  });

  server.put('/entities/', function(req, res, next){

    const entities = req.body;
    const bulk = Entities.collection.initializeOrderedBulkOp();

    entities.forEach((entity) => {
      Entities.update({ _id: entity._id }, { areValuesPertinent: entity.areValuesPertinent },
        function(err, answer){
          if(err){
            console.log(error)
            //res.send(buildErrorMsg(err))
        //    return next()
          } else{
        //    res.send(200)
          //  return next()
          }
        }
      );
    })
  });


  // return entities who are present in recastEntities but not kanzi
  function findDifferents(recastEntities, kanzi){
    let diff = []
    if(recastEntities.length == 0)
      return recastEntities;

    recastEntities.forEach((recastE) => {
      const found = kanzi.some((kanziE) => {
         return (recastE._id == kanziE._id)
        })
      if(!found)
        diff.push(recastE)
    })
    return diff
  }

  function getRecastEntities(){
    const url = "https://api.recast.ai/v2/users/"+config.RECAST_USER_SLUG+"/bots/"+config.RECAST_BOT_SLUG+"/entities"
    const options = {headers:{ 'Authorization': 'Token '+config.RECAST_DEV_ACCESS_TOKEN }}
    return axios.get(url,options)
  }

  function getKanziSavedEntities(){
    return Entities.find()
  }

}
