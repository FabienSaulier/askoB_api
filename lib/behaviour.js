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
    case 'saveUserAnimalTargetWeight':
      await saveUserAnimalTargetWeight(input, user)
      break;
    case 'saveUserAnimalProfilMorpho':
      await saveUserAnimalProfilMorpho(input, user)
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
  // TODO str split, si l'user rentre une phrase avec un chiffre dedans
  // take the sequence with a number
  await Users.update({_id: user._id}, {$set: {'animals.0.weight' : input}})
}

async function saveUserAnimalInArmsWeight(input, user){
  input = input.replace(',','.')
  // TODO str split, si l'user rentre une phrase avec un chiffre dedans
  // take the sequence with a number
  const options = {new:true}
  user = await Users.findOneAndUpdate({_id: user._id}, {$set: {'animals.0.owner_plus_animal_weight' : input}}, options)
  setAnimalWeight(user)
}

async function saveUserOwnerWeight(input, user){
  input = input.replace(',','.')
  // TODO str split, si l'user rentre une phrase avec un chiffre dedans
  // take the sequence with a number
  const options = {new:true}
  user = await Users.findOneAndUpdate({_id: user._id}, {$set: {'weight' : input}}, options)
  await setAnimalWeight(user)
}

async function saveUserAnimalTargetWeight(input, user){
  input = input.replace(',','.')
  // TODO str split, si l'user rentre une phrase avec un chiffre dedans
  // take the sequence with a number
  await Users.update({_id: user._id}, {$set: {'animals.0.target_weight' : input}})
}

async function saveUserAnimalProfilMorpho(input, user){
  input = input.replace(',','.')
  // TODO str split, si l'user rentre une phrase avec un chiffre dedans
  // take the sequence with a number
  user = await Users.update({_id: user._id}, {$set: {'animals.0.profil_morpho' : input}})
  const weight = user.animals[0].weight
  const pm = user.animals[0].profil_morpho
  if(weight && pm){
    let init_needed_loss = undefined
    switch (pm) {
      case 3.5:
          init_needed_loss = weight - weight*10/100
        break;
      case 4:
          init_needed_loss = weight - weight*20/100
        break;
      case 4.5:
          init_needed_loss = weight - weight*30/100
        break;
      case 5:
          init_needed_loss = weight - weight*40/100
        break;
      default:
    }
    saveUserAnimalInitNeededLoss(_.round(init_needed_loss,1), user)
    saveUserAnimalTargetWeight(_.round(weight - init_needed_loss, 1), user)
  }
}

async function saveUserAnimalInitNeededLoss(input, user){
  input = input.replace(',','.')
  // TODO str split, si l'user rentre une phrase avec un chiffre dedans
  // take the sequence with a number
  await Users.update({_id: user._id}, {$set: {'animals.0.init_needed_loss' : input}})
}


async function setAnimalWeight(user){
    if(user.weight && user.animals[0].owner_plus_animal_weight){
      let animal_weight = user.animals[0].owner_plus_animal_weight - user.weight
      animal_weight = _.round(animal_weight, 1)
      saveUserAnimalWeight(animal_weight, user)
    }
}
