import mongoose from 'mongoose'

const LabelSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: [true, 'le label doit être unique'],
    dropDups: [true, 'le label doit être unique'],
    required: [true, 'Un nom est nécessaire'],
  },
})

const labels = mongoose.models.labels || mongoose.model('labels', LabelSchema)
module.exports = labels
