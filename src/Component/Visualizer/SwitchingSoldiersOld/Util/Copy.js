// TODO
// Merge with `Initialize.js`

import getObj from '../../../../Util/getObj'
import { getUniqueID } from '../../../../Util/getUniqueId'
import {
  ground,
  groundClear,
  leftPerson,
  nextGround,
  onGround,
  rightPerson
} from './Predicates'

export default function copy({
  leftPersons,
  rightPersons,
  boxes,
  emptyGround
}) {
  leftPersons = leftPersons.map((item, index) => {
    const id = 'left-person-' + index + '-' + getUniqueID()
    leftPerson(id)
    return { id, number: index + 1, rootId: item.id, boxId: item.boxId }
  })

  rightPersons = rightPersons.map((item, index) => {
    const id = 'right-person-' + index + '-' + getUniqueID()
    rightPerson(id)
    return { id, number: index + 1, rootId: item.id, boxId: item.boxId }
  })

  boxes = boxes.map((item, index) => {
    const id = 'ground-' + index + '-' + getUniqueID()
    ground(id)
    groundClear(id)
    return { id, index, number: index + 1, rootId: item.id }
  })

  for (let i = boxes.length - 1; i > 0; i--) {
    nextGround(boxes[i - 1].id, boxes[i].id)
  }

  const boxObj = getObj(boxes, 'rootId')
  // NOTE
  // If we want, we can remove the `rootId` here,
  // but still keeping it as of now for tracing purposes

  leftPersons.forEach((lp, index) => {
    const box = boxObj[lp.boxId]
    lp.boxId = box.id
    onGround(lp.id, box.id)
    groundClear.not(box.id)

    // NOTE
    // If we want, we can remove the `rootId` here,
    // but still keeping it as of now for tracing purposes
  })

  rightPersons.forEach((rp, index) => {
    // TODO
    // Instead of setting `boxId`, we need to utilize the predicates only
    const box = boxObj[rp.boxId]
    rp.boxId = box.id
    onGround(rp.id, box.id)
    groundClear.not(box.id)

    // NOTE
    // If we want, we can remove the `rootId` here,
    // but still keeping it as of now for tracing purposes
  })

  return { leftPersons, rightPersons, boxes }
}
