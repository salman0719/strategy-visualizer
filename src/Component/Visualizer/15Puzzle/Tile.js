import React, { useCallback, useState, useEffect, useContext } from 'react'
import Puzzle15VisualizerContext from './Context'

const Tile = function (props) {
  const { getMove } = useContext(Puzzle15VisualizerContext)
  const { id, className, number, boxId, posX, posY } = props

  const onClick = useCallback(
    (e) => {
      const move = getMove(id)
      move && move()
    },
    [id]
  )

  const [left, setLeft] = useState(0)
  const [top, setTop] = useState(0)

  useEffect(() => {
    // TODO
    // Instead of `40`, use variables that can span across js and css
    if (boxId) {
      setLeft(posX * 40)
      setTop(posY * 40)
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
