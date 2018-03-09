import httpRequest from 'request'
import requestP from 'request-promise'
import config from '../config/config'
import logger from '../lib/logger'

export function postTofacebook(messageData) {
  httpRequest({
    uri: config.FB_MESSAGE_URL + config.ACCESS_TOKEN,
    method: 'POST',
    json: messageData,
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      logger.debug('posted to Facebook')
    } else {
      logger.error('Unable to send message: ', body.error)
    }
  })
}

export function sendTypingOn(recipientId) {
  const data = {
    recipient: {
      id: recipientId,
    },
    sender_action: 'typing_on',
  }
  httpRequest({
    uri: config.FB_MESSAGE_URL + config.ACCESS_TOKEN,
    method: 'POST',
    json: data,
  }, (error, response) => {
    if (!error && response.statusCode === 200) {
      logger.debug('sent typing_on')
    } else {
      logger.error('Unable to send message: %s : %s ', response.body.error.type, response.body.error.message)
    }
  })
}

export function sendTypingOff(recipientId) {
  const data = {
    recipient: {
      id: recipientId,
    },
    sender_action: 'typing_off',
  }
  httpRequest({
    uri: config.FB_MESSAGE_URL + config.ACCESS_TOKEN,
    method: 'POST',
    json: data,
  }, (error, response) => {
    if (!error && response.statusCode === 200) {
      logger.debug('sent typing_off')
    } else {
      logger.error('Unable to send message: %s : %s ', response.body.error.type, response.body.error.message)
    }
  })
}

export function sendMarkSeen(recipientId) {
  const data = {
    recipient: {
      id: recipientId,
    },
    sender_action: 'mark_seen',
  }
  httpRequest({
    uri: config.FB_MESSAGE_URL + config.ACCESS_TOKEN,
    method: 'POST',
    json: data,
  }, (error, response) => {
    if (!error && response.statusCode === 200) {
      logger.debug('sent mark_seen')
    } else {
      logger.error('Unable to send message: %s : %s ', response.body.error.type, response.body.error.message)
    }
  })
}

export async function getUserInfo(psid){
  const options = {
    uri: config.FB_BASE_URL + psid + '?fields=first_name,last_name,profile_pic&access_token=' + config.ACCESS_TOKEN,
    method: 'GET',
    json: {},
  }
  return requestP(options)
}
