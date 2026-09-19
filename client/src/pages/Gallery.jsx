/**
 * Gallery page — frontend-only structure.
 *
 * Gallery data will be fetched from a future API endpoint and mapped
 * over the GalleryItem component below. The empty-state UI is shown
 * while no images are available.
 *
 * When backend integration is ready:
 *   1. Fetch gallery items from the API inside a useEffect (or a data-loader).
 *   2. Replace the empty-state block with:
 *        items.map(item => <GalleryItem key={item._id} {...item} />)
 */

/**
 * Renders a single gallery item.
 * Props mirror the expected shape of a future gallery API response:
 *   _id, src, alt, caption, date (ISO string), category
 */
function GalleryItem({ src, alt, caption, date, category }) {
  const formattedDate = date
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(date))
    : null;

  return (
    <figure className="group overflow-hidden rounded-xl border border-bronze-100 bg-white">
      <div className="overflow-hidden">
        <img
          src={src}
          alt={alt ?? ''}
          loading="lazy"
          className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-60"
        />
      </div>

      {(caption || formattedDate || category) && (
        <figcaption className="p-4">
          {category && (
            <span className="mb-2 inline-block rounded-full bg-bronze-50 px-2.5 py-0.5 text-xs font-medium text-bronze-700 ring-1 ring-inset ring-bronze-200">
              {category}
            </span>
          )}
          {caption && (
            <p className="mt-1 text-sm font-medium leading-6 text-charcoal-950">
              {caption}
            </p>
          )}
          {formattedDate && (
            <p className="mt-1 text-xs text-charcoal-500">
              <time dateTime={date}>{formattedDate}</time>
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}

/** Shown when no gallery images are available yet. */
function GalleryEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-bronze-200 bg-bronze-50 px-6 py-24 text-center">
      <div
        aria-hidden="true"
        className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-bronze-400 shadow-sm ring-1 ring-bronze-100"
      >
        {/* Photo / image icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <path d="M2.25 15.75 7.5 10.5l3 3L13.5 9l4.5 6M21 6.75A2.25 2.25 0 0 0 18.75 4.5h-13.5A2.25 2.25 0 0 0 3 6.75v10.5A2.25 2.25 0 0 0 5.25 19.5h13.5A2.25 2.25 0 0 0 21 17.25V6.75Z" />
          <circle cx="8.25" cy="9" r="1.5" />
        </svg>
      </div>
      <p className="text-base font-medium text-charcoal-950">
        Our gallery will be updated with photos from Valluvam's activities and events.
      </p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-charcoal-500">
        Follow us on social media to see photos from our latest community and
        educational initiatives.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// In a future stage, replace this empty array with data fetched from the API.
// Example: const items = await fetch('/api/gallery').then(r => r.json());
// ---------------------------------------------------------------------------
const galleryItems = [];

function Gallery() {
  return (
    <main>
      {/* Page header */}
      <header className="bg-bronze-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
            <h1 className="text-4xl font-bold tracking-tight text-charcoal-950 sm:text-5xl">
              Gallery
            </h1>
            <p className="mt-6 text-base leading-8 text-charcoal-700 sm:text-lg">
              A look at Valluvam's activities, events, educational support, and
              community work through photographs. Images from our initiatives
              and programmes will be shared here.
            </p>
          </div>
        </div>
      </header>

      {/* Gallery grid */}
      <section
        aria-labelledby="gallery-section-title"
        className="bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
          <h2
            id="gallery-section-title"
            className="text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl"
          >
            Photos
          </h2>
          <p className="mt-4 text-base leading-8 text-charcoal-700 sm:text-lg">
            Moments from Valluvam's community, educational, and social activities.
          </p>

          <div className="mt-10">
            {galleryItems.length > 0 ? (
              <ul
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                aria-label="Valluvam gallery"
              >
                {galleryItems.map((item) => (
                  <li key={item._id}>
                    <GalleryItem {...item} />
                  </li>
                ))}
              </ul>
            ) : (
              <GalleryEmptyState />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Gallery;
