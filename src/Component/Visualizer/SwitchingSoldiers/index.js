import '../../../switching-soldiers.css'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Container, Button, Form, Col } from 'react-bootstrap'
import initialize from './Util/Initialize'
import { DEFAULT_EMPTY_GROUND_COUNT, DEFAULT_PERSON_COUNT } from './Constants'
import createPuzzleCopy from '../../../Util/createPuzzleCopy'
import SwitchingSoldiersPuzzleContainer from './PuzzleContainer'
import { useCopyControl, useDocumentTitle } from '../../../Util/hooks'
import { ROOT_BRANCH, PREDICATE_KEY } from '../../../Util/constants'
import { getUniqueID } from '../../../Util/getUniqueId'

// TODO
// Move up to common source
const DEFAULT_AUTO_PLAY_INTERVAL = 2000

const SwitchingSoldiersVisualizer = function () {
  useDocumentTitle('Switching Soldiers')

  const rootPuzzleRef = useRef(null)
  const [resetToken, setResetToken] = useState(null)
  const [formValues, setFormValues] = useState({
    leftPersonCount: DEFAULT_PERSON_COUNT,
    rightPersonCount: DEFAULT_PERSON_COUNT,
    emptyGroundCount: DEFAULT_EMPTY_GROUND_COUNT
  })
  const { leftPersonCount, rightPersonCount, emptyGroundCount } = formValues
  const [puzzleItem, setPuzzleItem] = useState(null)
  const { boxes, leftPersons, rightPersons } = puzzleItem || { boxes: [], leftPersons: [], rightPersons: [] }
  const predicates = puzzleItem?.[PREDICATE_KEY] || {}
  const { copiedItems, set: setCopyControl, reset: resetCopyControl } = useCopyControl({ item: puzzleItem, copy: createPuzzleCopy })
  const [autoPlayInterval, setAutoPlayInterval] = useState(DEFAULT_AUTO_PLAY_INTERVAL)

  const updatePuzzleItem = useCallback((initArg) => {
    setPuzzleItem(initialize(initArg))
    setIsPlaying(false)
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

  // Change the name to `onRequestApply` maybe?
  const onRequestUpdate = useCallback((stateIdentifier) => {
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
    updatePuzzleItem({ leftPersonCount, rightPersonCount, emptyGroundCount })
  }, [leftPersonCount, rightPersonCount, emptyGroundCount, resetToken])

  // TEMP
  const getBranches = useCallback(() => {
    const moves = rootPuzzleRef.current.getMoves()

    moves.sort((fst, snd) => {
      let fstValue = 0, sndValue = 0
      if (['leftPersonJump', 'rightPersonJump'].includes(fst[0])) {
        fstValue = 3
      } else {
        fstValue = fst[2].evenDistanceCount || 0
      }

      if (['leftPersonJump', 'rightPersonJump'].includes(snd[0])) {
        sndValue = 3
      } else {
        sndValue = snd[2].evenDistanceCount || 0
      }

      return fstValue > sndValue ? -1 : 1
    })

    let highestValue = moves.length ? moves[0][2].evenDistanceCount : 0
    if (!highestValue && highestValue !== 0) { highestValue = 3 }

    return moves.map((move, index) => {
      let message = null, success = false
      const moveName = move[0]
      const info = move[2]
      let evenDistanceCount = info.evenDistanceCount
      if (!evenDistanceCount && evenDistanceCount !== 0) { evenDistanceCount = 3 }

      if (moveName === 'leftPersonJump') {
        // success = true
        message = 'Left person can jump. (Strategy: Always jump if possible)'
      } else if (moveName === 'rightPersonJump') {
        // success = true
        message = 'Right person can jump. (Strategy: Always jump if possible)'
      } else {
        if (info.evenDistanceCount > 0) {
          message = `Creates (${info.evenDistanceCount}) even distance. (Strategy: Try to create even distance if no jumping move is available)`
        } else {
          message = moves.length === 1 ? 'Only move available.' : 'Not a strategic move. Only play if no other suitable move has been found.'
        }
      }

      if (evenDistanceCount === highestValue) { success = true }

      return {
        ...createPuzzleCopy(puzzleItem),
        stateIdentifier: 'move-' + index + '-' + getUniqueID(),
        initialMove: [
          moveName, move[1],
          { message, success, activePersonId: move[1][0] }
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
          className='mb-2 mx-1 position-relative'
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

        {!isPlaying &&
          <Button
            onClick={toggleAutoPlay}
            size='sm'
            variant='success'
            className='mb-2 mx-1 position-relative'
          >
            {isAutoPlaying ? 'Stop Auto-Play' : 'Auto-Play'}
          </Button>}

        <div>
          <div className='mb-2 mx-1 d-inline-block w-200'>
            <label className='control-label'>Left Person Count</label>
            <Form.Control
              name='leftPersonCount'
              value={leftPersonCount}
              onChange={updateFormValue}
              placeholder='Left Person Count'
            />
          </div>

          <div className='mb-2 mx-1 d-inline-block w-200'>
            <label className='control-label'>Right Person Count</label>
            <Form.Control
              name='rightPersonCount'
              value={rightPersonCount}
              onChange={updateFormValue}
              placeholder='Right Person Count'
            />
          </div>

          <div className='mb-2 mx-1 d-inline-block w-200'>
            <label className='control-label'>Empty Ground Count</label>
            <Form.Control
              name='emptyGroundCount'
              value={emptyGroundCount}
              onChange={updateFormValue}
              placeholder='Empty Ground Count'
            />
          </div>
          <div className='mb-2 mx-1 d-inline-block w-200'>
            <label className='control-label'>Auto Play Interval</label>
            <Form.Control
              name='autoPlayInterval'
              value={autoPlayInterval}
              onChange={updateAutoPlayInterval}
              placeholder='Auto Play Interval'
            />
          </div>

          <div className='mb-2 mx-1 d-inline-block w-200 text-start'>
            <Form.Check
              type='switch'
              name='hideDisplay'
              label='Hide Display'
              className='d-inline-block'
              checked={hideDisplay}
              onChange={toggleHideDisplay}
              disabled={isAutoPlaying}
            />
          </div>
        </div>
      </div>

      <SwitchingSoldiersPuzzleContainer
        ref={rootPuzzleRef}
        boxes={boxes}
        leftPersons={leftPersons}
        rightPersons={rightPersons}
        predicates={predicates}
        stateIdentifier={ROOT_BRANCH}
        onActive={onActive}
        isPlaying={isPlaying}
        isAutoPlaying={isAutoPlaying}
      />

      <Col ref={copyContainerRef} className='justify-content-center m-auto'>
        {copiedItems.map((item) => {
          const { leftPersons, rightPersons, boxes, stateIdentifier } = item
          const predicates = item[PREDICATE_KEY]

          // TEMP

          const initialMove = item.initialMove

          // TEMP
          // END

          return (
            <SwitchingSoldiersPuzzleContainer
              key={stateIdentifier}
              boxes={boxes}
              leftPersons={leftPersons}
              rightPersons={rightPersons}
              predicates={predicates}
              stateIdentifier={stateIdentifier}
              onActive={onActive}
              onRequestUpdate={onRequestUpdate}
              isPlaying={isPlaying}
              isAutoPlaying={isAutoPlaying}

              // TEMP
              initialMove={initialMove}
            />
          )
        })}
      </Col>
    </Container >
  )
}

export default SwitchingSoldiersVisualizer
