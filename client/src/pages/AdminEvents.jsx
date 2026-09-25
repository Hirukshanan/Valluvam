import { useState, useEffect } from 'react';
import {
  fetchAdminEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
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
  imagePublicId: '',
  status: 'draft',
};

function EventForm({ initial, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [errors, setErrors] = useState({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        date: initial.date ? initial.date.slice(0, 10) : '',
        location: initial.location || '',
        image: initial.image || '',
        imagePublicId: initial.imagePublicId || '',
        status: initial.status || 'draft',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setUploadError('');
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
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type || !file.type.startsWith('image/')) {
      setUploadError('Invalid file type. Please select an image (JPEG, PNG, WebP, GIF, AVIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image file is too large. Maximum size is 10 MB.');
      return;
    }

    setUploadError('');
    setIsUploadingImage(true);
    try {
      const result = await uploadEventImage(file);
      if (result && result.url) {
        setForm((prev) => ({
          ...prev,
          image: result.url,
          imagePublicId: result.publicId || '',
        }));
        setPreviewError(false);
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to upload image to Cloudinary');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  }

  function handleRemoveImage() {
    setForm((prev) => ({
      ...prev,
      image: '',
      imagePublicId: '',
    }));
    setPreviewError(false);
    setUploadError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isUploadingImage) return;
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      image: form.image.trim(),
      imagePublicId: form.imagePublicId?.trim() || '',
    });
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-charcoal-200 bg-white px-3 py-2 text-sm text-charcoal-950 placeholder:text-charcoal-400 transition-colors focus:border-bronze-400 focus:ring-2 focus:ring-bronze-200 focus:outline-none disabled:opacity-60';

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
          disabled={isSubmitting || isUploadingImage}
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
          disabled={isSubmitting || isUploadingImage}
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
            disabled={isSubmitting || isUploadingImage}
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
            disabled={isSubmitting || isUploadingImage}
            placeholder="Event location"
            className={inputClass}
          />
          {errors.location && (
            <p className="mt-1 text-xs text-red-600">{errors.location}</p>
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-charcoal-800">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          name="status"
          value={form.status}
          onChange={handleChange}
          disabled={isSubmitting || isUploadingImage}
          className={inputClass}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
      </div>

      {/* Event Image (Cloudinary) */}
      <div>
        <label className="block text-sm font-medium text-charcoal-800">
          Event Image
        </label>
        <p className="mb-2 text-xs text-charcoal-500">
          Select an image from your computer to upload directly to Cloudinary.
        </p>

        {form.image ? (
          <div className="rounded-lg border border-bronze-100 bg-bronze-50/40 p-3 sm:p-4">
            <div className="relative overflow-hidden rounded-lg border border-bronze-200 bg-white">
              <img
                src={form.image}
                alt="Event preview"
                onError={() => setPreviewError(true)}
                className="h-48 w-full object-cover sm:h-56"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                  ✓ Image Set
                </span>
                {previewError && (
                  <p className="text-xs text-red-600">Failed to load preview.</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="replaceEventImageInput"
                  className={`inline-flex items-center gap-1.5 rounded-md border border-bronze-200 bg-white px-2.5 py-1 text-xs font-medium text-bronze-700 transition-colors hover:bg-bronze-50 cursor-pointer ${
                    isUploadingImage || isSubmitting ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
                  }`}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Replace Image
                  <input
                    id="replaceEventImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isUploadingImage || isSubmitting}
                    className="sr-only"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isUploadingImage || isSubmitting}
                  className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            </div>

            {isUploadingImage && (
              <div className="mt-2.5 flex items-center space-x-2 text-xs text-bronze-700">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bronze-600 border-t-transparent" />
                <span>Uploading replacement image to Cloudinary...</span>
              </div>
            )}

            {uploadError && (
              <p className="mt-2 text-xs text-red-600">{uploadError}</p>
            )}
          </div>
        ) : (
          <div>
            <label
              htmlFor="eventImageUploadInput"
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-charcoal-200 bg-charcoal-50/50 p-6 text-center cursor-pointer transition-colors hover:border-bronze-300 hover:bg-bronze-50/30 ${
                isUploadingImage ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <svg
                className="mb-2 h-8 w-8 text-charcoal-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-xs font-medium text-charcoal-700">
                Click to browse and upload event image
              </span>
              <span className="mt-0.5 text-[11px] text-charcoal-500">
                JPEG, PNG, WebP up to 10 MB
              </span>
              <input
                id="eventImageUploadInput"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploadingImage || isSubmitting}
                className="sr-only"
              />
            </label>

            {isUploadingImage && (
              <div className="mt-2 flex items-center space-x-2 text-xs text-bronze-700">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bronze-600 border-t-transparent" />
                <span>Uploading image to Cloudinary...</span>
              </div>
            )}

            {uploadError && (
              <p className="mt-1.5 text-xs text-red-600">{uploadError}</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || isUploadingImage}
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
          disabled={isSubmitting || isUploadingImage}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-charcoal-950/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-bronze-100 bg-white p-6 shadow-lg my-auto">
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
            {/* Desktop / tablet table */}
            <div className="hidden overflow-x-auto rounded-xl border border-bronze-100 bg-white shadow-sm md:block">
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
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-bronze-50 pt-3">
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

