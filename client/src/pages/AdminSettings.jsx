import { useState, useEffect } from 'react';
import { fetchSettings, updateSettings } from '../services/adminSettingsService';
import { useSettings } from '../context/SettingsContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClassName =
  'mt-2 block w-full rounded-md border border-charcoal-300 bg-white px-3.5 py-2.5 text-sm sm:text-base text-charcoal-950 transition-colors focus-visible:border-bronze-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600 disabled:opacity-60 disabled:cursor-not-allowed';

const initialSettingsState = {
  organizationName: '',
  slogan: '',
  establishedDate: '',
  email: '',
  location: '',
  facebookUrl: '',
  instagramUrl: '',
};

// ---------------------------------------------------------------------------
// Toast Notification
// ---------------------------------------------------------------------------
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-md">
      <svg
        className="h-5 w-5 shrink-0 text-emerald-600"
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
      <span className="font-medium">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 text-emerald-600 hover:text-emerald-800"
        aria-label="Dismiss notification"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}

function AdminSettings() {
  const { refreshSettings } = useSettings();
  const [form, setForm] = useState(initialSettingsState);
  const [originalForm, setOriginalForm] = useState(initialSettingsState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // Fetch settings on mount
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setServerError('');
      try {
        const data = await fetchSettings();
        if (isMounted && data) {
          const loaded = {
            organizationName: data.organizationName || '',
            slogan: data.slogan || '',
            establishedDate: data.establishedDate || '',
            email: data.email || '',
            location: data.location || '',
            facebookUrl: data.facebookUrl || '',
            instagramUrl: data.instagramUrl || '',
          };
          setForm(loaded);
          setOriginalForm(loaded);
          if (data.updatedAt) {
            setLastUpdated(data.updatedAt);
          }
        }
      } catch (err) {
        if (isMounted) {
          setServerError(err.message || 'Failed to load organization settings');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    load();

    return () => {
      isMounted = false;
    };
  }, []);

  function validate() {
    const errs = {};
    if (!form.organizationName.trim()) {
      errs.organizationName = 'Organization name is required';
    } else if (form.organizationName.trim().length > 150) {
      errs.organizationName = 'Organization name cannot exceed 150 characters';
    }

    if (!form.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(form.email.trim())) {
      errs.email = 'Please provide a valid email address';
    }

    if (form.slogan && form.slogan.trim().length > 300) {
      errs.slogan = 'Slogan cannot exceed 300 characters';
    }

    if (form.location && form.location.trim().length > 300) {
      errs.location = 'Location cannot exceed 300 characters';
    }

    if (form.facebookUrl && form.facebookUrl.trim().length > 500) {
      errs.facebookUrl = 'Facebook URL cannot exceed 500 characters';
    }

    if (form.instagramUrl && form.instagramUrl.trim().length > 500) {
      errs.instagramUrl = 'Instagram URL cannot exceed 500 characters';
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
  }

  function handleReset() {
    setForm(originalForm);
    setErrors({});
    setServerError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (saving) return;

    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const updated = await updateSettings({
        organizationName: form.organizationName.trim(),
        slogan: form.slogan.trim(),
        establishedDate: form.establishedDate.trim(),
        email: form.email.trim().toLowerCase(),
        location: form.location.trim(),
        facebookUrl: form.facebookUrl.trim(),
        instagramUrl: form.instagramUrl.trim(),
      });

      const updatedData = {
        organizationName: updated.organizationName || '',
        slogan: updated.slogan || '',
        establishedDate: updated.establishedDate || '',
        email: updated.email || '',
        location: updated.location || '',
        facebookUrl: updated.facebookUrl || '',
        instagramUrl: updated.instagramUrl || '',
      };

      setForm(updatedData);
      setOriginalForm(updatedData);
      if (updated.updatedAt) {
        setLastUpdated(updated.updatedAt);
      }
      setToastMessage('Organization settings updated successfully.');
      refreshSettings();
    } catch (err) {
      setServerError(err.message || 'Failed to update organization settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-1 pb-16">
      {/* ── Page Header ── */}
      <div className="rounded-xl border border-bronze-100 bg-white p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-charcoal-950 sm:text-2xl">Settings</h2>
            <p className="mt-1 text-sm text-charcoal-600">
              Manage organization details, contact information, and social links.
            </p>
          </div>
          {lastUpdated && (
            <p className="text-xs text-charcoal-500">
              Last saved:{' '}
              {new Date(lastUpdated).toLocaleString('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-4xl py-6">
        {/* Error Alert */}
        {serverError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
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
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-bronze-100 bg-white p-12">
            <div className="flex flex-col items-center gap-3">
              <svg className="h-8 w-8 animate-spin text-bronze-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-sm font-medium text-charcoal-600">Loading organization settings…</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            {/* General Info Card */}
            <div className="rounded-xl border border-bronze-100 bg-white p-4 sm:p-6 shadow-xs">
              <h2 className="text-lg font-semibold text-charcoal-950">Organization Profile</h2>
              <p className="mt-1 text-sm text-charcoal-600">
                Basic identity and branding information for Valluvam.
              </p>

              <div className="mt-6 space-y-5">
                {/* Organization Name */}
                <div>
                  <label htmlFor="settings-orgName" className="block text-sm font-semibold text-charcoal-950">
                    Organization Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="settings-orgName"
                    name="organizationName"
                    type="text"
                    required
                    value={form.organizationName}
                    onChange={handleChange}
                    disabled={saving}
                    className={`${fieldClassName} ${
                      errors.organizationName ? 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-600' : ''
                    }`}
                  />
                  {errors.organizationName && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{errors.organizationName}</p>
                  )}
                </div>

                {/* Slogan */}
                <div>
                  <label htmlFor="settings-slogan" className="block text-sm font-semibold text-charcoal-950">
                    Slogan / Motto
                  </label>
                  <input
                    id="settings-slogan"
                    name="slogan"
                    type="text"
                    value={form.slogan}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="e.g. Let all your thoughts be set on high aspirations"
                    className={`${fieldClassName} ${
                      errors.slogan ? 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-600' : ''
                    }`}
                  />
                  {errors.slogan && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{errors.slogan}</p>
                  )}
                </div>

                {/* Established Date */}
                <div>
                  <label htmlFor="settings-establishedDate" className="block text-sm font-semibold text-charcoal-950">
                    Established Date
                  </label>
                  <input
                    id="settings-establishedDate"
                    name="establishedDate"
                    type="text"
                    value={form.establishedDate}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="e.g. 28 March 2025"
                    className={fieldClassName}
                  />
                  <p className="mt-1 text-xs text-charcoal-500">
                    Displayed in the About Us and Home sections (e.g. 28 March 2025).
                  </p>
                </div>
              </div>
            </div>

            {/* Contact & Location Card */}
            <div className="rounded-xl border border-bronze-100 bg-white p-4 sm:p-6 shadow-xs">
              <h2 className="text-lg font-semibold text-charcoal-950">Contact & Location</h2>
              <p className="mt-1 text-sm text-charcoal-600">
                Official contact channel and headquarters address.
              </p>

              <div className="mt-6 space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="settings-email" className="block text-sm font-semibold text-charcoal-950">
                    Official Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="settings-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    disabled={saving}
                    className={`${fieldClassName} ${
                      errors.email ? 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-600' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="settings-location" className="block text-sm font-semibold text-charcoal-950">
                    Location / Address
                  </label>
                  <input
                    id="settings-location"
                    name="location"
                    type="text"
                    value={form.location}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="e.g. Pandiruppu, Kalmunai, Ampara District, Sri Lanka"
                    className={`${fieldClassName} ${
                      errors.location ? 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-600' : ''
                    }`}
                  />
                  {errors.location && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{errors.location}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media Links Card */}
            <div className="rounded-xl border border-bronze-100 bg-white p-4 sm:p-6 shadow-xs">
              <h2 className="text-lg font-semibold text-charcoal-950">Social Media Links</h2>
              <p className="mt-1 text-sm text-charcoal-600">
                Official public social profiles linked in the website footer.
              </p>

              <div className="mt-6 space-y-5">
                {/* Facebook URL */}
                <div>
                  <label htmlFor="settings-facebookUrl" className="block text-sm font-semibold text-charcoal-950">
                    Facebook Page URL
                  </label>
                  <input
                    id="settings-facebookUrl"
                    name="facebookUrl"
                    type="url"
                    value={form.facebookUrl}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="https://www.facebook.com/..."
                    className={`${fieldClassName} ${
                      errors.facebookUrl ? 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-600' : ''
                    }`}
                  />
                  {errors.facebookUrl && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{errors.facebookUrl}</p>
                  )}
                </div>

                {/* Instagram URL */}
                <div>
                  <label htmlFor="settings-instagramUrl" className="block text-sm font-semibold text-charcoal-950">
                    Instagram Profile URL
                  </label>
                  <input
                    id="settings-instagramUrl"
                    name="instagramUrl"
                    type="url"
                    value={form.instagramUrl}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="https://www.instagram.com/..."
                    className={`${fieldClassName} ${
                      errors.instagramUrl ? 'border-red-500 focus-visible:border-red-500 focus-visible:outline-red-600' : ''
                    }`}
                  />
                  {errors.instagramUrl && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{errors.instagramUrl}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-charcoal-300 bg-white px-5 py-2.5 text-sm font-medium text-charcoal-700 hover:bg-charcoal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Reset to Current
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-bronze-700 bg-bronze-700 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:border-bronze-800 hover:bg-bronze-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Saving changes…
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}
    </div>
  );
}

export default AdminSettings;
