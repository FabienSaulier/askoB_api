import mongoose from 'mongoose'
import mongooseStringQuery from 'mongoose-string-query'
import timestamps from 'mongoose-timestamp'
import uniqueValidator from 'mongoose-unique-validator'
import Answer from './answer'
import _ from 'lodash'

const AnimalSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  weight: {
    type: Number,
  },
  target_weight: {
    type: Number,
  },
  init_needed_loss: {
    type: Number,
  },
  owner_plus_animal_weight: {
    type: Number,
  },
  profil_morpho: {
    type: Number
  },
  age: {
    type: Number,
  },
  species: {
    type: String,
  },
  id_weigh_loss_answer_step: { // dernière question où l'utilisateur s'est arrêté
    type: mongoose.Schema.Types.ObjectId,
  },
  habit_frequency_food_outside_meal: {
    type: String,
    enum: ['NEVER', 'SOMETIMES', 'OFTEN', 'EVERYTIME'],
  },
  habit_frequency_treats: {
    type: String,
    enum: ['NEVER', 'SOMETIMES', 'OFTEN', 'EVERYTIME'],
  },
  habit_duration_walk: {
    type: String,
    enum: ['SHORT', 'MEDIUM', 'LONG'],
  },
  habit_quantity_food_respected: {
    type: Boolean,
  },
  alert_time_food: {
    type: Number, // heure.  00 means for midday AND supper
  },
  alert_time_treats: {
    type: Number, // heure.  00 means for midday AND supper
  },
  alert_time_walk: {
    type: Number, // heure
  }
})

//WARNING  HACK il faudrait vérifier que le sender est correctement auth par facebook.
// on peut faire un call /webhook avec des infos bidon et se faire passer un sender qu'on est pas.
const UserSchema = new mongoose.Schema({
  senderID: {
    type: String, // id facebook du sender
  },
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  locale: {
    type: String,
  },
  gender: {
    type: String,
  },
  question_species: {
    type: String,
  },
  weight: {
    type: Number
  },
  animals: {
    type: [AnimalSchema],
  },
  last_answer: { // id last answer returned to the user
    type: Answer.schema,
  },
})

UserSchema.statics.getUser = async function(senderID) {
  return await this.findOne({senderID: senderID})
}

UserSchema.statics.updateQuestionSpecies = async function(user, species) {
  await Users.update({_id: user._id}, {$set: {'question_species' : species}})
}

UserSchema.statics.setLastAnswer = async function(user, answer) {
  await Users.update({_id: user._id}, {$set: {'last_answer' : answer}})
}

UserSchema.statics.setIdWeighLossAnswerStep = async function(user, id_weigh_loss_answer_step) {
  await Users.update({_id: user._id}, {$set: {'animals.0.id_weigh_loss_answer_step' : id_weigh_loss_answer_step}})
}

UserSchema.statics.resetP2P = async function(user) {
  await Users.update({_id: user._id}, {$unset: {'animals.0.id_weigh_loss_answer_step' : '' }})
}

UserSchema.plugin(timestamps)
UserSchema.plugin(mongooseStringQuery)

const Users = mongoose.models.users || mongoose.model('users', UserSchema)
module.exports = Users
