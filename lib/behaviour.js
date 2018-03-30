import _ from 'lodash'
import logger from '../lib/logger'
import Users from '../model/user'


/**
 * runBehaviour - invoke the named function
 * @param  String name of the function to invoke
 * @param  {user} user
 * @param  {message} message message data
 */
export async function runBehaviour(name, user, message){
  await _.invoke(new Behaviour(), name, message, user)
}

class Behaviour{
  constructor() {}

  async saveUserAnimalName(message, user){
    await Users.update({_id: user._id}, {$set: {'animals.0.name' : message.text}})
  }

  async saveUserAnimalWeight(message, user){
    const weight = _.replace(message.text,',','.')
    // TODO str split, si l'user rentre une phrase avec un chiffre dedans
    // take the sequence with a number
    await Users.update({_id: user._id}, {$set: {'animals.0.weight' : weight}})
  }

  async saveUserAnimalInArmsWeight(message, user){
    const weight = _.replace(message.text,',','.')
    // TODO str split, si l'user rentre une phrase avec un chiffre dedans
    // take the sequence with a number
    const options = {new:true}
    user = await Users.findOneAndUpdate({_id: user._id}, {$set: {'animals.0.owner_plus_animal_weight' : weight}}, options)
    await this.setAnimalWeight(user)
  }

  async saveUserOwnerWeight(message, user){
    const weight = _.replace(message.text,',','.')
    // TODO str split, si l'user rentre une phrase avec un chiffre dedans
    // take the sequence with a number
    const options = {new:true}
    user = await Users.findOneAndUpdate({_id: user._id}, {$set: {'weight' : weight}}, options)
    await this.setAnimalWeight(user)
  }

  async saveUserAnimalTargetWeight(message, user){
    const weight = _.replace(message.text,',','.')
    // TODO str split, si l'user rentre une phrase avec un chiffre dedans
    // take the sequence with a number
    await Users.update({_id: user._id}, {$set: {'animals.0.target_weight' : weight}})
  }

  async saveUserAnimalProfilMorpho(message, user){
    const profilMorpho = _.replace(message.text,',','.')
    // TODO str split, si l'user rentre une phrase avec un chiffre dedans
    // take the sequence with a number
    user = await Users.findOneAndUpdate({_id: user._id}, {$set: {'animals.0.profil_morpho' : profilMorpho}})
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

  async saveUserAnimalInitNeededLoss(message, user){
    const initNeededLoss = _.replace(message.text,',','.')
    // TODO str split, si l'user rentre une phrase avec un chiffre dedans
    // take the sequence with a number
    await Users.update({_id: user._id}, {$set: {'animals.0.init_needed_loss' : initNeededLoss}})
  }

  async setQuestionSpecies(message, user){
    const words = _.words(message.text, new RegExp(/chien|lapin/g))
    if(words.length > 0){
      const species = words[0].toLowerCase()
      await Users.updateQuestionSpecies(user, species)
    }
  }

  async saveSelectedQRPayload(message, user){
    let payload = JSON.parse(message.quick_reply.payload);
    delete payload.id // remove answer id, we want only the useful payload
    let placeholder = {}
    placeholder['animals.0.'+_.keys(payload)[0]] = _.values(payload)[0]
    console.log(placeholder)
    const result = await Users.update({_id: user._id}, {$set: placeholder })
    console.log("update with Payload Behaviour result: ",result)
  }


  /******************************************************/
  /*       Helper functions, do not call from outside   */
  /******************************************************/

  async setAnimalWeight(user){
    if(user.weight && user.animals[0].owner_plus_animal_weight){
      let animal_weight = user.animals[0].owner_plus_animal_weight - user.weight
      animal_weight = _.round(animal_weight, 1)
      this.saveUserAnimalWeight(animal_weight, user)
    }
  }

}
