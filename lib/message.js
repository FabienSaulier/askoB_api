import httpRequest from 'request'
import Answers from '../model/answer'
import config from '../config/config'
import recastai from 'recastai'
import logger from '../lib/logger'
import FacebookMessage from '../model/facebookMessage'
import Entities from '../model/entity'

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

    let recast = clientRecast.request;

    recast.analyseText(messageText)
      .then(function(result) {
        const intent = result.intent()
        const entities = getEntities(result);
        //const entitiesValues =

        getEntitiesValues(result)
        .then((entitiesValues) => {

          if(intent && intent.slug == 'greetings')
            sendGreetingAnswer(senderID);
          else if(intent)
            sendSpecificAnswer(entities, entitiesValues, senderID);
          else
            sendDefaultAnswer(senderID);

        })

      })

  }
}

function getAnswerWhichMatchEntitiesValues(answers, entitiesValues){
  return answers.find((a) => areArrayEqual(a.entValues, entitiesValues))
}

export function sendSpecificAnswer(entities, entitiesValues, senderID){
  logger.info("search on ",entities)
  if(entitiesValues){
    logger.info("with values:",entitiesValues)
  }

  const query = Answers.find({ entities: { $size : entities.length, $all:entities}})
  query.then(
    function(answers){
      // if there is no answers matching
      if(!answers){
        logger.warning("no anwser found for ",entities)
        sendDefaultAnswer(senderID);
      }

      const constPerfectAnswer = getAnswerWhichMatchEntitiesValues(answers, entitiesValues)
      if(constPerfectAnswer){
        logger.info("It's a Perfect Match!");
        const fbmsg = new FacebookMessage(constPerfectAnswer, senderID);
        postTofacebook(fbmsg.get());
      }
      else{
        const entitiesValues = []
        const generalAnswer = getAnswerWhichMatchEntitiesValues(answers, entitiesValues)
        if(generalAnswer){
          logger.info("Got generic answer with NO entities values");
          const fbmsg = new FacebookMessage(generalAnswer, senderID);
          postTofacebook(fbmsg.get());
        } else{
          logger.error("NO Generic Answer (without values) for ", entities)
          sendDefaultAnswer(senderID);
        }
      }

    },
    function(error){
      logger.error(error);
    })
    .catch((e)=>{logger.warn(e)})
}


function getEntities(result){
  let keys = Object.keys(result.entities)
  const valueToExclude = ['pronoun', 'person', 'number']
  keys = keys.filter(key => !valueToExclude.includes(key))
  keys = keys.map(key => key.toUpperCase())
  return keys
}

async function getEntitiesValues(result){
  let entitiesValues = [];
  let res = await Entities.find({areValuesPertinent:true}, {slug:true, _id:false})
  let entValToConsider = []
  res.forEach((r)  => entValToConsider.push(r.slug))
  const keys = Object.keys(result.entities)
  keys.forEach((key) => {
      if(entValToConsider.includes(key)){
        const values = result.entities[key]
        entitiesValues.push(values[0].value)
      }
  })
  return entitiesValues
}


function areArrayEqual(array1, array2){
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
