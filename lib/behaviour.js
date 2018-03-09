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
    case 'saveUserAnimalInArmsWeight':
      await saveUserAnimalInArmsWeight(input, user)
      break;
    case 'saveUserOwnerWeight':
      await saveUserOwnerWeight(input, user)
      break;
    default:
      logger.warn("unknown behaviour: ",name)
      break;
  }
}


async function saveUserAnimalName(input, user){
  await Users.update({_id: user._id}, {$set: {'animals.0.name' : input}})
}

async function saveUserAnimalWeight(input, user){
  input = input.replace(',','.')
  // str split
  // take the sequence with a number
  await Users.update({_id: user._id}, {$set: {'animals.0.weight' : input}})
}

async function saveUserAnimalInArmsWeight(input, user){
  input = input.replace(',','.')
  // str split
  // take the sequence with a number
  const options = {new:true}
  user = await Users.findOneAndUpdate({_id: user._id}, {$set: {'animals.0.owner_plus_animal_weight' : input}}, options)
  setAnimalWeight(user)
}

async function saveUserOwnerWeight(input, user){
  input = input.replace(',','.')
  // str split
  // take the sequence with a number
  const options = {new:true}
  user = await Users.findOneAndUpdate({_id: user._id}, {$set: {'weight' : input}}, options)
  await setAnimalWeight(user)
}

async function setAnimalWeight(user){
    if(user.weight && user.animals[0].owner_plus_animal_weight){
      let animal_weight = user.animals[0].owner_plus_animal_weight - user.weight
      animal_weight = _.round(animal_weight, 1)
      saveUserAnimalWeight(animal_weight, user)
    }
}
