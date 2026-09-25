import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';

const linkClassName =
  'rounded-sm text-charcoal-700 hover:text-bronze-700 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600';

function Footer() {
  const { settings } = useSettings();
  const { t } = useLanguage();

  const quickLinks = [
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
    <footer className="border-t border-bronze-100 bg-bronze-50 text-charcoal-700">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-charcoal-950">
              {settings.organizationName}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7">
              {t('footer.tagline')}
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="text-base font-semibold text-charcoal-950">{t('footer.quickLinks')}</h2>
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
            <h2 className="text-base font-semibold text-charcoal-950">{t('footer.contact')}</h2>
            <address className="mt-4 space-y-3 text-sm not-italic leading-7">
              <p>
                <span className="font-medium text-charcoal-950">{t('common.email')}: </span>
                <a href={`mailto:${settings.email}`} className={`${linkClassName} break-words`}>
                  {settings.email}
                </a>
              </p>
              <p>
                <span className="font-medium text-charcoal-950">{t('common.location')}: </span>
                {settings.location}
              </p>
            </address>

            <div className="mt-6">
              <h2 className="text-base font-semibold text-charcoal-950">{t('footer.followUs')}</h2>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm">
                {settings.facebookUrl && (
                  <li>
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClassName}
                    >
                      Facebook<span className="sr-only"> {t('common.opensInNewTab')}</span>
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
                      Instagram<span className="sr-only"> {t('common.opensInNewTab')}</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-bronze-200 py-5 text-center text-sm">
          {t('footer.copyright', { org: settings.organizationName })}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
