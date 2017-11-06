var restify = require('restify');

const config = require('./config');

if(config.ENV = 'development'){
  require('dotenv').config();
}
var httpRequest = require('request');

const mongoose = require('mongoose');
mongoose.connect('mongodb://'+process.env.mongodbuser+':'+process.env.mongodbpassword+'@'+process.env.mongodburl, {useMongoClient: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("connected to db");
});


let recastai = require('recastai').default;
let clientRecast = new recastai(process.env.RECAST_DEV_ACCESS_TOKEN);


const Answers = require('./answer');
const Themes = require('./themes');



var server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

/////   CORS  /////////////
const corsMiddleware = require('restify-cors-middleware');
const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['*'],
  allowHeaders: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Type']
})

server.pre(cors.preflight)
server.use(cors.actual)

/////   END  CORS  /////////////


/*
server.use(
  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");


    res.header("Access-Control-Allow-Methods", "POST");

    res.header("Access-Control-Allow-Headers", "Content_Type");
//    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    return next();
  }
);
*/

server.get('/webhook', function(req, res, next) {

  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === "123456789") {
    console.log("Validating webhook");
    res.sendRaw(200, req.query['hub.challenge']);

  } else {
    console.error("Failed webhook validation. Make sure the validation tokens match.");
    res.send(403);
  }
});


////////////////////////////////////////////////////////////////////////////
////
////             A sortir, mieux orga
////
////////////////////////////////////////////////////////////////////////////
server.get('/lapin', function(req, res, next) {
  const code = 'INDEX';

//TODO factoriser
  Answers.findOne({'code':code})
    .then(
      function(result){
        res.send(200, result);
      },
      function(error){
        console.log("ERROR :",error);
      }
    );
});


server.get('/lapin/answer/:code', function(req, res, next) {
  const code = req.params.code;
  Answers.findOne({'code':code})
    .then(
      function(result){
        res.send(200, result);
      },
      function(error){
        console.log("ERROR :",error);
      }
    );
});

server.del('/lapin/answer/:code', function(req, res, next) {
  const code = req.params.code;
  console.log("to delete ", code);
  Answers.remove({ code: code}, function (err) {
    if (err) return console.log(err);
  });
});

const flattenMongooseValidationError = require('flatten-mongoose-validation-error');

// Update and Create an asnwer. TODO a factoriser
server.put('/lapin/answer/', function(req, res, next){
  const inputAnswer = req.body;
  if(inputAnswer._id){
    Answers.update({_id:inputAnswer._id}, inputAnswer, {runValidators: true}, function(err, answer){
      if(err){
        const e = flattenMongooseValidationError(err, ' - ');
        res.send(400, {'errorMsg': e});
        return next();
      } else{
        res.send(200);
      }
    })
  }else{
    Answers.create(inputAnswer, function(err){
      if(err){
        const e = flattenMongooseValidationError(err, ' - ');
        res.send(400, {'errorMsg': e});
        return next();
      }else{
        res.send(200);
        return next();
      }
    })
  }
});



////////////////////////////////////////////////////////////////////////////
////
////            FIN
////
////////////////////////////////////////////////////////////////////////////


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

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        console.log("foreach event: ", event.message);
        if (event.message) {
          receivedMessage(event);
        } else {
          //    console.log("Webhook received unknown event: ", event);
          console.log("Webhook received unknown event... todo: log and analyze ");
        }
      });


    });

    // Assume all went well. Send 200, otherwise, the request will time out and will be resent
    res.send(200);
  }
});


function receivedMessage(event) {
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
        console.log("INTENT :",intent);
        if(intent && intent.slug == 'greetings')
          sendHomeAnswer(senderID);
        else
          sendDefaultAnswer(senderID);
      })

  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}


function sendAnswer(recipientId, answer) {

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


function sendGenericMessage(recipientId, messageText) {
  // a voir
}


function sendTextMessage(recipientId, messageText) {
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


function callSendAPI(messageData) {
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

function sendTypingOn(recipientId) {

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

function sendHomeAnswer(senderID){
  const code = 'INDEX';

//TODO factoriser, au retour de la promise de find, envoyer la réponse.
//  findAnswer(code);

  const query = Answers.findOne({'code':code});

  query.then(
    function(defaultAnswer){
      sendAnswer(senderID, defaultAnswer);
    },
    function(error){
      console.log("ERROR :",error);
    });
}

function sendDefaultAnswer(senderID){
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



server.listen(process.env.PORT || 3000, function() {
	 console.log(`Server is listening on port 3000`);
});
