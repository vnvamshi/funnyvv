import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const AgenticContext = createContext(null)
const API = 'http://localhost:1117/api'

export const AgenticProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [sessionId, setSessionId] = useState(null)
  const [userType, setUserType] = useState('visitor')
  const [isConnected, setIsConnected] = useState(false)
  const [navStack, setNavStack] = useState([])
  
  useEffect(() => {
    fetch(`${API}/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_type: userType })
    }).then(r => r.json()).then(d => {
      if (d.session_id) { setSessionId(d.session_id); setIsConnected(true) }
    }).catch(() => {})
  }, [])
  
  useEffect(() => {
    setNavStack(p => [...p, { route: location.pathname, title: document.title }])
    if (sessionId) {
      fetch(`${API}/navigation/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, page_route: location.pathname })
      }).catch(() => {})
    }
  }, [location.pathname, sessionId])
  
  const sendVoice = useCallback(async (text, page) => {
    try {
      const res = await fetch(`${API}/ledger/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_type: userType, session_id: sessionId, raw_transcript: text, page_route: page })
      })
      return res.json()
    } catch { return null }
  }, [sessionId, userType])
  
  const goBack = useCallback(async () => {
    if (navStack.length > 1) {
      try {
        const res = await fetch(`${API}/navigation/back`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId })
        })
        const d = await res.json()
        if (d.success && d.page) { setNavStack(p => p.slice(0, -1)); navigate(d.page.page_route) }
      } catch { navigate(-1) }
    }
  }, [sessionId, navStack, navigate])
  
  const goHome = useCallback(() => { setNavStack([]); navigate('/') }, [navigate])
  
  return (
    <AgenticContext.Provider value={{ sessionId, userType, setUserType, isConnected, navStack, sendVoice, goBack, goHome }}>
      {children}
    </AgenticContext.Provider>
  )
}

export const useAgentic = () => useContext(AgenticContext)
