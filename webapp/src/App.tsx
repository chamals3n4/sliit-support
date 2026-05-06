import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Header } from './components/Header'
import { AboutPage } from './pages/AboutPage'
import { ChatPage } from './pages/ChatPage'

function App() {
  const initialPage = useMemo<'chat' | 'about'>(() => (window.location.pathname === '/about' ? 'about' : 'chat'), [])
  const [page, setPage] = useState<'chat' | 'about'>(initialPage)
  const currentYear = new Date(Date.now()).getFullYear()

  const navigate = (next: 'chat' | 'about') => {
    setPage(next)
    window.history.pushState({}, '', next === 'about' ? '/about' : '/')
  }

  const goHomeFromLogo = () => {
    const isHome = page === 'chat' && window.location.pathname === '/'
    if (isHome) {
      window.location.reload()
      return
    }
    navigate('chat')
  }

  useEffect(() => {
    const onPop = () => setPage(window.location.pathname === '/about' ? 'about' : 'chat')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return (
    <>
      <Header onNavigate={navigate} onLogoClick={goHomeFromLogo} />
      {page === 'about' ? <AboutPage onBack={() => navigate('chat')} /> : <ChatPage />}
      <footer className="app-footer">
        Made with ❤️ by Chamal Senarathna © {currentYear} - This assistant can make mistakes.
      </footer>
    </>
  )
}

export default App
