import '../../../15-puzzle.css'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Container, Button, Col, Form } from 'react-bootstrap'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import initialize from './Util/Initialize'
import Puzzle15Container from './PuzzleContainer'
import { useCopyControl, useDocumentTitle } from '../../../Util/hooks'
import { DEFAULT_COLUMNS, DEFAULT_ROWS } from './Constants'
import { getActions } from './Util/domain'
import { ROOT_BRANCH, PREDICATE_KEY } from '../../../Util/constants'
import createPuzzleCopy from '../../../Util/createPuzzleCopy'
import { getUniqueID } from '../../../Util/getUniqueId'
import is15PuzzleSolved from './Util/isSolved'
import toast from '../../Toast'

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
  const [feedback, setFeedback] = useState(null)

  const updatePuzzleItem = useCallback((initArg) => {
    setPuzzleItem(initialize(initArg))
    setIsPlaying(false)
    setFeedback(null)
    resetCopyControl()
  }, [])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setFeedback(null)
    setResetToken(getUniqueID())
  }, [])

  const updateFormValue = useCallback((e) => {
    const { target: { name, value } } = e
    setFormValues({ ...formValues, [name]: value })
  }, [formValues])

  const onActive = useCallback((stateIdentifier) => {
    setCopyControl.activeBranch(stateIdentifier)
  }, [])

  const [isPlaying, setIsPlaying] = useState(false)
  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying)
    !isPlaying ? window.dispatchEvent(new CustomEvent('display-moves')) : resetCopyControl()
  }, [isPlaying])

  const onRequestApplyMove = useCallback((stateIdentifier) => {
    if (stateIdentifier) {
      setPuzzleItem(createPuzzleCopy(copiedItems.find((item) => (item.stateIdentifier === stateIdentifier)).puzzleItem))
    }
    resetCopyControl()

    // TEMP
    if (isPlaying) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('display-moves'))
      }, 500)
    }
  }, [copiedItems, isPlaying])

  useEffect(() => {
    updatePuzzleItem({ columnCount, rowCount })
  }, [columnCount, rowCount, resetToken])

  // TEMP
  const getBranches = useCallback(() => {
    const moves = rootPuzzleRef.current.getMoves()

    return moves.map(([moveName, moveArg], index) => {
      const newPuzzleItem = createPuzzleCopy(puzzleItem)
      const predicates = newPuzzleItem[PREDICATE_KEY]
      getActions(predicates)[moveName].apply(null, moveArg)

      return {
        puzzleItem: newPuzzleItem,
        stateIdentifier: 'move-' + index + '-' + getUniqueID(),
        providerExtension: {
          activeTileId: moveArg[0]
        }
      }
    })
  }, [puzzleItem])

  useEffect(() => {
    const process = () => {
      if (is15PuzzleSolved(puzzleItem)) {
        setFeedback('Puzzle successfully solved.')
        return
      }

      // TEMP
      // Skipping the following line execution
      // setCopyControl.copiedItems(getBranches())

      const constraintValue = constraintValueRef.current.trim()
      if (constraintValue) {
        try {
          const fn = new Function('boxes', 'tiles', 'predicates', constraintValue)
          const { boxes, tiles } = puzzleItem
          const predicates = puzzleItem[PREDICATE_KEY]
          const feedback = fn(boxes, tiles, predicates)
          setFeedback(feedback || null)
        } catch (ex) {
          toast.error('Invalid code passed, please check out the console for more information.')
          console.log('Error -', ex)
        }
      } else {
        const { tiles } = puzzleItem
        let feedback = null

        if (tiles.slice(0, 4).find((tile, index) => {
          return tile.boxNumber !== index + 1 + 0
        })) {
          feedback = 'Solve the first row first.'
        } else if (tiles.slice(4, 8).find((tile, index) => {
          return tile.boxNumber !== index + 1 + 4
        })) {
          feedback = "Solve the second row now. Don't move the first row."
        } else {
          feedback = "Solve the rest of the puzzle. Don't move the first two rows."
        }

        setFeedback(feedback)
      }

    }

    const listener = (e) => {
      if (e.ctrlKey) {
        // Pressing "ctrl + p"
        if (e.keyCode === 80) {
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

  const constraintValueRef = useRef('\n\n\n')

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

        <Button
          onClick={togglePlay}
          size='sm'
          variant='primary'
          className='mb-2 mx-1 position-relative'
        >
          {isPlaying ? 'Stop' : 'Play'}
        </Button>
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
      </div>

      <div className='d-flex justify-content-center text-start'>
        <CodeMirror
          value={constraintValueRef.current || ''}
          width='600px'
          extensions={[javascript({ jsx: true })]}
          onChange={(value) => {
            constraintValueRef.current = value
          }}
        />
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
        onRequestApplyMove={onRequestApplyMove}
      />

      {feedback && <div>{feedback}</div>}

      <Col className='justify-content-center m-auto'>
        {copiedItems.map((item) => {
          const { puzzleItem, stateIdentifier, providerExtension } = item
          const { boxes, tiles } = puzzleItem
          const predicates = puzzleItem[PREDICATE_KEY]

          return (
            <Puzzle15Container
              key={stateIdentifier}
              columnCount={columnCount}
              boxes={boxes}
              tiles={tiles}
              predicates={predicates}
              stateIdentifier={stateIdentifier}
              onActive={onActive}
              isPlaying={isPlaying}
              onRequestApplyMove={onRequestApplyMove}

              providerExtension={providerExtension}
            />
          )
        })}
      </Col>
    </Container >
  )
}

export default Puzzle15Visualizer
