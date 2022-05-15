import getObj from '../../../../Util/getObj'
import { getUniqueID } from '../../../../Util/getUniqueId'
import { templatePredicateForOne, templatePredicateForTwo } from '../../../../Util/predicate'
import shuffle from '../../../../Util/shuffle'
import { DEFAULT_COLUMNS, DEFAULT_ROWS } from '../Constants'
import { PREDICATE_KEY } from '../../../../Util/constants'

export default function initialize(props) {
  const columnCount = parseInt(props.columnCount) || DEFAULT_COLUMNS
  const rowCount = parseInt(props.rowCount) || DEFAULT_ROWS

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
      return { id, index, number: index + 1, posX: index % columnCount, posY: Math.floor(index / columnCount) }
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

      box.tileId = tile.id
    },
    onNegate: function ({ boxes: boxObj, tiles: tileObj }, tileId, boxId) {
      const tile = tileObj[tileId]
      tile.boxNumber = null
      tile.boxId = null
      tile.posX = null
      tile.posY = null

      boxObj[boxId].tileId = null
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
    const connectedBoxIdObj = {}

    if ((index % columnCount) - 1 === (index - 1) % columnCount && index > 0) {
      let connectedId = boxes[index - 1].id
      adjacentlPred(box.id, connectedId)
      connectedBoxIdObj[connectedId] = 'moveRight'
    }

    if ((index % columnCount) + 1 === (index + 1) % columnCount && index < totalBox - 1) {
      let connectedId = boxes[index + 1].id
      adjacentrPred(box.id, connectedId)
      connectedBoxIdObj[connectedId] = 'moveLeft'
    }

    if (index - columnCount > -1) {
      let connectedId = boxes[index - columnCount].id
      adjacentuPred(box.id, connectedId)
      connectedBoxIdObj[connectedId] = 'moveDown'
    }

    if (index + columnCount < totalBox) {
      let connectedId = boxes[index + columnCount].id
      adjacentdPred(box.id, connectedId)
      connectedBoxIdObj[connectedId] = 'moveUp'
    }

    box.connectedBoxIdObj = connectedBoxIdObj
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

  // NOTE
  // Based on end goal, this might change, so if we change in the `isSolved` file,
  // probably that should be reflected in here as well!
  tiles.forEach((tile, index) => {
    tile.expectedPosX = index % columnCount
    tile.expectedPosY = Math.floor(index / columnCount)
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
