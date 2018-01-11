import mongoose from 'mongoose'

const TestSchema = new mongoose.Schema({
  userInput: {
    type: String,
    required: [true, 'Un user input est nécessaire'],
  },
  tags: { // entivies, ent values
    type: [String],
  },
  answers_id: {
    type: [String],
  },
})

const Tests = mongoose.models.tests || mongoose.model('tests', TestSchema)
module.exports = Tests
