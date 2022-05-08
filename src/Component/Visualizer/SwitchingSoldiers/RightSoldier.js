import React, { useContext, useCallback } from 'react'
import VisualizerContext from './Context'
import Soldier from './Soldier'

const RightSoldier = function (props) {
  const {
    boxes,
    leftPersons,
    nextGround,
    rightPersonMoveApplicable,
    rightPersonMove,
    rightPersonJump
  } = useContext(VisualizerContext)
  const { id, boxId } = props

  const onClick = useCallback(
    (e) => {
      const prevBox = boxes.find((box) => {
        return nextGround.has(box.id, boxId)
      })
      if (!prevBox) return

      const prevBoxId = prevBox.id

      if (rightPersonMoveApplicable(id, boxId, prevBoxId)) {
        rightPersonMove(id, boxId, prevBoxId)
      } else {
        const prevToPrevBox = boxes.find((box) => {
          return nextGround.has(box.id, prevBoxId)
        })
        const nextLeftPerson = leftPersons.find((lp) => lp.boxId === prevBoxId)
        prevToPrevBox &&
          nextLeftPerson &&
          rightPersonJump(
            id,
            boxId,
            prevBoxId,
            nextLeftPerson.id,
            prevToPrevBox.id
          )
      }
    },
    [id, boxId]
  )

  return <Soldier onClick={onClick} className='right-soldier' {...props} />
}

export default RightSoldier
