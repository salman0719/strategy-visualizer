import React, { useCallback, useContext } from 'react'
import VisualizerContext from './Context'
import Soldier from './Soldier'

const LeftSoldier = function (props) {
  const {
    boxes,
    rightPersons,
    nextGround,
    leftPersonMoveApplicable,
    leftPersonMove,
    leftPersonJump
  } = useContext(VisualizerContext)
  const { id, boxId } = props

  const onClick = useCallback(
    (e) => {
      const nextBox = boxes.find((box) => {
        return nextGround.has(boxId, box.id)
      })
      if (!nextBox) return

      const nextBoxId = nextBox.id

      if (leftPersonMoveApplicable(id, boxId, nextBoxId)) {
        leftPersonMove(id, boxId, nextBoxId)
      } else {
        const nextToNextBox = boxes.find((box) => {
          return nextGround.has(nextBoxId, box.id)
        })
        const nextRightPerson = rightPersons.find(
          (rp) => rp.boxId === nextBoxId
        )
        nextToNextBox &&
          nextRightPerson &&
          leftPersonJump(
            id,
            boxId,
            nextBoxId,
            nextRightPerson.id,
            nextToNextBox.id
          )
      }
    },
    [id, boxId]
  )

  return <Soldier onClick={onClick} className='left-soldier' {...props} />
}

export default LeftSoldier
