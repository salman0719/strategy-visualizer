import React, { useCallback, useState, useEffect, useContext } from 'react'
import Puzzle15VisualizerContext from './Context'
import { BOX_WIDTH } from '../../../Util/constants'

const Tile = function (props) {
  const { getMove } = useContext(Puzzle15VisualizerContext)
  const { id, className, number, boxId, posX, posY } = props

  const onClick = useCallback((e) => {
    const move = getMove(id)
    move && move()
  }, [id])

  const [left, setLeft] = useState(0)
  const [top, setTop] = useState(0)

  useEffect(() => {
    if (boxId) {
      setLeft(posX * BOX_WIDTH)
      setTop(posY * BOX_WIDTH)
    }
  }, [boxId, posX, posY])

  if (!boxId) {
    return null
  }

  return (
    <div
      style={{ left, top }}
      className={'tile' + (className ? ' ' + className : '')}
      onClick={onClick}
    >
      <small>{number}</small>
    </div>
  )
}

export default Tile
