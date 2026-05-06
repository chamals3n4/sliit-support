import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Header } from './components/Header'
import { AboutPage } from './pages/AboutPage'
import { ChatPage } from './pages/ChatPage'

function App() {
  const initialPage = useMemo<'chat' | 'about'>(() => (window.location.pathname === '/about' ? 'about' : 'chat'), [])
  const [page, setPage] = useState<'chat' | 'about'>(initialPage)

  const navigate = (next: 'chat' | 'about') => {
    setPage(next)
    window.history.pushState({}, '', next === 'about' ? '/about' : '/')
  }

  useEffect(() => {
    const onPop = () => setPage(window.location.pathname === '/about' ? 'about' : 'chat')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return (
    <>
      <Header onNavigate={navigate} />
      {page === 'about' ? <AboutPage onBack={() => navigate('chat')} /> : <ChatPage />}
    </>
  )
}

export default App
