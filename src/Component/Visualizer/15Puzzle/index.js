import '../../../15-puzzle.css'
import React, { useCallback, useEffect, useState } from 'react'
import { Container, Button, Col, Form } from 'react-bootstrap'
import initialize from './Util/Initialize'
import Puzzle15Container from './PuzzleContainer'
import { useCopyControl, useDocumentTitle } from '../../../Util/hooks'
import { DEFAULT_COLUMNS, DEFAULT_ROWS } from './Constants'
import { ROOT_BRANCH, PREDICATE_KEY } from '../../../Util/constants'
import createPuzzleCopy from '../../../Util/createPuzzleCopy'
import { getUniqueID } from '../../../Util/getUniqueId'

const Puzzle15Visualizer = function () {
  useDocumentTitle('15 Puzzle')

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

  const updatePuzzleItem = useCallback((initArg) => {
    setPuzzleItem(initialize(initArg))
    resetCopyControl()
  }, [])

  const reset = useCallback(() => {
    setFormValues({ ...formValues })
    setResetToken(getUniqueID())
  }, [])

  const updateFormValue = useCallback((e) => {
    const { target: { name, value } } = e
    setFormValues({ ...formValues, [name]: value })
  }, [formValues])

  const onActive = useCallback((stateIdentifier) => {
    setCopyControl.activeBranch(stateIdentifier)
  }, [])

  useEffect(() => {
    updatePuzzleItem({ columnCount, rowCount })
  }, [columnCount, rowCount, resetToken])

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
      </div>

      <div>
        <div className="mb-2 mx-1 d-inline-block w-200">
          <label className="control-label">Column Count</label>
          <Form.Control
            name='columnCount'
            value={columnCount}
            onChange={updateFormValue}
            placeholder="Column Count"
          />
        </div>

        <div className="mb-2 mx-1 d-inline-block w-200">
          <label className="control-label">Row Count</label>
          <Form.Control
            name='rowCount'
            value={rowCount}
            onChange={updateFormValue}
            placeholder="Row Count"
          />
        </div>

      </div>

      <Puzzle15Container
        columnCount={columnCount}
        boxes={boxes}
        tiles={tiles}
        predicates={predicates}
        stateIdentifier={ROOT_BRANCH}
        onActive={onActive}
      />

      <Col md={6} className='justify-content-center m-auto'>
        {copiedItems.map((item) => {
          const { boxes, tiles, stateIdentifier } = item
          const predicates = item[PREDICATE_KEY]

          return (
            <Puzzle15Container
              key={stateIdentifier}
              columnCount={columnCount}
              boxes={boxes}
              tiles={tiles}
              predicates={predicates}
              stateIdentifier={stateIdentifier}
              onActive={onActive}
            />
          )
        })}
      </Col>
    </Container >
  )
}

export default Puzzle15Visualizer
