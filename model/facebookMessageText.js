import FacebookMessage from './facebookMessage'
import _ from 'lodash'

export default class FacebookMessageText extends FacebookMessage {

  constructor(answer, user) {
    super(answer, user)
    this.message.text = this.replaceToken(answer.text, user)
  }

  replaceToken(text, user){
    const pattern = /[%]\S+[%]/    // les mots avec %xxx%
    const regexp = new RegExp(pattern, 'gm')
    const res = _.words(text, regexp)

    if(res){
      for(let strToReplace of res){
        const prop = strToReplace.replace(/%/gm, '')  // with regexp remove all %
        strToReplace = _.escapeRegExp(strToReplace)
        const regexp = new RegExp(strToReplace, 'gm');
        text = text.replace(regexp,_.get(user,prop) )
      }
    }
    return text
  }
}
