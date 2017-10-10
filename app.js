var restify = require('restify');

const config = require('./config');


const mongoose = require('mongoose');
console.log();
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
server.get('/hello/:name', respond);


server.get('/',  function(req, res, next) {
  console.log(req.url);
  /*
  let firstDoc = new Answers({ 'label': 'mine', 'text':'mon first doc save'});
  firstDoc.save(function (err){
      if(err) console.log(err);
      else console.log("first doc saved with success!");
      });
*/
Themes.find(function (err, themes) {
  if (err) return console.error(err);

  res.send(themes);
})


  next();
  //return next();
});

server.head('/hello/:name', respond);



server.listen(process.env.PORT || 3000, function() {
	 console.log(`Server is listening on port 3000`);
});