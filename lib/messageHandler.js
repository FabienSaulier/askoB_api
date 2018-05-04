import _ from 'lodash'
import config from '../config/config'
import logger from '../lib/logger'
import * as Message from '../lib/message'
import FacebookMessageText from '../model/facebookMessageText'
import FacebookMessageGif from '../model/facebookMessageGif'
import FacebookMessageCarouselProfilMorpho from '../model/facebookMessageCarouselProfilMorpho'
import FacebookMessageVideo from '../model/facebookMessageVideo'
import FacebookMessageShareButton from '../model/facebookMessageShareButton'
import * as ANSWERS_ID from '../lib/answersID'
import * as FacebookApiWrapper from '../lib/facebookApiWrapper'
import Answers from '../model/answer'
import Users from '../model/user'

export function sendAnswer(answer, user){
  const fbMsg = new FacebookMessageText(answer, user)
  FacebookApiWrapper.postTofacebook(fbMsg.getMessage())

  if(answer._id == '5ab3b8407b089d002c6fc156'){
    const fbMsgVideo = new FacebookMessageVideo(answer, user)
    FacebookApiWrapper.postTofacebook(fbMsgVideo.getMessage())
  }

  if(answer._id == '5aa6b30de8160e43b4605dc3'){
    const fbMsgCarousel = new FacebookMessageCarouselProfilMorpho(answer, user)
    FacebookApiWrapper.postTofacebook(fbMsgCarousel.getMessage())
  }

  if(answer.intent == 'goodbye'){
    const fbMsgShareBtn = new FacebookMessageShareButton(answer, user)
    FacebookApiWrapper.postTofacebook(fbMsgShareBtn.getMessage())
  }

  if (answer.gifId) {
    const fbMsgGif = new FacebookMessageGif(answer, user)
    FacebookApiWrapper.postTofacebook(fbMsgGif.getMessage())
  }
}
