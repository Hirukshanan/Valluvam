import { useState, useEffect } from 'react';
import {
  fetchGalleryAlbums,
  createAlbum,
  updateAlbum,
  fetchEvents,
} from '../services/adminGalleryService';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  'Educational Support',
  'Rural Education',
  'Community Relief',
  'Events',
  'Other',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

// ---------------------------------------------------------------------------
// Album Form (Create / Edit)
// ---------------------------------------------------------------------------

const emptyForm = {
  title: '',
  description: '',
  category: '',
  date: '',
  coverImage: '',
  eventId: '',
};

function AlbumForm({ initial, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [previewError, setPreviewError] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (initial) {
      let eventIdVal = '';
      if (initial.eventId) {
        eventIdVal =
          typeof initial.eventId === 'object' && initial.eventId._id
            ? initial.eventId._id
            : String(initial.eventId);
      }

      setForm({
        title: initial.title || '',
        description: initial.description || '',
        category: initial.category || '',
        date: initial.date ? String(initial.date).slice(0, 10) : '',
        coverImage: initial.coverImage || '',
        eventId: eventIdVal,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setPreviewError(false);

    // Load events for the optional event selector
    fetchEvents()
      .then((data) => setEvents(data))
      .catch(() => setEvents([]));
  }, [initial]);

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.coverImage.trim()) e.coverImage = 'Cover image URL is required';
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (name === 'coverImage') {
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

    // Build payload — set eventId to selected value or null if empty
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      date: form.date,
      coverImage: form.coverImage.trim(),
      eventId: form.eventId ? form.eventId : null,
    };

    onSubmit(payload);
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-charcoal-200 bg-white px-3 py-2 text-sm text-charcoal-950 placeholder:text-charcoal-400 transition-colors focus:border-bronze-400 focus:ring-2 focus:ring-bronze-200 focus:outline-none disabled:opacity-60';

  const trimmedImage = form.coverImage?.trim() || '';
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
          placeholder="Album title"
          className={inputClass}
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-charcoal-800">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="Optional album description"
          className={inputClass}
        />
      </div>

      {/* Category + Date row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-charcoal-800">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={isSubmitting}
            className={inputClass}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
        </div>

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
      </div>

      {/* Cover Image URL + Event selector row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="coverImage" className="block text-sm font-medium text-charcoal-800">
            Cover Image URL <span className="text-red-500">*</span>
          </label>
          <input
            id="coverImage"
            name="coverImage"
            type="url"
            value={form.coverImage}
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
                alt="Cover preview"
                onError={() => setPreviewError(true)}
                className="h-36 w-full rounded-lg object-cover"
              />
            </div>
          )}

          {errors.coverImage && <p className="mt-1 text-xs text-red-600">{errors.coverImage}</p>}
        </div>

        <div>
          <label htmlFor="eventId" className="block text-sm font-medium text-charcoal-800">
            Linked Event <span className="text-charcoal-400 font-normal">(optional)</span>
          </label>
          <select
            id="eventId"
            name="eventId"
            value={form.eventId}
            onChange={handleChange}
            disabled={isSubmitting}
            className={inputClass}
          >
            <option value="">None</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>
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
          {initial ? 'Update Album' : 'Create Album'}
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
// Admin Gallery page — album listing + create / edit
// ---------------------------------------------------------------------------

function AdminGallery() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState('');

  async function loadAlbums() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchGalleryAlbums();
      setAlbums(data);
    } catch (err) {
      setError(err.message || 'Failed to load gallery albums');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlbums();
  }, []);

  // -- Create / Edit --

  function handleCreate() {
    setEditingAlbum(null);
    setShowForm(true);
  }

  function handleEdit(album) {
    setEditingAlbum(album);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingAlbum(null);
  }

  async function handleFormSubmit(formData) {
    setIsSubmitting(true);
    try {
      if (editingAlbum) {
        await updateAlbum(editingAlbum._id, formData);
        setToast('Album updated successfully');
      } else {
        await createAlbum(formData);
        setToast('Album created successfully');
      }
      setShowForm(false);
      setEditingAlbum(null);
      await loadAlbums();
    } catch (err) {
      setError(err.message || 'Failed to save album');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-900 sm:text-2xl">Gallery</h2>
          <p className="mt-1 text-sm text-charcoal-500">
            View and manage photo albums
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
            Create Album
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
            {editingAlbum ? 'Edit Album' : 'Create Album'}
          </h3>
          <AlbumForm
            initial={editingAlbum}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Album list */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-bronze-100 bg-white py-16">
            <div className="flex items-center gap-3 text-charcoal-500">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Loading albums…
            </div>
          </div>
        ) : albums.length === 0 ? (
          <div className="rounded-xl border border-dashed border-bronze-200 bg-white px-6 py-16 text-center">
            <p className="text-base font-medium text-charcoal-800">No albums yet</p>
            <p className="mt-1 text-sm text-charcoal-500">
              Gallery albums will appear here once created.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-bronze-100 bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-bronze-100 bg-bronze-50/60">
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Album</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Category</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Date</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Photos</th>
                    <th className="px-4 py-3 text-right font-semibold text-charcoal-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bronze-50">
                  {albums.map((album) => (
                    <tr key={album._id} className="hover:bg-bronze-50/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={album.coverImage}
                            alt={album.title}
                            className="h-10 w-10 shrink-0 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span className="font-medium text-charcoal-900 max-w-xs truncate">
                            {album.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-bronze-100/70 px-2.5 py-0.5 text-xs font-semibold text-bronze-800">
                          {album.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-charcoal-600 whitespace-nowrap">
                        {formatDate(album.date)}
                      </td>
                      <td className="px-4 py-3 text-charcoal-600">
                        {album.photos?.length ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(album)}
                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-bronze-700 transition-colors hover:bg-bronze-100"
                          >
                            Edit
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
              {albums.map((album) => (
                <div
                  key={album._id}
                  className="rounded-xl border border-bronze-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-charcoal-900 line-clamp-2">
                        {album.title}
                      </h3>
                      <p className="mt-1 text-xs text-charcoal-500">
                        {formatDate(album.date)} · {album.photos?.length ?? 0} photos
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-bronze-50 pt-3">
                    <span className="inline-flex items-center rounded-full bg-bronze-100/70 px-2.5 py-0.5 text-xs font-semibold text-bronze-800">
                      {album.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEdit(album)}
                      className="rounded-md border border-bronze-200 px-3 py-1.5 text-xs font-medium text-bronze-700 transition-colors hover:bg-bronze-50"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Success toast */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

export default AdminGallery;
