import Answers from './answer'
import _ from 'lodash'

const HOME_MENU_PARLER_VETO_ID = '5a68b6777fb4053ae8ee546a'

export default class FacebookMessage {

  constructor(answer, user) {

    // these are attributes name awaited by facebook
    this.recipientId = user.senderID
    this.message = {}
    this.message.quick_replies = []

    // order of populate is the order displayed
    this.populateQRWithBackButton(answer, user.last_answer)
    this.populateQRWithChildren(answer)
    this.populateQRWithSiblings(answer)
    if(this.hasVetButton(answer)){
      this.populateQRWithVetButton()
      this.incrementVetButtonAnswerDisplayCount()
    }
    this.populateQRWithHomeButton(user.question_species)
    if(_.isEmpty(this.message.quick_replies)){ // facebook doesn't accept empty quick_replies
      delete this.message.quick_replies
    }
  }

  getMessage() {
    this.messageData =  { recipient: { id: this.recipientId }, message: this.message }
    return this.messageData
  }

  populateQRWithBackButton(answer, last_answer){
    if(last_answer && last_answer.children.length > 0){
      const payload = { id: last_answer._id }
      this.message.quick_replies.push({
        content_type: 'text',
        title: '⬆️',
        payload: JSON.stringify(payload),
      })
    }
  }

  populateQRWithChildren(answer){
    if (answer.children) {
      answer.children.forEach((child) => {
        let payload = { id: child._id}
        if(child.payload_data){
          _.set(payload, child.payload_data.key, child.payload_data.value)
        }
        this.message.quick_replies.push({
          content_type: 'text',
          title: child.label,
          payload: JSON.stringify(payload),
        })
      })
    }
  }

  populateQRWithSiblings(answer){
    if (answer.siblings && answer.siblings.length > 0) {
      const payload = {}
      payload.siblings = []
      answer.children.forEach((child) => {
        payload.siblings.push({ label: child.label, _id: child._id })
      })
      answer.siblings.forEach((sibling) => {
        payload.siblings.push({ label: sibling.label, _id: sibling._id })
      })
      this.message.quick_replies.push({
        content_type: 'text',
        title: '➕',
        payload: JSON.stringify(payload),
      })
    }
  }

  populateQRWithHomeButton(species){
    const HOME_MENU_THEMES_LAPIN_ID = '5a4f45d5ae8a73002c23e682'
    const HOME_MENU_THEMES_CHIEN_ID = '5a86d1d08588b2002c5cb70b'
    const HOME_MENU_THEMES_CHAT_ID = '5ad79467aaee76002cc254ee'

    if(species === 'lapin'){
      this.message.quick_replies.push({
        content_type: 'text',
        title: '🏠',
        payload: JSON.stringify({ id: HOME_MENU_THEMES_LAPIN_ID }),
      })
    } else if (species === 'chien'){
      this.message.quick_replies.push({
        content_type: 'text',
        title: '🏠',
        payload: JSON.stringify({ id: HOME_MENU_THEMES_CHIEN_ID }),
      })
    } else if (species === 'chat'){
      this.message.quick_replies.push({
        content_type: 'text',
        title: '🏠',
        payload: JSON.stringify({ id: HOME_MENU_THEMES_CHAT_ID }),
      })
    }
  }

  hasVetButton(answer) {
    return answer.displayVetButton
  }

  populateQRWithVetButton(){
    this.message.quick_replies.push({
      content_type: 'text',
      title: 'Contacter véto 👩‍⚕️',
      payload: JSON.stringify({ id: HOME_MENU_PARLER_VETO_ID }),
    })
  }

  incrementVetButtonAnswerDisplayCount(){
    Answers.update({_id: HOME_MENU_PARLER_VETO_ID}, { $inc: { displayButtonCount: 1} } )
    .then(
      (result) => {
        //ok
      },
      (error) => {
        logger.error(error)
      },
    )
  }

}
