import log4js from 'log4js'
import config from '../config/config'

const logger = log4js.getLogger()
logger.level = config.LOG_LEVEL

module.exports = logger
