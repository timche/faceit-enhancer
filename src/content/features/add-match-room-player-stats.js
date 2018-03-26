import select from 'select-dom'
import {
  getTeamElements,
  getRoomId,
  getFactionDetails,
  getTeamMemberElements,
  getNicknameElement
} from '../libs/match-room'
import { hasFeatureAttribute, setFeatureAttribute } from '../libs/dom-element'
import {
  getQuickMatch,
  getMatch,
  getPlayer,
  getPlayerStats
} from '../libs/faceit'
import createMatchRoomPlayerStatsElement from '../components/match-room-player-stats'

const FEATURE_ATTRIBUTE = 'player-stats'

export default async parent => {
  const { teamElements, isTeamV1Element } = getTeamElements(parent)

  const roomId = getRoomId()
  const match = isTeamV1Element ? getQuickMatch(roomId) : getMatch(roomId)

  teamElements.forEach(async teamElement => {
    const { isFaction1 } = getFactionDetails(teamElement, isTeamV1Element)

    const memberElements = getTeamMemberElements(teamElement)

    memberElements.forEach(async memberElement => {
      if (hasFeatureAttribute(memberElement, FEATURE_ATTRIBUTE)) {
        return
      }
      setFeatureAttribute(memberElement, FEATURE_ATTRIBUTE)

      const nicknameElement = getNicknameElement(memberElement, isTeamV1Element)
      const nickname = nicknameElement.textContent

      const player = await getPlayer(nickname)

      if (!player) {
        return
      }

      const { guid } = player
      const { game } = await match
      const stats = await getPlayerStats(guid, game)

      if (!stats) {
        return
      }
      const statsElement = createMatchRoomPlayerStatsElement(stats, !isFaction1)

      const memberDetailsElement = select(
        '.match-team-member__details',
        memberElement
      )
      memberDetailsElement.after(statsElement)
    })
  })
}
