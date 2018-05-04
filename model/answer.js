import mongoose from 'mongoose'
import mongooseStringQuery from 'mongoose-string-query'
import timestamps from 'mongoose-timestamp'
import uniqueValidator from 'mongoose-unique-validator'
import _ from 'lodash'
import * as ANSWERS_ID from '../lib/answersID'


const SubAnswerSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  label: { // le label affiché en cas de quick_reply
    type: String,
    required: true,
  },
  payload_data: { // extra data add to payload for Quick Replies
    key: {
      type: String,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    }
  }
})

export const AnswerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Un name est nécessaire'],
  },
  description: { // description utilise en interne
    type: String,
  },
  quickReplyLabel: { // TODO a del a l'avenir
    type: String,
    required: [true, 'Un quick reply label est nécessaire'],
  },
  quickReplyLabel_fr: {
    type: String,
    required: [true, 'Un quick reply label est nécessaire'],
    maxlength: [20, 'quickReplyLabel_fr > à 20 caractères'],
  },
  quickReplyLabel_gb: {
    type: String,
    maxlength: [20, 'quickReplyLabel_gb > à 20 caractères'],
  },
  quickReplyLabel_es: {
    type: String,
    maxlength: [20, 'quickReplyLabel_es > à 20 caractères'],
  },
  quickReplyLabel_nl: {
    type: String,
    maxlength: [20, 'quickReplyLabel_nl > à 20 caractères'],
  },
  precise: {
    type: Boolean,
    default: false,
  },
  displayVetButton: {
    type: Boolean,
    default: false,
  },
  // counter, how many time the Quick Reply of this answer was displayed
  displayButtonCount: {
    type: Number,
    default: 0,
  },
  // counter, how many time the
  displayCount: {
    type: Number,
    default: 0,
  },
  species: {
    type: String,
    required: [true, 'Une species est nécessaire'],
  },
  intent: {
    type: String,
  },
  entities: {
    type: [String],
  },
  entValues: {
    type: [String],
  },
  text: { // TODO a del a l'avenir
    type: String,
    required: [true, 'Le texte de la réponse ne doit pas être vide'],
  },
  text_fr: {
    type: String,
    required: [true, 'Le texte de la réponse ne doit pas être vide'],
  },
  text_gb: {
    type: String,
  },
  text_es: {
    type: String,
  },
  text_nl: {
    type: String,
  },
  gifId: {
    type: String,
  },
  expectedBehaviour: {
    type: String,
  },
  nextAnswer: { // id, only in case of expexted Behaviour
    type: String
  },
  children: {
    type: [SubAnswerSchema],
  },
  siblings: {
    type: [SubAnswerSchema],
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
})

AnswerSchema.statics.findOneRandomByIntent = async function findOneRandomByIntent(intent) {
  const result = await this.find({ intent })
  const randomIndex = _.random(0, result.length - 1)
  return result[randomIndex]
}

AnswerSchema.statics.findChooseSpeciesAnswer = async function getStartedAnswer() {
  return [await this.findOne({_id: ANSWERS_ID.ANSWER_GET_STARTED_ID})]
}

AnswerSchema.statics.findMenuSpecies = async function getStartedAnswer(species) {
  if(species === 'chien')
    return this.findOne({_id: ANSWERS_ID.ANSWER_MENU_DOG_ID})
  if(species === 'chat')
    return this.findOne({_id: ANSWERS_ID.ANSWER_MENU_CAT_ID})
  if(species === 'lapin')
    return this.findOne({_id: ANSWERS_ID.ANSWER_MENU_RABBIT_ID})
}

AnswerSchema.statics.incrementAnswerDisplayCount = function incrementAnswerDisplayCount(answerId) {
  this.update({_id: answerId}, { $inc: { displayCount: 1} } ).exec()
}

AnswerSchema.statics.dontUseNLP = {
  text :  "Oups, utilise les boutons s'il te plaît.\n"+
          "Si tu veux poser une question concernant ton animal, utilise le menu :)"
}

AnswerSchema.plugin(timestamps)
AnswerSchema.plugin(mongooseStringQuery)

const Answers = mongoose.models.answers || mongoose.model('answers', AnswerSchema)
module.exports = Answers
