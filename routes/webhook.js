
import Answers from '../model/answer'
import config from '../config/config'

import {receivedMessage} from '../lib/message'


export default(server) => {

  server.get('/webhook', function(req, res, next) {

    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
      console.log("Validating webhook");
      res.sendRaw(200, req.query['hub.challenge']);
    } else {
      console.error("Failed webhook validation. Make sure the validation tokens match.");
      res.send(403);
    }
  });


  server.post('/webhook', function (req, res) {
    var data = req.body;
    console.log("post /webhook");

    // Make sure this is a page subscription
    if (data.object === 'page') {

      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {
        var pageID = entry.id;
        var timeOfEvent = entry.time;

        console.log("foreach entry", entry);

        // condition pour prévenir un crash server. what's the point of theses messages?
        if(!entry.messaging){
          console.log("entry unknonw: ",entry);
          res.send(200);
        }

        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          console.log("foreach event: ", event.message);
          if (event.message) {
            receivedMessage(event);
          } else {
            console.log("message unknonw: ",event);
          }
        });

      });

      // Assume all went well. Send 200, otherwise, the request will time out and will be resent
      res.send(200);
    }
  });

};
