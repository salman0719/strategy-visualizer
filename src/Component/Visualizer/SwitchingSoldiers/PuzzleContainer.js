import '../../../switching-soldiers.css'
import React, { useCallback, useRef } from 'react'
import Box from './Box'
import VisualizerContext from './Context'
import LeftSoldier from './LeftSoldier'
import RightSoldier from './RightSoldier'
import { useForceUpdate } from '../../../Util/hooks'

const SwitchingSoldiersPuzzleContainer = function ({
  leftPersons,
  rightPersons,
  boxes,
  predicates,
  stateIdentifier,
  onActive
}) {
  const forceUpdate = useForceUpdate()

  const { ground, groundClear, leftPerson,
    nextGround, onGround, rightPerson } = predicates

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
  }, [predicates])

  const leftPersonMove = useCallback((leftPersonId, from, to) => {
    if (leftPersonMoveApplicable(leftPersonId, from, to)) {
      onGround.not(leftPersonId, from)
      onGround(leftPersonId, to)
      groundClear.not(to)
      groundClear(from)

      leftPersonShouldJump.current = false
      rightPersonShouldJump.current = true

      forceUpdate()
    }
  }, [predicates])

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
    [predicates]
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

        forceUpdate()
      }
    },
    [predicates]
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
  }, [predicates])

  const rightPersonMove = useCallback((rightPersonId, from, to) => {
    if (rightPersonMoveApplicable(rightPersonId, from, to)) {
      onGround.not(rightPersonId, from)
      onGround(rightPersonId, to)
      groundClear.not(to)
      groundClear(from)

      leftPersonShouldJump.current = true
      rightPersonShouldJump.current = false

      forceUpdate()
    }
  }, [predicates])

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
    [predicates]
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

        forceUpdate()
      }
    },
    [predicates]
  )

  const onFocus = useCallback(() => {
    onActive(stateIdentifier)
  }, [stateIdentifier])

  const onBlur = useCallback(() => {
    onActive(null)
  }, [])

  return (
    <VisualizerContext.Provider
      value={{
        boxes,
        leftPersons,
        rightPersons,

        // TEMP
        // TODO
        // Eliminate the need to use predicates inside the item's component
        ...predicates,

        leftPersonMoveApplicable,
        leftPersonMove,

        rightPersonMoveApplicable,
        rightPersonMove,

        leftPersonJump,

        rightPersonJump
      }}
    >
      <div
        className='position-relative d-inline-block overflow-visible switching-soldiers-container mt-2 mb-3 mx-2'
        tabIndex={-1}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <div>
          {boxes.map((box) => {
            return <Box key={box.id} {...box} />
          })}
        </div>

        {leftPersons.map((lp) => {
          return <LeftSoldier key={lp.id} {...lp} />
        })}

        {rightPersons.map((rp) => {
          return <RightSoldier key={rp.id} {...rp} />
        })}
        <div
          className='d-none state-identifier'
          onClick={onActive}
        >
          {stateIdentifier}
        </div>
      </div>
    </VisualizerContext.Provider>
  )
}

export default SwitchingSoldiersPuzzleContainer
