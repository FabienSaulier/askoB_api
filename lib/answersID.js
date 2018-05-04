
/**
 * ID of answers
 */

export const ANSWER_MENU_RABBIT_ID = '5a4f45d5ae8a73002c23e682'
export const ANSWER_MENU_DOG_ID = '5a86d1d08588b2002c5cb70b'
export const ANSWER_MENU_CAT_ID = '5ad79467aaee76002cc254ee'
export const ANSWER_MENU_P2P_ID = '5aa0394eba59e85b24e839d0'

export const ANSWER_GET_STARTED_ID = '5aaad250af36f96fe0f3ae72'

export const ANSWER_NO_SPECIES_SELECTED_ID = '5aabe4443d934c2094927e3a'

export function getAnswerNameFromId(id){
  switch (id) {
    case '5a4f45d5ae8a73002c23e682':
      return 'ANSWER_MENU_RABBIT_ID'
      break;
    case '5a86d1d08588b2002c5cb70b':
      return 'ANSWER_MENU_DOG_ID'
      break;
    case '5ad79467aaee76002cc254ee':
      return 'ANSWER_MENU_CAT_ID'
      break;
    case '5aa0394eba59e85b24e839d0':
      return 'ANSWER_MENU_P2P_ID'
      break;
    case '5aaad250af36f96fe0f3ae72':
      return 'ANSWER_GET_STARTED_ID'
      break;
    case '5aabe4443d934c2094927e3a':
      return 'ANSWER_NO_SPECIES_SELECTED_ID'
      break;
    default:
      return 'WARN: answersID: Dont know this answer ID'
  }
}
