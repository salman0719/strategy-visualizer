import getObj from '../../../../Util/getObj'
import { getUniqueID } from '../../../../Util/getUniqueId'
import { templatePredicateForOne, templatePredicateForTwo } from '../../../../Util/predicate'
import shuffle from '../../../../Util/shuffle'
import { DEFAULT_COLUMNS, DEFAULT_ROWS, PREDICATE_KEY } from '../Constants'

export default function initialize(
  { columns: columnCount, rows: rowCount } = { columns: DEFAULT_COLUMNS, rows: DEFAULT_ROWS }
) {
  const totalBox = columnCount * rowCount
  const totalTile = totalBox - 1

  const tiles = Array(totalTile)
    .fill(0)
    .map((_, index) => {
      const id = 'tile-' + index + '-' + getUniqueID()
      return { id, number: index + 1 }
    })

  const boxes = Array(totalBox)
    .fill(0)
    .map((_, index) => {
      const id = 'box-' + index + '-' + getUniqueID()
      return { id, index, number: index + 1 }
    })

  const tileObj = getObj(tiles, 'id')
  const boxObj = getObj(boxes, 'id')

  const tilePred = templatePredicateForOne('tile')
  const positionPred = templatePredicateForOne('position')
  const emptyPred = templatePredicateForOne('empty')
  const atPred = templatePredicateForTwo('at', {
    onAssert: function ({ boxes: boxObj, tiles: tileObj }, tileId, boxId) {
      const tile = tileObj[tileId]
      const box = boxObj[boxId]
      const boxIndex = box.number - 1

      tile.boxNumber = boxIndex + 1
      tile.boxId = box.id
      tile.posX = boxIndex % columnCount
      tile.posY = Math.floor(boxIndex / columnCount)
    },
    onNegate: function ({ tiles: tileObj }, tileId) {
      const tile = tileObj[tileId]
      tile.boxNumber = null
      tile.boxId = null
      tile.posX = null
      tile.posY = null
    },
  })
  const adjacentuPred = templatePredicateForTwo('adjacentu')
  const adjacentdPred = templatePredicateForTwo('adjacentd')
  const adjacentlPred = templatePredicateForTwo('adjacentl')
  const adjacentrPred = templatePredicateForTwo('adjacentr')

  atPred.setEventData({ boxes: boxObj, tiles: tileObj })

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

  emptyPred(boxes[totalBox - 1].id)

  return {
    tiles,
    boxes,
    [PREDICATE_KEY]: {
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
