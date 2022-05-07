import React from 'react'

const Box = function ({ number }) {
  return <div className="box">{null && <small>{number}</small>}</div>
}

export default Box
