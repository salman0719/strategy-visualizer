import '../../../switching-soldiers.css'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Container, Button, Form } from 'react-bootstrap'
import initialize from './Util/Initialize'
import { DEFAULT_EMPTY_GROUND_COUNT, DEFAULT_PERSON_COUNT } from './Constants'
import copy from './Util/Copy'
import SwitchingSoldiersPuzzleContainer from './PuzzleContainer'

const SwitchingSoldiersVisualizer = function () {
  const [activeBranch, setActiveBranch] = useState('1')
  const [createdCopyCount, setCreatedCopyCount] = useState(0)
  const [leftPersonCount, setLeftPersonCount] = useState(DEFAULT_PERSON_COUNT)
  const [rightPersonCount, setRightPersonCount] = useState(DEFAULT_PERSON_COUNT)
  const [emptyGroundCount, setEmptyGroundCount] = useState(
    DEFAULT_EMPTY_GROUND_COUNT
  )
  const branchCountObj = useRef({})

  const defaultPuzzleComponent = useState(() => {
    return initialize()
  })[0]
  const [boxes, setBoxes] = useState(defaultPuzzleComponent.boxes)
  const [leftPersons, setLeftPersons] = useState(
    defaultPuzzleComponent.leftPersons
  )
  const [rightPersons, setRightPersons] = useState(
    defaultPuzzleComponent.rightPersons
  )

  const [copiedItems, setCopiedItems] = useState([])

  const updateRootItems = useCallback(({ left, right }, emptyGroundCount) => {
    const puzzleComponent = initialize({ left, right }, emptyGroundCount)

    setBoxes(puzzleComponent.boxes)
    setLeftPersons(puzzleComponent.leftPersons)
    setRightPersons(puzzleComponent.rightPersons)
    setCopiedItems([])
    setActiveBranch('1')
    setCreatedCopyCount(0)
    branchCountObj.current = {}
  }, [])

  useEffect(() => {
    const listener = (e) => {
      if (e.ctrlKey === true) {
        if (e.keyCode === 65) {
          // Pressing ctrl+a
          let newItem
          if (activeBranch === '1') {
            newItem = copy({
              leftPersons,
              rightPersons,
              boxes,
              emptyGround: emptyGroundCount
            })
          } else {
            let activeItem = copiedItems.find(
              (item) => item.stateIdentifier === activeBranch
            )
            newItem = copy({
              leftPersons: activeItem.leftPersons,
              rightPersons: activeItem.rightPersons,
              boxes: activeItem.boxes,
              emptyGround: emptyGroundCount
            })
          }

          const copyNumber = (branchCountObj.current[activeBranch] =
            (branchCountObj.current[activeBranch] || 0) + 1)
          newItem.stateIdentifier = activeBranch + '-' + copyNumber
          setCopiedItems([...copiedItems, newItem])
          setCreatedCopyCount(createdCopyCount + 1)
        } else if (
          e.keyCode === 88 &&
          copiedItems.length &&
          activeBranch &&
          activeBranch != '1'
        ) {
          // Pressing ctrl+x
          setCopiedItems(
            copiedItems.filter(
              (item) => !item.stateIdentifier.startsWith(activeBranch)
            )
          )
          setActiveBranch(null)
          setCreatedCopyCount(createdCopyCount - 1)
        } else {
          return
        }

        e.preventDefault()
      }
    }
    window.addEventListener('keydown', listener)

    return () => {
      window.removeEventListener('keydown', listener)
    }
  }, [
    emptyGroundCount,
    copiedItems,
    leftPersons,
    rightPersons,
    boxes,
    createdCopyCount,
    activeBranch
  ])

  const updateLeftPersonCount = useCallback(
    (e) => {
      let newPersonCount = parseInt(e.target.value || DEFAULT_PERSON_COUNT)
      // TODO
      // Maybe a `useEffect` makes more sense that using `updateRootItems`
      setLeftPersonCount(newPersonCount)
      updateRootItems(
        { left: newPersonCount, right: rightPersonCount },
        emptyGroundCount
      )
    },
    [rightPersonCount, emptyGroundCount]
  )

  const updateRightPersonCount = useCallback(
    (e) => {
      let newPersonCount = parseInt(e.target.value || DEFAULT_PERSON_COUNT)
      setRightPersonCount(newPersonCount)
      updateRootItems(
        { left: leftPersonCount, right: newPersonCount },
        emptyGroundCount
      )
    },
    [leftPersonCount, emptyGroundCount]
  )

  const updateEmptyGroundCount = useCallback(
    (e) => {
      let value = parseInt(e.target.value)
      if (!isNaN(value)) {
        updateRootItems(
          { left: leftPersonCount, right: rightPersonCount },
          value
        )
        setEmptyGroundCount(value)
      }
    },
    [leftPersonCount, rightPersonCount]
  )

  const reset = useCallback(() => {
    updateRootItems(
      { left: leftPersonCount, right: rightPersonCount },
      emptyGroundCount
    )
  }, [leftPersonCount, rightPersonCount, emptyGroundCount])

  const onActive = useCallback((e) => {
    setActiveBranch(e.target.innerText)
  }, [])

  return (
    <Container className="mt-5">
      <div className="text-left">
        <Button
          onClick={reset}
          size="sm"
          variant="secondary"
          className="mb-2 mx-1 position-relative"
          style={{ zIndex: 2 }}
        >
          Reset
        </Button>
        <div>
          <div className="mb-2 mx-1 d-inline-block w-200">
            <label className="control-label">Left Person Count</label>
            <Form.Control
              value={leftPersonCount}
              onChange={updateLeftPersonCount}
              placeholder="Left Person Count"
            />
          </div>

          <div className="mb-2 mx-1 d-inline-block w-200">
            <label className="control-label">Right Person Count</label>
            <Form.Control
              value={rightPersonCount}
              onChange={updateRightPersonCount}
              placeholder="Right Person Count"
            />
          </div>

          <div className="mb-2 mx-1 d-inline-block w-200">
            <label className="control-label">Empty Ground Count</label>
            <Form.Control
              value={emptyGroundCount}
              onChange={updateEmptyGroundCount}
              placeholder="Empty Ground Count"
            />
          </div>
        </div>
      </div>

      <SwitchingSoldiersPuzzleContainer
        // TODO
        // Temporarily differentiating using the following `id`
        // Later on, we will replace this with its own proper id
        // or utilize proper `dependency` inside `PuzzleContainer` component
        key={boxes[0].id}
        boxes={boxes}
        leftPersons={leftPersons}
        rightPersons={rightPersons}
        stateIdentifier="1"
        onActive={onActive}
        isActiveBranch={activeBranch === '1'}
      />

      {copiedItems.map((item, index) => {
        const { leftPersons, rightPersons, boxes, stateIdentifier } = item

        return (
          <SwitchingSoldiersPuzzleContainer
            key={boxes[0].id}
            boxes={boxes}
            leftPersons={leftPersons}
            rightPersons={rightPersons}
            stateIdentifier={stateIdentifier}
            onActive={onActive}
            isActiveBranch={activeBranch === stateIdentifier}
          />
        )
      })}
    </Container>
  )
}

export default SwitchingSoldiersVisualizer
