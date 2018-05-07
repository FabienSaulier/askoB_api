import mongoose from 'mongoose'
import mongooseStringQuery from 'mongoose-string-query'
import timestamps from 'mongoose-timestamp'
import _ from 'lodash'
import * as ANSWERS_ID from '../lib/answersID'

export const MessageLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  receivedAt: {
    type: Date,
    required: true,
  },
  nlp: { // le bot: chien / chat / lapin or empty if first time user
    type: String,
  },
  input: {
    type: String,
    required: true,
  },
  inputType: {
    type: String,
    required: true,
  },
  answersName: {
    type: [String]
  },
  answers_id: {
    type: [mongoose.Schema.Types.ObjectId]
  }
})

MessageLogSchema.statics.createAndSave = async function(user, input, inputType, answers) {
  let msgLog = new MessageLog()
  msgLog.user_id = user._id
  msgLog.userName = user.first_name+' '+user.last_name
  msgLog.receivedAt = new Date()
  msgLog.nlp = user.question_species
  msgLog.input = input
  msgLog.inputType = inputType
  let answersName = []
  answers.forEach((answer) => {
    answersName.push(answer.name)
  })
  msgLog.answersName = answersName
  const admin = ['Fabien Saulier', 'Julien Devillers', 'Patricia Sanz', 'Marie-Anne Dunoyer', 'Melissa Pace', 'Elodie le Lan']
  if(!_.includes(admin, msgLog.userName))
    msgLog.save()
}


const MessageLog = mongoose.models.messageLogs || mongoose.model('messageLogs', MessageLogSchema)
module.exports = MessageLog
