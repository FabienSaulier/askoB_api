import httpRequest from 'request'
import Answers from '../model/answer'
import config from '../config/config'
import recastai from 'recastai'
import logger from '../lib/logger'
import FacebookMessage from '../model/facebookMessage'

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
      .then(function(result) {
        const intent = result.intent()
        logger.debug("intent : ",intent);
        const entities = getEntities(result);
        logger.debug("entities : ",entities);


        if(intent && intent.slug == 'greetings')
          sendGreetingAnswer(senderID);
        else if(intent && intent.slug == 'prevention-soins-hygiene')
          sendSpecificAnswer('PREVENTION', senderID);
        else if(intent)
          sendSpecificAnswer(intent.slug.toUpperCase(), senderID);
        else
          sendDefaultAnswer(senderID);
      })

  }
}

function getEntities(result){
  const keys = Object.keys(result.entities)
  return keys
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
    })
    .catch((e)=>{logger.warn(e)})
}


export function sendDefaultAnswer(senderID){
  let answer = {}
  answer.text = "réponse par défaut"
  const fbMsg = new FacebookMessage(answer, senderID);
  postTofacebook(fbMsg.get());

/*
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
    **/
}

function sendGreetingAnswer(senderID){
  let answer = {}
  answer.text = "Bonjour, \n Je suis KANZI et je veux t'aider à mieux comprendre ton LAPIN 🐰. Quel genre d'informations souhaites-tu ?"
  const fbMsg = new FacebookMessage(answer, senderID);
  postTofacebook(fbMsg.get());
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
    if (!error && response.statusCode == 200) {
      logger.debug("postTofacebook -- envoie de la réponse: ", messageData);
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
     logger.error("Unable to send message: %s : %s ",response.body.error.type, response.body.error.message);
   }
 });
}
