import { useState } from 'react';

const fieldClassName =
  'mt-2 block w-full rounded-md border border-charcoal-300 bg-white px-4 py-3 text-base text-charcoal-950 focus-visible:border-bronze-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600';

function Contact() {
  const [preferredContactMethod, setPreferredContactMethod] = useState('email');
  const [submissionAttempted, setSubmissionAttempted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    // Keep submission local until a contact endpoint is available.
    setSubmissionAttempted(true);
  }

  return (
    <main>
      <header className="bg-bronze-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
            <h1 className="text-4xl font-bold tracking-tight text-charcoal-950 sm:text-5xl">
              Contact Us
            </h1>
            <p className="mt-6 text-base leading-8 text-charcoal-700 sm:text-lg">
              Get in touch with Valluvam for general enquiries, volunteering,
              community support, or collaboration enquiries.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <section aria-labelledby="contact-details-title" className="min-w-0">
          <h2
            id="contact-details-title"
            className="text-2xl font-semibold text-charcoal-950"
          >
            Contact details
          </h2>
          <dl className="mt-6 space-y-6 rounded-xl border border-bronze-100 bg-bronze-50 p-6 sm:p-8">
            <div>
              <dt className="text-sm font-semibold text-charcoal-950">Email</dt>
              <dd className="mt-2 text-base leading-7">
                <a
                  href="mailto:valluvamofficial@gmail.com"
                  className="wrap-anywhere rounded-sm text-bronze-700 underline decoration-bronze-300 underline-offset-4 hover:text-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600"
                >
                  valluvamofficial@gmail.com
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-charcoal-950">Location</dt>
              <dd className="mt-2 text-base leading-7 text-charcoal-700">
                Pandiruppu, Kalmunai, Ampara District, Sri Lanka
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="contact-form-title" className="min-w-0">
          <h2
            id="contact-form-title"
            className="text-2xl font-semibold text-charcoal-950"
          >
            Send a message
          </h2>
          <p id="contact-form-required" className="mt-2 text-sm text-charcoal-700">
            All displayed fields are required.
          </p>

          <form
            onSubmit={handleSubmit}
            aria-labelledby="contact-form-title"
            aria-describedby="contact-form-notice contact-form-required"
            className="mt-6 space-y-5"
          >
            <div>
              <label htmlFor="contact-name" className="block text-sm font-semibold text-charcoal-950">
                Full Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className={fieldClassName}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-semibold text-charcoal-950">
                Email Address
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={fieldClassName}
              />
            </div>
            <fieldset className="w-full min-w-0 rounded-xl border border-bronze-100 bg-bronze-50 p-6 pt-6 sm:p-5 sm:pt-7">
              <legend className="float-left w-full mb-2 px-2 text-base font-semibold text-charcoal-950">
                How can we reach you?
              </legend>
              <div className="flex w-full flex-wrap gap-x-6 gap-y-2">
                {[
                  { value: 'email', label: 'Email' },
                  { value: 'whatsapp', label: 'WhatsApp' },
                  { value: 'phone', label: 'Phone' },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-charcoal-950"
                  >
                    <input
                      type="radio"
                      name="preferredContactMethod"
                      value={value}
                      checked={preferredContactMethod === value}
                      onChange={(event) => {
                        setPreferredContactMethod(event.target.value);
                        setSubmissionAttempted(false);
                      }}
                      required
                      className="h-4 w-4 accent-bronze-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {preferredContactMethod === 'email' ? (
                <p className="mt-3 text-sm leading-6 text-charcoal-700">
                  Uses the Email Address entered above.
                </p>
              ) : (
                <div className="mt-4">
                  <label
                    htmlFor={`contact-${preferredContactMethod}-number`}
                    className="block text-sm font-semibold text-charcoal-950"
                  >
                    {preferredContactMethod === 'whatsapp' ? 'WhatsApp Number' : 'Phone Number'}
                  </label>
                  <input
                    key={preferredContactMethod}
                    id={`contact-${preferredContactMethod}-number`}
                    name={`${preferredContactMethod}Number`}
                    type="tel"
                    autoComplete="tel"
                    required
                    className={fieldClassName}
                  />
                </div>
              )}
            </fieldset>
            <div>
              <label htmlFor="contact-subject" className="block text-sm font-semibold text-charcoal-950">
                Subject
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                required
                className={fieldClassName}
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-semibold text-charcoal-950">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                className={`${fieldClassName} resize-y`}
              />
            </div>
            {/* Integrate Cloudflare Turnstile or Google reCAPTCHA here during the
                backend/security stage, with token verification on the backend. */}
            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-bronze-700 bg-bronze-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-bronze-800 hover:bg-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600 sm:w-auto"
            >
              Send Message
            </button>
            <p role="status" className="text-sm leading-6 text-charcoal-700">
              {submissionAttempted &&
                'Your message has not been sent. Please contact valluvamofficial@gmail.com directly.'}
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Contact;

