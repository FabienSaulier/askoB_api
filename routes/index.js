import species from './species'
import intent from './intent'
import answer from './answer'
import nlp from './nlp'
import entity from './entity'
import test from './test'
import messageLog from './messageLog'
import user from './user'
import webhook from './webhook'
import label from './label'

// combine routes
export default(server) => {
  species(server)
  intent(server)
  answer(server)
  webhook(server)
  nlp(server)
  entity(server)
  messageLog(server)
  user(server)
  label(server)
  test(server)
}
