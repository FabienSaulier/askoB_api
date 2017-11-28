import Answers from '../model/answer'
import logger from '../lib/logger'
import flattenMongooseValidationError from 'flatten-mongoose-validation-error'
import errs from 'restify-errors'

export default(server) => {

  /**
  * Send an answer
  **/
  server.get('/answer/:id', function(req, res, next) {
    const id = req.params.id;
    Answers.findOne({'_id':id})
      .then(
        function(result){
          res.send(200, result);
        },
        function(error){
          logger.error(error);
        }
      );
  });

  /**
  * Delete an answer.
  **/
  server.del('/answer/:id', function(req, res, next) {
    const id = req.params.id;
    logger.info("Delete answer %s ", id);
    Answers.remove({ _id: id}, function (err) {
      if (err) return logger.error(err);
    });
  });


  // Update and Create an asnwer.
  server.put('/answer/', function(req, res, next){
    const inputAnswer = req.body;
    if(inputAnswer && inputAnswer._id){
      Answers.update({_id:inputAnswer._id}, inputAnswer, {runValidators: true}, function(err, answer){
        if(err){
          res.send(buildErrorMsg(err))
          return next()
        } else{
          res.send(200);
          return next();
        }
      })
    }else{
      Answers.create(inputAnswer, function(err){
        if(err){
          res.send(buildErrorMsg(err))
          return next()
        }else{
          res.send(200);
          return next();
        }
      })
    }
  });

  function buildErrorMsg(err){
    const e = flattenMongooseValidationError(err, ' - ');
    const error = new errs.UnprocessableEntityError({message:e})
    return error;
  }

}
