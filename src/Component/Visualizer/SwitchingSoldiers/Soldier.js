import React, { useContext, useEffect, useState } from 'react'
import { BOX_WIDTH } from '../../../Util/constants'
import SwitchingSoldiersContext from './Context'

const Soldier = function ({ id, className, boxIndex, onClick, number }) {
  const { activePersonId } = useContext(SwitchingSoldiersContext)
  const [left, setLeft] = useState(10)

  useEffect(() => {
    const update = () => { setLeft(10 + boxIndex * BOX_WIDTH) }
    boxIndex != null && (left === 10 ? setTimeout(update, 0) : update())
  }, [boxIndex])

  return (
    <div
      style={{ left }}
      className={'soldier' + (className ? ' ' + className : '') + (id === activePersonId ? ' active' : '')}
      onClick={onClick}
    >
      <small>{number}</small>
    </div>
  )
}

export default Soldier
