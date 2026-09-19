import { useState } from 'react';

const VOLUNTEER_AREAS = [
  'Teaching & Educational Support',
  'Event & Community Support',
  'Volunteer Coordination',
  'Skills & Professional Support',
  'Other',
];

const AVAILABILITY_OPTIONS = ['Weekdays', 'Weekends', 'Both', 'Flexible'];

const WAYS_TO_HELP = [
  {
    title: 'Teaching & Educational Support',
    description:
      'Help children and youth by tutoring, mentoring, or assisting with educational programmes and workshops.',
  },
  {
    title: 'Event & Community Support',
    description:
      'Assist in organising and running community events, cultural programmes, and outreach initiatives.',
  },
  {
    title: 'Volunteer Coordination',
    description:
      'Help manage and coordinate volunteer teams, schedules, and communications to keep activities running smoothly.',
  },
  {
    title: 'Skills & Professional Support',
    description:
      'Contribute your professional expertise — in areas such as design, IT, law, health, or administration — to strengthen our work.',
  },
];

const fieldClassName =
  'mt-2 block w-full rounded-md border border-charcoal-300 bg-white px-4 py-3 text-base text-charcoal-950 focus-visible:border-bronze-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600';

const selectClassName =
  'mt-2 block w-full rounded-md border border-charcoal-300 bg-white px-4 py-3 text-base text-charcoal-950 focus-visible:border-bronze-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%236b7280\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E")] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10';

function Volunteer() {
  const [submissionAttempted, setSubmissionAttempted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    // Frontend-only: prevent real submission until a backend endpoint is available.
    setSubmissionAttempted(true);
  }

  return (
    <main>
      {/* Page header */}
      <header className="bg-bronze-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
            <h1 className="text-4xl font-bold tracking-tight text-charcoal-950 sm:text-5xl">
              Volunteer With Valluvam
            </h1>
            <p className="mt-6 text-base leading-8 text-charcoal-700 sm:text-lg">
              Valluvam is built on the commitment of people who care. Whether you have a few hours
              a week or a specific skill to share, your time and support can make a real difference
              in the lives of our community. Join us and be part of something meaningful.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Left column — Ways You Can Help */}
          <section aria-labelledby="ways-to-help-title">
            <h2
              id="ways-to-help-title"
              className="text-2xl font-semibold text-charcoal-950"
            >
              Ways You Can Help
            </h2>
            <p className="mt-3 text-base leading-7 text-charcoal-700">
              There are many ways to contribute your time, skills, and energy to Valluvam's
              activities. Choose an area that suits you best.
            </p>

            <ul className="mt-8 space-y-5" aria-label="Volunteering areas">
              {WAYS_TO_HELP.map(({ title, description }) => (
                <li
                  key={title}
                  className="rounded-xl border border-bronze-100 bg-bronze-50 p-5"
                >
                  <h3 className="text-sm font-semibold text-charcoal-950">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-charcoal-700">{description}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Right column — Volunteer Interest Form */}
          <section aria-labelledby="volunteer-form-title">
            <h2
              id="volunteer-form-title"
              className="text-2xl font-semibold text-charcoal-950"
            >
              Express Your Interest
            </h2>
            <p
              id="volunteer-form-note"
              className="mt-2 text-sm text-charcoal-700"
            >
              Fields marked with <span aria-hidden="true">*</span>
              <span className="sr-only">an asterisk</span> are required.
            </p>

            <form
              onSubmit={handleSubmit}
              aria-labelledby="volunteer-form-title"
              aria-describedby="volunteer-form-note"
              className="mt-6 space-y-5"
              noValidate
            >
              {/* Full Name */}
              <div>
                <label
                  htmlFor="vol-name"
                  className="block text-sm font-semibold text-charcoal-950"
                >
                  Full Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="vol-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  className={fieldClassName}
                />
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="vol-email"
                  className="block text-sm font-semibold text-charcoal-950"
                >
                  Email Address <span aria-hidden="true">*</span>
                </label>
                <input
                  id="vol-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={fieldClassName}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="vol-phone"
                  className="block text-sm font-semibold text-charcoal-950"
                >
                  Phone Number
                </label>
                <input
                  id="vol-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className={fieldClassName}
                />
              </div>

              {/* Area / Location */}
              <div>
                <label
                  htmlFor="vol-location"
                  className="block text-sm font-semibold text-charcoal-950"
                >
                  Area / Location
                </label>
                <input
                  id="vol-location"
                  name="location"
                  type="text"
                  autoComplete="address-level2"
                  className={fieldClassName}
                />
              </div>

              {/* Preferred Area of Volunteering */}
              <div>
                <label
                  htmlFor="vol-area"
                  className="block text-sm font-semibold text-charcoal-950"
                >
                  Preferred Area of Volunteering <span aria-hidden="true">*</span>
                </label>
                <select
                  id="vol-area"
                  name="volunteeringArea"
                  required
                  defaultValue=""
                  className={selectClassName}
                >
                  <option value="" disabled>
                    Select an area…
                  </option>
                  {VOLUNTEER_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability */}
              <div>
                <label
                  htmlFor="vol-availability"
                  className="block text-sm font-semibold text-charcoal-950"
                >
                  Availability <span aria-hidden="true">*</span>
                </label>
                <select
                  id="vol-availability"
                  name="availability"
                  required
                  defaultValue=""
                  className={selectClassName}
                >
                  <option value="" disabled>
                    Select availability…
                  </option>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Short Message */}
              <div>
                <label
                  htmlFor="vol-message"
                  className="block text-sm font-semibold text-charcoal-950"
                >
                  Short Message
                </label>
                <p id="vol-message-hint" className="mt-1 text-xs text-charcoal-500">
                  Tell us a little about yourself and why you'd like to volunteer with Valluvam.
                </p>
                <textarea
                  id="vol-message"
                  name="message"
                  rows={4}
                  aria-describedby="vol-message-hint"
                  className={`${fieldClassName} resize-y`}
                />
              </div>

              {/* Submit */}
              {/* TODO: Integrate Cloudflare Turnstile or similar CAPTCHA here before
                  connecting to a backend endpoint. */}
              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-bronze-700 bg-bronze-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-bronze-800 hover:bg-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600 sm:w-auto"
              >
                Submit Volunteer Interest
              </button>

              {/* Submission status — shown after submit attempt */}
              <p role="status" className="text-sm leading-6 text-charcoal-700">
                {submissionAttempted &&
                  'Thank you for your interest! Online submission is not yet available — please email us directly at valluvamofficial@gmail.com.'}
              </p>
            </form>
          </section>

        </div>
      </div>
    </main>
  );
}

export default Volunteer;
