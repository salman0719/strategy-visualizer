import './toast.css'
import './styles.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useState, useEffect } from 'react'
import SwitchingSoldiersVisualizer from './Component/Visualizer/SwitchingSoldiers'
import { ToastProvider } from './Component/Toast'
import queryString from './Util/queryString'
import Puzzle15Visualizer from './Component/Visualizer/15Puzzle'

const TEMP_TEST = () => {
  console.log('Testing codesandbox linking with github!')
}

export default function App() {
  const [toastRendered, setToastRendered] = useState(false)

  // TEMP
  console.log('Testing')

  useEffect(() => {
    setToastRendered(true)
  }, [])

  const render15Puzzle = queryString.parse().puzzle === '15puzzle'

  return (
    <div className="App">
      {toastRendered &&
        (render15Puzzle ? (
          <Puzzle15Visualizer />
        ) : (
          <SwitchingSoldiersVisualizer />
        ))}
      <ToastProvider />
    </div>
  )
}
