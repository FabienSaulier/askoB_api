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

    for(strToReplace of res){
      const prop = strToReplace.replace(/%/g, '')  // with regexp remove all %
      strToReplace = _.escapeRegExp(strToReplace)
      const regexp = new RegExp(strToReplace, 'g');
      text = text.replace(regexp,_.get(user,prop) )
    }
    /*
    if(res){
      let strToReplace = res[0]
      const prop = res[0].replace(/%/g, '')  // with regexp remove all %
      strToReplace = _.escapeRegExp(strToReplace)
      const regexp = new RegExp(strToReplace, 'g');
      text = text.replace(regexp,_.get(user,prop) )
    }*/
    return text
  }
}
