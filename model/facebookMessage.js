
export default class FacebookMessage {
  get() {
    return this.messageData
  }

  constructor(answer, recipientId) {
    // construction des quickReplies
    const quickReplies = [];
    if (answer.children) {
      answer.children.forEach((child) => {
        quickReplies.push({
          content_type: 'text',
          title: child.label,
          payload: child._id,
        })
      })
    }

    // construction du message
    const message = {}

    if (quickReplies.length === 0) {
      message.text = answer.text
    } else {
      message.text = answer.text
      message.quickReplies = quickReplies
    }

    this.messageData = { recipient: { id: recipientId }, message }
  }
}
