import species from './species'
import intent from './intent'
import answer from './answer'
import nlp from './nlp'
import entity from './entity'
import test from './test'
import messageLog from './messageLog'
import webhook from './webhook'

// combine routes
export default(server) => {
  species(server)
  intent(server)
  answer(server)
  webhook(server)
  nlp(server)
  entity(server)
  messageLog(server)
  test(server)
}
