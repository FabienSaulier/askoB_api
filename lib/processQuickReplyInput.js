import httpRequest from 'request'
import requestP from 'request-promise'
import config from '../config/config'
import logger from '../lib/logger'
import Users from '../model/user'
import Answers from '../model/answer'
import * as ANSWERS_ID from '../lib/answersID'

export async function run(event, user) {
  const quickReply = event.message.quick_reply
  const payload = JSON.parse(quickReply.payload)
  let answer = {}
  if (payload.siblings) {
    answer = await Answers.findOneRandomByIntent('sibling')
    answer.children = payload.siblings
  } else {
    answer = await Answers.findOne({ _id: payload.id })
  }
  return answer
}
