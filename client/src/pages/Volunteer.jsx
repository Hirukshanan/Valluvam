import { useState, useRef } from 'react';
import { submitVolunteer } from '../services/volunteerService';
import Turnstile from '../components/Turnstile';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';

const VOLUNTEER_AREAS = [
  { value: 'Teaching & Educational Support', labelKey: 'volunteer.areasList.teaching' },
  { value: 'Event & Community Support', labelKey: 'volunteer.areasList.events' },
  { value: 'Volunteer Coordination', labelKey: 'volunteer.areasList.coordination' },
  { value: 'Skills & Professional Support', labelKey: 'volunteer.areasList.skills' },
  { value: 'Other', labelKey: 'volunteer.areasList.other' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'Weekdays', labelKey: 'volunteer.availabilityList.weekdays' },
  { value: 'Weekends', labelKey: 'volunteer.availabilityList.weekends' },
  { value: 'Both', labelKey: 'volunteer.availabilityList.both' },
  { value: 'Flexible', labelKey: 'volunteer.availabilityList.flexible' },
];

const getWaysToHelp = (t) => [
  {
    title: t('volunteer.ways.teachingTitle'),
    description: t('volunteer.ways.teachingDesc'),
  },
  {
    title: t('volunteer.ways.eventsTitle'),
    description: t('volunteer.ways.eventsDesc'),
  },
  {
    title: t('volunteer.ways.coordinationTitle'),
    description: t('volunteer.ways.coordinationDesc'),
  },
  {
    title: t('volunteer.ways.skillsTitle'),
    description: t('volunteer.ways.skillsDesc'),
  },
];

const fieldClassName =
  'mt-2 block w-full rounded-md border border-charcoal-300 bg-white px-4 py-3 text-base text-charcoal-950 transition-colors focus-visible:border-bronze-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600 disabled:opacity-60 disabled:cursor-not-allowed';

const selectClassName =
  'mt-2 block w-full rounded-md border border-charcoal-300 bg-white px-4 py-3 text-base text-charcoal-950 transition-colors focus-visible:border-bronze-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600 disabled:opacity-60 disabled:cursor-not-allowed appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%236b7280\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E")] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  location: '',
  volunteerArea: '',
  availability: '',
  message: '',
};

