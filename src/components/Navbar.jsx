import { 
  Map, 
  Navigation, 
  Building2, 
  Info, 
  Sun, 
  Moon 
} from 'lucide-react';
import '../Navbar.css';

export default function Navbar({ 
  activeTab = 'map', 
  onSelectTab, 
  isDarkMode = false, 
  onToggleDarkMode,
  onOpenAbout
}) {
  const navTabs = [
    { id: 'map', label: 'Map', icon: Map },
    { id: 'directions', label: 'Directions', icon: Navigation },
    { id: 'places', label: 'Places', icon: Building2 },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <>
      {/* Desktop Slim Top App Bar */}
      <header className="app-topbar" role="banner">
        <div className="topbar-brand">
          <div className="topbar-logo-badge" aria-hidden="true">
            <Navigation className="topbar-logo-icon" size={20} />
          </div>
          <div className="topbar-title-group">
            <span className="topbar-title">CampusMap</span>
            <span className="topbar-badge">3D Nav</span>
          </div>
        </div>

        {/* Desktop Primary Nav Tabs */}
        <nav className="desktop-nav-tabs" aria-label="Primary Desktop Navigation">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`topbar-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (tab.id === 'about') {
                    onOpenAbout();
                  } else {
                    onSelectTab(tab.id);
                  }
                }}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.label}
              >
                <Icon size={18} aria-hidden="true" className="tab-icon" />
                <span className="tab-label">{tab.label}</span>
                {isActive && <span className="tab-active-indicator" aria-hidden="true" />}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="topbar-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`mobile-tab-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (tab.id === 'about') {
                  onOpenAbout();
                } else {
                  onSelectTab(tab.id);
                }
              }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
            >
              <div className="mobile-tab-icon-wrap">
                <Icon size={20} aria-hidden="true" />
              </div>
              <span className="mobile-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}