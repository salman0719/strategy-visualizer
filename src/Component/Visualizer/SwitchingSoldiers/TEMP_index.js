import '../../../switching-soldiers.css'
import React, { useCallback, useEffect, useState } from 'react'
import { Container, Button, Form } from 'react-bootstrap'
import { getUniqueID } from '../../../Util/getUniqueId'
import Box from './Box'
import VisualizerContext from './Context'
import LeftSoldier from './LeftSoldier'
import RightSoldier from './RightSoldier'
import toast from '../../Toast'
import getObj from '../../../Util/getObj'

// TODO
// We will generalize later!
const templatePredicateForOne = (name = '') => {
  const map = new Map()

  const validate = (item, fnName) => {
    if (!item) {
      throw new Error(
        `Argument of predicate '${name}'` +
          (fnName ? `, function(${fnName})` : '') +
          ` can not be empty!` +
          `Received value -`,
        item
      )
    }
  }

  // Applies the predicate
  const response = (item) => {
    validate(item)
    map.set(item, true)
  }
  response.not = (item) => {
    validate(item, 'not')
    return map.delete(item)
  }
  response.has = (item) => {
    validate(item, 'has')
    return map.get(item) === true
  }

  // TEMP
  // Debugging purpose
  response.getAll = () => map

  return response
}

const templatePredicateForTwo = (name = '') => {
  const map = new Map()

  const validate = (item1, item2, fnName) => {
    if (!item1) {
      throw new Error(
        `First argument of predicate '${name}'` +
          (fnName ? `, function(${fnName})` : '') +
          ` can not be empty!` +
          `Received value -`,
        item1
      )
    }

    if (!item2) {
      throw new Error(
        `Second argument of predicate '${name}'` +
          (fnName ? `, function(${fnName})` : '') +
          ` can not be empty!` +
          `Received value -`,
        item2
      )
    }
  }

  // Applies the predicate
  const response = (item1, item2) => {
    validate(item1, item2)

    let nestedMap = map.get(item1)
    if (!nestedMap) {
      nestedMap = new Map()
      map.set(item1, nestedMap)
    }

    nestedMap.set(item2, true)
  }
  response.not = (item1, item2) => {
    validate(item1, item2, 'not')

    let nestedMap = map.get(item1)
    if (!nestedMap) {
      return false
    }

    return nestedMap.delete(item2)
  }
  response.has = (item1, item2) => {
    validate(item1, item2, 'has')

    let nestedMap = map.get(item1)
    if (!nestedMap) {
      return false
    }

    return nestedMap.get(item2) === true
  }

  // TEMP
  // Debugging purpose
  response.getAll = () => map

  return response
}

const DEFAULT_PERSON_COUNT = 5
const DEFAULT_EMPTY_GROUND_COUNT = 1
const DEFAULT_SOLVE_STEP_DELAY = 2500

let leftPerson, rightPerson, ground, onGround, nextGround, groundClear
let leftPersonShouldJump, rightPersonShouldJump
let leftPersons, rightPersons, boxes

leftPerson = templatePredicateForOne('leftPerson')
rightPerson = templatePredicateForOne('rightPerson')
ground = templatePredicateForOne('ground')
onGround = templatePredicateForTwo('onGround')
nextGround = templatePredicateForTwo('nextGround')
groundClear = templatePredicateForOne('groundClear')

