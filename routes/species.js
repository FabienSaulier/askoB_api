import Answers from '../model/answer'
import logger from '../lib/logger'
import flattenMongooseValidationError from 'flatten-mongoose-validation-error'

export default(server) => {


  server.get('/species/:species', function(req, res, next) {
    const species = req.params.species;
    Answers.find({'species':species})
      .then(
        function(result){
          res.send(200, result);
        },
        function(error){
          logger.fatal(error);
        }
      );
  });

  server.get('/species/:species/intent/:intent', function(req, res, next) {
    const species = req.params.species;
    const intent = req.params.intent;

    Answers.find({'species':species, 'intent':intent})
      .then(
        function(result){
          res.send(200, result);
        },
        function(error){
          logger.fatal(error);
        }
      );
  });
}
