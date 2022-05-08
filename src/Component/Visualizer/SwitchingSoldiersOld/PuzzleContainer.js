import '../../../switching-soldiers.css'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Container } from 'react-bootstrap'
import { getUniqueID } from '../../../Util/getUniqueId'
import Box from './Box'
import VisualizerContext from './Context'
import LeftSoldier from './LeftSoldier'
import RightSoldier from './RightSoldier'
import toast from '../../Toast'
import {
  ground,
  groundClear,
  leftPerson,
  nextGround,
  onGround,
  rightPerson
} from './Util/Predicates'

const SwitchingSoldiersPuzzleContainer = function ({
  leftPersons,
  rightPersons,
  boxes,
  stateIdentifier,
  onActive,
  isActiveBranch
}) {
  const [stateKey, setStateKey] = useState('')

  const leftPersonShouldJump = useRef(false)
  const rightPersonShouldJump = useRef(false)

  const leftPersonMoveApplicable = useCallback((leftPersonId, from, to) => {
    if (
      leftPerson.has(leftPersonId) &&
      ground.has(from) &&
      ground.has(to) &&
      onGround.has(leftPersonId, from) &&
      nextGround.has(from, to) &&
      groundClear.has(to)
    ) {
      return true
    }

    return false
  }, [])
  const leftPersonMove = useCallback((leftPersonId, from, to) => {
    if (leftPersonMoveApplicable(leftPersonId, from, to)) {
      onGround.not(leftPersonId, from)
      onGround(leftPersonId, to)
      groundClear.not(to)
      groundClear(from)

      leftPersonShouldJump.current = false
      rightPersonShouldJump.current = true

      // TODO
      // Later on, we will omit this so that predicate can control them alone!
      leftPersons.find((lp) => lp.id === leftPersonId).boxId = to

      // TEMP
      // A temporary way to update the component
      setStateKey(getUniqueID())
    }
  }, [])

  const leftPersonJumpApplicable = useCallback(
    (leftPersonId, from, middle, middlePersonId, to) => {
      if (
        leftPerson.has(leftPersonId) &&
        ground.has(from) &&
        ground.has(to) &&
        ground.has(middle) &&
        onGround.has(leftPersonId, from) &&
        onGround.has(middlePersonId, middle) &&
        nextGround.has(from, middle) &&
        nextGround.has(middle, to) &&
        rightPerson.has(middlePersonId) &&
        groundClear.has(to)
      ) {
        return true
      }
    },
    []
  )
  const leftPersonJump = useCallback(
    (leftPersonId, from, middle, middlePersonId, to) => {
      if (
        leftPersonJumpApplicable(leftPersonId, from, middle, middlePersonId, to)
      ) {
        groundClear(from)
        groundClear.not(to)
        onGround(leftPersonId, to)
        onGround.not(leftPersonId, from)

        rightPersonShouldJump.current = false
        leftPersonShouldJump.current = true

        // TODO
        // Later on, we will omit this so that predicate can control them alone!
        leftPersons.find((lp) => lp.id === leftPersonId).boxId = to

        // TEMP
        // A temporary way to update the component
        setStateKey(getUniqueID())
      }
    },
    []
  )

  const rightPersonMoveApplicable = useCallback((rightPersonId, from, to) => {
    if (
      rightPerson.has(rightPersonId) &&
      ground.has(from) &&
      ground.has(to) &&
      onGround.has(rightPersonId, from) &&
      nextGround.has(to, from) &&
      groundClear.has(to)
    ) {
      return true
    }

    return false
  }, [])
  const rightPersonMove = useCallback((rightPersonId, from, to) => {
    if (rightPersonMoveApplicable(rightPersonId, from, to)) {
      onGround.not(rightPersonId, from)
      onGround(rightPersonId, to)
      groundClear.not(to)
      groundClear(from)
      leftPersonShouldJump.current = true
      rightPersonShouldJump.current = false

      // TODO
      // Later on, we will omit this so that predicate can control them alone!
      rightPersons.find((rp) => rp.id === rightPersonId).boxId = to

      // TEMP
      // A temporary way to update the component
      setStateKey(getUniqueID())
    }
  }, [])

  const rightPersonJumpApplicable = useCallback(
    (rightPersonId, from, middle, middlePersonId, to) => {
      if (
        rightPerson.has(rightPersonId) &&
        ground.has(from) &&
        ground.has(to) &&
        ground.has(middle) &&
        onGround.has(rightPersonId, from) &&
        onGround.has(middlePersonId, middle) &&
        nextGround.has(middle, from) &&
        nextGround.has(to, middle) &&
        leftPerson.has(middlePersonId) &&
        groundClear.has(to)
      ) {
        return true
      }
    },
    []
  )
  const rightPersonJump = useCallback(
    (rightPersonId, from, middle, middlePersonId, to) => {
      if (
        rightPersonJumpApplicable(
          rightPersonId,
          from,
          middle,
          middlePersonId,
          to
        )
      ) {
        onGround.not(rightPersonId, from)
        onGround(rightPersonId, to)
        groundClear.not(to)
        groundClear(from)
        leftPersonShouldJump.current = false
        rightPersonShouldJump.current = true

        // TODO
        // Later on, we will omit this so that predicate can control them alone!
        rightPersons.find((rp) => rp.id === rightPersonId).boxId = to

        // TEMP
        // A temporary way to update the component
        setStateKey(getUniqueID())
      }
    },
    []
  )

  const getMoves = useCallback((findIfMovePossible = false) => {
    let moves = []

    for (let lp of leftPersons) {
      let { boxId, id } = lp
      let nextBox = boxes.find((box) => nextGround.has(boxId, box.id))
      let nextBoxId
      if (nextBox) {
        nextBoxId = nextBox.id
        if (leftPersonMoveApplicable(id, boxId, nextBoxId)) {
          moves.push(['leftPersonMove', [id, boxId, nextBoxId]])
          if (findIfMovePossible) {
            break
          }
        }

        const nextToNextBox = boxes.find((box) =>
          nextGround.has(nextBoxId, box.id)
        )
        const nextRightPerson = rightPersons.find(
          (rp) => rp.boxId === nextBoxId
        )
        if (
          nextToNextBox &&
          nextRightPerson &&
          leftPersonJumpApplicable(
            id,
            boxId,
            nextBoxId,
            nextRightPerson.id,
            nextToNextBox.id
          )
        ) {
          moves.push([
            'leftPersonJump',
            [id, boxId, nextBoxId, nextRightPerson.id, nextToNextBox.id]
          ])
          if (findIfMovePossible) {
            break
          }
        }
      }
    }

    if (!findIfMovePossible || !moves.length) {
      for (let rp of rightPersons) {
        let { boxId, id } = rp
        let prevBox = boxes.find((box) => nextGround.has(box.id, boxId))
        let prevBoxId
        if (prevBox) {
          prevBoxId = prevBox.id
          if (rightPersonMoveApplicable(id, boxId, prevBoxId)) {
            moves.push(['rightPersonMove', [id, boxId, prevBoxId]])
            if (findIfMovePossible) {
              break
            }
          }

          const prevToPrevBox = boxes.find((box) =>
            nextGround.has(box.id, prevBoxId)
          )
          const nextLeftPerson = leftPersons.find(
            (lp) => lp.boxId === prevBoxId
          )
          if (
            prevToPrevBox &&
            nextLeftPerson &&
            rightPersonJumpApplicable(
              id,
              boxId,
              prevBoxId,
              nextLeftPerson.id,
              prevToPrevBox.id
            )
          ) {
            moves.push([
              'rightPersonJump',
              [id, boxId, prevBoxId, nextLeftPerson.id, prevToPrevBox.id]
            ])
            if (findIfMovePossible) {
              break
            }
          }
        }
      }
    }

    if (findIfMovePossible) return moves.length > 0

    return moves
  }, [])

  useEffect(() => {
    if (true) {
      return
    }

    // TEMP
    // Determines if the puzzle is solved or the game is over!
    if (!getMoves(true)) {
      setIsGameOver(true)
      setIsSolving(false)

      let puzzleBlocked = false,
        boxIndex = 0
      for (let person of rightPersons) {
        if (person.boxId !== boxes[boxIndex].id) {
          puzzleBlocked = true
          break
        }
        boxIndex++
      }

      if (!puzzleBlocked) {
        boxIndex = boxes.length - leftPersons.length
        for (let person of leftPersons) {
          if (person.boxId !== boxes[boxIndex].id) {
            puzzleBlocked = true
            break
          }
          boxIndex++
        }
      }

      if (puzzleBlocked) {
        toast.warning('Game over!')
      } else {
        toast.success('Puzzle successfully solved!')
      }
    }
  }, [stateKey])

  return (
    <VisualizerContext.Provider
      value={{
        boxes,
        leftPersons,
        rightPersons,

        leftPerson,
        rightPerson,
        ground,
        onGround,
        nextGround,
        groundClear,

        leftPersonMoveApplicable,
        leftPersonMove,

        rightPersonMoveApplicable,
        rightPersonMove,

        leftPersonJump,

        rightPersonJump
      }}
    >
      <Container className="mt-4">
        <div className="position-relative d-inline-block text-nowrap overflow-visible">
          {boxes.map((box) => {
            return <Box key={box.id} {...box} />
          })}

          {leftPersons.map((lp) => {
            return <LeftSoldier key={lp.id} {...lp} />
          })}

          {rightPersons.map((rp) => {
            return <RightSoldier key={rp.id} {...rp} />
          })}
          <div
            className={'state-identifier' + (isActiveBranch ? ' active' : '')}
            onClick={onActive}
          >
            {stateIdentifier}
          </div>
        </div>
      </Container>
    </VisualizerContext.Provider>
  )
}

export default SwitchingSoldiersPuzzleContainer
