import logger from '../lib/logger'

export default class FacebookMessageGif{

  get(){
    return this.messageData
  }

  constructor(answer, recipientId){

    // construction des quickReplies
    let quick_replies = [];
    if(answer.children){
      answer.children.forEach(function(child){
        quick_replies.push({
          "content_type":"text",
          "title": child.label,
          "payload": child._id
        })
      })
    }

    // construction du message
    let message = {}

    // On ne peut pas ajouter du text à un image, mais on peut mettre des quick replies
    if(quick_replies.length > 0){
      message.quick_replies = quick_replies
    }

    message.attachment = {
      "type":"image",
      "payload":{
        "url":'https://media.giphy.com/media/'+answer.gifId+'/200.gif',
        "is_reusable":true
      }
    }

    this.messageData = {'recipient': {id: recipientId}, 'message':message}
  }

}
