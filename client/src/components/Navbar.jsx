import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.jpg';

function Navbar() {
  const { settings } = useSettings();
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationLinks = [
    { label: t('navbar.home'), to: '/' },
    { label: t('navbar.aboutUs'), to: '/about' },
    { label: t('navbar.ourWork'), to: '/our-work' },
    { label: t('navbar.events'), to: '/events' },
    { label: t('navbar.gallery'), to: '/gallery' },
    { label: t('navbar.volunteer'), to: '/volunteer' },
    { label: t('navbar.supportUs'), to: '/support' },
    { label: t('navbar.contact'), to: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-bronze-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-4">
        <NavLink
          to="/"
          end
          onClick={() => setIsMenuOpen(false)}
          className="shrink-0 rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600"
        >
          <img
            src={logo}
            alt={settings.organizationName}
            width={80}
            height={80}
            decoding="async"
            className="h-20 w-20 object-contain"
          />
        </NavLink>

        <button
          type="button"
          aria-label={isMenuOpen ? t('navbar.closeMenu') : t('navbar.openMenu')}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-md border border-bronze-200 text-charcoal-950 transition-colors hover:bg-bronze-50 hover:text-bronze-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600 lg:hidden"
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d={isMenuOpen ? 'M6 6l12 12M6 18L18 6' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>

        <div className="ml-auto hidden min-w-0 items-center gap-6 overflow-x-auto lg:flex">
          <nav aria-label={t('navbar.mainNav')} className="shrink-0">
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

          {/* Language selector */}
          <div
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap border-l border-bronze-100 pl-5 text-sm"
            role="group"
            aria-label="Language selection"
          >
            <button
              type="button"
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              className={`rounded px-1.5 py-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600 ${
                language === 'en'
                  ? 'font-bold text-bronze-700 cursor-default'
                  : 'font-normal text-charcoal-600 hover:text-bronze-700'
              }`}
            >
              EN
            </button>
            <span aria-hidden="true" className="text-charcoal-300 select-none">|</span>
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              aria-pressed={language === 'ta'}
              className={`rounded px-1.5 py-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600 ${
                language === 'ta'
                  ? 'font-bold text-bronze-700 cursor-default'
                  : 'font-normal text-charcoal-600 hover:text-bronze-700'
              }`}
            >
              TA
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-navigation"
        hidden={!isMenuOpen}
        className="max-h-[calc(100dvh-113px)] overflow-y-auto border-t border-bronze-100 px-6 py-4 lg:hidden"
      >
        <nav aria-label={t('navbar.mobileNav')}>
          <ul className="flex flex-col gap-1">
            {navigationLinks.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-r-md border-l-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600 ${
                      isActive
                        ? 'border-bronze-500 bg-bronze-50 text-bronze-700'
                        : 'border-transparent text-charcoal-950 hover:bg-bronze-50 hover:text-bronze-700'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Language Selector */}
        <div
          className="mt-4 flex items-center gap-2 border-t border-bronze-100 px-4 pt-4 text-sm"
          role="group"
          aria-label="Language selection"
        >
          <button
            type="button"
            onClick={() => {
              setLanguage('en');
              setIsMenuOpen(false);
            }}
            aria-pressed={language === 'en'}
            className={`rounded px-2.5 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600 ${
              language === 'en'
                ? 'font-bold text-bronze-700 bg-bronze-50'
                : 'font-normal text-charcoal-600 hover:text-bronze-700'
            }`}
          >
            EN
          </button>
          <span aria-hidden="true" className="text-charcoal-300 select-none">|</span>
          <button
            type="button"
            onClick={() => {
              setLanguage('ta');
              setIsMenuOpen(false);
            }}
            aria-pressed={language === 'ta'}
            className={`rounded px-2.5 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600 ${
              language === 'ta'
                ? 'font-bold text-bronze-700 bg-bronze-50'
                : 'font-normal text-charcoal-600 hover:text-bronze-700'
            }`}
          >
            TA
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
