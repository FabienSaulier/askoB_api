
import httpRequest from 'request'
import Answers from '../model/answer'

import config from '../config/config'

if(config.ENV = 'development'){
  require('dotenv').config()
}


import recastai from 'recastai' ;
let clientRecast = new recastai(process.env.RECAST_DEV_ACCESS_TOKEN);

export function receivedMessage(event) {
  const senderID = event.sender.id;
  sendTypingOn(senderID);
  const recipientID = event.recipient.id;
  const timeOfMessage = event.timestamp;
  const message = event.message;
  console.log("receivedMessage ::",JSON.stringify(message));
  const messageId = message.mid;
  const messageText = message.text;
  const messageAttachments = message.attachments;

  if(message.quick_reply){
    console.log("DANS LE IF QUICK REPLY");
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
        console.log("ERROR :",error);
    });

  } else if (messageText) {
    console.log("call recast");

    let requesRecast = clientRecast.request;
    requesRecast.analyseText(messageText)
      .then(function(res) {
        var intent = res.intent()
        console.log("INTENT : ",intent);

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


export function sendAnswer(recipientId, answer) {

console.log(answer);
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
      console.log("son: ",sonCode);
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
  console.log(messageData);
  callSendAPI(messageData);
}


export function sendTextMessage(recipientId, messageText) {
  console.log("sendTextMessagee");
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
  console.log("callSendAPI ",messageData);
  httpRequest({
    uri: 'https://graph.facebook.com/v2.6/me/messages?access_token='+config.ACCESS_TOKEN,
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    //error correspond ici à des erreurs servers ?
    console.log(body.error);
    if (!error && response.statusCode == 200) {
      //var recipientId = body.recipient_id;
      //var messageId = body.message_id;
      //console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
    } else {
      console.error("Unable to send message.");
    //  console.error(response);
      console.error(body.error);
    }
  });
}

 export function sendTypingOn(recipientId) {

  console.log("send typing_on");
  var data = {
    recipient: {
      id: recipientId
    },
    sender_action:"typing_on"
  };

  httpRequest({
    uri: 'https://graph.facebook.com/v2.6/me/messages?access_token='+config.ACCESS_TOKEN,
    method: 'POST',
    json: data

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //var recipientId = body.recipient_id;
      //var messageId = body.message_id;
      //console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response.body.error);
    }
  });
}


//TODO factoriser, au retour de la promise de find, envoyer la réponse.
//  findAnswer(code);

export function sendSpecificAnswer(code, senderID){

  const query = Answers.findOne({'code':code});

  query.then(
    function(answer){
      console.log("answer after findOne query", answer);
      if(!answer)
        sendDefaultAnswer(senderID);
      else
        sendAnswer(senderID, answer);
    },
    function(error){
      console.log("ERROR :",error);
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
      console.log("ERROR :",error);
    });
}
