import FacebookMessage from './facebookMessage'

export default class FacebookMessageVideo extends FacebookMessage{

  constructor(answer, user) {
    super(answer, user)
    this.message.attachment = {
      type: 'template',
      payload: {
        "template_type":"media",
        "elements": [
           {
              "media_type": "video",
              "url": "https://www.facebook.com/9gag/videos/10157432012701840"
           },
         ]
      }
    }
  }

}
