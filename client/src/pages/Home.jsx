import { Link } from 'react-router-dom';
import backdrop from '../assets/Backdrop.jpg';

function Home() {
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
              Registered nonprofit organization
            </p>
            <h1
              id="hero-title"
              className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Valluvam
            </h1>
            <div aria-hidden="true" className="my-7 h-1 w-14 rounded-full bg-bronze-300" />
            <p className="max-w-xl text-2xl font-medium leading-snug tracking-tight text-white sm:text-3xl">
              “Let all your thoughts be set on high aspirations.”
            </p>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/90 sm:text-lg">
              Valluvam supports students, children, low-income families, and rural
              communities through education, resources, and social service initiatives.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                to="/our-work"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-bronze-700 bg-bronze-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-bronze-800 hover:bg-bronze-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600"
              >
                Explore Our Work
              </Link>
              <Link
                to="/support"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-bronze-300 bg-white px-6 py-3 text-sm font-semibold text-charcoal-950 transition-colors hover:border-bronze-500 hover:bg-bronze-100 hover:text-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600"
              >
                Support Us
              </Link>
            </div>

            <p className="mt-8 text-sm leading-6 text-white/80">
              Pandiruppu, Kalmunai, Ampara District, Sri Lanka
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}

export default Home;

