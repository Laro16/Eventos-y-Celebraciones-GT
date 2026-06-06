import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Catálogo público (sin login) */}
        <Route path="/" element={<App />} />
        {/* Panel de administración (con login) — lo construimos más adelante */}
        <Route path="/admin" element={<App admin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
