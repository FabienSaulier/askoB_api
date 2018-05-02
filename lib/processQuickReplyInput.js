import logger from '../lib/logger'
import Users from '../model/user'
import Answers from '../model/answer'

export async function run(event, user) {
  const quickReply = event.message.quick_reply
  const payload = JSON.parse(quickReply.payload)
  if(payload.id)
    user = await Users.updateUserQuestionSpecies(payload.id, user)

  let answer = {}
  if (payload.siblings) {
    answer = await Answers.findOneRandomByIntent('sibling')
    answer.children = payload.siblings
  } else {
    answer = await Answers.findOne({ _id: payload.id })
  }
  return answer
}