const initialize = (
  personCount = DEFAULT_PERSON_COUNT,
  emptyGround = DEFAULT_EMPTY_GROUND_COUNT
) => {
  if (typeof personCount !== 'object') {
    personCount = { left: personCount, right: personCount }
  }

  const totalLeftPerson = personCount.left
  const totalRightPerson = personCount.right
  const totalBox = totalLeftPerson + totalRightPerson + emptyGround

  leftPersonShouldJump = false
  rightPersonShouldJump = false

  leftPersons = Array(totalLeftPerson)
    .fill(0)
    .map((item, index) => {
      const id = 'left-person-' + index + '-' + getUniqueID()
      leftPerson(id)
      return { id, number: index + 1 }
    })

  rightPersons = Array(totalRightPerson)
    .fill(0)
    .map((item, index) => {
      const id = 'right-person-' + index + '-' + getUniqueID()
      rightPerson(id)
      return { id, number: index + 1 }
    })

  boxes = Array(totalBox)
    .fill(0)
    .map((item, index) => {
      const id = 'ground-' + index + '-' + getUniqueID()
      ground(id)
      groundClear(id)
      return { id, index, number: index + 1 }
    })

  for (let i = boxes.length - 1; i > 0; i--) {
    nextGround(boxes[i - 1].id, boxes[i].id)
  }

  leftPersons.forEach((lp, index) => {
    const box = boxes[index]
    lp.boxId = box.id
    onGround(lp.id, box.id)
    groundClear.not(box.id)
  })

  rightPersons.forEach((rp, index) => {
    // TODO
    // Instead of setting `boxId`, we need to utilize the predicates only
    const boxIndex = boxes.length - rightPersons.length + index
    const box = boxes[boxIndex]
    rp.boxId = box.id
    onGround(rp.id, box.id)
    groundClear.not(box.id)
  })
}

const copy = ({ leftPersons, rightPersons, boxes, emptyGround }) => {
  leftPersons = leftPersons.map((item, index) => {
    const id = 'left-person-' + index + '-' + getUniqueID()
    leftPerson(id)
    return { id, number: index + 1, rootId: item.id, boxId: item.boxId }
  })

  rightPersons = rightPersons.map((item, index) => {
    const id = 'right-person-' + index + '-' + getUniqueID()
    rightPerson(id)
    return { id, number: index + 1, rootId: item.id, boxId: item.boxId }
  })

  boxes = boxes.map((item, index) => {
    const id = 'ground-' + index + '-' + getUniqueID()
    ground(id)
    groundClear(id)
    return { id, index, number: index + 1, rootId: item.id }
  })

  for (let i = boxes.length - 1; i > 0; i--) {
    nextGround(boxes[i - 1].id, boxes[i].id)
  }

  const boxObj = getObj(boxes, 'rootId')
  // NOTE
  // If we want, we can remove the `rootId` here,
  // but still keeping it as of now for tracing purposes

  leftPersons.forEach((lp, index) => {
    const box = boxObj[lp.boxId]
    lp.boxId = box.id
    onGround(lp.id, box.id)
    groundClear.not(box.id)

    // NOTE
    // If we want, we can remove the `rootId` here,
    // but still keeping it as of now for tracing purposes
  })

  rightPersons.forEach((rp, index) => {
    // TODO
    // Instead of setting `boxId`, we need to utilize the predicates only
    const box = boxObj[rp.boxId]
    rp.boxId = box.id
    onGround(rp.id, box.id)
    groundClear.not(box.id)

    // NOTE
    // If we want, we can remove the `rootId` here,
    // but still keeping it as of now for tracing purposes
  })

  return { leftPersons, rightPersons, boxes }
}

initialize()

// TEMP
// Will use it later if required
// const boxObj = {}
// boxes.forEach((box) => {
//   boxObj[box.id] = box
// })

