import httpRequest from 'request'
import Answers from '../model/answer'
import config from '../config/config'
import recastai from 'recastai' ;
import logger from '../lib/logger'

let clientRecast = new recastai(config.RECAST_DEV_ACCESS_TOKEN);

export function receivedMessage(event) {
  const senderID = event.sender.id;
  const message = event.message;
  const messageId = message.mid;
  const messageText = message.text;
  const quickReply = message.quick_reply;

  logger.debug("receivedMessage :",JSON.stringify(message));
  sendTypingOn(senderID);

  if(quickReply){
    logger.debug("quik reply: ", quickReply.payload);
    const query = Answers.findOne({'code':quickReply.payload});

    query.then(
      function(answer){
        if(!answer){
          sendDefaultAnswer(senderID);
        } else{
          const msg = construcMessage(senderID, answer);
          postTofacebook(msg);
        }
    },
      function(error){
        logger.error("ERROR :",error);
    });

  } else if (messageText) {
    let requesRecast = clientRecast.request;
    requesRecast.analyseText(messageText)
      .then(function(res) {
        var intent = res.intent()
        logger.debug("INTENT : ",intent);
        logger.debug("res.intent()", res.entities);
        getMajorEntity();

        if(intent && intent.slug == 'greetings')
          sendSpecificAnswer('INDEX', senderID);
        if(intent && intent.slug == 'prevention-soins-hygiene')
          sendSpecificAnswer('PREVENTION', senderID);
        else if(intent)
          sendSpecificAnswer(intent.slug.toUpperCase(), senderID);
        else
          sendDefaultAnswer(senderID);
      })

  }
}

function getMajorEntity(entities){
  logger.info("getMajorEntity");
  // get entities
  // get the entity with the most confidence
  // find an answer with the exact code
}


export function sendSpecificAnswer(code, senderID){
  const query = Answers.findOne({'code':code});
  query.then(
    function(answer){
      if(!answer)
        sendDefaultAnswer(senderID);
      else{
        const msg = construcMessage(senderID, answer);
        postTofacebook(msg);
      }
    },
    function(error){
      logger.error(error);
    });
}


export function sendDefaultAnswer(senderID){
  const code = 'LOST';
  const query = Answers.findOne({'code':code});

  query.then(
    function(defaultAnswer){
      const msg = construcMessage(senderID, answer);
      postTofacebook(msg);
    },
    function(error){
      logger.error(error);
    });
}


export function construcMessage(recipientId, answer) {

  // construction des quickReplies
  let quick_replies = [];
  answer.sons.forEach(function(son){
    quick_replies.push({
      "content_type":"text",
      "title": son.name,
      "payload": son.code
    })
  })

  if(quick_replies.length === 0){
    quick_replies.push({
      "content_type":"text",
      "title": '🏠',
      "payload": 'INDEX'
    })
  }

  // constructin du message
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: answer.text,
      quick_replies:quick_replies
    }
  };
  return messageData;
}

 export function postTofacebook(messageData) {
  httpRequest({
    uri: config.FB_MESSAGE_URL+config.ACCESS_TOKEN,
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    //error correspond ici à des erreurs servers
    logger.error(body.error);
    if (!error && response.statusCode == 200) {
      logger.debug("postTofacebook -- envoie de la réponse: %s", messageData);
    } else {
      logger.error("Unable to send message: %s", body.error);
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
     logger.error("Unable to send message: %s", response.body.error);
   }
 });
}
