import config from '../config/config'
import logger from '../lib/logger'
import * as Message from '../lib/message'
import FacebookMessage from '../model/facebookMessage'
import FacebookMessageGif from '../model/facebookMessageGif'

import * as FacebookApiWrapper from '../lib/facebookApiWrapper'
import Answers from '../model/answer'
import Users from '../model/user'

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
        //    FacebookApiWrapper.sendMarkSeen(senderID)
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
  /*
    updateUserAnimal(message, senderID)
    if(! await doesUserExist(senderID)){
      await Users.create({senderID : senderID}) // await pas nécessaire
      const ANSWER_QUEL_ANIMAL_AS_TU = '5a608de58e9bc239cc09bcb7'
      const answer = await Answers.findOne({_id:ANSWER_QUEL_ANIMAL_AS_TU})
      sendAnswer(answer, senderID)
      return;
    }
    */


  const species = 'lapin' // user.animals[0].species
  const msgData = await Message.analyseMessage(message, species)
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
    const answers = await Message.findAnswer(species, intent, [entitiesAndValues])

    if(answers.length && answers.length > 1)
      answer = await buildAnswerWithQuickReplies(answers)
    else
      answer = answers
  }

  incrementAnswerDisplayCount(answer._id)

  sendAnswer(answer, senderID)
  return
}

function sendAnswer(answer, senderID){
  const fbMsg = new FacebookMessage(answer, senderID)
  FacebookApiWrapper.postTofacebook(fbMsg.getMessage())
  if (answer.gifId) {
    const fbMsgGif = new FacebookMessageGif(answer, senderID)
    FacebookApiWrapper.postTofacebook(fbMsgGif.getMessage())
  }
}


/**
TODO a del ??????
 * buildAnswerWithQuickReplies - build a multiplematch answer with quick replies
 *
 * @param  {} answers a list of answers
 * @return {}         an answer with quickreplies
 */
async function buildAnswerWithQuickReplies(answers) {
  const qrAnswer = await Answers.findOneRandomByIntent('multipleMatch')
  const answerWithQR = {
    text: qrAnswer.text,
    children: [],
  }
  answers.forEach((answer) => {
    answerWithQR.children.push({
      label: answer.quickReplyLabel ? answer.quickReplyLabel : answer.name,
      _id: answer._id,
    })
  })
  return answerWithQR
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
