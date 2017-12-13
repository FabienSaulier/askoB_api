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
        const entities = getEntities(result);
        const entitiesValues = getEntitiesValues(result);

        if(intent && intent.slug == 'greetings')
          sendGreetingAnswer(senderID);
        else if(intent)
          sendSpecificAnswer(intent.slug, entities, entitiesValues, senderID);
        else
          sendDefaultAnswer(senderID);
      })

  }
}

function getEntitiesValues(result){
  let entitiesValues = [];
  let keys = Object.keys(result.entities)
  if(keys.includes('aliments-ko')){
    const values = result.entities['aliments-ko']
    entitiesValues.push(values[0].value)
  }
  if(keys.includes('fruits')){
    const values = result.entities['fruits']
    entitiesValues.push(values[0].value)
  }
  return entitiesValues
}

function getEntities(result){
  let keys = Object.keys(result.entities)
  const valueToExclude = ['pronoun', 'person', 'number']
  keys = keys.filter(key => !valueToExclude.includes(key))
  keys = keys.map(key => key.toUpperCase())
  return keys
}

export function sendSpecificAnswer(intent, entities, entitiesValues, senderID){
  logger.info("search on ",entities)
  if(entitiesValues){
    logger.info("and values:",entitiesValues)
  }

  const query = Answers.find({'entities': {$all:entities}});
  query.then(
    function(answers){
      if(!answers)
        sendDefaultAnswer(senderID);
        //TODO
        // cas où il y a un couple d'ENTITIES qui n'est pas présent en base ? :o

      else if(answers.length == 1){
        const fbmsg = new FacebookMessage(answers[0], senderID);
        postTofacebook(fbmsg.get());
      }
      else{

        if(entitiesValues.length > 0){
          const aFiltered = answers.filter(
            a => a.entValues.includes(entitiesValues[0])
          )

          if(aFiltered.length == 1){
            const fbmsg = new FacebookMessage(aFiltered[0], senderID);
            postTofacebook(fbmsg.get());
          }

          if(aFiltered.length > 1){
            logger.error("not a Unique Answer _ entvalue is shared: ",aFiltered)
            sendDefaultAnswer(senderID);
          }

          if(aFiltered.length == 0){
            const answer = answers.filter(
              // take the answer who doesn't have entValues
              a => a.entValues.length == 0
            )
            const fbmsg = new FacebookMessage(answer[0], senderID);
            postTofacebook(fbmsg.get());
          }

        } else{
          // cas où on veut la réponse parent et ignorer les autres
          // ex: Alimentation et pas ALimentation - Fruit

          //TODO a reproduire dans les entvalues.
          logger.info("the test");
          logger.info(answers[answers.length-1].entities == entities)
          logger.info(answers[answers.length-1].entities)
          logger.info(entities)



          const answer = answers.filter(
            a => isArrayEqual(a.entities, entities)
          )
          const fbmsg = new FacebookMessage(answer[0], senderID);
          postTofacebook(fbmsg.get());

        }
      }
    },
    function(error){
      logger.error(error);
    })
    .catch((e)=>{logger.warn(e)})
}


function isArrayEqual(array1, array2){
  const res = (array1.length == array2.length) && array1.every(function(element, index) {
      return element === array2[index];
  });
  return res
}

export function sendDefaultAnswer(senderID){
  let answer = {}
  answer.text = "Désolé, je ne sais pas encore répondre à cette question! 🐰"
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
   httpRequest({
     uri: config.FB_MESSAGE_URL+config.ACCESS_TOKEN,
     method: 'POST',
     json: messageData
   }, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       logger.debug("postTofacebook -- envoie de la réponse: ", messageData);
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
