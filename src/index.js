import './root_css_constants.css'
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App"

const rootElement = document.getElementById("root")
const root = createRoot(rootElement)

// TEMP
// Temporarily rendering without StrictMode

root.render(<App />)

// root.render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// )