function Volunteer() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const turnstileRef = useRef(null);

  const waysToHelp = getWaysToHelp(t);

  function validate() {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = t('volunteer.validation.nameRequired');
    }
    if (!form.email.trim()) {
      errs.email = t('volunteer.validation.emailRequired');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        errs.email = t('volunteer.validation.emailInvalid');
      }
    }
    if (!form.message.trim()) {
      errs.message = t('volunteer.validation.messageRequired');
    }
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) {
      setServerError('');
    }
    if (success) {
      setSuccess(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Prevent accidental duplicate submissions
    if (isSubmitting) return;

    setServerError('');
    setSuccess(false);

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    let token = '';
    try {
      token = await turnstileRef.current?.execute();
    } catch (turnstileErr) {
      setServerError(
        turnstileErr.message || t('volunteer.validation.securityFailed')
      );
      turnstileRef.current?.reset();
      setIsSubmitting(false);
      return;
    }

    if (!token) {
      setServerError(t('volunteer.validation.securityIncomplete'));
      turnstileRef.current?.reset();
      setIsSubmitting(false);
      return;
    }

    try {
      await submitVolunteer({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        volunteerArea: form.volunteerArea.trim(),
        availability: form.availability.trim(),
        message: form.message.trim(),
        turnstileToken: token,
      });

      setSuccess(true);
      setForm(initialForm);
      turnstileRef.current?.reset();
    } catch (err) {
      setServerError(
        err.message || t('volunteer.validation.generalError')
      );
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <SEO
        title="Volunteer With Us"
        description={`Join ${settings.organizationName} as a volunteer. Contribute your time and skills in teaching, event coordination, professional support, and community outreach.`}
      />
      {/* Page header */}
      <header className="bg-bronze-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
            <h1 className="text-4xl font-bold tracking-tight text-charcoal-950 sm:text-5xl">
              {t('volunteer.title', { org: settings.organizationName })}
            </h1>
            <p className="mt-6 text-base leading-8 text-charcoal-700 sm:text-lg">
              {t('volunteer.subhead', { org: settings.organizationName })}
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
              {t('volunteer.waysToHelpHeading')}
            </h2>
            <p className="mt-3 text-base leading-7 text-charcoal-700">
              {t('volunteer.waysToHelpSubhead', { org: settings.organizationName })}
            </p>

            <ul className="mt-8 space-y-5" aria-label={t('volunteer.waysToHelpAria')}>
              {waysToHelp.map(({ title, description }) => (
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
              {t('volunteer.formHeading')}
            </h2>
            <p
              id="volunteer-form-note"
              className="mt-2 text-sm text-charcoal-700"
            >
              {t('volunteer.formNoteAsterisk')}
            </p>

            {/* Success message banner */}
            {success && (
              <div
                role="status"
                className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
              >
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold">{t('volunteer.successTitle')}</p>
                    <p className="mt-1 text-sm text-emerald-700">
                      {t('volunteer.successDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error message banner */}
            {serverError && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
              >
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 shrink-0 text-red-600 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{serverError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setServerError('')}
                    className="ml-auto text-xs font-semibold text-red-700 hover:underline"
                  >
                    {t('common.dismiss')}
                  </button>
                </div>
              </div>
            )}

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
                  {t('volunteer.nameLabel')} <span aria-hidden="true">*</span>
                </label>
                <input
                  id="vol-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`${fieldClassName} ${
                    errors.name ? 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-600' : ''
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="vol-email"
                  className="block text-sm font-semibold text-charcoal-950"
                >
                  {t('volunteer.emailLabel')} <span aria-hidden="true">*</span>
                </label>
                <input
                  id="vol-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`${fieldClassName} ${
                    errors.email ? 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-600' : ''
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="vol-phone"
                  className="block text-sm font-semibold text-charcoal-950"
                >
                  {t('volunteer.phoneLabel')}
                </label>
                <input
                  id="vol-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={fieldClassName}
                />
              </div>

              {/* Area / Location */}
              <div>
                <label
                  htmlFor="vol-location"
                  className="block text-sm font-semibold text-charcoal-950"
                >
                  {t('volunteer.locationLabel')}
                </label>
                <input
                  id="vol-location"
                  name="location"
                  type="text"
                  autoComplete="address-level2"
                  value={form.location}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={fieldClassName}
                />
              </div>

              {/* Preferred Area of Volunteering */}
              <div>
                <label
                  htmlFor="vol-area"
                  className="block text-sm font-semibold text-charcoal-950"
                >
                  {t('volunteer.areaLabel')}
                </label>
                <select
                  id="vol-area"
                  name="volunteerArea"
                  value={form.volunteerArea}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={selectClassName}
                >
                  <option value="">
                    {t('volunteer.selectArea')}
                  </option>
                  {VOLUNTEER_AREAS.map((area) => (
                    <option key={area.value} value={area.value}>
                      {t(area.labelKey)}
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
                  {t('volunteer.availabilityLabel')}
                </label>
                <select
                  id="vol-availability"
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={selectClassName}
                >
                  <option value="">
                    {t('volunteer.selectAvailability')}
                  </option>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
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
                  {t('volunteer.messageLabel')} <span aria-hidden="true">*</span>
                </label>
                <p id="vol-message-hint" className="mt-1 text-xs text-charcoal-500">
                  {t('volunteer.messageHint', { org: settings.organizationName })}
                </p>
                <textarea
                  id="vol-message"
                  name="message"
                  rows={4}
                  required
                  value={form.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-describedby="vol-message-hint"
                  className={`${fieldClassName} resize-y ${
                    errors.message ? 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-600' : ''
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-600">{errors.message}</p>
                )}
              </div>

              {/* Cloudflare Turnstile Invisible Verification */}
              <Turnstile
                ref={turnstileRef}
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                action="volunteer_form"
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-bronze-700 bg-bronze-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-bronze-800 hover:bg-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600 disabled:opacity-60 disabled:cursor-not-allowed sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    {t('volunteer.submittingButton')}
                  </>
                ) : (
                  t('volunteer.submitButton')
                )}
              </button>
            </form>
          </section>

        </div>
      </div>
    </main>
  );
}

export default Volunteer;
