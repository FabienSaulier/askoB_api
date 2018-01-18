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
        entry.messaging.forEach((event) => {
          if (event.message && event.message.text) { // check if it is an Actual message
            const senderID = event.sender.id
            FacebookApiWrapper.sendTypingOn(senderID)
            handleMessage(event.message, senderID)
          } else {
            // logger.info("message unknown: ",event);
          }
        })
      })
      // Assume all went well. Send 200, otherwise, the request will time out and will be resent
      res.send(200)
    } else {
      logger.warn('received a non page data: ', data.object)
      logger.warn('data: ', data)
    }
  })
}

async function handleMessage(message, senderID) {

//    await Users.update({senderID : senderID}, { $set: { "details.make": "zzz"}  } )
  const ID_ANSWER_LAPIN = '5a608d838e9bc239cc09bcb5'
  const ID_ANSWER_CHIEN = '5a608db68e9bc239cc09bcb6'

  if(message.quick_reply){
    const payload = JSON.parse(message.quick_reply.payload)
    if(payload.id === ID_ANSWER_LAPIN){
      console.log("add lapin")

      await Users.update({senderID : senderID}, { $set: { 'animals.0.species' : "lapin"}  } )
    }
    if(payload.id === ID_ANSWER_CHIEN){
      await Users.update({senderID : senderID}, { $set: { 'animals.0.species' : "chien"}  } )
    }
  }


  const user = await Users.findOne({senderID : senderID})
  const ANSWER_QUEL_ANIMAL_AS_TU = '5a608de58e9bc239cc09bcb7'
  console.log(user)
  if(!user){
    await Users.create({senderID : senderID})
    const answer = await Answers.findOne({_id:ANSWER_QUEL_ANIMAL_AS_TU})
    console.log(answer)
    sendAnswer(answer, senderID)
    return;
  }

  const species = user.animals[0].species
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
    answer = await Message.findAnswer(species, intent, [entitiesAndValues])
  }

  sendAnswer(answer, senderID)
  return;
}

function sendAnswer(answer, senderID){
  const fbMsg = new FacebookMessage(answer, senderID)
  FacebookApiWrapper.postTofacebook(fbMsg.get())
  if (answer.gifId) {
    const fbMsgGif = new FacebookMessageGif(answer, senderID)
    FacebookApiWrapper.postTofacebook(fbMsgGif.get())
  }
}
