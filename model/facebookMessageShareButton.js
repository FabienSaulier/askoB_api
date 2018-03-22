import FacebookMessage from './facebookMessage'

export default class FacebookMessageShareButton extends FacebookMessage{

  constructor(answer, user) {
    super(answer, user)

    let image_url = ''
    switch (user.question_species) {
      case 'lapin':
        image_url = 'https://scontent-cdt1-1.xx.fbcdn.net/v/t1.0-9/29468551_1907584326219849_5833109764619370496_n.jpg?_nc_eui2=v1%3AAeFQSe-sO1ZkiLHqI06fzHkbAl3heN-QKUcSWiscDBnTjCPv5Ke_k-0zbcDJ2K_Dy2GWQSwkR3xyr9CP60Onbab_NEt398pommVev15J9NthuA&oh=7e4fac00d0ae99a379ff89d5caba3280&oe=5B44CF18'
        break;
      case 'chien':
        image_url = 'https://scontent-cdt1-1.cdninstagram.com/vp/7a28fb3c87255eb8ba946b4cfe2eb491/5B745476/t51.2885-15/e35/25038884_582740762059308_630036994692481024_n.jpg'
        break;
      default:
    }

    this.message.attachment = {
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title: "Kanzi, chatbot vétérinaire",
            subtitle: "Répond à tes questions concernant le "+user.question_species,
            image_url: image_url,
            buttons: [
              {
                type: "element_share",
                share_contents: {
                  attachment: {
                    type: "template",
                    payload: {
                      template_type: "generic",
                      elements: [
                        {
                          title: "Kanzi, chatbot vétérinaire",
                          subtitle: "Répond à tes questions concernant le "+user.question_species,
                          image_url: image_url,
                          default_action: {
                            type: "web_url",
                            url: "https://www.messenger.com/t/kanzivet"
                          },
                          buttons: [
                            {
                              type: "web_url",
                              url: "https://www.messenger.com/t/kanzivet",
                              title: "Kanzi, chatbot vétérinaire",
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              }
            ]
          }
        ]
      }

    }

  }

}
