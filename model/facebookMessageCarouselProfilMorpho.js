import FacebookMessage from './facebookMessage'

export default class FacebookMessageCarouselProfilMorpho extends FacebookMessage{

  constructor(answer, user) {
    super(answer, user)
    this.message.attachment = {
      type: 'template',
      payload: {
        "template_type":"generic",
        "elements":[
           {
             "title":"1 - Très maigre",
             "image_url":"http://res.cloudinary.com/hdjpwdq5r/image/upload/v1521063575/pm_tres_maigre.png",
           },
           {
             "title":"2 - Maigre",
             "image_url":"http://res.cloudinary.com/hdjpwdq5r/image/upload/v1521063575/pm_maigre.png",
           },
           {
             "title":"3 - Idéal",
             "image_url":"http://res.cloudinary.com/hdjpwdq5r/image/upload/v1521063575/pm_ideal.png",
           },
           {
             "title":"4 - Excès de poids",
             "image_url":"http://res.cloudinary.com/hdjpwdq5r/image/upload/v1521063575/pm_surpoids.png",
           },
           {
             "title":"5 - Obèse",
             "image_url":"http://res.cloudinary.com/hdjpwdq5r/image/upload/v1521063575/pm_obese.png",
           },
        ]
      },
    }
  }

}
