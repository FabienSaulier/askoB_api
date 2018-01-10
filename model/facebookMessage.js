
export default class FacebookMessage {
  get() {
    return this.messageData
  }

  constructor(answer, recipientId) {
    // construction des quick_replies
    const quick_replies = []
    if (answer.children) {
      answer.children.forEach((child) => {
        const payload = { id: child._id }
        quick_replies.push({
          content_type: 'text',
          title: child.label,
          payload: JSON.stringify(payload),
        })
      })
    }

    if (answer.siblings && answer.siblings.length > 0) {
      const payload = {}
      payload.siblings = []
      answer.children.forEach((child) => {
        payload.siblings.push({ label: child.label, _id: child._id })
      })
      answer.siblings.forEach((sibling) => {
        payload.siblings.push({ label: sibling.label, _id: sibling._id })
      })
      quick_replies.push({
        content_type: 'text',
        title: '➕',
        payload: JSON.stringify(payload),
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
