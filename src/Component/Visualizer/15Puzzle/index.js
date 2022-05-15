import '../../../15-puzzle.css'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Container, Button, Col, Form } from 'react-bootstrap'
import initialize from './Util/Initialize'
import Puzzle15Container from './PuzzleContainer'
import { useCopyControl, useDocumentTitle } from '../../../Util/hooks'
import { DEFAULT_COLUMNS, DEFAULT_ROWS } from './Constants'
import { ROOT_BRANCH, PREDICATE_KEY } from '../../../Util/constants'
import createPuzzleCopy from '../../../Util/createPuzzleCopy'
import { getUniqueID } from '../../../Util/getUniqueId'

// TODO
// Move up to common source
const DEFAULT_AUTO_PLAY_INTERVAL = 2000

const Puzzle15Visualizer = function () {
  useDocumentTitle('15 Puzzle')

  const rootPuzzleRef = useRef(null)
  const [resetToken, setResetToken] = useState(null)
  const [formValues, setFormValues] = useState({
    columnCount: DEFAULT_COLUMNS,
    rowCount: DEFAULT_ROWS
  })
  const { columnCount, rowCount } = formValues
  const [puzzleItem, setPuzzleItem] = useState(null)
  const { boxes, tiles } = puzzleItem || { boxes: [], tiles: [] }
  const predicates = puzzleItem?.[PREDICATE_KEY] || {}
  const { copiedItems, set: setCopyControl, reset: resetCopyControl } = useCopyControl({ item: puzzleItem, copy: createPuzzleCopy })
  const [autoPlayInterval, setAutoPlayInterval] = useState(DEFAULT_AUTO_PLAY_INTERVAL)

  const updatePuzzleItem = useCallback((initArg) => {
    setPuzzleItem(initialize(initArg))
    setIsPlaying(false)
    setIsAutoPlaying(false)
    resetCopyControl()
  }, [])

  const reset = useCallback(() => {
    setFormValues({ ...formValues })
    setIsPlaying(false)
    setIsAutoPlaying(false)
    setResetToken(getUniqueID())
  }, [])

  const updateFormValue = useCallback((e) => {
    const { target: { name, value } } = e
    setFormValues({ ...formValues, [name]: value })
  }, [formValues])

  const updateAutoPlayInterval = useCallback((e) => {
    const value = parseFloat(e.target.value)
    setAutoPlayInterval(value ? value : DEFAULT_AUTO_PLAY_INTERVAL)
  }, [])

  const onActive = useCallback((stateIdentifier) => {
    setCopyControl.activeBranch(stateIdentifier)
  }, [])

  const onRequestApplyMove = useCallback((stateIdentifier) => {
    const newPuzzleItem = { ...copiedItems.find((item) => (item.stateIdentifier === stateIdentifier)) }

    // TODO
    // This adding and removing `stateIdentifier` business means that if we want to use
    // it elsewhere, we always have to manually add/remove this - which makes it easy
    // to make a mistake. Lets adopt another policy!
    delete newPuzzleItem.stateIdentifier

    setPuzzleItem(createPuzzleCopy(newPuzzleItem))
    resetCopyControl()

    // TEMP
    if (isPlaying) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('display-moves'))
      }, 500)
    }
  }, [copiedItems, isPlaying, isAutoPlaying])

  useEffect(() => {
    updatePuzzleItem({ columnCount, rowCount })
  }, [columnCount, rowCount, resetToken])

  // TEMP
  const getBranches = useCallback(() => {
    const moves = rootPuzzleRef.current.getMoves()

    // moves.sort((fst, snd) => {
    //   let fstValue = 0, sndValue = 0
    //   if (['leftPersonJump', 'rightPersonJump'].includes(fst[0])) {
    //     fstValue = 3
    //   } else {
    //     fstValue = fst[2].evenDistanceCount || 0
    //   }

    //   if (['leftPersonJump', 'rightPersonJump'].includes(snd[0])) {
    //     sndValue = 3
    //   } else {
    //     sndValue = snd[2].evenDistanceCount || 0
    //   }

    //   return fstValue > sndValue ? -1 : 1
    // })

    // let highestValue = moves.length ? moves[0][2].evenDistanceCount : 0
    // if (!highestValue && highestValue !== 0) { highestValue = 3 }

    // TODO
    // Extract the moves implemented inside the PuzzleContainer and take them
    // to a common source for this puzzle

    return moves.map((move, index) => {
      const moveName = move[0]

      return {
        ...createPuzzleCopy(puzzleItem),
        stateIdentifier: 'move-' + index + '-' + getUniqueID(),
        initialMove: [
          moveName, move[1],
          {
            message: ({ tiles, boxObj, predicates }) => {
              const getDistance = (items) => {
                return items.reduce((prev, cur) => {
                  return prev + Math.abs(cur.posX - cur.expectedPosX) +
                    Math.abs(cur.posY - cur.expectedPosY)
                }, 0)
              }

              const slices = [
                [tiles.slice(0, 2)],
                [tiles.slice(3, 4), [3]],
                [tiles.slice(2, 3), [7]],
                [tiles.slice(2, 4)]
              ]

              let sliceResponse = null
              slices.find((slice, i) => {
                let items = slice[0],
                  pos = slice[1]

                if (items.find((tile, index) => {
                  return tile.boxNumber !== (pos ? pos[index] : i * 2 + index + 1)
                })) {
                  // console.log(items.map((item) => (item.number)).join('-') + ' not properly placed!')
                  const emptyBoxId = predicates.empty.getAll().keys().next().value
                  const emptyBox = boxObj[emptyBoxId]
                  const emptyBoxPosX = emptyBox.posX, emptyBoxPosY = emptyBox.posY

                  let minDistance = Infinity
                  items.forEach((item) => {
                    let dist = Math.abs(item.posX - emptyBoxPosX) + Math.abs(item.posY - emptyBoxPosY)
                    if (dist < minDistance) { minDistance = dist }
                  })

                  const distance = getDistance(items) + minDistance - 1

                  sliceResponse = 'Tile `' + items.map((item) => (item.number)).join('-') + '`, Distance - `' + distance + '`'
                  return true
                }

                return false
              })

              if (sliceResponse) { return sliceResponse }

              // for (let i = 0; i < 4; i++) {
              //   let items = tiles.slice(i * 2, i * 2 + 2)
              //   if (items.find((tile, index) => {
              //     return tile.boxNumber !== i * 2 + index + 1
              //   })) {
              //     console.log(items.map((item) => (item.number)).join('-') + ' not properly placed!')
              //     const emptyBoxId = predicates.empty.getAll().keys().next().value
              //     const emptyBox = boxObj[emptyBoxId]
              //     const emptyBoxPosX = emptyBox.posX, emptyBoxPosY = emptyBox.posY

              //     const fstDistance = Math.abs(items[0].posX - emptyBoxPosX) + Math.abs(items[0].posY - emptyBoxPosY)
              //     const sndDistance = Math.abs(items[1].posX - emptyBoxPosX) + Math.abs(items[1].posY - emptyBoxPosY)

              //     const distance = getDistance(items) + (fstDistance > sndDistance ? sndDistance : fstDistance) - 1

              //     return 'Tile `' + items.map((item) => (item.number)).join('-') + '`, Distance - `' + distance + '`'
              //   }
              // }

              // const firstRowTiles = tiles.slice(0, 4)
              // // TODO
              // // Based on goal, this also needs to be adjusted
              // if (firstRowTiles.find((tile, index) => {
              //   return tile.boxNumber !== index + 1
              // })) {
              //   console.log('1-2-3-4 not properly placed!')
              //   return 'First Row, Manhattan Distance - `' + getDistance(firstRowTiles) + '`'
              // }

              const manhattanDistance = getDistance(tiles)

              return 'Manhattan Distance - `' + manhattanDistance + '`'
            }, success: false, activeTileId: move[1][0]
          }
        ]
      }
    })
  }, [puzzleItem])

  useEffect(() => {
    const process = () => {
      setCopyControl.copiedItems(getBranches())
    }

    const listener = (e) => {
      if (e.ctrlKey) {
        // Pressing "ctrl + p"
        if (e.keyCode === 80) {
          // TODO
          // Prevent when `isAutoPlaying` is `true`
          process()
        } else {
          return
        }

        e.preventDefault()
      }
    }

    const displayMovesListener = (e) => {
      process()
    }

    window.addEventListener('keydown', listener)
    window.addEventListener('display-moves', displayMovesListener)
    return () => {
      window.removeEventListener('keydown', listener)
      window.removeEventListener('display-moves', displayMovesListener)
    }
  }, [puzzleItem])

  const [isPlaying, setIsPlaying] = useState(false)
  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying)
    !isPlaying ? window.dispatchEvent(new CustomEvent('display-moves')) : resetCopyControl()
  }, [isPlaying])

  const [hideDisplay, setHideDisplay] = useState(false)
  const toggleHideDisplay = useCallback(() => {
    setHideDisplay(!hideDisplay)
  }, [hideDisplay])

  const copyContainerRef = useRef(null)
  const autoPlayingRef = useRef(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(!isAutoPlaying)
    isAutoPlaying && resetCopyControl()
  }, [isAutoPlaying])
  useEffect(() => {
    if (isAutoPlaying) {
      const token = getUniqueID()
      autoPlayingRef.current = token

      if (hideDisplay) {
        resetCopyControl()
      } else {
        !copyContainerRef.current.firstElementChild && window.dispatchEvent(new CustomEvent('display-moves'))
      }
      let applyMove = true

      const fn = () => {
        if (token === autoPlayingRef.current) {
          if (applyMove) {
            const branches = getBranches()
            if (branches.length) {
              let move = branches[0].initialMove
              move = [move[0], move[1]]
              rootPuzzleRef.current.applyMove(move)
            } else {
              setIsAutoPlaying(false)
            }
            applyMove = false
          } else {
            window.dispatchEvent(new CustomEvent('display-moves'))
            applyMove = true
          }

          if (hideDisplay) {
            applyMove = true
            setTimeout(fn, autoPlayInterval)
          } else {
            if (applyMove) {
              setTimeout(fn, autoPlayInterval)
            } else {
              setTimeout(fn, 300)
            }
          }

        }
      }

      window.setTimeout(fn, autoPlayInterval)

    } else {
      autoPlayingRef.current = null
    }
  }, [isAutoPlaying, autoPlayInterval, puzzleItem, hideDisplay])

  // TEMP
  // END

  if (!puzzleItem) { return null }

  return (
    <Container className='mt-5'>
      <div className='text-left'>
        <Button
          onClick={reset}
          size='sm'
          variant='secondary'
          className='mb-2 mx-1 position-relative test'
        >
          Reset
        </Button>

        {!isAutoPlaying &&
          <Button
            onClick={togglePlay}
            size='sm'
            variant='primary'
            className='mb-2 mx-1 position-relative'
          >
            {isPlaying ? 'Stop' : 'Play'}
          </Button>}

        {null && !isPlaying &&
          <Button
            onClick={toggleAutoPlay}
            size='sm'
            variant='success'
            className='mb-2 mx-1 position-relative'
          >
            {isAutoPlaying ? 'Stop Auto-Play' : 'Auto-Play'}
          </Button>}
      </div>

      <div>
        <div className='mb-2 mx-1 d-inline-block w-200'>
          <label className='control-label'>Column Count</label>
          <Form.Control
            name='columnCount'
            value={columnCount}
            onChange={updateFormValue}
            placeholder="Column Count"
          />
        </div>

        <div className='mb-2 mx-1 d-inline-block w-200'>
          <label className='control-label'>Row Count</label>
          <Form.Control
            name='rowCount'
            value={rowCount}
            onChange={updateFormValue}
            placeholder="Row Count"
          />
        </div>

        {null && <div className='mb-2 mx-1 d-inline-block w-200'>
          <label className='control-label'>Auto Play Interval</label>
          <Form.Control
            name='autoPlayInterval'
            value={autoPlayInterval}
            onChange={updateAutoPlayInterval}
            placeholder='Auto Play Interval'
          />
        </div>}

        {null && <div className='mb-2 mx-1 d-inline-block w-200 text-start'>
          <Form.Check
            type='switch'
            name='hideDisplay'
            label='Hide Display'
            className='d-inline-block'
            checked={hideDisplay}
            onChange={toggleHideDisplay}
            disabled={isAutoPlaying}
          />
        </div>}

      </div>

      <Puzzle15Container
        ref={rootPuzzleRef}
        columnCount={columnCount}
        boxes={boxes}
        tiles={tiles}
        predicates={predicates}
        stateIdentifier={ROOT_BRANCH}
        onActive={onActive}
        isPlaying={isPlaying}
        isAutoPlaying={isAutoPlaying}
      />

      <Col ref={copyContainerRef} className='justify-content-center m-auto'>
        {copiedItems.map((item) => {
          const { boxes, tiles, stateIdentifier } = item
          const predicates = item[PREDICATE_KEY]

          // TEMP

          const initialMove = item.initialMove

          // TEMP
          // END

          return (
            <Puzzle15Container
              key={stateIdentifier}
              columnCount={columnCount}
              boxes={boxes}
              tiles={tiles}
              predicates={predicates}
              stateIdentifier={stateIdentifier}
              onActive={onActive}
              onRequestApplyMove={onRequestApplyMove}
              isPlaying={isPlaying}
              isAutoPlaying={isAutoPlaying}

              // TEMP
              initialMove={initialMove}

              // TEMP
              rootUsedStates={rootPuzzleRef.current?.getUsedStates() || new Map()}
            />
          )
        })}
      </Col>
    </Container >
  )
}

export default Puzzle15Visualizer
