import _ from 'lodash'
import logger from '../lib/logger'
import Users from '../model/user'

export async function runBehaviour(name, user, input){
  await _.invoke(new Behaviour(), name, input, user)
}

class Behaviour{
  constructor() {}

  async saveUserAnimalName(input, user){
    let t = await Users.update({_id: user._id}, {$set: {'animals.0.name' : input}})
  }

  async saveUserAnimalWeight(input, user){
    input = _.replace(input,',','.')
    // TODO str split, si l'user rentre une phrase avec un chiffre dedans
    // take the sequence with a number
    await Users.update({_id: user._id}, {$set: {'animals.0.weight' : input}})
  }

  async saveUserAnimalInArmsWeight(input, user){
    input = _.replace(input,',','.')
    // TODO str split, si l'user rentre une phrase avec un chiffre dedans
    // take the sequence with a number
    const options = {new:true}
    user = await Users.findOneAndUpdate({_id: user._id}, {$set: {'animals.0.owner_plus_animal_weight' : input}}, options)
    setAnimalWeight(user)
  }

  async saveUserOwnerWeight(input, user){
    input = _.replace(input,',','.')
    // TODO str split, si l'user rentre une phrase avec un chiffre dedans
    // take the sequence with a number
    const options = {new:true}
    user = await Users.findOneAndUpdate({_id: user._id}, {$set: {'weight' : input}}, options)
    await setAnimalWeight(user)
  }

  async saveUserAnimalTargetWeight(input, user){
    input = _.replace(input,',','.')
    // TODO str split, si l'user rentre une phrase avec un chiffre dedans
    // take the sequence with a number
    await Users.update({_id: user._id}, {$set: {'animals.0.target_weight' : input}})
  }

  async saveUserAnimalProfilMorpho(input, user){
    input = _.replace(input,',','.')
    // TODO str split, si l'user rentre une phrase avec un chiffre dedans
    // take the sequence with a number
    user = await Users.findOneAndUpdate({_id: user._id}, {$set: {'animals.0.profil_morpho' : input}})
    const weight = user.animals[0].weight
    const pm = user.animals[0].profil_morpho
    let init_needed_loss = undefined
    if(weight && pm){
      switch (pm) {
        case 3.5:
            init_needed_loss = weight*10/100
          break;
        case 4:
            init_needed_loss = weight*20/100
          break;
        case 4.5:
            init_needed_loss = weight*30/100
          break;
        case 5:
            init_needed_loss = weight*40/100
          break;
        default:
      }
      saveUserAnimalInitNeededLoss(_.round(init_needed_loss,1), user)
      saveUserAnimalTargetWeight(_.round(weight - init_needed_loss, 1), user)
    }
  }

  async saveUserAnimalInitNeededLoss(input, user){
    input = _.replace(input,',','.')
    // TODO str split, si l'user rentre une phrase avec un chiffre dedans
    // take the sequence with a number
    await Users.update({_id: user._id}, {$set: {'animals.0.init_needed_loss' : input}})
  }

  async setQuestionSpecies(input, user){
    const words = _.words(input, new RegExp(/chien|lapin/g))
    if(words.length > 0){
      const species = words[0].toLowerCase()
      await Users.updateQuestionSpecies(user, species)
    }
  }

  async setAnimalWeight(user){
      if(user.weight && user.animals[0].owner_plus_animal_weight){
        let animal_weight = user.animals[0].owner_plus_animal_weight - user.weight
        animal_weight = _.round(animal_weight, 1)
        saveUserAnimalWeight(animal_weight, user)
      }
  }

}