const SwitchingSoldiersVisualizer = function () {
  const [stateKey, setStateKey] = useState('')
  const [isSolving, setIsSolving] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [leftPersonCount, setLeftPersonCount] = useState(DEFAULT_PERSON_COUNT)
  const [rightPersonCount, setRightPersonCount] = useState(DEFAULT_PERSON_COUNT)
  const [emptyGroundCount, setEmptyGroundCount] = useState(
    DEFAULT_EMPTY_GROUND_COUNT
  )
  const [feedback, setFeedback] = useState('')
  const [solveStepDelay, setSolveStepDelay] = useState(DEFAULT_SOLVE_STEP_DELAY)

  const [copiedItems, setCopiedItems] = useState([])

  useEffect(() => {
    const listener = (e) => {
      if (e.ctrlKey === true) {
        if (e.keyCode === 65) {
          // Pressing ctrl+a
          const newItem = copy({
            leftPersons,
            rightPersons,
            boxes,
            emptyGround: emptyGroundCount
          })
          setCopiedItems([...copiedItems, newItem])
        } else if (e.keyCode === 88 && copiedItems.length) {
          // Pressing ctrl+x
          const newCopiedItems = [...copiedItems]
          newCopiedItems.pop()
          setCopiedItems(newCopiedItems)
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
  }, [emptyGroundCount, copiedItems])

  const leftPersonMoveApplicable = useCallback((leftPersonId, from, to) => {
    if (
      leftPerson.has(leftPersonId) &&
      ground.has(from) &&
      ground.has(to) &&
      onGround.has(leftPersonId, from) &&
      nextGround.has(from, to) &&
      groundClear.has(to)
    ) {
      return true
    }

    return false
  }, [])
  const leftPersonMove = useCallback((leftPersonId, from, to) => {
    if (leftPersonMoveApplicable(leftPersonId, from, to)) {
      onGround.not(leftPersonId, from)
      onGround(leftPersonId, to)
      groundClear.not(to)
      groundClear(from)
      leftPersonShouldJump = false
      rightPersonShouldJump = true

      // TODO
      // Later on, we will omit this so that predicate can control them alone!
      leftPersons.find((lp) => lp.id === leftPersonId).boxId = to

      // TEMP
      // A temporary way to update the component
      setStateKey(getUniqueID())
    }
  }, [])

  const leftPersonJumpApplicable = useCallback(
    (leftPersonId, from, middle, middlePersonId, to) => {
      if (
        leftPerson.has(leftPersonId) &&
        ground.has(from) &&
        ground.has(to) &&
        ground.has(middle) &&
        onGround.has(leftPersonId, from) &&
        onGround.has(middlePersonId, middle) &&
        nextGround.has(from, middle) &&
        nextGround.has(middle, to) &&
        rightPerson.has(middlePersonId) &&
        groundClear.has(to)
      ) {
        return true
      }
    },
    []
  )
  const leftPersonJump = useCallback(
    (leftPersonId, from, middle, middlePersonId, to) => {
      if (
        leftPersonJumpApplicable(leftPersonId, from, middle, middlePersonId, to)
      ) {
        groundClear(from)
        groundClear.not(to)
        onGround(leftPersonId, to)
        onGround.not(leftPersonId, from)
        rightPersonShouldJump = false
        leftPersonShouldJump = true

        // TODO
        // Later on, we will omit this so that predicate can control them alone!
        leftPersons.find((lp) => lp.id === leftPersonId).boxId = to

        // TEMP
        // A temporary way to update the component
        setStateKey(getUniqueID())
      }
    },
    []
  )

  const rightPersonMoveApplicable = useCallback((rightPersonId, from, to) => {
    if (
      rightPerson.has(rightPersonId) &&
      ground.has(from) &&
      ground.has(to) &&
      onGround.has(rightPersonId, from) &&
      nextGround.has(to, from) &&
      groundClear.has(to)
    ) {
      return true
    }

    return false
  }, [])
  const rightPersonMove = useCallback((rightPersonId, from, to) => {
    if (rightPersonMoveApplicable(rightPersonId, from, to)) {
      onGround.not(rightPersonId, from)
      onGround(rightPersonId, to)
      groundClear.not(to)
      groundClear(from)
      leftPersonShouldJump = true
      rightPersonShouldJump = false

      // TODO
      // Later on, we will omit this so that predicate can control them alone!
      rightPersons.find((rp) => rp.id === rightPersonId).boxId = to

      // TEMP
      // A temporary way to update the component
      setStateKey(getUniqueID())
    }
  }, [])

  const rightPersonJumpApplicable = useCallback(
    (rightPersonId, from, middle, middlePersonId, to) => {
      if (
        rightPerson.has(rightPersonId) &&
        ground.has(from) &&
        ground.has(to) &&
        ground.has(middle) &&
        onGround.has(rightPersonId, from) &&
        onGround.has(middlePersonId, middle) &&
        nextGround.has(middle, from) &&
        nextGround.has(to, middle) &&
        leftPerson.has(middlePersonId) &&
        groundClear.has(to)
      ) {
        return true
      }
    },
    []
  )
  const rightPersonJump = useCallback(
    (rightPersonId, from, middle, middlePersonId, to) => {
      if (
        rightPersonJumpApplicable(
          rightPersonId,
          from,
          middle,
          middlePersonId,
          to
        )
      ) {
        onGround.not(rightPersonId, from)
        onGround(rightPersonId, to)
        groundClear.not(to)
        groundClear(from)
        leftPersonShouldJump = false
        rightPersonShouldJump = true

        // TODO
        // Later on, we will omit this so that predicate can control them alone!
        rightPersons.find((rp) => rp.id === rightPersonId).boxId = to

        // TEMP
        // A temporary way to update the component
        setStateKey(getUniqueID())
      }
    },
    []
  )

  const getMoves = useCallback((findIfMovePossible = false) => {
    let moves = []

    for (let lp of leftPersons) {
      let { boxId, id } = lp
      let nextBox = boxes.find((box) => nextGround.has(boxId, box.id))
      let nextBoxId
      if (nextBox) {
        nextBoxId = nextBox.id
        if (leftPersonMoveApplicable(id, boxId, nextBoxId)) {
          moves.push(['leftPersonMove', [id, boxId, nextBoxId]])
          if (findIfMovePossible) {
            break
          }
        }

        const nextToNextBox = boxes.find((box) =>
          nextGround.has(nextBoxId, box.id)
        )
        const nextRightPerson = rightPersons.find(
          (rp) => rp.boxId === nextBoxId
        )
        if (
          nextToNextBox &&
          nextRightPerson &&
          leftPersonJumpApplicable(
            id,
            boxId,
            nextBoxId,
            nextRightPerson.id,
            nextToNextBox.id
          )
        ) {
          moves.push([
            'leftPersonJump',
            [id, boxId, nextBoxId, nextRightPerson.id, nextToNextBox.id]
          ])
          if (findIfMovePossible) {
            break
          }
        }
      }
    }

    if (!findIfMovePossible || !moves.length) {
      for (let rp of rightPersons) {
        let { boxId, id } = rp
        let prevBox = boxes.find((box) => nextGround.has(box.id, boxId))
        let prevBoxId
        if (prevBox) {
          prevBoxId = prevBox.id
          if (rightPersonMoveApplicable(id, boxId, prevBoxId)) {
            moves.push(['rightPersonMove', [id, boxId, prevBoxId]])
            if (findIfMovePossible) {
              break
            }
          }

          const prevToPrevBox = boxes.find((box) =>
            nextGround.has(box.id, prevBoxId)
          )
          const nextLeftPerson = leftPersons.find(
            (lp) => lp.boxId === prevBoxId
          )
          if (
            prevToPrevBox &&
            nextLeftPerson &&
            rightPersonJumpApplicable(
              id,
              boxId,
              prevBoxId,
              nextLeftPerson.id,
              prevToPrevBox.id
            )
          ) {
            moves.push([
              'rightPersonJump',
              [id, boxId, prevBoxId, nextLeftPerson.id, prevToPrevBox.id]
            ])
            if (findIfMovePossible) {
              break
            }
          }
        }
      }
    }

    if (findIfMovePossible) return moves.length > 0

    return moves
  }, [])

  useEffect(() => {
    // TEMP
    // Determines if the puzzle is solved or the game is over!
    if (!getMoves(true)) {
      setIsGameOver(true)
      setIsSolving(false)

      let puzzleBlocked = false,
        boxIndex = 0
      for (let person of rightPersons) {
        if (person.boxId !== boxes[boxIndex].id) {
          puzzleBlocked = true
          break
        }
        boxIndex++
      }

      if (!puzzleBlocked) {
        boxIndex = boxes.length - leftPersons.length
        for (let person of leftPersons) {
          if (person.boxId !== boxes[boxIndex].id) {
            puzzleBlocked = true
            break
          }
          boxIndex++
        }
      }

      if (puzzleBlocked) {
        toast.warning('Game over!')
      } else {
        toast.success('Puzzle successfully solved!')
      }
    }
  }, [stateKey])

  const updateLeftPersonCount = useCallback(
    (e) => {
      let newPersonCount = parseInt(e.target.value || DEFAULT_PERSON_COUNT)
      initialize(
        { left: newPersonCount, right: rightPersonCount },
        emptyGroundCount
      )
      setLeftPersonCount(newPersonCount)
    },
    [rightPersonCount, emptyGroundCount]
  )

  const updateRightPersonCount = useCallback(
    (e) => {
      let newPersonCount = parseInt(e.target.value || DEFAULT_PERSON_COUNT)
      initialize(
        { left: leftPersonCount, right: newPersonCount },
        emptyGroundCount
      )
      setRightPersonCount(newPersonCount)
    },
    [leftPersonCount, emptyGroundCount]
  )

  const updateEmptyGroundCount = useCallback(
    (e) => {
      let value = parseInt(e.target.value)
      if (!isNaN(value)) {
        initialize({ left: leftPersonCount, right: rightPersonCount }, value)
        setEmptyGroundCount(value)
      }
    },
    [leftPersonCount, rightPersonCount]
  )

  const updateSolveStepDelay = useCallback((e) => {
    setSolveStepDelay(parseInt(e.target.value || DEFAULT_SOLVE_STEP_DELAY))
  }, [])

  const toggleSolve = useCallback(() => {
    if (isSolving) {
      if ('TEMP_ADJUST_LATER' in window) {
        window.clearTimeout(window.TEMP_ADJUST_LATER)
        delete window.TEMP_ADJUST_LATER
      }
    } else {
      const performMove = () => {
        const moves = getMoves()

        // TODO
        // Stop if current `isSolving` is `false`
        if (!moves.length) return

        let move
        if (leftPersonShouldJump) {
          move = moves.find((move) => move[0] === 'leftPersonJump')
          if (!move) {
            move = moves.find((move) => move[0] === 'leftPersonMove')
            setFeedback(
              <p>
                No left person can jump, left person will now move one step
                forward before right persons start to jump
              </p>
            )
          } else {
            setFeedback(
              <p>
                Left persons will continue to jump until they can no longer jump
              </p>
            )
          }
          // if (!move) {
          //   move = moves[0]
          // }
        } else if (rightPersonShouldJump) {
          move = moves.find((move) => move[0] === 'rightPersonJump')
          if (!move) {
            move = moves.find((move) => move[0] === 'rightPersonMove')
            setFeedback(
              <p>
                No right person can jump, a right person will now move one step
                forward before left persons starts to jump
              </p>
            )
          } else {
            setFeedback(
              <p>
                Right persons will continue to jump until they can no longer
                jump
              </p>
            )
          }
          // if (!move) {
          //   move = moves[0]
          // }
        }

        if (!move) {
          move = moves[0]
          if (moves.length === 1) {
            setFeedback(<p>One move possible, no strategy required</p>)
          } else {
            setFeedback(
              <p>
                No person can jump, we will move one of the persons one step
                forward
              </p>
            )
          }
        }

        let [fnName, args] = move
        let fn

        if (fnName === 'leftPersonMove') {
          fn = leftPersonMove
        } else if (fnName === 'leftPersonJump') {
          fn = leftPersonJump
        } else if (fnName === 'rightPersonMove') {
          fn = rightPersonMove
        } else if (fnName === 'rightPersonJump') {
          fn = rightPersonJump
        }

        window.TEMP_ADJUST_LATER = setTimeout(() => {
          fn.apply(null, args)
          performMove()
        }, solveStepDelay)
      }

      performMove()
    }

    setIsSolving(!isSolving)
  }, [isSolving, solveStepDelay])

  const reset = useCallback(() => {
    initialize(
      { left: leftPersonCount, right: rightPersonCount },
      emptyGroundCount
    )
    if ('TEMP_ADJUST_LATER' in window) {
      window.clearTimeout(window.TEMP_ADJUST_LATER)
      delete window.TEMP_ADJUST_LATER
    }
    setFeedback('')
    setIsSolving(false)
    setIsGameOver(false)
    setCopiedItems([])
    setStateKey(getUniqueID())
  }, [leftPersonCount, rightPersonCount, emptyGroundCount])

  const providerCommonProps = {
    boxes,
    leftPersons,
    rightPersons,

    leftPerson,
    rightPerson,
    ground,
    onGround,
    nextGround,
    groundClear,

    leftPersonMoveApplicable,
    leftPersonMove,

    rightPersonMoveApplicable,
    rightPersonMove,

    leftPersonJump,

    rightPersonJump
  }

  return (
    <Container className="mt-5">
      <div style={{ minHeight: 150 }} className="d-none">
        <div className="feedback">
          {feedback || <p>Hit `Solve` button to start receiving feedback</p>}
        </div>
      </div>

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
        {!isGameOver && (
          <Button
            onClick={toggleSolve}
            size="sm"
            variant={isSolving ? 'danger' : 'primary'}
            className="mb-2 mx-1 position-relative"
            style={{ zIndex: 2 }}
          >
            {isSolving ? 'Stop' : 'Apply Strategy'}
          </Button>
        )}
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
              id="empty-ground-count"
              value={emptyGroundCount}
              onChange={updateEmptyGroundCount}
              placeholder="Empty Ground Count"
            />
          </div>

          <div className="mb-2 mx-1 d-inline-block w-200">
            <label className="control-label">Solve Step Delay</label>
            <Form.Control
              value={solveStepDelay}
              onChange={updateSolveStepDelay}
              placeholder="Solve Step Delay"
            />
          </div>
        </div>
      </div>

      <VisualizerContext.Provider value={providerCommonProps}>
        <div>
          <div className="position-relative d-inline-block text-nowrap overflow-visible">
            {boxes.map((box) => {
              return <Box key={box.id} {...box} />
            })}

            {leftPersons.map((lp) => {
              return <LeftSoldier key={lp.id} {...lp} />
            })}

            {rightPersons.map((rp) => {
              return <RightSoldier key={rp.id} {...rp} />
            })}
          </div>
        </div>
      </VisualizerContext.Provider>

      {copiedItems.map((item, index) => {
        const { leftPersons, rightPersons, boxes } = item

        return (
          <VisualizerContext.Provider
            key={index}
            value={{
              ...providerCommonProps,
              boxes,
              leftPersons,
              rightPersons
            }}
          >
            <div className="mt-4">
              <div className="position-relative d-inline-block text-nowrap overflow-visible">
                {boxes.map((box) => {
                  return <Box key={box.id} {...box} />
                })}

                {leftPersons.map((lp) => {
                  return <LeftSoldier key={lp.id} {...lp} />
                })}

                {rightPersons.map((rp) => {
                  return <RightSoldier key={rp.id} {...rp} />
                })}
              </div>
            </div>
          </VisualizerContext.Provider>
        )
      })}

      {isSolving && (
        <div
          className="position-fixed w-100 h-100"
          style={{ top: 0, left: 0, zIndex: 1 }}
        />
      )}
    </Container>
  )
}

export default SwitchingSoldiersVisualizer
