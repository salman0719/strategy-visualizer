import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import Box from './Box'
import VisualizerContext from './Context'
import Tile from './Tile'
import getObj from '../../../Util/getObj'
import { DEFAULT_COLUMNS } from './Constants'
import { BOX_WIDTH, PREDICATE_KEY, ROOT_BRANCH } from '../../../Util/constants'
import { getUniqueID } from '../../../Util/getUniqueId'
import is15PuzzleSolved from './Util/isSolved'

const Puzzle15Container = forwardRef(function ({
  columnCount,
  tiles,
  boxes,
  predicates,
  stateIdentifier,
  onActive,
  onRequestApplyMove,
  isPlaying,
  isAutoPlaying,
  initialMove,

  // TEMP
  rootUsedStates
}, ref) {
  const [puzzleStateId, setPuzzleStateId] = useState(null)
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false)
  const [isPuzzleOver, setIsPuzzleOver] = useState(false)

  columnCount = columnCount || DEFAULT_COLUMNS

  const boxObj = useState({})[0]
  const tileObj = useState({})[0]

  useEffect(() => {
    for (let key in boxObj) {
      delete boxObj[key]
    }
    Object.assign(boxObj, getObj(boxes, 'id'))
  }, [boxes])
  useEffect(() => {
    for (let key in tileObj) {
      delete tileObj[key]
    }
    Object.assign(tileObj, getObj(tiles, 'id'))
  }, [tiles])

  const moveUpApplicable = useCallback(
    (t, from, emp) => {
      // :precondition (and (tile ?t) (position ?from) (position ?emp)
      //                  (adjacentu ?from ?emp) (at ?t ?from) (empty ?emp))

      if (
        predicates.tile.has(t) &&
        predicates.position.has(from) &&
        predicates.position.has(emp) &&
        predicates.adjacentu.has(from, emp) &&
        predicates.at.has(t, from) &&
        predicates.empty.has(emp)
      ) {
        return true
      }

      return false
    },
    [predicates]
  )

  const moveDownApplicable = useCallback(
    (t, from, emp) => {
      // :precondition (and (tile ?t) (position ?from) (position ?emp)
      //                    (adjacentd ?from ?emp) (at ?t ?from) (empty ?emp))

      if (
        predicates.tile.has(t) &&
        predicates.position.has(from) &&
        predicates.position.has(emp) &&
        predicates.adjacentd.has(from, emp) &&
        predicates.at.has(t, from) &&
        predicates.empty.has(emp)
      ) {
        return true
      }

      return false
    },
    [predicates]
  )

  const moveLeftApplicable = useCallback(
    (t, from, emp) => {
      // :precondition (and (tile ?t) (position ?from) (position ?emp)
      //                    (adjacentl ?from ?emp) (at ?t ?from) (empty ?emp))

      if (
        predicates.tile.has(t) &&
        predicates.position.has(from) &&
        predicates.position.has(emp) &&
        predicates.adjacentl.has(from, emp) &&
        predicates.at.has(t, from) &&
        predicates.empty.has(emp)
      ) {
        return true
      }

      return false
    },
    [predicates]
  )

  const moveRightApplicable = useCallback(
    (t, from, emp) => {
      // :precondition (and (tile ?t) (position ?from) (position ?emp)
      //                    (adjacentr ?from ?emp) (at ?t ?from) (empty ?emp))

      if (
        predicates.tile.has(t) &&
        predicates.position.has(from) &&
        predicates.position.has(emp) &&
        predicates.adjacentr.has(from, emp) &&
        predicates.at.has(t, from) &&
        predicates.empty.has(emp)
      ) {
        return true
      }

      return false
    },
    [predicates]
  )

  const moveUp = useCallback(
    (t, from, emp) => {
      if (moveUpApplicable(t, from, emp)) {
        // :effect (and (not (at ?t ?from)) (not (empty ?emp))
        //            (at ?t ?emp) (empty ?from))
        predicates.at.not(t, from)
        predicates.empty.not(emp)
        predicates.at(t, emp)
        predicates.empty(from)

        setPuzzleStateId(getUniqueID())

        return true
      }
    },
    [predicates]
  )

  const moveDown = useCallback(
    (t, from, emp) => {
      if (moveDownApplicable(t, from, emp)) {
        // :effect (and (not (at ?t ?from)) (not (empty ?emp))
        //            (at ?t ?emp) (empty ?from))
        predicates.at.not(t, from)
        predicates.empty.not(emp)
        predicates.at(t, emp)
        predicates.empty(from)

        setPuzzleStateId(getUniqueID())

        return true
      }
    },
    [predicates]
  )

  const moveLeft = useCallback(
    (t, from, emp) => {
      if (moveLeftApplicable(t, from, emp)) {
        // :effect (and (not (at ?t ?from)) (not (empty ?emp))
        //            (at ?t ?emp) (empty ?from))
        predicates.at.not(t, from)
        predicates.empty.not(emp)
        predicates.at(t, emp)
        predicates.empty(from)

        setPuzzleStateId(getUniqueID())

        return true
      }
    },
    [predicates]
  )

  const moveRight = useCallback(
    (t, from, emp) => {
      if (moveRightApplicable(t, from, emp)) {
        // :effect (and (not (at ?t ?from)) (not (empty ?emp))
        //            (at ?t ?emp) (empty ?from))
        predicates.at.not(t, from)
        predicates.empty.not(emp)
        predicates.at(t, emp)
        predicates.empty(from)

        setPuzzleStateId(getUniqueID())

        return true
      }
    },
    [predicates]
  )

  const getMove = useCallback(
    (tileId) => {
      const tile = tileObj[tileId]
      const { id, boxId } = tile
      const box = boxObj[boxId]
      const emptyBox = boxes.find((box) => predicates.empty.has(box.id))

      const t = id,
        from = box.id,
        emp = emptyBox.id

      let fn = null

      if (moveUpApplicable(t, from, emp)) {
        fn = moveUp
      } else if (moveDownApplicable(t, from, emp)) {
        fn = moveDown
      } else if (moveLeftApplicable(t, from, emp)) {
        fn = moveLeft
      } else if (moveRightApplicable(t, from, emp)) {
        fn = moveRight
      }

      if (fn) {
        return fn.bind(null, t, from, emp)
      }

      return false
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

  const getMoves = useCallback((findIfMovePossible) => {
    const emptyBoxId = predicates.empty.getAll().keys().next().value
    const emptyBox = boxObj[emptyBoxId]
    const { connectedBoxIdObj } = emptyBox
    const moves = []
    for (let connectedBoxId in connectedBoxIdObj) {
      let moveFn = connectedBoxIdObj[connectedBoxId]
      let connectedBox = boxObj[connectedBoxId]
      moves.push([moveFn, [connectedBox.tileId, connectedBox.id, emptyBoxId]])
      if (findIfMovePossible) { break }
    }

    return findIfMovePossible ? moves.length > 0 : moves
  }, [predicates])

  const applyMove = useCallback(([moveFn, moveArg]) => {
    const fnMapper = {
      'moveUp': moveUp,
      'moveLeft': moveLeft,
      'moveDown': moveDown,
      'moveRight': moveRight,
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

  const [usedStates] = useState(new Map())
  useEffect(() => {
    usedStates.set(tiles.map((tile) => {
      return tile.number + '-' + tile.boxNumber
    }).join('|'), true)
  }, [puzzleStateId, predicates])

  useImperativeHandle(ref, () => ({
    getMoves,
    applyMove,
    getUsedStates: () => (usedStates),
    isSolved: () => (isPuzzleSolved),
    isOver: () => (isPuzzleOver)
  }))

  window.PREDICATES = window.PREDICATES || {}
  window.PREDICATES[stateIdentifier] = predicates

  window.APPLY_MOVE = window.APPLY_MOVE || {}
  window.APPLY_MOVE[stateIdentifier] = applyMove

  window.GET_MOVES = window.GET_MOVES || {}
  window.GET_MOVES[stateIdentifier] = getMoves

  // TEMP
  // End


  useEffect(() => {
    const isSolved = is15PuzzleSolved({ boxes, tiles })
    const isOver = !getMoves(true)

    setIsPuzzleSolved(isSolved)
    setIsPuzzleOver(isOver)
  }, [puzzleStateId, predicates])

  const [initialMoveProcessed, setInitialMoveProcessed] = useState(!initialMove)
  useEffect(() => {
    if (initialMove) {
      applyMove(initialMove)
      setInitialMoveProcessed(true)
    }
  }, [])

  if (!initialMoveProcessed) { return null }

  // NOTE
  // Not displaying traversed states
  // if (rootUsedStates?.has(tiles.map((tile) => {
  //   return tile.number + '-' + tile.boxNumber
  // }).join('|'))) {
  //   return null
  // }

  return (
    <VisualizerContext.Provider
      value={{
        boxes,
        tiles,
        getMove,

        // TEMP
        // Use efficient technique
        activeTileId: initialMove?.[2]?.activeTileId
      }}
    >
      <div
        className={'position-relative d-inline-block overflow-visible fifteen-puzzle-container mt-2 mb-3 mx-2 align-top' + (isPuzzleSolved ? ' puzzle-solved' : isPuzzleOver ? ' puzzle-over' : '')}
        style={{ width: columnCount * BOX_WIDTH }}
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
            stateIdentifier !== ROOT_BRANCH && isPlaying && onRequestApplyMove(stateIdentifier)
          }
        } : null)}
      >
        {boxes.map((box) => {
          return <Box key={box.id} {...box} />
        })}

        <div className={isPlaying || isAutoPlaying ? 'pe-none' : null}>
          {tiles.map((tile) => {
            return <Tile key={tile.id} {...tile} />
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
          <div className='mt-1' style={{ width: columnCount * BOX_WIDTH }}>
            {typeof initialMove[2].message === 'function' ?
              initialMove[2].message({ tiles, boxes, tileObj, boxObj, predicates }) : null}
          </div>
        }
        {/* TEMP */}
        {/* END */}
      </div>
    </VisualizerContext.Provider>
  )
})

export default Puzzle15Container
