import Answers from '../model/answer'
import logger from '../lib/logger'
import flattenMongooseValidationError from 'flatten-mongoose-validation-error'
import errs from 'restify-errors'
import _ from 'lodash'

export default(server) => {

  /**
  * Send an answer
  **/
  server.get('/answer/:id', function(req, res, next) {
    const id = req.params.id;
    Answers.findOne({'_id':id})
      .then(
        function(result){
          res.send(200, result)
        },
        function(error){
          logger.error(error)
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
      if (err) return logger.error(err)
      else res.send(200)
    });
  });

  // Update and Create an asnwer.
  server.put('/answer/', function(req, res, next){
    const inputAnswer = req.body;
    logger.info("sauvegarde d'une nouvelle reponse",inputAnswer)
    if(inputAnswer && inputAnswer._id){
      Answers.update({_id:inputAnswer._id}, inputAnswer, {runValidators: true}, function(err, answer){
        if(err){
          res.send(buildErrorMsg(err))
          return next()
        } else{
          res.send(200)
          return next()
        }
      })
    }else{
      Answers.create(inputAnswer, function(err){
        if(err){
          res.send(buildErrorMsg(err))
          return next()
        }else{
          res.send(200)
          return next()
        }
      })
    }
  });


  /**
   * get the general answers corresponding to the intent and
   * return One of them at random
   */
  server.get('/answer/general/:intent', function(req, res, next) {
    const intent = req.params.intent;
    Answers.find({'intent':intent})
      .then(
        function(result){
          const randomIndex = _.random(0, result.length-1)
          res.send(200, result[randomIndex])
        },
        function(error){
          logger.error(error)
        }
      );
  });

  function buildErrorMsg(err){
    const e = flattenMongooseValidationError(err, ' - ')
    logger.warn(e)
    const error = new errs.UnprocessableEntityError({message:e})
    return error
  }

}
