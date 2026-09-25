import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import backdrop from '../assets/Backdrop.jpg';

const getActivityAreas = (t) => [
  {
    title: t('home.activities.educationalSupportTitle'),
    description: t('home.activities.educationalSupportDesc'),
    iconPath: 'M12 6v15m0-15C9 4 5 4 2 5v14c3-1 7-1 10 2m0-15c3-2 7-2 10-1v14c-3-1-7-1-10 2',
  },
  {
    title: t('home.activities.studentAssistanceTitle'),
    description: t('home.activities.studentAssistanceDesc'),
    iconPath: 'M9 5V4a3 3 0 0 1 6 0v1M8 5h8a3 3 0 0 1 3 3v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a3 3 0 0 1 3-3Zm0 16v-7h8v7M9 9h6',
  },
  {
    title: t('home.activities.ruralEducationTitle'),
    description: t('home.activities.ruralEducationDesc'),
    iconPath: 'm3 10 9-7 9 7M5 9v12h14V9M10 21v-6h4v6M8 11h1m6 0h1M12 3V1',
  },
  {
    title: t('home.activities.communityReliefTitle'),
    description: t('home.activities.communityReliefDesc'),
    iconPath: 'm3 7 9-4 9 4v12l-9 3-9-3V7Zm0 0 9 4 9-4M12 11v11M7.5 5l9 4v5',
  },
];

function Home() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const activityAreas = getActivityAreas(t);

  return (
    <main>
      <section
        aria-labelledby="hero-title"
        className="relative isolate overflow-hidden bg-charcoal-950"
      >
        <img
          src={backdrop}
          alt=""
          width={2048}
          height={1536}
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_60%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-charcoal-950/75 lg:bg-linear-to-r lg:from-charcoal-950/95 lg:via-charcoal-950/75 lg:to-charcoal-950/20"
        />

        <div className="mx-auto flex min-h-[640px] max-w-7xl items-center px-6 py-16 sm:min-h-[700px] sm:py-20 lg:min-h-[760px] lg:py-24">
          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-wide text-bronze-200">
              {t('common.registeredNonprofit')}
            </p>
            <h1
              id="hero-title"
              className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              {settings.organizationName}
            </h1>
            <div aria-hidden="true" className="my-7 h-1 w-14 rounded-full bg-bronze-300" />
            <p className="max-w-xl text-2xl font-medium leading-snug tracking-tight text-white sm:text-3xl">
              “{settings.slogan}”
            </p>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/90 sm:text-lg">
              {t('home.heroSubhead', { org: settings.organizationName })}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                to="/our-work"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-bronze-700 bg-bronze-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-bronze-800 hover:bg-bronze-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600"
              >
                {t('home.exploreWork')}
              </Link>
              <Link
                to="/support"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-bronze-300 bg-white px-6 py-3 text-sm font-semibold text-charcoal-950 transition-colors hover:border-bronze-500 hover:bg-bronze-100 hover:text-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600"
              >
                {t('home.supportUs')}
              </Link>
            </div>

            <p className="mt-8 text-sm leading-6 text-white/80">
              {settings.location}
            </p>
          </div>

        </div>
      </section>

      <section
        aria-labelledby="who-we-are-title"
        className="bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-3xl px-6">
          <div>
            <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
            <h2
              id="who-we-are-title"
              className="text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl"
            >
              {t('home.whoWeAreHeading')}
            </h2>
            <p className="mt-6 text-base leading-8 text-charcoal-700 sm:text-lg">
              {t('home.whoWeAreText1', {
                org: settings.organizationName,
                date: settings.establishedDate,
                location: settings.location,
              })}
            </p>
            <p className="mt-4 text-base leading-8 text-charcoal-700 sm:text-lg">
              {t('home.whoWeAreText2')}
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-md border border-bronze-700 bg-bronze-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-bronze-800 hover:bg-bronze-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600 sm:w-auto"
            >
              {t('home.learnMoreAboutUs')}
            </Link>
          </div>
        </div>
      </section>
      <section
        aria-labelledby="what-we-do-title"
        className="bg-bronze-50 py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
          <h2
            id="what-we-do-title"
            className="text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl"
          >
            {t('home.whatWeDoHeading')}
          </h2>
          <p className="mt-4 text-base leading-8 text-charcoal-700 sm:text-lg">
            {t('home.whatWeDoSubhead')}
          </p>

          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {activityAreas.map(({ title, description, iconPath }) => (
              <li key={title} className="rounded-xl border border-bronze-100 bg-white p-6 sm:p-7">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-bronze-50 text-bronze-700">
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
                <h3 className="text-xl font-semibold text-charcoal-950">{title}</h3>
                <p className="mt-3 text-base leading-7 text-charcoal-700">{description}</p>
              </li>
            ))}
          </ul>

          <Link
            to="/our-work"
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-md border border-bronze-700 px-6 py-3 text-sm font-semibold text-bronze-700 transition-colors hover:bg-bronze-100 hover:text-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600 sm:w-auto"
          >
            {t('home.viewOurWork')}
          </Link>
        </div>
      </section>
      <section
        aria-labelledby="get-involved-title"
        className="bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
          <h2
            id="get-involved-title"
            className="text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl"
          >
            {t('home.getInvolvedHeading')}
          </h2>
          <p className="mt-4 text-base leading-8 text-charcoal-700 sm:text-lg">
            {t('home.getInvolvedSubhead', { org: settings.organizationName })}
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col rounded-xl border border-bronze-100 bg-bronze-50 p-6 sm:p-8">
              <h3 className="text-2xl font-semibold text-charcoal-950">{t('home.volunteerCardTitle')}</h3>
              <p className="mt-3 text-base leading-7 text-charcoal-700">
                {t('home.volunteerCardText', { org: settings.organizationName })}
              </p>
              <div className="mt-auto pt-6">
                <Link
                  to="/volunteer"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-bronze-700 bg-bronze-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-bronze-800 hover:bg-bronze-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600 sm:w-auto"
                >
                  {t('home.becomeVolunteer')}
                </Link>
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-bronze-100 bg-bronze-50 p-6 sm:p-8">
              <h3 className="text-2xl font-semibold text-charcoal-950">{t('home.supportCardTitle', { org: settings.organizationName })}</h3>
              <p className="mt-3 text-base leading-7 text-charcoal-700">
                {t('home.supportCardText', { org: settings.organizationName })}
              </p>
              <div className="mt-auto pt-6">
                <Link
                  to="/support"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-bronze-700 bg-bronze-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-bronze-800 hover:bg-bronze-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600 sm:w-auto"
                >
                  {t('home.supportCardButton')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;

