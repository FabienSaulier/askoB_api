import mongoose from 'mongoose'

import logger from '../lib/logger'

mongoose.Promise = global.Promise

mongoose.connect(`mongodb://${process.env.mongodbuser}:${process.env.mongodbpassword}@${process.env.mongodburl}`, { useMongoClient: true })
const db = mongoose.connection
db.on('error', (error) => {
  logger.error('Connection error: %s', error)
})
db.once('open', () => {
  logger.info('connected to db')
})
