import httpRequest from 'request'
import config from '../config/config'
import logger from '../lib/logger'

 export function postTofacebook(messageData) {
   httpRequest({
     uri: config.FB_MESSAGE_URL+config.ACCESS_TOKEN,
     method: 'POST',
     json: messageData
   }, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       logger.debug("posted to Facebook",);
     } else {
       logger.error("Unable to send message: ", body.error);
     }
   });
}

export function sendTypingOn(recipientId) {
 logger.debug("send typing_on");
 var data = {
   recipient: {
     id: recipientId
   },
   sender_action:"typing_on"
 };
 httpRequest({
   uri: config.FB_MESSAGE_URL+config.ACCESS_TOKEN,
   method: 'POST',
   json: data
 }, function (error, response, body) {
   if (!error && response.statusCode == 200) {
     // ok
   } else {
     logger.error("Unable to send message: %s : %s ",response.body.error.type, response.body.error.message);
   }
 });
}
