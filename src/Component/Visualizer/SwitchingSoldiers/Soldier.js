import React, { useContext, useEffect, useState } from 'react'
import VisualizerContext from './Context'

const Soldier = function ({ id, className, boxId, onClick, number }) {
  const { boxes } = useContext(VisualizerContext)

  const [left, setLeft] = useState(10)

  useEffect(() => {
    // TODO
    // Instead of `42`, use variables that can span across js and css
    setLeft(10 + boxes.find((box) => box.id === boxId).index * 42)
  }, [boxId])

  return (
    <div
      style={{ left }}
      className={'soldier' + (className ? ' ' + className : '')}
      onClick={onClick}
    >
      <small>{number}</small>
    </div>
  )
}

export default Soldier
