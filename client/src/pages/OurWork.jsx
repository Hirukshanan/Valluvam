import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';

const getWorkAreas = (t, organizationName) => [
  {
    title: t('ourWork.areas.educationalResourcesTitle'),
    description: t('ourWork.areas.educationalResourcesDesc', { org: organizationName }),
    iconPath:
      'M12 6v15m0-15C9 4 5 4 2 5v14c3-1 7-1 10 2m0-15c3-2 7-2 10-1v14c-3-1-7-1-10 2',
  },
  {
    title: t('ourWork.areas.booksLearningTitle'),
    description: t('ourWork.areas.booksLearningDesc'),
    iconPath:
      'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  },
  {
    title: t('ourWork.areas.studentAssistanceTitle'),
    description: t('ourWork.areas.studentAssistanceDesc'),
    iconPath:
      'M9 5V4a3 3 0 0 1 6 0v1M8 5h8a3 3 0 0 1 3 3v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a3 3 0 0 1 3-3Zm0 16v-7h8v7M9 9h6',
  },
  {
    title: t('ourWork.areas.ruralEducationTitle'),
    description: t('ourWork.areas.ruralEducationDesc', { org: organizationName }),
    iconPath:
      'm3 10 9-7 9 7M5 9v12h14V9M10 21v-6h4v6M8 11h1m6 0h1M12 3V1',
  },
  {
    title: t('ourWork.areas.communityReliefTitle'),
    description: t('ourWork.areas.communityReliefDesc', { org: organizationName }),
    iconPath:
      'm3 7 9-4 9 4v12l-9 3-9-3V7Zm0 0 9 4 9-4M12 11v11M7.5 5l9 4v5',
  },
];

function OurWork() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const workAreas = getWorkAreas(t, settings.organizationName);
  return (
    <main>
      <SEO
        title="Our Work"
        description={`Explore ${settings.organizationName}'s practical initiatives including free past papers, educational resources, student assistance with bicycles, rural teaching, and disaster relief.`}
      />
      {/* Page header */}
      <header className="bg-bronze-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
            <h1 className="text-4xl font-bold tracking-tight text-charcoal-950 sm:text-5xl">
              {t('ourWork.title')}
            </h1>
            <p className="mt-6 text-base leading-8 text-charcoal-700 sm:text-lg">
              {t('ourWork.subhead', { org: settings.organizationName })}
            </p>
          </div>
        </div>
      </header>

      {/* Work areas grid */}
      <section
        aria-labelledby="work-areas-title"
        className="bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
          <h2
            id="work-areas-title"
            className="text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl"
          >
            {t('ourWork.whatWeDoHeading')}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-charcoal-700 sm:text-lg">
            {t('ourWork.whatWeDoSubhead')}
          </p>

          <ul
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            aria-label={t('ourWork.workAreasAriaLabel', { org: settings.organizationName })}
          >
            {workAreas.map(({ title, description, iconPath }) => (
              <li
                key={title}
                className="flex flex-col rounded-xl border border-bronze-100 bg-bronze-50 p-6 sm:p-7"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white text-bronze-700 shadow-sm ring-1 ring-bronze-100">
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d={iconPath} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-charcoal-950">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-charcoal-700">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Call-to-action */}
      <section
        aria-labelledby="work-cta-title"
        className="bg-bronze-50 py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div
              aria-hidden="true"
              className="mx-auto mb-6 h-1 w-14 rounded-full bg-bronze-500"
            />
            <h2
              id="work-cta-title"
              className="text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl"
            >
              {t('ourWork.ctaHeading')}
            </h2>
            <p className="mt-6 text-base leading-8 text-charcoal-700 sm:text-lg">
              {t('ourWork.ctaText', { org: settings.organizationName })}
            </p>
            <div className="mt-8">
              <Link
                to="/volunteer"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-bronze-700 bg-bronze-700 px-8 py-3 text-sm font-semibold text-white transition-colors hover:border-bronze-800 hover:bg-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600"
              >
                {t('ourWork.volunteerButton')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default OurWork;

