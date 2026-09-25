import { useState, useRef } from 'react';
import { submitContactMessage } from '../services/contactService';
import Turnstile from '../components/Turnstile';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';

const fieldClassName =
  'mt-2 block w-full rounded-md border border-charcoal-300 bg-white px-4 py-3 text-base text-charcoal-950 transition-colors focus-visible:border-bronze-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600 disabled:opacity-60 disabled:cursor-not-allowed';

const initialForm = {
  name: '',
  email: '',
  preferredContactMethod: 'email',
  whatsappNumber: '',
  phoneNumber: '',
  subject: '',
  message: '',
};

function Contact() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const turnstileRef = useRef(null);

  function validate() {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = t('contact.validation.nameRequired');
    }
    if (!form.email.trim()) {
      errs.email = t('contact.validation.emailRequired');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        errs.email = t('contact.validation.emailInvalid');
      }
    }

    if (form.preferredContactMethod === 'whatsapp') {
      if (!form.whatsappNumber.trim()) {
        errs.whatsappNumber = t('contact.validation.whatsappRequired');
      }
    } else if (form.preferredContactMethod === 'phone') {
      if (!form.phoneNumber.trim()) {
        errs.phoneNumber = t('contact.validation.phoneRequired');
      }
    }

    if (!form.subject.trim()) {
      errs.subject = t('contact.validation.subjectRequired');
    }
    if (!form.message.trim()) {
      errs.message = t('contact.validation.messageRequired');
    }
    return errs;
  }

  function handleNumberKeyDown(event) {
    if (
      [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
      ].includes(event.key) ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const finalValue =
      name === 'whatsappNumber' || name === 'phoneNumber'
        ? value.replace(/\D/g, '')
        : value;
    setForm((prev) => ({ ...prev, [name]: finalValue }));
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

  function handleMethodChange(value) {
    setForm((prev) => ({
      ...prev,
      preferredContactMethod: value,
    }));
    setErrors((prev) => ({
      ...prev,
      whatsappNumber: undefined,
      phoneNumber: undefined,
    }));
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
      const fieldOrder = [
        'name',
        'email',
        'whatsappNumber',
        'phoneNumber',
        'subject',
        'message',
      ];
      const firstKey = fieldOrder.find((k) => fieldErrors[k]);
      if (firstKey) {
        const elementIdMap = {
          name: 'contact-name',
          email: 'contact-email',
          whatsappNumber: 'contact-whatsapp-number',
          phoneNumber: 'contact-phone-number',
          subject: 'contact-subject',
          message: 'contact-message',
        };
        const el = document.getElementById(elementIdMap[firstKey]);
        el?.focus();
      }
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    let token = '';
    try {
      token = await turnstileRef.current?.execute();
    } catch (turnstileErr) {
      setServerError(
        turnstileErr.message || t('contact.validation.securityFailed')
      );
      turnstileRef.current?.reset();
      setIsSubmitting(false);
      return;
    }

    if (!token) {
      setServerError(t('contact.validation.securityIncomplete'));
      turnstileRef.current?.reset();
      setIsSubmitting(false);
      return;
    }

    try {
      await submitContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        preferredContactMethod: form.preferredContactMethod,
        whatsappNumber:
          form.preferredContactMethod === 'whatsapp'
            ? form.whatsappNumber.trim()
            : '',
        phoneNumber:
          form.preferredContactMethod === 'phone'
            ? form.phoneNumber.trim()
            : '',
        turnstileToken: token,
      });

      setSuccess(true);
      setForm(initialForm);
      turnstileRef.current?.reset();
    } catch (err) {
      setServerError(
        err.message || t('contact.validation.generalError')
      );
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <SEO
        title="Contact Us"
        description={`Get in touch with ${settings.organizationName} for general enquiries, volunteering opportunities, community support, or collaboration in ${settings.location}.`}
      />
      <header className="bg-bronze-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
            <h1 className="text-4xl font-bold tracking-tight text-charcoal-950 sm:text-5xl">
              {t('contact.title')}
            </h1>
            <p className="mt-6 text-base leading-8 text-charcoal-700 sm:text-lg">
              {t('contact.subhead', { org: settings.organizationName })}
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
            {t('contact.detailsHeading')}
          </h2>
          <dl className="mt-6 space-y-6 rounded-xl border border-bronze-100 bg-bronze-50 p-6 sm:p-8">
            <div>
              <dt className="text-sm font-semibold text-charcoal-950">{t('contact.emailLabel')}</dt>
              <dd className="mt-2 text-base leading-7">
                <a
                  href={`mailto:${settings.email}`}
                  className="wrap-anywhere rounded-sm text-bronze-700 underline decoration-bronze-300 underline-offset-4 hover:text-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600"
                >
                  {settings.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-charcoal-950">{t('contact.locationLabel')}</dt>
              <dd className="mt-2 text-base leading-7 text-charcoal-700">
                {settings.location}
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="contact-form-title" className="min-w-0">
          <h2
            id="contact-form-title"
            className="text-2xl font-semibold text-charcoal-950"
          >
            {t('contact.formHeading')}
          </h2>
          <p id="contact-form-required" className="mt-2 text-sm text-charcoal-700">
            {t('contact.requiredNote')}
          </p>

          {/* Success banner */}
          {success && (
            <div
              role="status"
              aria-live="polite"
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
                  <p className="text-sm font-semibold">{t('contact.successTitle')}</p>
                  <p className="mt-1 text-sm text-emerald-700">
                    {t('contact.successDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error banner */}
          {serverError && (
            <div
              role="alert"
              aria-live="assertive"
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
                  className="ml-auto text-xs font-semibold text-red-700 hover:underline rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  {t('common.dismiss')}
                </button>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            aria-labelledby="contact-form-title"
            aria-describedby="contact-form-required"
            className="mt-6 space-y-5"
            noValidate
          >
            <div>
              <label htmlFor="contact-name" className="block text-sm font-semibold text-charcoal-950">
                {t('contact.nameLabel')} <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                aria-required="true"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'contact-name-error' : undefined}
                value={form.name}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`${fieldClassName} ${
                  errors.name ? 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-600' : ''
                }`}
              />
              {errors.name && (
                <p id="contact-name-error" role="alert" className="mt-1.5 text-xs text-red-600 font-medium">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-sm font-semibold text-charcoal-950">
                {t('contact.emailInputLabel')} <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'contact-email-error' : undefined}
                value={form.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`${fieldClassName} ${
                  errors.email ? 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-600' : ''
                }`}
              />
              {errors.email && (
                <p id="contact-email-error" role="alert" className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>
              )}
            </div>

            <fieldset className="w-full min-w-0 rounded-xl border border-bronze-100 bg-bronze-50 p-6 pt-6 sm:p-5 sm:pt-7">
              <legend className="float-left w-full mb-2 px-2 text-base font-semibold text-charcoal-950">
                {t('contact.reachMethodLegend')} <span aria-hidden="true" className="text-red-500">*</span>
              </legend>
              <div className="flex w-full flex-wrap gap-x-6 gap-y-2">
                {[
                  { value: 'email', label: t('contact.methodEmail') },
                  { value: 'whatsapp', label: t('contact.methodWhatsapp') },
                  { value: 'phone', label: t('contact.methodPhone') },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    htmlFor={`contact-method-${value}`}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-charcoal-950"
                  >
                    <input
                      id={`contact-method-${value}`}
                      type="radio"
                      name="preferredContactMethod"
                      value={value}
                      checked={form.preferredContactMethod === value}
                      onChange={() => handleMethodChange(value)}
                      disabled={isSubmitting}
                      required
                      aria-required="true"
                      className="h-4 w-4 accent-bronze-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {form.preferredContactMethod === 'email' ? (
                <p className="mt-3 text-sm leading-6 text-charcoal-700">
                  {t('contact.emailMethodNote')}
                </p>
              ) : (
                <div className="mt-4">
                  <label
                    htmlFor={`contact-${form.preferredContactMethod}-number`}
                    className="block text-sm font-semibold text-charcoal-950"
                  >
                    {form.preferredContactMethod === 'whatsapp' ? t('contact.whatsappNumberLabel') : t('contact.phoneNumberLabel')}{' '}
                    <span aria-hidden="true" className="text-red-500">*</span>
                  </label>
                  <input
                    key={form.preferredContactMethod}
                    id={`contact-${form.preferredContactMethod}-number`}
                    name={form.preferredContactMethod === 'whatsapp' ? 'whatsappNumber' : 'phoneNumber'}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="tel"
                    required
                    aria-required="true"
                    aria-invalid={Boolean(
                      form.preferredContactMethod === 'whatsapp'
                        ? errors.whatsappNumber
                        : errors.phoneNumber
                    )}
                    aria-describedby={
                      form.preferredContactMethod === 'whatsapp' && errors.whatsappNumber
                        ? 'contact-whatsapp-error'
                        : form.preferredContactMethod === 'phone' && errors.phoneNumber
                          ? 'contact-phone-error'
                          : undefined
                    }
                    value={
                      form.preferredContactMethod === 'whatsapp'
                        ? form.whatsappNumber
                        : form.phoneNumber
                    }
                    onChange={handleChange}
                    onKeyDown={handleNumberKeyDown}
                    disabled={isSubmitting}
                    className={`${fieldClassName} ${
                      (form.preferredContactMethod === 'whatsapp' && errors.whatsappNumber) ||
                      (form.preferredContactMethod === 'phone' && errors.phoneNumber)
                        ? 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-600'
                        : ''
                    }`}
                  />
                  {form.preferredContactMethod === 'whatsapp' && errors.whatsappNumber && (
                    <p id="contact-whatsapp-error" role="alert" className="mt-1.5 text-xs text-red-600 font-medium">{errors.whatsappNumber}</p>
                  )}
                  {form.preferredContactMethod === 'phone' && errors.phoneNumber && (
                    <p id="contact-phone-error" role="alert" className="mt-1.5 text-xs text-red-600 font-medium">{errors.phoneNumber}</p>
                  )}
                </div>
              )}
            </fieldset>

            <div>
              <label htmlFor="contact-subject" className="block text-sm font-semibold text-charcoal-950">
                {t('contact.subjectLabel')} <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                required
                aria-required="true"
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                value={form.subject}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`${fieldClassName} ${
                  errors.subject ? 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-600' : ''
                }`}
              />
              {errors.subject && (
                <p id="contact-subject-error" role="alert" className="mt-1.5 text-xs text-red-600 font-medium">{errors.subject}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-sm font-semibold text-charcoal-950">
                {t('contact.messageLabel')} <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                aria-required="true"
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                value={form.message}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`${fieldClassName} resize-y ${
                  errors.message ? 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-600' : ''
                }`}
              />
              {errors.message && (
                <p id="contact-message-error" role="alert" className="mt-1.5 text-xs text-red-600 font-medium">{errors.message}</p>
              )}
            </div>

            {/* Cloudflare Turnstile Invisible Verification */}
            <Turnstile
              ref={turnstileRef}
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-bronze-700 bg-bronze-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-bronze-800 hover:bg-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze-600 disabled:opacity-60 disabled:cursor-not-allowed sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  {t('contact.submittingButton')}
                </>
              ) : (
                t('contact.submitButton')
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Contact;
