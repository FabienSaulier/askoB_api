
export default class FacebookMessage {
  get() {
    return this.messageData
  }

  constructor(answer, recipientId) {
    // construction des quick_replies
    const quick_replies = [];
    if (answer.children) {
      answer.children.forEach((child) => {
        quick_replies.push({
          content_type: 'text',
          title: child.label,
          payload: child._id,
        })
      })
    }

    // construction du message
    const message = {}

    if (quick_replies.length === 0) {
      message.text = answer.text
    } else {
      message.text = answer.text
      message.quick_replies = quick_replies
    }

    this.messageData = { recipient: { id: recipientId }, message }
  }
}
