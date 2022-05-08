import './toast.css'
import './styles.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useState, useEffect } from 'react'
import SwitchingSoldiersVisualizer from './Component/Visualizer/SwitchingSoldiers'
import SwitchingSoldiersVisualizerOld from './Component/Visualizer/SwitchingSoldiersOld'
import { ToastProvider } from './Component/Toast'
import queryString from './Util/queryString'
import Puzzle15Visualizer from './Component/Visualizer/15Puzzle'

const qsPuzzleMapper = {
  'default': SwitchingSoldiersVisualizer,
  'switching_soldiers_old': SwitchingSoldiersVisualizerOld,
  'switching_soldiers': SwitchingSoldiersVisualizer,
  '15puzzle': Puzzle15Visualizer
}

export default function App() {
  const [toastRendered, setToastRendered] = useState(false)

  useEffect(() => {
    setToastRendered(true)
  }, [])

  const Comp = qsPuzzleMapper[queryString.parse().puzzle] || qsPuzzleMapper.default

  return (
    <div className="App">
      {toastRendered && <Comp />}
      <ToastProvider />
    </div>
  )
}
