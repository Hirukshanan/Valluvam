/**
 * Events page — frontend-only structure.
 *
 * Event data will be fetched from a future API endpoint and mapped
 * over the EventCard component below. The empty-state UI is shown
 * while no events are available.
 *
 * When backend integration is ready:
 *   1. Fetch events from the API inside a useEffect (or a data-loader).
 *   2. Replace the empty-state block with:
 *        events.map(event => <EventCard key={event._id} {...event} />)
 */

/**
 * Renders a single event card.
 * Props mirror the expected shape of a future event API response:
 *   image, title, date (ISO string), location, description, detailsUrl
 */
function EventCard({ image, title, date, location, description, detailsUrl }) {
  const formattedDate = date
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(date))
    : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-bronze-100 bg-white">
      {/* Event image */}
      {image ? (
        <img src={image} alt="" className="h-52 w-full object-cover" />
      ) : (
        <div aria-hidden="true" className="h-52 w-full bg-bronze-50" />
      )}

      <div className="flex flex-1 flex-col p-6">
        {/* Date & location */}
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-charcoal-500">
          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0 text-bronze-500"
              >
                <path d="M8 2v3M16 2v3M3 8h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
              </svg>
              <dt className="sr-only">Date</dt>
              <dd>
                <time dateTime={date}>{formattedDate}</time>
              </dd>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1.5">
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0 text-bronze-500"
              >
                <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
              </svg>
              <dt className="sr-only">Location</dt>
              <dd>{location}</dd>
            </div>
          )}
        </dl>

        {/* Title */}
        <h3 className="mt-3 text-lg font-semibold leading-snug text-charcoal-950">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="mt-2 flex-1 text-sm leading-6 text-charcoal-700">
            {description}
          </p>
        )}

        {/* View Details link */}
        {detailsUrl && (
          <div className="mt-5">
            <a
              href={detailsUrl}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-bronze-700 px-4 py-2 text-sm font-semibold text-bronze-700 transition-colors hover:bg-bronze-50 hover:text-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600"
            >
              View Details
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

/** Shown when no events are available yet. */
function EventsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-bronze-200 bg-bronze-50 px-6 py-20 text-center">
      <div
        aria-hidden="true"
        className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-bronze-400 shadow-sm ring-1 ring-bronze-100"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <path d="M8 2v3M16 2v3M3 8h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        </svg>
      </div>
      <p className="text-base font-medium text-charcoal-950">
        Our events and activities will be updated here.
      </p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-charcoal-500">
        Check back soon or follow us on social media to stay informed about
        upcoming Valluvam events.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// In a future stage, replace this empty array with data fetched from the API.
// Example: const events = await fetch('/api/events').then(r => r.json());
// ---------------------------------------------------------------------------
const events = [];

function Events() {
  return (
    <main>
      {/* Page header */}
      <header className="bg-bronze-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
            <h1 className="text-4xl font-bold tracking-tight text-charcoal-950 sm:text-5xl">
              Events
            </h1>
            <p className="mt-6 text-base leading-8 text-charcoal-700 sm:text-lg">
              This page will showcase Valluvam's community, educational, and
              social initiatives and events. Follow our activities and find out
              how you can get involved.
            </p>
          </div>
        </div>
      </header>

      {/* Event listings */}
      <section
        aria-labelledby="events-listing-title"
        className="bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
          <h2
            id="events-listing-title"
            className="text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl"
          >
            All Events
          </h2>
          <p className="mt-4 text-base leading-8 text-charcoal-700 sm:text-lg">
            Community, educational, and social initiatives organised by Valluvam.
          </p>

          <div className="mt-10">
            {events.length > 0 ? (
              <ul
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                aria-label="Valluvam events"
              >
                {events.map((event) => (
                  <li key={event._id}>
                    <EventCard {...event} />
                  </li>
                ))}
              </ul>
            ) : (
              <EventsEmptyState />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Events;
