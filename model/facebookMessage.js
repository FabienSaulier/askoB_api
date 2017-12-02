export default class FacebookMessage{

  get(){
    return this.messageData
  }
  
  constructor(answer, recipientId){
    this.recipientId = recipientId;

    // construction des quickReplies
    /*
    let quick_replies = [];
    answer.sons.forEach(function(son){
      quick_replies.push({
        "content_type":"text",
        "title": son.name,
        "payload": son.code
      })
    })

    if(quick_replies.length === 0){
      quick_replies.push({
        "content_type":"text",
        "title": '🏠',
        "payload": 'INDEX'
      })
    }
    */

    // constructin du message
    this.messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        text: answer.text,
    //    quick_replies:quick_replies
      }
    }

  }

}
