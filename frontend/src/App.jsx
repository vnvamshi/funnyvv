import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AgenticBar from './components/agentic/AgenticBar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/properties" element={<Properties />} />
      </Routes>
      <AgenticBar />
    </div>
  )
}

export default App
