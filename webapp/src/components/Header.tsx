type HeaderProps = {
  onNavigate: (page: 'chat' | 'about') => void
  onLogoClick: () => void
}

export function Header({ onNavigate, onLogoClick }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <button type="button" className="logo-btn" onClick={onLogoClick} aria-label="Go to home">
            <img src="/logo.svg" alt="SLIIT Logo" className="brand-logo" />
          </button>
          <h1 className="brand-title">
            Ask Questions About Admissions, Academics, and Student Services
          </h1>
        </div>
        <div className="topbar-actions">
          <button type="button" className="link-btn" onClick={() => onNavigate('about')}>
            <span className="link-btn-label">About Project</span>
          </button>
          <a
            href="https://github.com/chamals3n4/sliit-support"
            target="_blank"
            rel="noopener noreferrer"
            className="link-btn"
            aria-label="Open GitHub repository"
          >
            <svg viewBox="0 0 16 16" className="icon-github" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.67 0 8.2c0 3.63 2.29 6.71 5.47 7.79.4.08.55-.18.55-.39 0-.19-.01-.82-.01-1.48-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.15-.28-.16-.68-.55-.01-.56.63-.01 1.08.59 1.23.84.72 1.24 1.87.89 2.33.68.07-.53.28-.89.5-1.09-1.78-.21-3.64-.92-3.64-4.07 0-.9.31-1.64.82-2.22-.08-.21-.36-1.04.08-2.17 0 0 .67-.22 2.2.85.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.07 2.2-.85 2.2-.85.44 1.13.16 1.96.08 2.17.51.58.82 1.31.82 2.22 0 3.16-1.87 3.86-3.65 4.07.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.47.55.39A8.18 8.18 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z" />
            </svg>
            <span className="hide-sm link-btn-label">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  )
}
