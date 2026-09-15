import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const navigationLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Our Work', to: '/our-work' },
  { label: 'Events', to: '/events' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Volunteer', to: '/volunteer' },
  { label: 'Support Us', to: '/support' },
  { label: 'Contact', to: '/contact' },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-bronze-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-4">
        <NavLink
          to="/"
          end
          className="shrink-0 rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600"
        >
          <img
            src={logo}
            alt="Valluvam"
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
          />
        </NavLink>

        <div className="ml-auto flex min-w-0 items-center gap-6 overflow-x-auto">
          <nav aria-label="Main navigation" className="shrink-0">
            <ul className="flex items-center gap-5">
              {navigationLinks.map(({ label, to }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `inline-block whitespace-nowrap border-b-2 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600 ${
                        isActive
                          ? 'border-bronze-500 text-bronze-700'
                          : 'border-transparent text-charcoal-950 hover:border-bronze-200 hover:text-bronze-700'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Visual placeholder until language switching is added. */}
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap border-l border-bronze-100 pl-5 text-sm">
            <span lang="en" className="font-semibold text-bronze-700">EN</span>
            <span aria-hidden="true" className="text-charcoal-300">|</span>
            <span lang="ta" className="text-charcoal-700">தமிழ்</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
