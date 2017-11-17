import Answers from '../model/answer'
import logger from '../lib/logger'
import flattenMongooseValidationError from 'flatten-mongoose-validation-error'

export default(server) => {

  server.get('/lapin', function(req, res, next) {
    const code = 'INDEX';
    Answers.findOne({'code':code})
      .then(
        function(result){
          res.send(200, result);
        },
        function(error){
          logger.fatal(error);
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
          logger.error(error);
        }
      );
  });

  server.del('/lapin/answer/:code', function(req, res, next) {
    const code = req.params.code;
    logger.info("Delete /lapin/answer %s ", code);
    Answers.remove({ code: code}, function (err) {
      if (err) return logger.error(err);
    });
  });

  // Update and Create an asnwer.
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
};
