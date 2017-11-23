import Answers from '../model/answer'
import logger from '../lib/logger'
import flattenMongooseValidationError from 'flatten-mongoose-validation-error'

export default(server) => {

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
}
