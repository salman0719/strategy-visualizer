import '../../../switching-soldiers.css'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Box from './Box'
import VisualizerContext from './Context'
import LeftSoldier from './LeftSoldier'
import RightSoldier from './RightSoldier'

// TEMP
import toast from '../../Toast'
import { BOX_WIDTH, ROOT_BRANCH } from '../../../Util/constants'
import getObj from '../../../Util/getObj'
import { getUniqueID } from '../../../Util/getUniqueId'
import isSwitchingSoldiersSolved from './Util/isSolved'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'

const SwitchingSoldiersPuzzleContainer = forwardRef(function ({
  initialMove,
  leftPersons,
  rightPersons,
  boxes,
  predicates,
  stateIdentifier,
  onRequestUpdate,
  onActive,
  isPlaying,
  isAutoPlaying
}, ref) {
  const [puzzleStateId, setPuzzleStateId] = useState(null)
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false)
  const [isPuzzleOver, setIsPuzzleOver] = useState(false)

  const { ground, groundClear, leftPerson,
    nextGround, onGround, rightPerson,
    leftNeighbourEvenDistance, rightNeighbourEvenDistance } = predicates

  const leftPersonShouldJump = useRef(false)
  const rightPersonShouldJump = useRef(false)

  const leftPersonObj = useState({})[0]
  const rightPersonObj = useState({})[0]

  useEffect(() => {
    for (let key in leftPersonObj) {
      delete leftPersonObj[key]
    }
    Object.assign(leftPersonObj, getObj(leftPersons, 'id'))
  }, [leftPersons])
  useEffect(() => {
    for (let key in rightPersonObj) {
      delete rightPersonObj[key]
    }
    Object.assign(rightPersonObj, getObj(rightPersons, 'id'))
  }, [rightPersons])

  // Collection of utility functions
  const getEvenDistanceCount = useCallback((id) => {
    const person = id in leftPersonObj ? leftPersonObj[id] : rightPersonObj[id]
    const { leftNeighbourId, rightNeighbourId } = person
    let distance = 0
    if (leftNeighbourId) { distance += leftNeighbourEvenDistance.has(id) ? 1 : -1 }
    if (rightNeighbourId) { distance += rightNeighbourEvenDistance.has(id) ? 1 : -1 }

    return distance
  }, [predicates])

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

  // TODO
  // Send leftNeighbourId & rightNeighbourId as parameters
  const leftPersonMove = useCallback((leftPersonId, from, to) => {
    if (leftPersonMoveApplicable(leftPersonId, from, to)) {
      onGround.not(leftPersonId, from)
      onGround(leftPersonId, to)
      groundClear.not(to)
      groundClear(from)

      // TODO
      // The following predicate change also needs to closely emulate PDDL
      const leftPerson = leftPersonObj[leftPersonId]
      const { leftNeighbourId, rightNeighbourId } = leftPerson
      if (leftNeighbourId) {
        if (rightNeighbourEvenDistance.has(leftNeighbourId)) {
          rightNeighbourEvenDistance.not(leftNeighbourId)
        } else {
          rightNeighbourEvenDistance(leftNeighbourId)
        }

        if (leftNeighbourEvenDistance.has(leftPersonId)) {
          leftNeighbourEvenDistance.not(leftPersonId)
        } else {
          leftNeighbourEvenDistance(leftPersonId)
        }
      }

      if (rightNeighbourId) {
        if (leftNeighbourEvenDistance.has(rightNeighbourId)) {
          leftNeighbourEvenDistance.not(rightNeighbourId)
        } else {
          leftNeighbourEvenDistance(rightNeighbourId)
        }

        if (rightNeighbourEvenDistance.has(leftPersonId)) {
          rightNeighbourEvenDistance.not(leftPersonId)
        } else {
          rightNeighbourEvenDistance(leftPersonId)
        }
      }

      leftPersonShouldJump.current = false
      rightPersonShouldJump.current = true

      setPuzzleStateId(getUniqueID())

      return true
    }

    return false
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

        setPuzzleStateId(getUniqueID())


        return true
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

  // TODO
  // Send leftNeighbourId & rightNeighbourId as parameters
  const rightPersonMove = useCallback((rightPersonId, from, to) => {
    if (rightPersonMoveApplicable(rightPersonId, from, to)) {
      onGround.not(rightPersonId, from)
      onGround(rightPersonId, to)
      groundClear.not(to)
      groundClear(from)

      // TODO
      // The following predicate change also needs to closely emulate PDDL
      const rightPerson = rightPersonObj[rightPersonId]
      const { leftNeighbourId, rightNeighbourId } = rightPerson
      if (leftNeighbourId) {
        if (rightNeighbourEvenDistance.has(leftNeighbourId)) {
          rightNeighbourEvenDistance.not(leftNeighbourId)
        } else {
          rightNeighbourEvenDistance(leftNeighbourId)
        }

        if (leftNeighbourEvenDistance.has(rightPersonId)) {
          leftNeighbourEvenDistance.not(rightPersonId)
        } else {
          leftNeighbourEvenDistance(rightPersonId)
        }
      }

      if (rightNeighbourId) {
        if (leftNeighbourEvenDistance.has(rightNeighbourId)) {
          leftNeighbourEvenDistance.not(rightNeighbourId)
        } else {
          leftNeighbourEvenDistance(rightNeighbourId)
        }

        if (rightNeighbourEvenDistance.has(rightPersonId)) {
          rightNeighbourEvenDistance.not(rightPersonId)
        } else {
          rightNeighbourEvenDistance(rightPersonId)
        }
      }

      leftPersonShouldJump.current = true
      rightPersonShouldJump.current = false

      setPuzzleStateId(getUniqueID())
      return true
    }

    return false
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

        setPuzzleStateId(getUniqueID())
        return true
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

  // TEMP
  const getMoves = useCallback((findIfMovePossible = false) => {
    let moves = []

    for (let lp of leftPersons) {
      let { boxId, id } = lp
      let nextBox = boxes.find((box) => nextGround.has(boxId, box.id))
      let nextBoxId
      if (nextBox) {
        nextBoxId = nextBox.id
        if (leftPersonMoveApplicable(id, boxId, nextBoxId)) {
          moves.push(['leftPersonMove', [id, boxId, nextBoxId], {
            evenDistanceCount: -getEvenDistanceCount(id)
          }])
          if (findIfMovePossible) { break }
        }

        // TODO
        // We probably can cache relevant values inside the `initialize` in a way
        // that will help to skip these computational steps
        const nextToNextBox = boxes.find((box) =>
          nextGround.has(nextBoxId, box.id)
        )
        const nextRightPerson = rightPersons.find((rp) => (rp.boxId === nextBoxId))
        if (nextToNextBox && nextRightPerson &&
          leftPersonJumpApplicable(
            id, boxId, nextBoxId,
            nextRightPerson.id, nextToNextBox.id
          )
        ) {
          moves.push(['leftPersonJump', [id, boxId, nextBoxId, nextRightPerson.id, nextToNextBox.id], {}])
          if (findIfMovePossible) { break }
        }
      }
    }

    if (!findIfMovePossible || !moves.length) {
      for (let rp of rightPersons) {
        let { boxId, id } = rp
        let prevBox = boxes.find((box) => (nextGround.has(box.id, boxId)))
        let prevBoxId
        if (prevBox) {
          prevBoxId = prevBox.id
          if (rightPersonMoveApplicable(id, boxId, prevBoxId)) {
            moves.push(['rightPersonMove', [id, boxId, prevBoxId], {
              evenDistanceCount: -getEvenDistanceCount(id)
            }])
            if (findIfMovePossible) { break }
          }

          const prevToPrevBox = boxes.find((box) => (nextGround.has(box.id, prevBoxId)))
          const nextLeftPerson = leftPersons.find((lp) => (lp.boxId === prevBoxId))
          if (prevToPrevBox && nextLeftPerson &&
            rightPersonJumpApplicable(
              id, boxId, prevBoxId,
              nextLeftPerson.id, prevToPrevBox.id
            )
          ) {
            moves.push(['rightPersonJump', [id, boxId, prevBoxId, nextLeftPerson.id, prevToPrevBox.id], {}])
            if (findIfMovePossible) { break }
          }
        }
      }
    }

    if (findIfMovePossible) { return moves.length > 0 }

    return moves
  }, [predicates])

  const applyMove = useCallback(([moveFn, moveArg]) => {
    const fnMapper = {
      'leftPersonMove': leftPersonMove,
      'rightPersonMove': rightPersonMove,
      'leftPersonJump': leftPersonJump,
      'rightPersonJump': rightPersonJump,
    }

    const fn = fnMapper[moveFn]

    if (!fn) {
      toast.error(`Invalid move - '${moveFn}' selected.`)
    } else {
      if (fn.apply(null, moveArg) === false) {
        toast.error(`Attempted '${moveFn}', which is not an applicable move! Please check the console to check out applied arguments.`)
        console.error('Move name -', moveFn)
        console.error('Applied arguments', moveArg)
      }
    }
  }, [predicates])

  useImperativeHandle(ref, () => ({
    getMoves,
    applyMove,
    isSolved: () => (isPuzzleSolved),
    isOver: () => (isPuzzleOver)
  }))

  useEffect(() => {
    initialMove && applyMove(initialMove)
  }, [])

  window.PREDICATES = window.PREDICATES || {}
  window.PREDICATES[stateIdentifier] = predicates

  window.APPLY_MOVE = window.APPLY_MOVE || {}
  window.APPLY_MOVE[stateIdentifier] = applyMove

  window.GET_MOVES = window.GET_MOVES || {}
  window.GET_MOVES[stateIdentifier] = getMoves

  // TEMP
  // END

  useEffect(() => {
    const isSolved = isSwitchingSoldiersSolved({ boxes, leftPersons, rightPersons })
    const isOver = !getMoves(true)

    setIsPuzzleSolved(isSolved)
    setIsPuzzleOver(isOver)
  }, [puzzleStateId, predicates])

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

        rightPersonJump,

        // TEMP
        // Use efficient technique
        activePersonId: initialMove?.[2]?.activePersonId
      }}
    >
      <div
        className={'position-relative d-inline-block overflow-visible switching-soldiers-container mt-2 mb-3 mx-2 align-top' + (isPuzzleSolved ? ' puzzle-solved' : isPuzzleOver ? ' puzzle-over' : '')}
        tabIndex={-1}
        onFocus={onFocus}
        onBlur={onBlur}

        // TEMP
        {...(isPlaying || isAutoPlaying ? {
          tabIndex: null,
          onFocus: null,
          onBlur: null,
          onClick: (e) => {
            document.activeElement.blur()
            isPlaying && onRequestUpdate(stateIdentifier)
          }
        } : null)}
      >
        <div className={'puzzle-box text-nowrap' + (stateIdentifier !== ROOT_BRANCH && initialMove?.[2]?.success ? ' success' : '')}>
          {boxes.map((box) => {
            return <Box key={box.id} {...box} />
          })}
        </div>

        <div className={'text-nowrap' + (stateIdentifier !== ROOT_BRANCH ? ' pe-none' : '')}>
          {leftPersons.map((lp) => {
            return <LeftSoldier key={lp.id} {...lp} />
          })}
        </div>

        <div className={'text-nowrap' + (stateIdentifier !== ROOT_BRANCH ? ' pe-none' : '')}>
          {rightPersons.map((rp) => {
            return <RightSoldier key={rp.id} {...rp} />
          })}
        </div>
        <div
          className='d-none state-identifier'
          onClick={onActive}
        >
          {stateIdentifier}
        </div>
        {/* TEMP */}
        {initialMove?.[2]?.message &&
          <div className='mt-4' style={{ width: boxes.length * BOX_WIDTH }}>
            {initialMove[2].message}
          </div>
        }
        {/* TEMP */}
        {/* END */}
        {isPuzzleSolved ?
          <FontAwesomeIcon icon={faCheckCircle} className='puzzle-solved-icon' /> :
          isPuzzleOver ?
            <FontAwesomeIcon icon={faTimesCircle} className='puzzle-over-icon' /> : null
        }
      </div>
    </VisualizerContext.Provider >
  )
})

export default SwitchingSoldiersPuzzleContainer
