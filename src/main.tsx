import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // Importing from src/App.tsx
import './styles/globals.css' // Or globals.css

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)