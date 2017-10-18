var restify = require('restify');


const config = require('./config');
var httpRequest = require('request');

const mongoose = require('mongoose');
mongoose.connect('mongodb://'+process.env.mongodbuser+':'+process.env.mongodbpassword+'@'+process.env.mongodburl, {useMongoClient: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("connected to db");
});

const Answers = require('./answer');
const Themes = require('./themes');


function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

var server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());


server.get('/',  function(req, res, next) {    
    console.log(req.url);
    res.send(200);
    next();
});

server.get('/themes',  function(req, res, next) {    
    console.log(req.url);
    Themes.find(function (err, themes) {
        if (err) return console.error(err);
        console.log(themes);
        res.charSet('utf-8');
        res.send(themes);
    })
    next();
});

server.get('/webhook', function(req, res, next) {
    
        
    console.log("webhook");
    console.log(req.query['hub.challenge']);
    
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === "123456789") {
    console.log("Validating webhook");
    
    res.sendRaw(200, req.query['hub.challenge']);
  //  httpRequest
    
  //  res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
   // res.sendStatus(403);          
  }  
});


server.post('/answer',  function(req, res, next) {
    
    console.log("body: ",req.body);
    
    res.send(200);
    

    
    /* APPEL A FACEBOOk ! */
        httpRequest.post(
        {
            url: 'https://graph.facebook.com/v2.6/me/messages?access_token=EAAHkcVMf1PgBAIJXgBFIOsGtcZA9ZBf0s3WXVjRIZB70Re1ZBarcleBHpyBS2mtCOmU0NVQ4gZCqgKBzFD8iRcpkWAPyLHpZBEGqDCoPNG2gevusPBc2ho1dlqsQnmMqAeh1lBA4ZAU1wbWlrtQxlZCaHtXrGHMbkhoBZA6DLjNLoCQZDZD',
            json: true,
            body:toto
        }, 
        function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
    });
    
    
    next();
});


server.get('/answer/:code_answer', function(req, res, next) {
    
    
    const query = Answers.findOne({'code':req.params.code_answer});
    
    query.then(function(answer){
        
        
        var fbResponse = {
            "recipient":{ "id":"1564151846940529"  }, 
            "message":{
                "text":answer.text,
                "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Red",
                    "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
                  }
                ]},
        };
        

        httpRequest.post(
        {
            url: 'https://graph.facebook.com/v2.6/me/messages?access_token=EAAHkcVMf1PgBAIJXgBFIOsGtcZA9ZBf0s3WXVjRIZB70Re1ZBarcleBHpyBS2mtCOmU0NVQ4gZCqgKBzFD8iRcpkWAPyLHpZBEGqDCoPNG2gevusPBc2ho1dlqsQnmMqAeh1lBA4ZAU1wbWlrtQxlZCaHtXrGHMbkhoBZA6DLjNLoCQZDZD',
            json: true,
            body:fbResponse
        }, 
        function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
        });
        

        
    })
    
    console.log(req.params);
    console.log("coucou, code is : ",req.params.code_answer);
    res.send(200);
    
    next();
});


server.listen(process.env.PORT || 3000, function() {
	 console.log(`Server is listening on port 3000`);
});