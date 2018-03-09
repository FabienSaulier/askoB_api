import _ from 'lodash'
import logger from '../lib/logger'
import Users from '../model/user'

export async function runBehaviour(name, user, input){

  switch (name) {
    case 'saveUserAnimalName':
      await saveUserAnimalName(input, user)
      break;
    case 'saveUserAnimalWeight':
      await saveUserAnimalWeight(input, user)
      break;
    default:
      logger.warn("unknown behaviour: ",name)
      break;
  }
}


async function saveUserAnimalWeight(input, user){
  // str split
  // take the sequence with a number
  await Users.update({_id: user._id}, {$set: {'animals.0.weight' : input}})
}


async function saveUserAnimalName(input, user){
  await Users.update({_id: user._id}, {$set: {'animals.0.name' : input}})
}
