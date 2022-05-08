import React, { useEffect, useState } from 'react'
import { BOX_WIDTH } from '../../../Util/constants'

const Soldier = function ({ className, boxIndex, onClick, number }) {
  const [left, setLeft] = useState(10)

  useEffect(() => {
    boxIndex != null && setLeft(10 + boxIndex * BOX_WIDTH)
  }, [boxIndex])

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
