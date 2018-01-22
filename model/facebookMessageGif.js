
export default class FacebookMessageGif {
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

    const HOME_MENU_LAPIN_ID = '5a4f45d5ae8a73002c23e682'
    quick_replies.push({
      content_type: 'text',
      title: '🏠',
      payload: JSON.stringify({ id: HOME_MENU_LAPIN_ID }),
    })

    // construction du message
    const message = {}

    // On ne peut pas ajouter du text à un image, mais on peut mettre des quick replies
    if (quick_replies.length > 0) {message.quick_replies = quick_replies}

    message.attachment = {
      type: 'image',
      payload: {
        url: `https://media.giphy.com/media/${answer.gifId}/200.gif`,
        is_reusable: true,
      },
    }

    this.messageData = { recipient: { id: recipientId }, message }
  }
}
