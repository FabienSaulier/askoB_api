import mongoose from 'mongoose'
import mongooseStringQuery from 'mongoose-string-query'
import timestamps from 'mongoose-timestamp'
import uniqueValidator from 'mongoose-unique-validator'
import Answer from './answer'
import _ from 'lodash'
import logger from '../lib/logger'
import * as FacebookApiWrapper from '../lib/facebookApiWrapper'
import * as ANSWERS_ID from '../lib/answersID'

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
  timezone: {
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
  last_ad_referral: { // cf Facebook User Profile API
    source: {
      type: String,
    },
    type: {
      type: String,
    },
    ad_id: {
      type: String
    },
  },
})

UserSchema.statics.getUser = async function(senderID) {
  return await this.findOne({senderID: senderID})
}

UserSchema.statics.setLastAnswer = async function(user, answer) {
  return Users.findByIdAndUpdate({_id: user._id}, {$set: {'last_answer' : answer}}).exec()
}

UserSchema.statics.setIdWeighLossAnswerStep = async function(user, id_weigh_loss_answer_step) {
  await Users.update({_id: user._id}, {$set: {'animals.0.id_weigh_loss_answer_step' : id_weigh_loss_answer_step}})
}

UserSchema.statics.resetP2P = async function(user) {
  await Users.update({_id: user._id}, {$unset: {'animals.0.id_weigh_loss_answer_step' : '' }})
}

UserSchema.statics.getUserInfos = async function(senderID){
  let user = await Users.getUser(senderID)
  if(!user){
    user = await FacebookApiWrapper.getUserInfos(senderID)
    console.log("user info ",user)
    user.senderID = senderID
    user = await Users.create(user)
  }
  return user
}

/**
 * updateUserQuestionSpecies - description
 * @param  {answerID} answerID
 * @param  {type} user
 */
UserSchema.statics.updateUserQuestionSpecies  = async function(answerID, user){
  switch (answerID) {
    case ANSWERS_ID.ANSWER_MENU_RABBIT_ID:
      return Users.updateQuestionSpecies(user, 'lapin')
      break
    case ANSWERS_ID.ANSWER_MENU_DOG_ID:
      return Users.updateQuestionSpecies(user, 'chien')
      break
    case ANSWERS_ID.ANSWER_MENU_CAT_ID:
      return Users.updateQuestionSpecies(user, 'chat')
      break
      case ANSWERS_ID.ANSWER_MENU_P2P_ID:
      return Users.updateQuestionSpecies(user, 'autres')
      break
    default:
  }
}

/**
 * UserSchema - description
 * update and return user
 */
UserSchema.statics.updateQuestionSpecies = async function(user, species) {
  return Users.findByIdAndUpdate({_id: user._id}, {$set: {'question_species' : species}}).exec()
}

UserSchema.plugin(timestamps)
UserSchema.plugin(mongooseStringQuery)

const Users = mongoose.models.users || mongoose.model('users', UserSchema)
module.exports = Users
