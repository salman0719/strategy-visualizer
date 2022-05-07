import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Container } from 'react-bootstrap'
import { getUniqueID } from '../../../Util/getUniqueId'
import Box from './Box'
import VisualizerContext from './Context'
import Tile from './Tile'
import toast from '../../Toast'
import getObj from '../../../Util/getObj'

const getForceUpdate = () => {
  const set = useState()[1]
  return () => {
    set(getUniqueID())
  }
}

const Puzzle15Container = function ({
  tiles,
  boxes,
  predicates,
  stateIdentifier,
  onActive,
  isActiveBranch
}) {
  const forceUpdate = getForceUpdate()

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

  const moveUpApplicable = useCallback(
    (t, from, emp) => {
      // :precondition (and (tile ?t) (position ?from) (position ?emp)
      //                  (adjacentu ?from ?emp) (at ?t ?from) (empty ?emp))

      if (
        predicates.tile.has(t) &&
        predicates.position.has(from) &&
        predicates.position.has(emp) &&
        predicates.adjacentu.has(from, emp) &&
        predicates.at.has(t, from) &&
        predicates.empty.has(emp)
      ) {
        return true
      }

      return false
    },
    [predicates]
  )

  const moveDownApplicable = useCallback(
    (t, from, emp) => {
      // :precondition (and (tile ?t) (position ?from) (position ?emp)
      //                    (adjacentd ?from ?emp) (at ?t ?from) (empty ?emp))

      if (
        predicates.tile.has(t) &&
        predicates.position.has(from) &&
        predicates.position.has(emp) &&
        predicates.adjacentd.has(from, emp) &&
        predicates.at.has(t, from) &&
        predicates.empty.has(emp)
      ) {
        return true
      }

      return false
    },
    [predicates]
  )

  const moveLeftApplicable = useCallback(
    (t, from, emp) => {
      // :precondition (and (tile ?t) (position ?from) (position ?emp)
      //                    (adjacentl ?from ?emp) (at ?t ?from) (empty ?emp))

      if (
        predicates.tile.has(t) &&
        predicates.position.has(from) &&
        predicates.position.has(emp) &&
        predicates.adjacentl.has(from, emp) &&
        predicates.at.has(t, from) &&
        predicates.empty.has(emp)
      ) {
        return true
      }

      return false
    },
    [predicates]
  )

  const moveRightApplicable = useCallback(
    (t, from, emp) => {
      // :precondition (and (tile ?t) (position ?from) (position ?emp)
      //                    (adjacentr ?from ?emp) (at ?t ?from) (empty ?emp))

      if (
        predicates.tile.has(t) &&
        predicates.position.has(from) &&
        predicates.position.has(emp) &&
        predicates.adjacentr.has(from, emp) &&
        predicates.at.has(t, from) &&
        predicates.empty.has(emp)
      ) {
        return true
      }

      return false
    },
    [predicates]
  )

  const moveUp = useCallback(
    (t, from, emp) => {
      if (moveUpApplicable(t, from, emp)) {
        // :effect (and (not (at ?t ?from)) (not (empty ?emp))
        //            (at ?t ?emp) (empty ?from))
        predicates.at.not(t, from)
        predicates.empty.not(emp)
        predicates.at(t, emp)
        predicates.empty(from)

        forceUpdate()
      }
    },
    [predicates]
  )

  const moveDown = useCallback(
    (t, from, emp) => {
      if (moveDownApplicable(t, from, emp)) {
        // :effect (and (not (at ?t ?from)) (not (empty ?emp))
        //            (at ?t ?emp) (empty ?from))
        predicates.at.not(t, from)
        predicates.empty.not(emp)
        predicates.at(t, emp)
        predicates.empty(from)

        forceUpdate()
      }
    },
    [predicates]
  )

  const moveLeft = useCallback(
    (t, from, emp) => {
      if (moveLeftApplicable(t, from, emp)) {
        // :effect (and (not (at ?t ?from)) (not (empty ?emp))
        //            (at ?t ?emp) (empty ?from))
        predicates.at.not(t, from)
        predicates.empty.not(emp)
        predicates.at(t, emp)
        predicates.empty(from)

        forceUpdate()
      }
    },
    [predicates]
  )

  const moveRight = useCallback(
    (t, from, emp) => {
      if (moveRightApplicable(t, from, emp)) {
        // :effect (and (not (at ?t ?from)) (not (empty ?emp))
        //            (at ?t ?emp) (empty ?from))
        predicates.at.not(t, from)
        predicates.empty.not(emp)
        predicates.at(t, emp)
        predicates.empty(from)

        forceUpdate()
      }
    },
    [predicates]
  )

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

      if (moveUpApplicable(t, from, emp)) {
        fn = moveUp
      } else if (moveDownApplicable(t, from, emp)) {
        fn = moveDown
      } else if (moveLeftApplicable(t, from, emp)) {
        fn = moveLeft
      } else if (moveRightApplicable(t, from, emp)) {
        fn = moveRight
      }

      if (fn) {
        return fn.bind(null, t, from, emp)
      }

      return false
    },
    [predicates]
  )

  return (
    <VisualizerContext.Provider
      value={{
        boxes,
        tiles,
        getMove
      }}
    >
      <Container className="mt-3">
        <div
          className="position-relative d-inline-block overflow-visible fifteen-puzzle-container"
          style={{ width: 160 }}
        >
          {boxes.map((box) => {
            return <Box key={box.id} {...box} />
          })}

          {tiles.map((tile) => {
            return <Tile key={tile.id} {...tile} />
          })}

          <div
            className={
              'd-none state-identifier' + (isActiveBranch ? ' active' : '')
            }
            onClick={onActive}
          >
            {stateIdentifier}
          </div>
        </div>
      </Container>
    </VisualizerContext.Provider>
  )
}

export default Puzzle15Container
