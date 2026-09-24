import { useState, useEffect } from 'react';
import handpic from '../assets/Handpic.jpeg';
import { fetchActiveTeamMembers } from '../services/teamService';

const values = [
  {
    title: 'Education',
    description:
      'We believe access to education is fundamental. Our work focuses on removing practical barriers so that every student can pursue learning.',
    iconPath:
      'M12 6v15m0-15C9 4 5 4 2 5v14c3-1 7-1 10 2m0-15c3-2 7-2 10-1v14c-3-1-7-1-10 2',
  },
  {
    title: 'Compassion',
    description:
      'We approach every initiative with care and empathy, recognising the dignity of each person and family we work alongside.',
    iconPath:
      'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z',
  },
  {
    title: 'Community',
    description:
      'Valluvam is rooted in community. We work with people — not just for them — building connections and shared purpose across the areas we serve.',
    iconPath:
      'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z',
  },
  {
    title: 'Responsibility',
    description:
      'We act with accountability to the communities we serve, using resources carefully and focusing on support that creates real, practical impact.',
    iconPath:
      'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
];

const howWeWorkSteps = [
  {
    step: '01',
    title: 'Identify Community Needs',
    description:
      'We listen to and observe the communities and students we serve to understand where support is most needed.',
  },
  {
    step: '02',
    title: 'Organise Support',
    description:
      'We plan appropriate responses — whether educational resources, relief supplies, or direct assistance — and coordinate what is required.',
  },
  {
    step: '03',
    title: 'Work With Members & Volunteers',
    description:
      'Our members and volunteers contribute their time, skills, and effort to make each initiative possible.',
  },
  {
    step: '04',
    title: 'Deliver Practical Assistance',
    description:
      'We carry out the work directly — providing materials, teaching, or relief — and follow through to ensure it reaches those who need it.',
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Circular avatar placeholder — shown when no photo URL is available. */
function AvatarPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-bronze-100 text-bronze-400 ring-4 ring-white"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-12 w-12"
      >
        <path
          fillRule="evenodd"
          d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

/**
 * Renders a single leadership profile card.
 * Accepts the full leadership record shape so future data substitution
 * requires only updating the data array above.
 */
function LeadershipCard({ role, name, photo, bio }) {
  const hasPhoto = Boolean(photo && photo.trim());
  const hasName = Boolean(name && name.trim());

  return (
    <div className="flex flex-col items-center rounded-xl border border-bronze-100 bg-white p-6 text-center sm:p-8">
      {hasPhoto ? (
        <img
          src={photo}
          alt={hasName ? `${name} - ${role}` : role}
          className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-white"
        />
      ) : (
        <AvatarPlaceholder />
      )}

      <div className="mt-4">
        <p className="text-base font-semibold text-charcoal-950">
          {hasName ? (
            name
          ) : (
            <span className="italic text-charcoal-400">Name to be updated</span>
          )}
        </p>
        <p className="mt-1 text-sm font-medium text-bronze-700">{role}</p>
        {bio && bio.trim() && (
          <p className="mt-3 text-sm leading-6 text-charcoal-700">{bio}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function About() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchActiveTeamMembers()
      .then((data) => {
        if (isMounted) {
          setTeamMembers(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load team members:', err);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const activeMembers = (teamMembers || [])
    .filter((m) => m.active)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return (
    <main>
      {/* ── 1. Page introduction ─────────────────────────────────────── */}
      <header className="bg-bronze-50 py-16 sm:py-20 lg:py-0">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
          {/* Text column */}
          <div className="lg:py-24">
            <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
            <h1 className="text-4xl font-bold tracking-tight text-charcoal-950 sm:text-5xl">
              About Valluvam
            </h1>
            <dl className="mt-6 space-y-2 text-base leading-8 text-charcoal-700 sm:text-lg">
              <div>
                <dt className="sr-only">Type</dt>
                <dd>Registered nonprofit organization</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-charcoal-950">Established</dt>
                <dd>
                  <time dateTime="2025-03-28">28 March 2025</time>
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-charcoal-950">Based in</dt>
                <dd>Pandiruppu, Kalmunai, Ampara District, Sri Lanka</dd>
              </div>
            </dl>
          </div>

          {/* Image column */}
          <div className="relative overflow-hidden rounded-2xl lg:rounded-none lg:rounded-bl-3xl">
            <img
              src={handpic}
              alt="Valluvam community activity"
              width={960}
              height={640}
              className="h-72 w-full object-cover sm:h-80 lg:h-full lg:min-h-[480px]"
            />
            {/* Subtle warm overlay */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-charcoal-950/20 to-transparent"
            />
          </div>
        </div>
      </header>

      {/* ── 2. Leadership ────────────────────────────────────────────── */}
      <section
        aria-labelledby="leadership-title"
        className="bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
          <h2
            id="leadership-title"
            className="text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl"
          >
            Our Leadership
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-charcoal-700 sm:text-lg">
            Valluvam is led by a dedicated team committed to the organization's
            mission and the communities it serves.
          </p>

          {loading ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center rounded-xl border border-bronze-100 bg-white p-6 text-center sm:p-8 animate-pulse"
                >
                  <div className="h-24 w-24 rounded-full bg-bronze-100 ring-4 ring-white" />
                  <div className="mt-4 flex w-full flex-col items-center gap-2">
                    <div className="h-4 w-32 rounded bg-charcoal-200" />
                    <div className="h-3 w-20 rounded bg-bronze-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeMembers.length === 0 ? (
            <p className="mt-10 text-center text-sm italic text-charcoal-500">
              Leadership information will be updated soon.
            </p>
          ) : (
            <ul
              className="mt-10 grid gap-6 sm:grid-cols-3"
              aria-label="Leadership team"
            >
              {activeMembers.map((member) => (
                <li key={member._id || member.id}>
                  <LeadershipCard {...member} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── 3. Our Values ────────────────────────────────────────────── */}
      <section
        aria-labelledby="values-title"
        className="bg-bronze-50 py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
          <h2
            id="values-title"
            className="text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl"
          >
            Our Values
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-charcoal-700 sm:text-lg">
            These values guide how we work and how we relate to the communities
            and individuals we support.
          </p>

          <ul
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Valluvam values"
          >
            {values.map(({ title, description, iconPath }) => (
              <li
                key={title}
                className="rounded-xl border border-bronze-100 bg-white p-6"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-bronze-50 text-bronze-700">
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d={iconPath} />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-charcoal-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-charcoal-700">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 4. How We Work ───────────────────────────────────────────── */}
      <section
        aria-labelledby="how-we-work-title"
        className="bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
          <h2
            id="how-we-work-title"
            className="text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl"
          >
            How We Work
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-charcoal-700 sm:text-lg">
            Our approach is straightforward and grounded in direct action.
          </p>

          <ol
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="How Valluvam works"
          >
            {howWeWorkSteps.map(({ step, title, description }) => (
              <li
                key={step}
                className="relative rounded-xl border border-bronze-100 bg-bronze-50 p-6"
              >
                <span
                  aria-hidden="true"
                  className="mb-4 block text-3xl font-bold tracking-tight text-bronze-200 select-none"
                >
                  {step}
                </span>
                <h3 className="text-base font-semibold text-charcoal-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-charcoal-700">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}

export default About;
