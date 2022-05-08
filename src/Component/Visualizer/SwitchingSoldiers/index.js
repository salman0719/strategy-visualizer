import '../../../switching-soldiers.css'
import React, { useCallback, useEffect, useState } from 'react'
import { Container, Button, Form, Col } from 'react-bootstrap'
import initialize from './Util/Initialize'
import { DEFAULT_EMPTY_GROUND_COUNT, DEFAULT_PERSON_COUNT } from './Constants'
import createPuzzleCopy from '../../../Util/createPuzzleCopy'
import SwitchingSoldiersPuzzleContainer from './PuzzleContainer'
import { useCopyControl, useDocumentTitle } from '../../../Util/hooks'
import { ROOT_BRANCH, PREDICATE_KEY } from '../../../Util/constants'

const SwitchingSoldiersVisualizer = function () {
  useDocumentTitle('Switching Soldiers')

  const [formValues, setFormValues] = useState({
    leftPersonCount: DEFAULT_PERSON_COUNT,
    rightPersonCount: DEFAULT_PERSON_COUNT,
    emptyGroundCount: DEFAULT_EMPTY_GROUND_COUNT
  })
  const { leftPersonCount, rightPersonCount, emptyGroundCount } = formValues
  const [puzzleItem, setPuzzleItem] = useState(null)
  const { boxes, leftPersons, rightPersons } = puzzleItem || { boxes: [], leftPersons: [], rightPersons: [] }
  const predicates = puzzleItem?.[PREDICATE_KEY] || {}
  const { activeBranch, copiedItems,
    set: setCopyControl, reset: resetCopyControl } = useCopyControl({ item: puzzleItem, copy: createPuzzleCopy })

  const updatePuzzleItem = useCallback((initArg) => {
    setPuzzleItem(initialize(initArg))
    resetCopyControl()
  }, [])

  const reset = useCallback(() => {
    setFormValues({ ...formValues })
  }, [])

  const updateFormValue = useCallback((e) => {
    const { target: { name, value } } = e
    setFormValues({ ...formValues, [name]: value })
  }, [formValues])

  const onActive = useCallback((stateIdentifier) => {
    setCopyControl.activeBranch(stateIdentifier)
  }, [])

  useEffect(() => {
    updatePuzzleItem({ leftPersonCount, rightPersonCount, emptyGroundCount })
  }, [leftPersonCount, rightPersonCount, emptyGroundCount])

  if (!puzzleItem) { return null }

  return (
    <Container className='mt-5'>
      <div className='text-left'>
        <Button
          onClick={reset}
          size='sm'
          variant='secondary'
          className='mb-2 mx-1 position-relative'
          style={{ zIndex: 2 }}
        >
          Reset
        </Button>
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
        </div>
      </div>

      <SwitchingSoldiersPuzzleContainer
        boxes={boxes}
        leftPersons={leftPersons}
        rightPersons={rightPersons}
        predicates={predicates}
        stateIdentifier={ROOT_BRANCH}
        onActive={onActive}
        isActiveBranch={activeBranch === ROOT_BRANCH}
      />

      <Col md={6} className='justify-content-center m-auto'>
        {copiedItems.map((item) => {
          const { leftPersons, rightPersons, boxes, stateIdentifier } = item
          const predicates = item[PREDICATE_KEY]

          return (
            <SwitchingSoldiersPuzzleContainer
              key={stateIdentifier}
              boxes={boxes}
              leftPersons={leftPersons}
              rightPersons={rightPersons}
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

export default SwitchingSoldiersVisualizer
