import { useState, useEffect } from 'react';
import {
  fetchGalleryAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
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
            <div className="mt-2 aspect-[4/3] max-w-xs overflow-hidden rounded-lg border border-bronze-100 bg-charcoal-50 flex items-center justify-center shadow-xs">
              <img
                src={trimmedImage}
                alt="Cover preview"
                onError={() => setPreviewError(true)}
                className="h-full w-full object-contain"
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
// Delete Album confirmation dialog
// ---------------------------------------------------------------------------

function DeleteDialog({ albumTitle, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/40 px-4">
      <div className="w-full max-w-sm rounded-xl border border-bronze-100 bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-charcoal-900">Delete Album</h3>
        <p className="mt-2 text-sm text-charcoal-600">
          Are you sure you want to delete{' '}
          <span className="font-medium text-charcoal-900">"{albumTitle}"</span>? This
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
// Delete Photo confirmation dialog
// ---------------------------------------------------------------------------

function DeletePhotoDialog({ photo, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/40 px-4">
      <div className="w-full max-w-sm rounded-xl border border-bronze-100 bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-charcoal-900">Remove Photo</h3>
        <p className="mt-2 text-sm text-charcoal-600">
          Are you sure you want to remove this photo from the album? This action cannot be undone.
        </p>
        {photo?.imageUrl && (
          <div className="mt-3 aspect-[4/3] w-full max-h-52 overflow-hidden rounded-lg border border-bronze-100 bg-charcoal-50 flex items-center justify-center shadow-xs">
            <img
              src={photo.imageUrl}
              alt="Photo preview"
              className="h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
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
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Album Photos Management View
// ---------------------------------------------------------------------------

function AlbumPhotosView({ album, onBack, onAlbumUpdated, setToast }) {
  const [currentAlbum, setCurrentAlbum] = useState(album);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Photo removal state
  const [deletingPhoto, setDeletingPhoto] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cover image update state
  const [settingCoverUrl, setSettingCoverUrl] = useState(null);

  // Full-size photo viewer state
  const [viewingPhoto, setViewingPhoto] = useState(null);

  useEffect(() => {
    setCurrentAlbum(album);
  }, [album]);

  // Sort photos by existing order field
  const sortedPhotos = [...(currentAlbum.photos || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const trimmedPhotoUrl = newPhotoUrl.trim();
  const isLocalPhotoPath = /^[a-zA-Z]:[/\\]|^file:\/\//i.test(trimmedPhotoUrl);

  // Add Photo
  async function handleAddPhoto(e) {
    e.preventDefault();
    if (!trimmedPhotoUrl) {
      setAddError('Please enter an image URL');
      return;
    }

    setIsAdding(true);
    setAddError('');

    try {
      const currentPhotos = currentAlbum.photos || [];
      const maxOrder = currentPhotos.reduce(
        (max, p) => Math.max(max, p.order ?? 0),
        -1
      );
      const nextOrder = maxOrder + 1;
      const newPhoto = { imageUrl: trimmedPhotoUrl, order: nextOrder };
      const updatedPhotos = [...currentPhotos, newPhoto];

      const updated = await updateAlbum(currentAlbum._id, {
        photos: updatedPhotos,
      });

      setCurrentAlbum(updated);
      onAlbumUpdated(updated);
      setNewPhotoUrl('');
      setToast('Photo added successfully');
    } catch (err) {
      setAddError(err.message || 'Failed to add photo');
    } finally {
      setIsAdding(false);
    }
  }

  // Remove Photo
  async function handleConfirmRemovePhoto() {
    if (!deletingPhoto) return;
    setIsDeleting(true);

    try {
      const currentPhotos = currentAlbum.photos || [];
      const updatedPhotos = currentPhotos.filter((p) => {
        if (deletingPhoto._id && p._id) {
          return p._id !== deletingPhoto._id;
        }
        return p.imageUrl !== deletingPhoto.imageUrl;
      });

      const updated = await updateAlbum(currentAlbum._id, {
        photos: updatedPhotos,
      });

      setCurrentAlbum(updated);
      onAlbumUpdated(updated);
      setDeletingPhoto(null);
      setToast('Photo removed successfully');
    } catch (err) {
      setAddError(err.message || 'Failed to remove photo');
      setDeletingPhoto(null);
    } finally {
      setIsDeleting(false);
    }
  }

  // Set Cover Image
  async function handleSelectCover(imageUrl) {
    if (currentAlbum.coverImage === imageUrl) return;
    setSettingCoverUrl(imageUrl);

    try {
      const updated = await updateAlbum(currentAlbum._id, {
        coverImage: imageUrl,
      });

      setCurrentAlbum(updated);
      onAlbumUpdated(updated);
      setToast('Cover image updated successfully');
    } catch (err) {
      setAddError(err.message || 'Failed to update cover image');
    } finally {
      setSettingCoverUrl(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-charcoal-500 mb-2">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-charcoal-900 font-medium transition-colors"
          >
            Gallery
          </button>
          <span>/</span>
          <span className="text-charcoal-900 font-medium truncate max-w-xs sm:max-w-md">
            {currentAlbum.title}
          </span>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-charcoal-200 bg-white px-3 py-1.5 text-sm font-medium text-charcoal-700 shadow-sm transition-colors hover:bg-charcoal-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Albums
        </button>
      </div>

      {/* Album Info Card */}
      <div className="rounded-xl border border-bronze-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-charcoal-900 sm:text-2xl truncate">
                {currentAlbum.title}
              </h2>
              <span className="inline-flex items-center rounded-full bg-bronze-100/70 px-2.5 py-0.5 text-xs font-semibold text-bronze-800">
                {currentAlbum.category}
              </span>
              <span className="inline-flex items-center rounded-full bg-charcoal-100 px-2.5 py-0.5 text-xs font-medium text-charcoal-700">
                {sortedPhotos.length} {sortedPhotos.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>

            {currentAlbum.description && (
              <p className="mt-2 text-sm text-charcoal-600 whitespace-pre-line">
                {currentAlbum.description}
              </p>
            )}

            <p className="mt-2 text-xs text-charcoal-500">
              Date: {formatDate(currentAlbum.date)}
            </p>
          </div>

          {currentAlbum.coverImage && (
            <div className="shrink-0 flex flex-col items-start sm:items-end">
              <span className="text-xs font-medium text-charcoal-500 mb-1">Cover Image</span>
              <div
                className="w-28 aspect-[4/3] rounded-lg overflow-hidden border border-bronze-200 bg-charcoal-50 flex items-center justify-center shadow-xs cursor-pointer hover:border-bronze-400 transition-colors"
                onClick={() => setViewingPhoto({ imageUrl: currentAlbum.coverImage, order: 'Cover' })}
                title="Click to view full size"
              >
                <img
                  src={currentAlbum.coverImage}
                  alt={currentAlbum.title}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Photo Form */}
      <div className="rounded-xl border border-bronze-100 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-charcoal-900">Add Photo</h3>
        <p className="mt-0.5 text-xs text-charcoal-500">
          Enter a direct web image URL to add a photo to this album.
        </p>

        <form onSubmit={handleAddPhoto} noValidate className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <input
              type="url"
              value={newPhotoUrl}
              onChange={(e) => {
                setNewPhotoUrl(e.target.value);
                if (addError) setAddError('');
              }}
              disabled={isAdding}
              placeholder="https://example.com/photo.jpg"
              className="block w-full rounded-lg border border-charcoal-200 bg-white px-3 py-2 text-sm text-charcoal-950 placeholder:text-charcoal-400 transition-colors focus:border-bronze-400 focus:ring-2 focus:ring-bronze-200 focus:outline-none disabled:opacity-60"
            />
            {addError && <p className="mt-1 text-xs text-red-600">{addError}</p>}
            {trimmedPhotoUrl && isLocalPhotoPath && (
              <p className="mt-1 text-xs text-amber-700">
                Local file paths (e.g. C:\...) are not supported. Please enter a direct web image URL.
              </p>
            )}
            {trimmedPhotoUrl && !isLocalPhotoPath && (
              <div className="mt-3 aspect-[4/3] w-44 overflow-hidden rounded-lg border border-bronze-100 bg-charcoal-50 flex items-center justify-center shadow-xs">
                <img
                  src={trimmedPhotoUrl}
                  alt="Add photo preview"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isAdding || !trimmedPhotoUrl}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-bronze-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-bronze-700 disabled:cursor-not-allowed disabled:opacity-60 shrink-0"
          >
            {isAdding && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            Add Photo
          </button>
        </form>
      </div>

      {/* Photos Section */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-charcoal-900">
            Photos ({sortedPhotos.length})
          </h3>
        </div>

        {sortedPhotos.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-bronze-200 bg-white px-6 py-16 text-center">
            <p className="text-base font-medium text-charcoal-800">No photos in this album</p>
            <p className="mt-1 text-sm text-charcoal-500">
              Use the form above to add your first photo.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sortedPhotos.map((photo, index) => {
              const isCover = photo.imageUrl === currentAlbum.coverImage;
              return (
                <div
                  key={photo._id || `${photo.imageUrl}-${index}`}
                  className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all ${
                    isCover
                      ? 'border-bronze-400 ring-2 ring-bronze-400/50'
                      : 'border-bronze-100 hover:border-bronze-200'
                  }`}
                >
                  {/* Consistent 4:3 fixed aspect-ratio photo frame */}
                  <div
                    className="relative aspect-[4/3] w-full overflow-hidden bg-charcoal-50 flex items-center justify-center cursor-pointer"
                    onClick={() => setViewingPhoto(photo)}
                    title="Click to view full size"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={`Photo ${index + 1}`}
                      className="h-full w-full object-contain transition-transform group-hover:scale-105 duration-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />

                    {/* Cover badge */}
                    {isCover && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-bronze-600/95 px-2 py-0.5 text-xs font-semibold text-white shadow-sm backdrop-blur-xs pointer-events-none">
                        ★ Cover Photo
                      </span>
                    )}

                    {/* Order tag */}
                    <span className="absolute top-2 right-2 rounded-md bg-charcoal-900/70 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-xs pointer-events-none">
                      #{photo.order !== undefined ? photo.order : index}
                    </span>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between border-t border-bronze-50 p-2.5 bg-white">
                    {isCover ? (
                      <span className="text-xs font-semibold text-bronze-700">
                        Current Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectCover(photo.imageUrl)}
                        disabled={settingCoverUrl === photo.imageUrl}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-bronze-700 hover:bg-bronze-50 transition-colors disabled:opacity-60"
                      >
                        {settingCoverUrl === photo.imageUrl ? (
                          <>
                            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Saving…
                          </>
                        ) : (
                          'Set as Cover'
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeletingPhoto(photo)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-size Photo Viewer Modal (preserves full original photo dimensions) */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/85 p-4 backdrop-blur-xs"
          onClick={() => setViewingPhoto(null)}
        >
          <div
            className="relative flex flex-col items-center max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full items-center justify-between pb-3 text-white">
              <span className="text-sm font-medium text-charcoal-300">
                {viewingPhoto.order !== undefined
                  ? typeof viewingPhoto.order === 'string'
                    ? viewingPhoto.order
                    : `Photo #${viewingPhoto.order}`
                  : 'Full View'}
              </span>
              <button
                type="button"
                onClick={() => setViewingPhoto(null)}
                className="rounded-lg bg-charcoal-800/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-charcoal-700 transition-colors"
              >
                Close ✕
              </button>
            </div>

            <div className="flex items-center justify-center max-h-[80vh] w-full overflow-hidden rounded-xl bg-charcoal-900/60 p-2">
              <img
                src={viewingPhoto.imageUrl}
                alt="Full preview"
                className="max-h-[78vh] max-w-full rounded-lg object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Photo Dialog */}
      {deletingPhoto && (
        <DeletePhotoDialog
          photo={deletingPhoto}
          onConfirm={handleConfirmRemovePhoto}
          onCancel={() => setDeletingPhoto(null)}
          isDeleting={isDeleting}
        />
      )}
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
// Admin Gallery page — album listing + create / edit / delete / manage photos
// ---------------------------------------------------------------------------

function AdminGallery() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deletingAlbum, setDeletingAlbum] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Photo management state
  const [managingAlbum, setManagingAlbum] = useState(null);

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

  // -- Delete --

  async function handleConfirmDelete() {
    if (!deletingAlbum) return;
    setIsDeleting(true);
    try {
      await deleteAlbum(deletingAlbum._id);
      setToast('Album deleted successfully');
      if (editingAlbum && editingAlbum._id === deletingAlbum._id) {
        setShowForm(false);
        setEditingAlbum(null);
      }
      if (managingAlbum && managingAlbum._id === deletingAlbum._id) {
        setManagingAlbum(null);
      }
      setDeletingAlbum(null);
      await loadAlbums();
    } catch (err) {
      setError(err.message || 'Failed to delete album');
      setDeletingAlbum(null);
    } finally {
      setIsDeleting(false);
    }
  }

  // -- Manage Photos --

  function handleManagePhotos(album) {
    setShowForm(false);
    setEditingAlbum(null);
    setManagingAlbum(album);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAlbumUpdated(updated) {
    setManagingAlbum(updated);
    setAlbums((prev) =>
      prev.map((a) => (a._id === updated._id ? updated : a))
    );
  }

  return (
    <div>
      {/* If managing photos inside an album, render photo management view */}
      {managingAlbum ? (
        <AlbumPhotosView
          album={managingAlbum}
          onBack={() => setManagingAlbum(null)}
          onAlbumUpdated={handleAlbumUpdated}
          setToast={setToast}
        />
      ) : (
        <>
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
                            <button
                              type="button"
                              onClick={() => handleManagePhotos(album)}
                              className="flex items-center gap-3 text-left group"
                            >
                              <div className="h-10 w-12 aspect-[4/3] shrink-0 rounded-lg overflow-hidden bg-charcoal-50 border border-bronze-100 flex items-center justify-center shadow-2xs">
                                <img
                                  src={album.coverImage}
                                  alt={album.title}
                                  className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                              <span className="font-medium text-charcoal-900 max-w-xs truncate group-hover:text-bronze-700 transition-colors">
                                {album.title}
                              </span>
                            </button>
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
                            <button
                              type="button"
                              onClick={() => handleManagePhotos(album)}
                              className="inline-flex items-center gap-1.5 font-medium hover:text-bronze-700 transition-colors"
                            >
                              {album.photos?.length ?? 0} photos
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleManagePhotos(album)}
                                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-bronze-700 transition-colors hover:bg-bronze-100"
                              >
                                Photos
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEdit(album)}
                                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-charcoal-700 transition-colors hover:bg-charcoal-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingAlbum(album)}
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
                  {albums.map((album) => (
                    <div
                      key={album._id}
                      className="rounded-xl border border-bronze-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-20 aspect-[4/3] shrink-0 rounded-lg overflow-hidden bg-charcoal-50 border border-bronze-100 flex items-center justify-center cursor-pointer shadow-2xs"
                          onClick={() => handleManagePhotos(album)}
                        >
                          <img
                            src={album.coverImage}
                            alt={album.title}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3
                            onClick={() => handleManagePhotos(album)}
                            className="text-sm font-semibold text-charcoal-900 line-clamp-2 cursor-pointer hover:text-bronze-700 transition-colors"
                          >
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
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleManagePhotos(album)}
                            className="rounded-md border border-bronze-200 px-2.5 py-1.5 text-xs font-medium text-bronze-700 transition-colors hover:bg-bronze-50"
                          >
                            Photos ({album.photos?.length ?? 0})
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(album)}
                            className="rounded-md border border-charcoal-200 px-2.5 py-1.5 text-xs font-medium text-charcoal-700 transition-colors hover:bg-charcoal-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingAlbum(album)}
                            className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
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
        </>
      )}

      {/* Delete Album confirmation dialog */}
      {deletingAlbum && (
        <DeleteDialog
          albumTitle={deletingAlbum.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingAlbum(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Success toast */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

export default AdminGallery;
