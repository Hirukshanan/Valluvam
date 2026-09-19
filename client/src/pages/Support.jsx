import { Link } from 'react-router-dom';

const supportOptions = [
  {
    title: 'Support a Student',
    description:
      'Help a student in need by contributing towards essentials such as school supplies, learning materials, or transport, so they can focus on their education.',
    iconPath:
      'M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 6a7 7 0 0 1 14 0M9 11h.01M15 11h.01',
  },
  {
    title: 'Educational Materials',
    description:
      'Support the provision of books, past papers, stationery, and other resources that help students and learners access quality education.',
    iconPath:
      'M12 6v15m0-15C9 4 5 4 2 5v14c3-1 7-1 10 2m0-15c3-2 7-2 10-1v14c-3-1-7-1-10 2',
  },
  {
    title: 'Sponsor an Initiative',
    description:
      'Partner with Valluvam to sponsor a specific programme or community initiative, helping us plan and deliver more impactful activities.',
    iconPath:
      'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557L3.04 10.405a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z',
  },
  {
    title: 'Volunteer Your Time',
    description:
      'Share your skills, knowledge, or energy by volunteering with Valluvam. Every hour of your time contributes to a stronger community.',
    iconPath:
      'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z',
  },
  {
    title: 'Community Relief',
    description:
      'Contribute to relief efforts that support families and communities during difficult periods, including the provision of food and essential supplies.',
    iconPath:
      'm3 7 9-4 9 4v12l-9 3-9-3V7Zm0 0 9 4 9-4M12 11v11M7.5 5l9 4v5',
  },
];

function Support() {
  return (
    <main>
      {/* Page header */}
      <header className="bg-bronze-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
            <h1 className="text-4xl font-bold tracking-tight text-charcoal-950 sm:text-5xl">
              Support Valluvam
            </h1>
            <p className="mt-6 text-base leading-8 text-charcoal-700 sm:text-lg">
              Supporting Valluvam doesn't have to mean a single act. There are many
              ways to contribute — your time, knowledge, resources, or presence can
              all make a meaningful difference to the students and communities we serve.
            </p>
          </div>
        </div>
      </header>

      {/* Support options grid */}
      <section
        aria-labelledby="support-options-title"
        className="bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
          <h2
            id="support-options-title"
            className="text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl"
          >
            Ways to Contribute
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-charcoal-700 sm:text-lg">
            Whether you can offer your time, expertise, or resources, there is a
            meaningful way for you to be part of Valluvam's work.
          </p>

          <ul
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Support options"
          >
            {supportOptions.map(({ title, description, iconPath }) => (
              <li
                key={title}
                className="rounded-xl border border-bronze-100 bg-bronze-50 p-6 sm:p-7"
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
                <p className="mt-2 text-base leading-7 text-charcoal-700">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Call-to-action */}
      <section
        aria-labelledby="support-cta-title"
        className="bg-bronze-50 py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div
              aria-hidden="true"
              className="mx-auto mb-6 h-1 w-14 rounded-full bg-bronze-500"
            />
            <h2
              id="support-cta-title"
              className="text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl"
            >
              Want to support Valluvam?
            </h2>
            <p className="mt-6 text-base leading-8 text-charcoal-700 sm:text-lg">
              We'd love to hear from you. Reach out to us and we can discuss how
              you would like to contribute. Every form of support — big or small —
              helps us continue our work in the community.
            </p>
            <div className="mt-8">
              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-bronze-700 bg-bronze-700 px-8 py-3 text-sm font-semibold text-white transition-colors hover:border-bronze-800 hover:bg-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Support;

