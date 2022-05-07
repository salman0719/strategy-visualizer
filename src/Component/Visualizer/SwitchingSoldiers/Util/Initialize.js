import { getUniqueID } from '../../../../Util/getUniqueId'
import { DEFAULT_PERSON_COUNT, DEFAULT_EMPTY_GROUND_COUNT } from '../Constants'
import {
  ground,
  groundClear,
  leftPerson,
  nextGround,
  onGround,
  rightPerson
} from './Predicates'

export default function initialize(
  personCount = DEFAULT_PERSON_COUNT,
  emptyGround = DEFAULT_EMPTY_GROUND_COUNT
) {
  if (typeof personCount !== 'object') {
    personCount = { left: personCount, right: personCount }
  }

  const totalLeftPerson = personCount.left
  const totalRightPerson = personCount.right
  const totalBox = totalLeftPerson + totalRightPerson + emptyGround

  const leftPersons = Array(totalLeftPerson)
    .fill(0)
    .map((item, index) => {
      const id = 'left-person-' + index + '-' + getUniqueID()
      leftPerson(id)
      return { id, number: index + 1 }
    })

  const rightPersons = Array(totalRightPerson)
    .fill(0)
    .map((item, index) => {
      const id = 'right-person-' + index + '-' + getUniqueID()
      rightPerson(id)
      return { id, number: index + 1 }
    })

  const boxes = Array(totalBox)
    .fill(0)
    .map((item, index) => {
      const id = 'ground-' + index + '-' + getUniqueID()
      ground(id)
      groundClear(id)
      return { id, index, number: index + 1 }
    })

  for (let i = boxes.length - 1; i > 0; i--) {
    nextGround(boxes[i - 1].id, boxes[i].id)
  }

  leftPersons.forEach((lp, index) => {
    const box = boxes[index]
    lp.boxId = box.id
    onGround(lp.id, box.id)
    groundClear.not(box.id)
  })

  rightPersons.forEach((rp, index) => {
    // TODO
    // Instead of setting `boxId`, we need to utilize the predicates only
    const boxIndex = boxes.length - rightPersons.length + index
    const box = boxes[boxIndex]
    rp.boxId = box.id
    onGround(rp.id, box.id)
    groundClear.not(box.id)
  })

  return { leftPersons, rightPersons, boxes }
}
