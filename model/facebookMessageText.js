import FacebookMessage from './facebookMessage'

export default class FacebookMessageText extends FacebookMessage {

  constructor(answer, recipientId) {
    super(answer, recipientId)
    this.message.text = answer.text
  }
}
