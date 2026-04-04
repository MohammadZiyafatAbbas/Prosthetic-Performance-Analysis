import { NavLink, useLocation } from 'react-router-dom';

/**
 * Sidebar navigation component.
 * @returns {JSX.Element}
 */
export default function Sidebar() {
  const location = useLocation();

  const links = [
    {
      to: '/',
      label: 'Dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h4a1 1 0 001-1v-3h2v3a1 1 0 001 1h4a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      to: '/sessions',
      label: 'Sessions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      to: '/about',
      label: 'About',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col py-6 px-4 shadow-2xl">
      {/* App brand */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-500 text-white shadow-lg">
          {/* Inline SVG prosthetic arm icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 2a2 2 0 012 2v1h1a3 3 0 013 3v1h.5a1.5 1.5 0 010 3H18v1a3 3 0 01-3 3h-1v1a2 2 0 01-4 0v-1H9a3 3 0 01-3-3V8a3 3 0 013-3h1V4a2 2 0 012-2zm0 6a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
        </div>
        <span className="text-white font-bold text-sm leading-tight tracking-tight">Prosthetic Performance Analysis</span>
      </div>

      {/* Navigation links */}
      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon }) => {
          const isActive =
            to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {icon}
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-2">
        <p className="text-slate-600 text-xs">Prosthetic Performance Analysis v1.0</p>
      </div>
    </aside>
  );
}
