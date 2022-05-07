import '../../../15-puzzle.css'
import React, { useCallback, useState } from 'react'
import { Container, Button, Col } from 'react-bootstrap'
import initialize from './Util/Initialize'
import copy from './Util/Copy'
import Puzzle15Container from './PuzzleContainer'
import { useCopyControl, useDocumentTitle } from '../../../Util/hooks'
import { DEFAULT_ACTIVE_BRANCH, PREDICATE_KEY } from './Constants'

const TEMP_COLUMNS = 8

const Puzzle15Visualizer = function () {
  useDocumentTitle('15 Puzzle')

  const [puzzleItem, setPuzzleItem] = useState(() => {
    return initialize({ columns: TEMP_COLUMNS, rows: 2 })
  })
  const { boxes, tiles } = puzzleItem
  const predicates = puzzleItem[PREDICATE_KEY]
  const { activeBranch, copiedItems,
    set: setCopyControl, reset: resetCopyControl } = useCopyControl({ item: puzzleItem, copy })

  const updatePuzzleItem = useCallback(() => {
    setPuzzleItem(initialize())
    resetCopyControl()
  }, [])

  const reset = useCallback(() => {
    updatePuzzleItem()
  }, [])

  const onActive = useCallback((stateIdentifier) => {
    setCopyControl.activeBranch(stateIdentifier)
  }, [])

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

      <Puzzle15Container
        columnCount={TEMP_COLUMNS}
        boxes={boxes}
        tiles={tiles}
        predicates={predicates}
        stateIdentifier={DEFAULT_ACTIVE_BRANCH}
        onActive={onActive}
        isActiveBranch={activeBranch === DEFAULT_ACTIVE_BRANCH}
      />

      <Col md={6} className='justify-content-center m-auto'>
        {copiedItems.map((item) => {
          const { boxes, tiles, stateIdentifier } = item
          const predicates = item[PREDICATE_KEY]

          return (
            <Puzzle15Container
              key={stateIdentifier}
              boxes={boxes}
              tiles={tiles}
              predicates={predicates}
              stateIdentifier={stateIdentifier}
              onActive={onActive}
              isActiveBranch={activeBranch === stateIdentifier}
            />
          )
        })}
      </Col>
    </Container>
  )
}

export default Puzzle15Visualizer
