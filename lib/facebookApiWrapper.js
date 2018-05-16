import httpRequest from 'request'
import requestP from 'request-promise'
import config from '../config/config'
import logger from '../lib/logger'

const dashbot = require('dashbot')('1NjhQt4ue106pAEHWByzoXHvCy84OVIcaRUVG26s').facebook

export function postTofacebook(messageData) {
  const requestData = {
    uri: config.FB_MESSAGE_URL + config.ACCESS_TOKEN,
    qs: { 'access_token': config.ACCESS_TOKEN },
    method: 'POST',
    json: messageData,
  }
  httpRequest(requestData, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      logger.debug('posted to Facebook')
      dashbot.logOutgoing(requestData, body)
    } else {
      logger.error('Unable to send message: ', body.error)
      logger.error('message data: ',messageData)
      logger.error('message: ',messageData.message)
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
  const options = {
    uri: config.FB_MESSAGE_URL + config.ACCESS_TOKEN,
    method: 'POST',
    json: data,
  }
  return requestP(options)
}

export function sendTypingOff(recipientId) {
  const data = {
    recipient: {
      id: recipientId,
    },
    sender_action: 'typing_off',
  }
  const options = {
    uri: config.FB_MESSAGE_URL + config.ACCESS_TOKEN,
    method: 'POST',
    json: data,
  }
  return requestP(options)
}

export function sendMarkSeen(recipientId) {
  const data = {
    recipient: {
      id: recipientId,
    },
    sender_action: 'mark_seen',
  }
  const options = {
    uri: config.FB_MESSAGE_URL + config.ACCESS_TOKEN,
    method: 'POST',
    json: data,
  }
  return requestP(options)
}

export async function getUserInfos(psid){
  const options = {
    uri: config.FB_BASE_URL + psid + '?fields=first_name,last_name,profile_pic,locale,timezone,gender,last_ad_referral&access_token=' + config.ACCESS_TOKEN,
    method: 'GET',
    json: {},
  }
  return requestP(options)
}
