import Answers from '../model/answer'
import config from '../config/config'
import logger from '../lib/logger'
import * as Message from '../lib/message'
import FacebookMessage from '../model/facebookMessage'

/**
* Facebook entries point
**/

export default(server) => {

  /**
  * Method for api validation purpose
  **/
  server.get('/webhook', function(req, res, next) {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
      logger.info("Validating webhook");
      res.sendRaw(200, req.query['hub.challenge']);
    } else {
      logger.error("Failed webhook validation. Make sure the validation tokens match.");
      res.send(403);
    }
  });

  /**
  * Entry point of users messages
  **/
  server.post('/webhook', function (req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page') {

      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {

        // condition pour prévenir un crash server. what's the point of theses messages?
        if(!entry.messaging){
          return;
        }

        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          if(event.message) {

            const senderID = event.sender.id;
            Message.sendTypingOn(senderID)
            handleMessage(event.message, senderID)

          } else {
            // logger.info("message unknown: ",event);
          }
        });

      });
      // Assume all went well. Send 200, otherwise, the request will time out and will be resent
      res.send(200);
    } else{
      logger.warn("received a non page data: ", data.object);
      logger.warn("data: ", data);

    }
  });

};

async function handleMessage(message, senderID) {

    const msgData = await Message.analyseMessage(message)

    if(msgData.payload){
      const answer = await Message.getAnswerById(msgData.payload)
      const fbMsg = new FacebookMessage(answer, senderID);
      Message.postTofacebook(fbMsg.get());
    } else{
      const intent = msgData.intent()
      const entities = Message.getEntities(msgData);
      const entitiesValues = await Message.getEntitiesValues(msgData)
      const entitiesAndValues = entities.concat(entitiesValues)

      logger.info(entitiesAndValues)

      // response can be an answer or quick replies
      const response = await Message.findAnswer(intent, [entitiesAndValues])

      const fbMsg = new FacebookMessage(response, senderID);
      Message.postTofacebook(fbMsg.get());


    }
}
