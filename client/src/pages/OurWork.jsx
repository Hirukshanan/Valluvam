import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const getWorkAreas = (organizationName) => [
  {
    title: 'Educational Resources',
    description:
      `${organizationName} provides free past papers and educational materials to students, helping them prepare for exams and access learning opportunities that may otherwise be out of reach.`,
    iconPath:
      'M12 6v15m0-15C9 4 5 4 2 5v14c3-1 7-1 10 2m0-15c3-2 7-2 10-1v14c-3-1-7-1-10 2',
  },
  {
    title: 'Books & Learning Support',
    description:
      'We source and distribute books and useful learning resources to students who need support, ensuring they have the materials necessary to continue their education.',
    iconPath:
      'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  },
  {
    title: 'Student Assistance',
    description:
      'We support students from low-income families with practical educational needs, including providing bicycles to help them travel to school and access their education.',
    iconPath:
      'M9 5V4a3 3 0 0 1 6 0v1M8 5h8a3 3 0 0 1 3 3v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a3 3 0 0 1 3-3Zm0 16v-7h8v7M9 9h6',
  },
  {
    title: 'Rural Education',
    description:
      `${organizationName} works directly in rural communities, teaching and supporting students in schools and areas where educational resources and opportunities are limited.`,
    iconPath:
      'm3 10 9-7 9 7M5 9v12h14V9M10 21v-6h4v6M8 11h1m6 0h1M12 3V1',
  },
  {
    title: 'Community Relief',
    description:
      `During natural disasters and difficult periods, ${organizationName} provides food and essential items to families and communities in need, offering support when it matters most.`,
    iconPath:
      'm3 7 9-4 9 4v12l-9 3-9-3V7Zm0 0 9 4 9-4M12 11v11M7.5 5l9 4v5',
  },
];

function OurWork() {
  const { settings } = useSettings();
  const workAreas = getWorkAreas(settings.organizationName);
  return (
    <main>
      {/* Page header */}
      <header className="bg-bronze-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
            <h1 className="text-4xl font-bold tracking-tight text-charcoal-950 sm:text-5xl">
              Our Work
            </h1>
            <p className="mt-6 text-base leading-8 text-charcoal-700 sm:text-lg">
              {settings.organizationName} focuses on practical educational and community support for
              students, families, and communities. Our work is grounded in
              identifying real needs and responding with direct, meaningful action.
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
            What We Do
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-charcoal-700 sm:text-lg">
            Our activities span learning support and community relief — wherever
            help is needed most.
          </p>

          <ul
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            aria-label={`${settings.organizationName} work areas`}
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
              See how you can get involved
            </h2>
            <p className="mt-6 text-base leading-8 text-charcoal-700 sm:text-lg">
              {settings.organizationName}'s work is made possible by people who choose to give their
              time and skills to the community. If you'd like to be part of that,
              we'd be glad to hear from you.
            </p>
            <div className="mt-8">
              <Link
                to="/volunteer"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-bronze-700 bg-bronze-700 px-8 py-3 text-sm font-semibold text-white transition-colors hover:border-bronze-800 hover:bg-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600"
              >
                Volunteer With Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default OurWork;

