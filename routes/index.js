import species from './species'
import answer from './answer'
import nlp from './nlp'
import webhook from './webhook'

// combine routes
export default(server) => {
  species(server)
  answer(server)
  webhook(server)
  nlp(server)
};
