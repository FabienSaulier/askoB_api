
import Answers from '../model/answer'
import config from '../config/config'
import logger from '../lib/logger'
import {receivedMessage} from '../lib/message'

/**
*
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
  * Entry point of the user messages
  **/
  server.post('/webhook', function (req, res) {
    var data = req.body;
    logger.info("post /webhook");

    // Make sure this is a page subscription
    if (data.object === 'page') {

      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {
        var pageID = entry.id;
        var timeOfEvent = entry.time;

        logger.info("foreach entry", entry);

        // condition pour prévenir un crash server. what's the point of theses messages?
        if(!entry.messaging){
          logger.warn("entry unknonw: ",entry);
          res.send(200);
        }

        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          logger.info("foreach event: ", event.message);
          if (event.message) {
            receivedMessage(event);
          } else {
            logger.info("message unknonw: ",event);
          }
        });

      });
      // Assume all went well. Send 200, otherwise, the request will time out and will be resent
      res.send(200);
    }
  });

};
