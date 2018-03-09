import FacebookMessage from './facebookMessage'

export default class FacebookMessageGif extends FacebookMessage{

  constructor(answer, user) {
    super(answer, user)
    this.message.attachment = {
      type: 'image',
      payload: {
        url: `https://media.giphy.com/media/${answer.gifId}/200.gif`,
        is_reusable: true,
      },
    }
  }

}
