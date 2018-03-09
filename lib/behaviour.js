import _ from 'lodash'
import logger from '../lib/logger'
import Users from '../model/user'

export async function runBehaviour(name, user, input){

  switch (name) {
    case 'saveUserAnimalName':
      await saveUserAnimalName(input, user)
      break;
    default:
      logger.warn("unknown behaviour: ",name)
      break;
  }
}


async function saveUserAnimalName(input, user){
  await Users.update({_id: user._id}, {$set: {'animals.0.name' : input}})
}
