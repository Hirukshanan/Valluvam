import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Our Work', to: '/our-work' },
  { label: 'Events', to: '/events' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Volunteer', to: '/volunteer' },
  { label: 'Support Us', to: '/support' },
  { label: 'Contact', to: '/contact' },
];

const linkClassName =
  'rounded-sm text-charcoal-700 hover:text-bronze-700 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600';

function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="border-t border-bronze-100 bg-bronze-50 text-charcoal-700">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-charcoal-950">
              {settings.organizationName}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7">
              Supporting students, families, and communities through education and social service.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="text-base font-semibold text-charcoal-950">Quick Links</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {quickLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className={linkClassName}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-base font-semibold text-charcoal-950">Contact</h2>
            <address className="mt-4 space-y-3 text-sm not-italic leading-7">
              <p>
                <span className="font-medium text-charcoal-950">Email: </span>
                <a href={`mailto:${settings.email}`} className={`${linkClassName} break-words`}>
                  {settings.email}
                </a>
              </p>
              <p>
                <span className="font-medium text-charcoal-950">Location: </span>
                {settings.location}
              </p>
            </address>

            <div className="mt-6">
              <h2 className="text-base font-semibold text-charcoal-950">Follow Us</h2>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm">
                {settings.facebookUrl && (
                  <li>
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClassName}
                    >
                      Facebook<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                )}
                {settings.instagramUrl && (
                  <li>
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClassName}
                    >
                      Instagram<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-bronze-200 py-5 text-center text-sm">
          © {settings.organizationName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
