import Answers from '../model/answer'
import logger from '../lib/logger'
import flattenMongooseValidationError from 'flatten-mongoose-validation-error'

export default(server) => {

  /**
  * Send all general answers of a species
  **/
  server.get('/generalitents/:species', function(req, res, next) {
    const species = req.params.species;
    const generalIntents = ['greetings', 'goodbye']
    Answers.find({'species':species, 'intent':{ $in: generalIntents} } )
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
