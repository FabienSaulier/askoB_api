export default class FacebookMessage{

  get(){
    return this.messageData
  }

  constructor(answer, recipientId){

//  mettre l'objet sous cette forme ?    this.recipientId = recipientId;

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
    const recipient = {id: recipientId}
    let message = {}
    if(quick_replies.length <1){
      message = {'text': answer.text}
    } else{
      message = {'text': answer.text, 'quick_replies':quick_replies}
    }

    this.messageData = {'recipient': {id: recipientId}, 'message':message}
  }

}
