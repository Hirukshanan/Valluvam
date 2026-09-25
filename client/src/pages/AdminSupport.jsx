import { useState, useEffect } from 'react';
import {
  fetchAdminSupport,
  createSupportOption,
  updateSupportOption,
  deleteSupportOption,
} from '../services/adminSupportService';

// ---------------------------------------------------------------------------
// Icon options available for support cards
// ---------------------------------------------------------------------------
const ICON_OPTIONS = [
  { value: 'student', label: 'Student Support (User / Education)' },
  { value: 'materials', label: 'Educational Materials (Book / Pages)' },
  { value: 'sponsor', label: 'Sponsor an Initiative (Star / Partner)' },
  { value: 'volunteer', label: 'Volunteer Your Time (Helping Hands)' },
  { value: 'relief', label: 'Community Relief (Package / Aid)' },
  { value: 'heart', label: 'General / Care (Heart)' },
];

const emptyForm = {
  title: '',
  description: '',
  displayOrder: 0,
  active: true,
  icon: 'heart',
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

// ---------------------------------------------------------------------------
// Delete Confirmation Dialog
// ---------------------------------------------------------------------------
function DeleteDialog({ optionTitle, onConfirm, onCancel, isDeleting }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-charcoal-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl my-auto">
        <h3 id="delete-dialog-title" className="text-lg font-semibold text-charcoal-900">
          Delete Support Option
        </h3>
        <p className="mt-2 text-sm text-charcoal-600">
          Are you sure you want to delete &ldquo;{optionTitle}&rdquo;? This action cannot be
          undone and the option will no longer be visible on the public website.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-charcoal-200 px-4 py-2 text-sm font-medium text-charcoal-700 transition-colors hover:bg-charcoal-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Support Option Form (Create / Edit)
// ---------------------------------------------------------------------------
function SupportOptionForm({ initial, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        displayOrder: initial.displayOrder !== undefined ? initial.displayOrder : 0,
        active: initial.active !== undefined ? initial.active : true,
        icon: initial.icon || 'heart',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [initial]);

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    return e;
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      displayOrder: Number(form.displayOrder) || 0,
      active: Boolean(form.active),
      icon: form.icon || 'heart',
    });
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-charcoal-200 bg-white px-3 py-2 text-sm text-charcoal-950 placeholder:text-charcoal-400 transition-colors focus:border-bronze-400 focus:ring-2 focus:ring-bronze-200 focus:outline-none disabled:opacity-60';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-charcoal-800">
          Option Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="e.g. Support a Student"
          className={inputClass}
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-charcoal-800">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="Detailed explanation of how this support option works..."
          className={inputClass}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Display Order + Icon selection */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="displayOrder" className="block text-sm font-medium text-charcoal-800">
            Display Order
          </label>
          <input
            id="displayOrder"
            name="displayOrder"
            type="number"
            value={form.displayOrder}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="0"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-charcoal-500">
            Lower numbers appear first on the public website.
          </p>
        </div>

        <div>
          <label htmlFor="icon" className="block text-sm font-medium text-charcoal-800">
            Icon Theme
          </label>
          <select
            id="icon"
            name="icon"
            value={form.icon}
            onChange={handleChange}
            disabled={isSubmitting}
            className={inputClass}
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-charcoal-500">
            Determines the graphic shown on the card.
          </p>
        </div>
      </div>

      {/* Active checkbox */}
      <div className="pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-charcoal-300 text-bronze-600 focus:ring-bronze-500"
          />
          <span className="text-sm font-medium text-charcoal-800">
            Active (visible on the public website)
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-bronze-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-bronze-700 disabled:opacity-60"
        >
          {isSubmitting && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          {initial ? 'Update Option' : 'Create Option'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-charcoal-200 px-4 py-2 text-sm font-medium text-charcoal-700 transition-colors hover:bg-charcoal-50 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main AdminSupport Component
// ---------------------------------------------------------------------------
function AdminSupport() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [deletingOption, setDeletingOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  async function loadOptions() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminSupport();
      setOptions(data);
    } catch (err) {
      setError(err.message || 'Failed to load support options');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOptions();
  }, []);

  function handleCreate() {
    setEditingOption(null);
    setShowForm(true);
  }

  function handleEdit(option) {
    setEditingOption(option);
    setShowForm(true);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingOption(null);
  }

  async function handleFormSubmit(formData) {
    setIsSubmitting(true);
    try {
      if (editingOption) {
        await updateSupportOption(editingOption._id, formData);
        setToast('Support option updated successfully');
      } else {
        await createSupportOption(formData);
        setToast('Support option created successfully');
      }
      setShowForm(false);
      setEditingOption(null);
      await loadOptions();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(option) {
    setTogglingId(option._id);
    try {
      await updateSupportOption(option._id, { active: !option.active });
      setToast(`Option "${option.title}" marked as ${!option.active ? 'active' : 'inactive'}`);
      await loadOptions();
    } catch (err) {
      setError(err.message || 'Failed to update option status');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingOption) return;
    setIsDeleting(true);
    try {
      await deleteSupportOption(deletingOption._id);
      setToast('Support option deleted successfully');
      setDeletingOption(null);
      await loadOptions();
    } catch (err) {
      setError(err.message || 'Failed to delete support option');
      setDeletingOption(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-900 sm:text-2xl">
            Support Us Content
          </h2>
          <p className="mt-1 text-sm text-charcoal-500">
            Manage the contribution options displayed on the public Support Us page
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-bronze-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-bronze-700 sm:self-auto"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Option
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={loadOptions}
            className="ml-4 font-semibold underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Form modal/card */}
      {showForm && (
        <div className="mt-6 rounded-xl border border-bronze-100 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-charcoal-900">
            {editingOption ? 'Edit Support Option' : 'Create New Support Option'}
          </h3>
          <SupportOptionForm
            initial={editingOption}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* List / Table */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-bronze-100 bg-white py-16">
            <div className="flex items-center gap-3 text-charcoal-500">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Loading support options…
            </div>
          </div>
        ) : options.length === 0 ? (
          <div className="rounded-xl border border-dashed border-bronze-200 bg-white px-6 py-16 text-center">
            <p className="text-base font-medium text-charcoal-800">No support options yet</p>
            <p className="mt-1 text-sm text-charcoal-500">
              Create your first support option or click &ldquo;Add Option&rdquo; to begin.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table */}
            <div className="hidden overflow-x-auto rounded-xl border border-bronze-100 bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-bronze-100 bg-bronze-50/60">
                    <th className="px-4 py-3 font-semibold text-charcoal-800 w-16">Order</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Title & Description</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Icon Theme</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-charcoal-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bronze-50">
                  {options.map((option) => (
                    <tr key={option._id} className="hover:bg-bronze-50/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-charcoal-700 whitespace-nowrap">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-bronze-100 text-xs font-bold text-bronze-800">
                          {option.displayOrder}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-md">
                        <p className="font-semibold text-charcoal-900">{option.title}</p>
                        <p className="mt-0.5 text-xs text-charcoal-500 line-clamp-2">
                          {option.description}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs capitalize text-charcoal-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded bg-charcoal-100 px-2 py-0.5 font-medium text-charcoal-700">
                          {option.icon || 'heart'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(option)}
                          disabled={togglingId === option._id}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                            option.active
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
                          }`}
                          title="Click to toggle active status"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              option.active ? 'bg-emerald-500' : 'bg-charcoal-400'
                            }`}
                          />
                          {option.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(option)}
                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-bronze-700 transition-colors hover:bg-bronze-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingOption(option)}
                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {options.map((option) => (
                <div
                  key={option._id}
                  className="rounded-xl border border-bronze-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-bronze-100 text-xs font-bold text-bronze-800">
                        {option.displayOrder}
                      </span>
                      <h3 className="text-sm font-semibold text-charcoal-900">
                        {option.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(option)}
                      disabled={togglingId === option._id}
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        option.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-charcoal-100 text-charcoal-600'
                      }`}
                    >
                      {option.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-charcoal-600 line-clamp-3">
                    {option.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-bronze-50 pt-3">
                    <span className="text-[11px] text-charcoal-400 capitalize">
                      Theme: {option.icon || 'heart'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(option)}
                        className="rounded-md border border-bronze-200 px-3 py-1.5 text-xs font-medium text-bronze-700 transition-colors hover:bg-bronze-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingOption(option)}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deletingOption && (
        <DeleteDialog
          optionTitle={deletingOption.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingOption(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

export default AdminSupport;
