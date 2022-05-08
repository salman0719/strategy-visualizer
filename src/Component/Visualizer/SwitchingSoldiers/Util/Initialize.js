import getObj from '../../../../Util/getObj'
import { getUniqueID } from '../../../../Util/getUniqueId'
import { templatePredicateForOne, templatePredicateForTwo } from '../../../../Util/predicate'
import { DEFAULT_PERSON_COUNT, DEFAULT_EMPTY_GROUND_COUNT } from '../Constants'
import { PREDICATE_KEY } from '../../../../Util/constants'

export default function initialize(props) {
  const leftPersonCount = parseInt(props.leftPersonCount) || DEFAULT_PERSON_COUNT
  const rightPersonCount = parseInt(props.rightPersonCount) || DEFAULT_PERSON_COUNT
  const emptyGroundCount = parseInt(props.emptyGroundCount) || DEFAULT_EMPTY_GROUND_COUNT

  const totalBox = leftPersonCount + rightPersonCount + emptyGroundCount

  const leftPersons = Array(leftPersonCount)
    .fill(0)
    .map((_, index) => {
      const id = 'left-person-' + index + '-' + getUniqueID()
      return { id, number: index + 1, boxIndex: null }
    })

  const rightPersons = Array(rightPersonCount)
    .fill(0)
    .map((_, index) => {
      const id = 'right-person-' + index + '-' + getUniqueID()
      return { id, number: index + 1, boxIndex: null }
    })

  const boxes = Array(totalBox)
    .fill(0)
    .map((_, index) => {
      const id = 'ground-' + index + '-' + getUniqueID()
      return { id, index, number: index + 1 }
    })

  const leftPersonObj = getObj(leftPersons, 'id')
  const rightPersonObj = getObj(rightPersons, 'id')
  const boxObj = getObj(boxes, 'id')

  const groundPred = templatePredicateForOne('ground')
  const leftPersonPred = templatePredicateForOne('leftPerson')
  const rightPersonPred = templatePredicateForOne('rightPerson')
  const groundClearPred = templatePredicateForOne('groundClear')
  const nextGroundPred = templatePredicateForTwo('nextGround')
  const onGroundPred = templatePredicateForTwo('onGround', {
    onAssert: function ({ boxes: boxObj, leftPersons: leftPersonObj, rightPersons: rightPersonObj }, personId, boxId) {
      const personObj = Object.assign({}, leftPersonObj, rightPersonObj)
      const box = boxObj[boxId]
      Object.assign(personObj[personId], {
        boxId,
        boxIndex: box.index
      })
    },
    onNegate: function ({ leftPersons: leftPersonObj, rightPersons: rightPersonObj }, personId, boxId) {
      const personObj = Object.assign({}, leftPersonObj, rightPersonObj)
      const prevBoxId = personObj[personId].boxId
      if (prevBoxId === boxId) {
        Object.assign(personObj[personId], {
          boxId: null,
          boxIndex: undefined
        })
      }
    }
  })

  onGroundPred.setEventData({ boxes: boxObj, leftPersons: leftPersonObj, rightPersons: rightPersonObj })

  leftPersons.forEach((leftPerson) => {
    leftPersonPred(leftPerson.id)
  })
  rightPersons.forEach((rightPerson) => {
    rightPersonPred(rightPerson.id)
  })
  boxes.forEach((box) => {
    groundPred(box.id)
    groundClearPred(box.id)
  })

  for (let i = boxes.length - 1; i > 0; i--) {
    nextGroundPred(boxes[i - 1].id, boxes[i].id)
  }

  leftPersons.forEach((lp, index) => {
    const boxId = boxes[index].id
    onGroundPred(lp.id, boxId)
    groundClearPred.not(boxId)
  })

  rightPersons.forEach((rp, index) => {
    const boxIndex = boxes.length - rightPersons.length + index
    const boxId = boxes[boxIndex].id
    onGroundPred(rp.id, boxId)
    groundClearPred.not(boxId)
  })

  return {
    leftPersons,
    rightPersons,
    boxes,
    [PREDICATE_KEY]: {
      ground: groundPred,
      leftPerson: leftPersonPred,
      rightPerson: rightPersonPred,
      groundClear: groundClearPred,
      nextGround: nextGroundPred,
      onGround: onGroundPred,
    }
  }
}
