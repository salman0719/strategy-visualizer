import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Box from './Box'
import VisualizerContext from './Context'
import Tile from './Tile'
import getObj from '../../../Util/getObj'
import { DEFAULT_COLUMNS } from './Constants'
import { BOX_WIDTH, ROOT_BRANCH } from '../../../Util/constants'
import { getUniqueID } from '../../../Util/getUniqueId'
import is15PuzzleSolved from './Util/isSolved'
import { getActions, getPreconditions } from './Util/domain'

// TODO
// Rename `getPreconditions` to `getValidatePreconditions`

const Puzzle15Container = forwardRef(function ({
  columnCount,
  tiles,
  boxes,
  predicates,
  stateIdentifier,
  onActive,
  onRequestApplyMove,
  isPlaying,

  // TEMP
  // NOTE
  // Maybe we need to ponder the implementation of the following attribute in 
  // a different way
  providerExtension,
}, ref) {
  const isRootBranch = stateIdentifier === ROOT_BRANCH
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

  const initPreconditions = useState(() => {
    return getPreconditions(predicates)
  })[0]
  const preconditionRef = useRef(initPreconditions)
  useEffect(() => {
    preconditionRef.current = getPreconditions(predicates)
  }, [predicates])

  const initActions = useState(() => {
    return getActions(predicates)
  })[0]
  const actionRef = useRef(initActions)
  useEffect(() => {
    actionRef.current = getActions(predicates)
  }, [predicates])

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

      const curPreconditions = preconditionRef.current
      const curActions = actionRef.current

      if (curPreconditions.moveUp(t, from, emp)) {
        fn = curActions.moveUp
      } else if (curPreconditions.moveDown(t, from, emp)) {
        fn = curActions.moveDown
      } else if (curPreconditions.moveLeft(t, from, emp)) {
        fn = curActions.moveLeft
      } else if (curPreconditions.moveRight(t, from, emp)) {
        fn = curActions.moveRight
      }

      if (fn) {
        return () => {
          if (fn(t, from, emp)) {
            setPuzzleStateId(getUniqueID())
            isRootBranch && isPlaying && onRequestApplyMove()
          }
        }
      }

      return false
    },
    [predicates, isPlaying]
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
    const { moveUp, moveLeft, moveDown, moveRight } = actionRef.current

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

  useImperativeHandle(ref, () => ({
    getMoves,
    applyMove,
    // TODO
    // Move to a common source like it was done with getActions & getPreconditions
    // isSolved: () => (isPuzzleSolved),
    // isOver: () => (isPuzzleOver)
  }), [predicates])

  // window.PREDICATES = window.PREDICATES || {}
  // window.PREDICATES[stateIdentifier] = predicates

  // window.APPLY_MOVE = window.APPLY_MOVE || {}
  // window.APPLY_MOVE[stateIdentifier] = applyMove

  // window.GET_MOVES = window.GET_MOVES || {}
  // window.GET_MOVES[stateIdentifier] = getMoves

  // TEMP
  // End


  useEffect(() => {
    const isSolved = is15PuzzleSolved({ boxes, tiles })
    const isOver = !getMoves(true)

    setIsPuzzleSolved(isSolved)
    setIsPuzzleOver(isOver)
  }, [puzzleStateId, predicates])

  return (
    <VisualizerContext.Provider
      value={{
        boxes,
        tiles,
        getMove,

        // TEMP
        // NOTE
        // Domain specific info for the time being
        ...providerExtension
      }}
    >
      <div
        className={'position-relative d-inline-block overflow-visible fifteen-puzzle-container mt-2 mb-3 mx-2 align-top' + (isPuzzleSolved ? ' puzzle-solved' : isPuzzleOver ? ' puzzle-over' : '')}
        style={{ width: columnCount * BOX_WIDTH }}
        tabIndex={-1}
        onFocus={onFocus}
        onBlur={onBlur}

        // TEMP
        {...(!isRootBranch && isPlaying ? {
          tabIndex: null,
          onFocus: null,
          onBlur: null,
          onClick: (e) => {
            document.activeElement.blur()
            isPlaying && onRequestApplyMove(stateIdentifier)
          }
        } : null)}
      >
        {boxes.map((box) => {
          return <Box key={box.id} {...box} />
        })}

        <div className={!isRootBranch && isPlaying ? 'pe-none' : null}>
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

        {providerExtension?.message &&
          <div className='mt-1' style={{ width: columnCount * BOX_WIDTH }}>
            {providerExtension?.message}
          </div>
        }
      </div>
    </VisualizerContext.Provider>
  )
})

export default Puzzle15Container
