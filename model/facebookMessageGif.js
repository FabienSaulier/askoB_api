
export default class FacebookMessageGif {
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

    // On ne peut pas ajouter du text à un image, mais on peut mettre des quick replies
    if (quickReplies.length > 0) {
      message.quickReplies = quickReplies
    }

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
