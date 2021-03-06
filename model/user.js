import mongoose from 'mongoose'
import mongooseStringQuery from 'mongoose-string-query'
import timestamps from 'mongoose-timestamp'
import uniqueValidator from 'mongoose-unique-validator'
import _ from 'lodash'

const AnimalSchema = new mongoose.Schema({
  species: {
    type: String,
    required: true,
  },
})

//WARNING  HACK il faudrait vérifier que le sender est correctement auth par facebook.
// on peut faire un call /webhook avec des infos bidon et se faire passer un sender qu'on est pas.
const UserSchema = new mongoose.Schema({
  senderID: {
    type: String, // id facebook du sender
  },
  animals: {
    type: [AnimalSchema],
  },

})

UserSchema.plugin(timestamps)
UserSchema.plugin(mongooseStringQuery)
UserSchema.plugin(uniqueValidator) // for name but buggy when update

const Users = mongoose.models.users || mongoose.model('users', UserSchema)
module.exports = Users
