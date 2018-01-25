import config from '../config/config'
import logger from '../lib/logger'
import * as Message from '../lib/message'
import FacebookMessageText from '../model/facebookMessageText'
import FacebookMessageGif from '../model/facebookMessageGif'

import * as FacebookApiWrapper from '../lib/facebookApiWrapper'
import Answers from '../model/answer'

/**
* Facebook entries point
* */

export default(server) => {
  /**
  * Method for api validation purpose
  * */
  server.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
      logger.info('Validating webhook')
      res.sendRaw(200, req.query['hub.challenge'])
    } else {
      logger.error('Failed webhook validation. Make sure the validation tokens match.')
      res.send(403)
    }
  })

  /**
  * Entry point of users messages
  * */
  server.post('/webhook', (req, res) => {
    const data = req.body

    // Make sure this is a page subscription
    if (data.object === 'page') {
      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach((entry) => {
        // condition pour prévenir un crash server. what's the point of theses messages?
        if (!entry.messaging) {
          return
        }

        // Iterate over each messaging event
        entry.messaging.forEach( async (event) => {
          if (event.message && event.message.text) { // check if it is an Actual message
            const senderID = event.sender.id
            FacebookApiWrapper.sendMarkSeen(senderID)
            await FacebookApiWrapper.sendTypingOn(senderID)
            await handleMessage(event.message, senderID)
            FacebookApiWrapper.sendTypingOff(senderID)
          } else {
            // logger.info("message unknown: ",event);
          }
        })

        // Assume all went well. Send 200, otherwise, the request will time out and will be resent
        res.send(200)
      })

    } else {
      logger.warn('received a non page data: ', data.object)
      logger.warn('data: ', data)
    }
  })
}

async function handleMessage(message, senderID) {
  const msgData = await Message.analyseMessage(message)
  let answer = {}

  if (msgData.payload) {
    const payload = JSON.parse(msgData.payload)
    if (payload.siblings) {
      answer = await Answers.findOneRandomByIntent('sibling')
      answer.children = payload.siblings
    } else {
      answer = await Message.getAnswerById(payload.id)
    }
  } else {
    const intent = msgData.intent()
    const entities = Message.getEntities(msgData)
    const entitiesValues = await Message.getEntitiesValues(msgData)
    const entitiesAndValues = entities.concat(entitiesValues)
    answer = await Message.findAnswer(intent, [entitiesAndValues])
  }

  incrementAnswerDisplayCount(answer._id)

  // send the answer
  const fbmText = new FacebookMessageText(answer, senderID)
  FacebookApiWrapper.postTofacebook(fbmText.getMessage())

  // if the answer has a gif: send the gif
  if (answer.gifId) {
    const fbmGif = new FacebookMessageGif(answer, senderID)
    FacebookApiWrapper.postTofacebook(fbmGif.getMessage())
  }
}


/**
 * incrementAnswerDisplayCount
 *
 * @param  {String} answerId answer to increment 
 */
function incrementAnswerDisplayCount(answerId){
  Answers.update({_id: answerId}, { $inc: { displayCount: 1} } )
  .then(
    (result) => {
      // ok
    },
    (error) => {
      logger.error(error)
    },
  )
}
