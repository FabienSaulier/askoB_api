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


server.post('/answer',  function(req, res, next) {    
    console.log(req.body);
    
    res.send(200);
    
    
    /* APPEL A FACEBOOk ! */
        httpRequest.post(
        {
            'uri': 'hhttps://graph.facebook.com/v2.6/me/messages?access_token=EAAHkcVMf1PgBAIJXgBFIOsGtcZA9ZBf0s3WXVjRIZB70Re1ZBarcleBHpyBS2mtCOmU0NVQ4gZCqgKBzFD8iRcpkWAPyLHpZBEGqDCoPNG2gevusPBc2ho1dlqsQnmMqAeh1lBA4ZAU1wbWlrtQxlZCaHtXrGHMbkhoBZA6DLjNLoCQZDZD',
            'json': '{ "recipient":{ "id":"1564151846940529"  }, "message":{ "text":"hello,sdfdsfdsfsdf world!"}}'
        }, 
        function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
    });
    
    
    next();
});



server.listen(process.env.PORT || 3000, function() {
	 console.log(`Server is listening on port 3000`);
});