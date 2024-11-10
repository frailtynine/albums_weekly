import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ComponentProvider } from './Components/Misc/Context.tsx'

createRoot(document.getElementById('root')!).render(
    <ComponentProvider>
  <StrictMode>
    <App />
  </StrictMode>,
    </ComponentProvider>
)
