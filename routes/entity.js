import axios from 'axios'
import _object from 'lodash/object'

import Entities from '../model/entity'
import logger from '../lib/logger'
import config from '../config/config'


export default(server) => {
  // Look for entities at recast, if new, save them to Kanzi api
  // Then return the list of entities
  server.get('/entities/:species', (req, res) => {
    const { species } = req.params
    let recastEntities = []
    let kanziSavedEntities = []

    getRecastEntities(species)
      .then((response) => {
        recastEntities = response.data.results
        recastEntities.forEach(re => re.id = re.id.concat('_'+species))
        console.log("recastEntities", recastEntities)
        recastEntities = recastEntities.map(entity => _object.mapKeys(entity, (value, key) => (key === 'id' ? '_id' : key)))
        return getKanziSavedEntities(species)
      })
      .then((ent) => {
        kanziSavedEntities = ent
        const entitiesToSave = findDifferents(recastEntities, kanziSavedEntities)
        entitiesToSave.forEach(e => e.species = species)
        return Entities.create(entitiesToSave)
      })
      .then(() => getKanziSavedEntities(species))
      .then(entities =>
        res.send(200, entities))
      .catch(error => logger.error(error))
  })

  server.put('/entities/', (req, res) => {
    const entities = req.body
    entities.forEach((entity) => {
      Entities.update(
        { _id: entity._id },
        { isFiltered: entity.isFiltered, areValuesPertinent: entity.areValuesPertinent },
        (err) => {
          if (err) {
            logger.error(err)
          }
        },
      )
    })
  })


  // return entities who are present in recastEntities but not kanzi
  function findDifferents(recastEntities, kanzi) {
    const diff = []
    if (recastEntities.length === 0) { return recastEntities }

    recastEntities.forEach((recastE) => {
      const found = kanzi.some(kanziE => (recastE._id === kanziE._id))
      if (!found) { diff.push(recastE) }
    })
    return diff
  }

  function getRecastEntities(species) {
    let botSlug = ''
    let recastAccess = ''
    if(species === 'chien'){
      botSlug = config.RECAST_BOT_SLUG_CHIEN
      recastAccess = config.RECAST_DEV_ACCESS_TOKEN_CHIEN
    }else{
      botSlug = config.RECAST_BOT_SLUG
      recastAccess = config.RECAST_DEV_ACCESS_TOKEN
    }

    const url = `https://api.recast.ai/v2/users/${config.RECAST_USER_SLUG}/bots/${botSlug}/entities`
    console.log(url)
    const options = { headers: { Authorization: `Token ${recastAccess}` } }
    return axios.get(url, options)
  }

  function getKanziSavedEntities(species) {
    return Entities.find({species:species})
  }
}
