import FacebookMessage from './facebookMessage'
import _ from 'lodash'

export default class FacebookMessageText extends FacebookMessage {

  constructor(answer, user) {
    super(answer, user)
    this.message.text = this.replaceToken(answer.text, user)
  }

  replaceToken(text, user){
    const pattern = /[%]\S+[%]/    // les mots avec %xxx%
    const regexp = new RegExp(pattern);
    const res = text.match(regexp, 'g')

    if(res){
      const strToReplace = res[0]
      const prop = res[0].replace(/%/g, '')  //remove all %
      console.log(strToReplace)
      console.log(prop)
      text = text.replace(strToReplace,_.get(user,prop) )
    }
    return text
  }
}
