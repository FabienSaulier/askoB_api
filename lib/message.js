import httpRequest from 'request'
import Answers from '../model/answer'
import config from '../config/config'
import recastai from 'recastai' ;
import logger from '../lib/logger'

let clientRecast = new recastai(config.RECAST_DEV_ACCESS_TOKEN);

export function receivedMessage(event) {
  const senderID = event.sender.id;
  sendTypingOn(senderID);
  const recipientID = event.recipient.id;
  const timeOfMessage = event.timestamp;
  const message = event.message;
  logger.debug("receivedMessage :",JSON.stringify(message));
  const messageId = message.mid;
  const messageText = message.text;
  const messageAttachments = message.attachments;

  if(message.quick_reply){
    logger.debug("quik reply: %s", payload);
    const payload = message.quick_reply.payload;
    const query = Answers.findOne({'code':payload});

    query.then(
      function(answer){
        if(!answer){
            sendDefaultAnswer(senderID);
        } else{
          sendAnswer(senderID, answer);
        }
    },
      function(error){
        logger.error("ERROR :",error);
    });

  } else if (messageText) {
    logger.debug("call recast");

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

  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function getMajorEntity(entities){
  logger.info("coucou getMajorEntity");
}

// get entities
// get the entity with the most confidence
// find an answer with the exact code


export function sendAnswer(recipientId, answer) {

  let quick_replies = [];

  // TODO quick fix cause we change bdd: sons: [{code,name},..] => sonsCode: [code]
  if(answer.sons){
    answer.sons.forEach(function(son){
      quick_replies.push({
        "content_type":"text",
        "title": son.name,
        "payload": son.code
      })
    })
  } else{
    answer.sonsCode.forEach(function(sonCode){
      quick_replies.push({
        "content_type":"text",
        "title": sonCode,
        "payload": sonCode
      })
    })
  }
  // END TODO Quickfix

  if(quick_replies.length === 0){
    quick_replies.push({
      "content_type":"text",
      "title": '🏠',
      "payload": 'INDEX'
    })
  }

  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: answer.text,
      quick_replies:quick_replies
    }
  };

  callSendAPI(messageData);
}


export function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
    }
  };
  callSendAPI(messageData);
}


 export function callSendAPI(messageData) {
  httpRequest({
    uri: config.FB_MESSAGE_URL+config.ACCESS_TOKEN,
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    //error correspond ici à des erreurs servers ?
    logger.error(body.error);
    if (!error && response.statusCode == 200) {
      logger.debug("callSendAPI -- envoie d'une réponse au Messenger du sender: %s", messageData);

      //var recipientId = body.recipient_id;
      //var messageId = body.message_id;
      //console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
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
      //var recipientId = body.recipient_id;
      //var messageId = body.message_id;
      //console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
    } else {
      logger.error("Unable to send message: %s", response.body.error);
    }
  });
}


//TODO factoriser, au retour de la promise de find, envoyer la réponse.
//  findAnswer(code);

export function sendSpecificAnswer(code, senderID){

  logger.debug("searching for sendSpecificAnswer ",code);

  const query = Answers.findOne({'code':code});

  query.then(
    function(answer){
      logger.debug("answer after findOne query", answer);
      if(!answer)
        sendDefaultAnswer(senderID);
      else
        sendAnswer(senderID, answer);
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
      sendAnswer(senderID, defaultAnswer);
    },
    function(error){
      logger.error(error);
    });
}
