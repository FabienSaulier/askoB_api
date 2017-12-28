import species from './species'
import intent from './intent'
import answer from './answer'
import nlp from './nlp'
import entity from './entity'
import webhook from './webhook'

// combine routes
export default(server) => {
  species(server)
  intent(server)
  answer(server)
  webhook(server)
  nlp(server)
  entity(server)
};
