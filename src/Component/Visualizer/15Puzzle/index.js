import '../../../15-puzzle.css'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Container, Button } from 'react-bootstrap'
import initialize from './Util/Initialize'
// import { DEFAULT_EMPTY_GROUND_COUNT, DEFAULT_PERSON_COUNT } from './Constants'
// import copy from './Util/Copy'
import Puzzle15Container from './PuzzleContainer'

const Puzzle15Visualizer = function () {
  useEffect(() => {
    const prevTitle = document.title
    document.title = '15 Puzzle Domain'
    return () => {
      document.title = prevTitle
    }
  }, [])

  const [activeBranch, setActiveBranch] = useState('1')
  // const [createdCopyCount, setCreatedCopyCount] = useState(0)
  // const [leftPersonCount, setLeftPersonCount] = useState(DEFAULT_PERSON_COUNT)
  // const [rightPersonCount, setRightPersonCount] = useState(DEFAULT_PERSON_COUNT)
  // const [emptyGroundCount, setEmptyGroundCount] = useState(
  //   DEFAULT_EMPTY_GROUND_COUNT
  // )
  // const branchCountObj = useRef({})

  const defaultPuzzleComponent = useState(() => {
    return initialize()
  })[0]
  const [boxes, setBoxes] = useState(defaultPuzzleComponent.boxes)
  const [tiles, setTiles] = useState(defaultPuzzleComponent.tiles)
  const [predicates, setPredicates] = useState(
    defaultPuzzleComponent.predicates
  )

  // const [copiedItems, setCopiedItems] = useState([])

  // const updateRootItems = useCallback(({ left, right }, emptyGroundCount) => {
  //   const puzzleComponent = initialize({ left, right }, emptyGroundCount)

  //   setBoxes(puzzleComponent.boxes)
  //   setTiles(puzzleComponent.tiles)
  //   setCopiedItems([])
  //   setActiveBranch('1')
  //   // setCreatedCopyCount(0)
  //   branchCountObj.current = {}
  // }, [])

  // useEffect(() => {
  //   const listener = (e) => {
  //     if (e.ctrlKey === true) {
  //       if (e.keyCode === 65) {
  //         // Pressing ctrl+a
  //         let newItem
  //         if (activeBranch === '1') {
  //           newItem = copy({
  //             leftPersons,
  //             rightPersons,
  //             boxes
  //             // emptyGround: emptyGroundCount
  //           })
  //         } else {
  //           let activeItem = copiedItems.find(
  //             (item) => item.stateIdentifier === activeBranch
  //           )
  //           newItem = copy({
  //             leftPersons: activeItem.leftPersons,
  //             rightPersons: activeItem.rightPersons,
  //             boxes: activeItem.boxes
  //             // emptyGround: emptyGroundCount
  //           })
  //         }

  //         const copyNumber = (branchCountObj.current[activeBranch] =
  //           (branchCountObj.current[activeBranch] || 0) + 1)
  //         newItem.stateIdentifier = activeBranch + '-' + copyNumber
  //         setCopiedItems([...copiedItems, newItem])
  //         setCreatedCopyCount(createdCopyCount + 1)
  //       } else if (
  //         e.keyCode === 88 &&
  //         copiedItems.length &&
  //         activeBranch &&
  //         activeBranch != '1'
  //       ) {
  //         // Pressing ctrl+x
  //         setCopiedItems(
  //           copiedItems.filter(
  //             (item) => !item.stateIdentifier.startsWith(activeBranch)
  //           )
  //         )
  //         setActiveBranch(null)
  //         setCreatedCopyCount(createdCopyCount - 1)
  //       } else {
  //         return
  //       }

  //       e.preventDefault()
  //     }
  //   }
  //   window.addEventListener('keydown', listener)

  //   return () => {
  //     window.removeEventListener('keydown', listener)
  //   }
  // }, [
  //   emptyGroundCount,
  //   copiedItems,
  //   leftPersons,
  //   rightPersons,
  //   boxes,
  //   createdCopyCount,
  //   activeBranch
  // ])

  // const reset = useCallback(() => {
  //   updateRootItems(
  //     { left: leftPersonCount, right: rightPersonCount },
  //     emptyGroundCount
  //   )
  // }, [leftPersonCount, rightPersonCount, emptyGroundCount])

  const onActive = useCallback((e) => {
    setActiveBranch(e.target.innerText)
  }, [])

  return (
    <Container className="mt-5">
      {/* {null && (
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
        </div>
      )} */}

      <Puzzle15Container
        // TODO
        // Temporarily differentiating using the following `id`
        // Later on, we will replace this with its own proper id
        // or utilize proper `dependency` inside `PuzzleContainer` component
        key={boxes[0].id}
        boxes={boxes}
        tiles={tiles}
        predicates={predicates}
        stateIdentifier="1"
        onActive={onActive}
        isActiveBranch={activeBranch === '1'}
      />

      {/* {null &&
        copiedItems.map((item, index) => {
          const { boxes, tiles, predicates, stateIdentifier } = item

          return (
            <Puzzle15Container
              key={boxes[0].id}
              boxes={boxes}
              tiles={tiles}
              predicates={predicates}
              stateIdentifier={stateIdentifier}
              onActive={onActive}
              isActiveBranch={activeBranch === stateIdentifier}
            />
          )
        })} */}
    </Container>
  )
}

export default Puzzle15Visualizer
