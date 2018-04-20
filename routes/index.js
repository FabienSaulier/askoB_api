import species from './species'
import intent from './intent'
import answer from './answer'
import nlp from './nlp'
import entity from './entity'
import test from './test'
import webhook from './webhook'
import webview from './webview'

// combine routes
export default(server) => {
  species(server)
  intent(server)
  answer(server)
  webhook(server)
  nlp(server)
  entity(server)
  test(server)
  webview(server)
}
