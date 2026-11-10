import { Outlet, NavLink } from 'react-router-dom'
import './Layout.css'

function NavIcon({ d }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const LINKS = [
  { to: '/', label: 'Home', end: true,   d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { to: '/champions', label: 'Champions', d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { to: '/builds',    label: 'Builds',    d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' },
  { to: '/profile',   label: 'Profile',   d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
]

export default function Layout() {
  return (
    <div className="app-layout">
      {/* Top navbar */}
      <nav className="navbar">
        <NavLink to="/" className="navbar-logo">
          {/* Hextech emblem SVG */}
          <svg className="navbar-logo-mark" viewBox="0 0 30 30" fill="none">
            <polygon
              points="15,2 27,8 27,22 15,28 3,22 3,8"
              stroke="#c89b3c" strokeWidth="1.2" fill="none"
            />
            <polygon
              points="15,7 22,11 22,19 15,23 8,19 8,11"
              stroke="#785a28" strokeWidth="0.8" fill="rgba(200,155,60,0.06)"
            />
            <circle cx="15" cy="15" r="3.5" fill="#c89b3c" />
            <circle cx="15" cy="15" r="2" fill="#010a13" />
            <circle cx="15" cy="15" r="1" fill="#c89b3c" />
          </svg>
          <div className="navbar-logo-text">
            LoL Tracker
            <span>Champion Database</span>
          </div>
        </NavLink>

        <div className="navbar-links">
          {LINKS.map(({ to, label, end, d }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <NavIcon d={d} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Page content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          {LINKS.map(({ to, label, end, d }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            >
              <NavIcon d={d} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
