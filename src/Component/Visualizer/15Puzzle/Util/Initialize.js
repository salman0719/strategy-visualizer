import getObj from '../../../../Util/getObj'
import { getUniqueID } from '../../../../Util/getUniqueId'
// import { DEFAULT_PERSON_COUNT, DEFAULT_EMPTY_GROUND_COUNT } from '../Constants'
import {
  templatePredicateForOne,
  templatePredicateForTwo
} from './TemplatePredicates'

// TEMP
// Placing here
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ]
  }

  return array
}

export default function initialize() {
  // personCount = DEFAULT_PERSON_COUNT,
  // emptyGround = DEFAULT_EMPTY_GROUND_COUNT
  // if (typeof personCount !== 'object') {
  //   personCount = { left: personCount, right: personCount }
  // }

  // TEMP
  // Static coding
  const columnCount = 4,
    rowCount = 4
  const totalBox = columnCount * rowCount
  const totalTile = totalBox - 1

  const tiles = Array(totalTile)
    .fill(0)
    .map((item, index) => {
      const id = 'tile-' + index + '-' + getUniqueID()
      return { id, number: index + 1 }
    })

  const boxes = Array(totalBox)
    .fill(0)
    .map((item, index) => {
      const id = 'box-' + index + '-' + getUniqueID()
      return { id, index, number: index + 1 }
    })

  const tileObj = getObj(tiles, 'id')
  const boxObj = getObj(boxes, 'id')

  const tilePred = templatePredicateForOne('tile')
  const positionPred = templatePredicateForOne('position')
  const emptyPred = templatePredicateForOne('empty')
  const atPred = templatePredicateForTwo('at', {
    onAssert: (tileId, boxId) => {
      const tile = tileObj[tileId]
      const box = boxObj[boxId]
      const boxIndex = box.number - 1

      tile.boxNumber = boxIndex + 1
      tile.boxId = box.id
      tile.posX = boxIndex % columnCount
      tile.posY = Math.floor(boxIndex / columnCount)
    },
    onNegate: (tileId, boxId) => {
      const tile = tileObj[tileId]
      tile.boxNumber = null
      tile.boxId = null
      tile.posX = null
      tile.posY = null
    }
  })
  const adjacentuPred = templatePredicateForTwo('adjacentu')
  const adjacentdPred = templatePredicateForTwo('adjacentd')
  const adjacentlPred = templatePredicateForTwo('adjacentl')
  const adjacentrPred = templatePredicateForTwo('adjacentr')

  tiles.forEach((tile) => {
    tilePred(tile.id)
  })
  boxes.forEach((box) => {
    positionPred(box.id)
  })

  boxes.forEach((box, index) => {
    if ((index % columnCount) - 1 === (index - 1) % columnCount && index > 0) {
      adjacentlPred(box.id, boxes[index - 1].id)
    }

    if (
      (index % columnCount) + 1 === (index + 1) % columnCount &&
      index < totalBox - 1
    ) {
      adjacentrPred(box.id, boxes[index + 1].id)
    }

    if (index - columnCount > -1) {
      adjacentuPred(box.id, boxes[index - columnCount].id)
    }

    if (index + columnCount < totalBox) {
      adjacentdPred(box.id, boxes[index + columnCount].id)
    }
  })

  shuffle(
    Array(totalTile)
      .fill(0)
      .map((_, index) => index)
  ).forEach((randomIndex, index) => {
    const tile = tiles[randomIndex]
    const box = boxes[index]
    atPred(tile.id, box.id)
  })

  emptyPred(boxes[15].id)

  return {
    tiles,
    boxes,
    predicates: {
      tile: tilePred,
      position: positionPred,
      empty: emptyPred,
      at: atPred,
      adjacentu: adjacentuPred,
      adjacentd: adjacentdPred,
      adjacentl: adjacentlPred,
      adjacentr: adjacentrPred
    }
  }
}
