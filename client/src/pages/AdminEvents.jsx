import { useState, useEffect } from 'react';
import {
  fetchAdminEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../services/adminEventService';

// ---------------------------------------------------------------------------
// Event Form (Create / Edit)
// ---------------------------------------------------------------------------

const emptyForm = {
  title: '',
  description: '',
  date: '',
  location: '',
  image: '',
  status: 'draft',
};

function EventForm({ initial, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [errors, setErrors] = useState({});
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        date: initial.date ? initial.date.slice(0, 10) : '',
        location: initial.location || '',
        image: initial.image || '',
        status: initial.status || 'draft',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setPreviewError(false);
  }, [initial]);

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.status) e.status = 'Status is required';
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (name === 'image') {
      setPreviewError(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    onSubmit(form);
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-charcoal-200 bg-white px-3 py-2 text-sm text-charcoal-950 placeholder:text-charcoal-400 transition-colors focus:border-bronze-400 focus:ring-2 focus:ring-bronze-200 focus:outline-none disabled:opacity-60';

  const trimmedImage = form.image?.trim() || '';
  const isLocalPath = /^[a-zA-Z]:[/\\]|^file:\/\//i.test(trimmedImage);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-charcoal-800">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="Event title"
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
          rows={4}
          value={form.description}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="Event description"
          className={inputClass}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Date + Location row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-charcoal-800">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            disabled={isSubmitting}
            className={inputClass}
          />
          {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-charcoal-800">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="Event location"
            className={inputClass}
          />
          {errors.location && (
            <p className="mt-1 text-xs text-red-600">{errors.location}</p>
          )}
        </div>
      </div>

      {/* Image URL + Status row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-charcoal-800">
            Image URL
          </label>
          <input
            id="image"
            name="image"
            type="url"
            value={form.image}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="https://example.com/image.jpg"
            className={inputClass}
          />

          {trimmedImage && isLocalPath && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
              Local file paths (e.g. C:\...) are not supported. Please enter a direct web image URL (http:// or https://).
            </p>
          )}

          {trimmedImage && !isLocalPath && previewError && (
            <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
              Unable to load image preview. Please check that the URL is a valid, direct image link.
            </p>
          )}

          {trimmedImage && !isLocalPath && !previewError && (
            <div className="mt-2 overflow-hidden rounded-lg border border-bronze-100 bg-bronze-50/50">
              <img
                src={trimmedImage}
                alt="Event preview"
                onError={() => setPreviewError(true)}
                className="h-36 w-full rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-charcoal-800">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            disabled={isSubmitting}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-bronze-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-bronze-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          {initial ? 'Update Event' : 'Create Event'}
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
// Delete confirmation dialog
// ---------------------------------------------------------------------------

function DeleteDialog({ eventTitle, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/40 px-4">
      <div className="w-full max-w-sm rounded-xl border border-bronze-100 bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-charcoal-900">Delete Event</h3>
        <p className="mt-2 text-sm text-charcoal-600">
          Are you sure you want to delete{' '}
          <span className="font-medium text-charcoal-900">"{eventTitle}"</span>? This
          action cannot be undone.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
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
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
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
// Success toast
// ---------------------------------------------------------------------------

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-md">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <path d="M22 4L12 14.01l-3-3" />
      </svg>
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState('');

  async function loadEvents() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminEvents();
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  // -- Create / Edit --

  function handleCreate() {
    setEditingEvent(null);
    setShowForm(true);
  }

  function handleEdit(event) {
    setEditingEvent(event);
    setShowForm(true);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingEvent(null);
  }

  async function handleFormSubmit(formData) {
    setIsSubmitting(true);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent._id, formData);
        setToast('Event updated successfully');
      } else {
        await createEvent(formData);
        setToast('Event created successfully');
      }
      setShowForm(false);
      setEditingEvent(null);
      await loadEvents();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  // -- Delete --

  async function handleConfirmDelete() {
    if (!deletingEvent) return;
    setIsDeleting(true);
    try {
      await deleteEvent(deletingEvent._id);
      setToast('Event deleted successfully');
      setDeletingEvent(null);
      await loadEvents();
    } catch (err) {
      setError(err.message || 'Failed to delete event');
      setDeletingEvent(null);
    } finally {
      setIsDeleting(false);
    }
  }

  // -- Render --

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-900 sm:text-2xl">Events</h2>
          <p className="mt-1 text-sm text-charcoal-500">
            Manage community events and activities
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-bronze-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-bronze-700"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Event
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
          <button
            type="button"
            onClick={() => setError('')}
            className="ml-3 font-medium underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mt-6 rounded-xl border border-bronze-100 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-charcoal-900">
            {editingEvent ? 'Edit Event' : 'Create Event'}
          </h3>
          <EventForm
            initial={editingEvent}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Events table / list */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-bronze-100 bg-white py-16">
            <div className="flex items-center gap-3 text-charcoal-500">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Loading events…
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-bronze-200 bg-white px-6 py-16 text-center">
            <p className="text-base font-medium text-charcoal-800">No events yet</p>
            <p className="mt-1 text-sm text-charcoal-500">
              Create your first event to get started.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-bronze-100 bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-bronze-100 bg-bronze-50/60">
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Title</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Date</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Location</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-charcoal-800">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bronze-50">
                  {events.map((event) => (
                    <tr key={event._id} className="hover:bg-bronze-50/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-charcoal-900 max-w-xs truncate">
                        {event.title}
                      </td>
                      <td className="px-4 py-3 text-charcoal-600 whitespace-nowrap">
                        {formatDate(event.date)}
                      </td>
                      <td className="px-4 py-3 text-charcoal-600 max-w-[200px] truncate">
                        {event.location}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            event.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-charcoal-100 text-charcoal-600'
                          }`}
                        >
                          {event.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(event)}
                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-bronze-700 transition-colors hover:bg-bronze-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingEvent(event)}
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

            {/* Mobile card list */}
            <div className="flex flex-col gap-3 md:hidden">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="rounded-xl border border-bronze-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-charcoal-900 line-clamp-2">
                      {event.title}
                    </h3>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        event.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-charcoal-100 text-charcoal-600'
                      }`}
                    >
                      {event.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-charcoal-500">
                    {formatDate(event.date)} · {event.location}
                  </p>
                  <div className="mt-3 flex gap-2 border-t border-bronze-50 pt-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(event)}
                      className="rounded-md border border-bronze-200 px-3 py-1.5 text-xs font-medium text-bronze-700 transition-colors hover:bg-bronze-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingEvent(event)}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {deletingEvent && (
        <DeleteDialog
          eventTitle={deletingEvent.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingEvent(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Success toast */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

export default AdminEvents;

