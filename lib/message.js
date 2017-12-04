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
    const query = Answers.findOne({'_id':quickReply.payload});

    query.then(
      function(answer){
        if(!answer){
          logger.error("ERROR : il n'existe pas de Answer pour la quick reply d'id:"+quickReply.payload);
          sendDefaultAnswer(senderID);
        } else{
          const fbmsg = new FacebookMessage(answer, senderID);
          postTofacebook(fbmsg.get());
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
          sendSpecificAnswer('prevention', entities, senderID);
        else if(intent)
          sendSpecificAnswer(intent.slug, entities, senderID);
        else
          sendDefaultAnswer(senderID);
      })

  }
}

function getEntities(result){
  let keys = Object.keys(result.entities)
  const valueToExclude = ['pronoun', 'person', 'number']
  keys = keys.filter(key => !valueToExclude.includes(key))
  keys = keys.map(key => key.toUpperCase())
  console.log(keys);
  return keys
}


export function sendSpecificAnswer(intent, entities, senderID){
  const query = Answers.findOne({'intent':intent, 'entities':entities});
  query.then(
    function(answer){
      if(!answer)
        sendDefaultAnswer(senderID);
      else{
        const fbmsg = new FacebookMessage(answer, senderID);
        postTofacebook(fbmsg.get());
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
}

function sendGreetingAnswer(senderID){
  let answer = {}
  answer.text = "Bonjour, \n Je suis KANZI et je veux t'aider à mieux comprendre ton LAPIN 🐰. Quel genre d'informations souhaites-tu ?"
  const fbMsg = new FacebookMessage(answer, senderID);
  postTofacebook(fbMsg.get());
}

 export function postTofacebook(messageData) {
   logger.info("postTofacebook ",messageData)
   httpRequest({
     uri: config.FB_MESSAGE_URL+config.ACCESS_TOKEN,
     method: 'POST',
     json: messageData
   }, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       logger.debug("postTofacebook -- envoie de la réponse: ", messageData);
     } else {
       console.log(body.error);
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
