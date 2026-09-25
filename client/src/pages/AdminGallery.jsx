import { useState, useEffect } from 'react';
import {
  fetchGalleryAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  fetchEvents,
  uploadGalleryImages,
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
  coverImagePublicId: '',
  eventId: '',
};

function AlbumForm({ initial, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [previewError, setPreviewError] = useState(false);
  const [events, setEvents] = useState([]);

  // Cover image upload state
  const [coverMode, setCoverMode] = useState('file'); // 'file' | 'url'
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState('');

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
        coverImagePublicId: initial.coverImagePublicId || '',
        eventId: eventIdVal,
      });
      setCoverMode(initial.coverImage && !initial.coverImagePublicId ? 'url' : 'file');
    } else {
      setForm(emptyForm);
      setCoverMode('file');
    }
    setErrors({});
    setPreviewError(false);
    setCoverUploadError('');
    setIsUploadingCover(false);

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
    if (!form.coverImage.trim()) e.coverImage = 'Cover image is required';
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

  async function handleCoverFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type || !file.type.startsWith('image/')) {
      setCoverUploadError('Invalid file type. Please select an image (JPEG, PNG, WebP, GIF, AVIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setCoverUploadError('Image file is too large. Maximum size is 10 MB.');
      return;
    }

    setCoverUploadError('');
    setIsUploadingCover(true);
    try {
      const results = await uploadGalleryImages([file]);
      if (results && results.length > 0) {
        setForm((prev) => ({
          ...prev,
          coverImage: results[0].url,
          coverImagePublicId: results[0].publicId,
        }));
        setErrors((prev) => ({ ...prev, coverImage: undefined }));
        setPreviewError(false);
      }
    } catch (err) {
      setCoverUploadError(err.message || 'Failed to upload cover image to Cloudinary');
    } finally {
      setIsUploadingCover(false);
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
      coverImagePublicId: form.coverImagePublicId || '',
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
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-charcoal-800">
              Cover Image <span className="text-red-500">*</span>
            </label>
            <div className="flex rounded-md bg-charcoal-100 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setCoverMode('file')}
                className={`rounded px-2 py-0.5 font-medium transition-colors ${
                  coverMode === 'file'
                    ? 'bg-white text-charcoal-900 shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setCoverMode('url')}
                className={`rounded px-2 py-0.5 font-medium transition-colors ${
                  coverMode === 'url'
                    ? 'bg-white text-charcoal-900 shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Paste URL
              </button>
            </div>
          </div>

          {coverMode === 'file' ? (
            <div className="mt-1">
              <input
                id="coverFileInput"
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                disabled={isSubmitting || isUploadingCover}
                className="block w-full text-xs text-charcoal-600 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-bronze-50 file:text-bronze-700 hover:file:bg-bronze-100 file:cursor-pointer cursor-pointer rounded-lg border border-charcoal-200 bg-white p-1.5 transition-colors focus:border-bronze-400 focus:outline-none"
              />
              {isUploadingCover && (
                <div className="mt-2 flex items-center space-x-2 text-xs text-bronze-700">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bronze-600 border-t-transparent" />
                  <span>Uploading to Cloudinary...</span>
                </div>
              )}
              {coverUploadError && (
                <p className="mt-1 text-xs text-red-600">{coverUploadError}</p>
              )}
            </div>
          ) : (
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
          )}

          {trimmedImage && isLocalPath && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
              Local file paths (e.g. C:\...) cannot be used directly in web browsers. Please switch to "Upload File" above to upload your local image to Cloudinary.
            </p>
          )}

          {trimmedImage && !isLocalPath && previewError && (
            <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
              Unable to load image preview. Please check that the URL or uploaded image is valid.
            </p>
          )}

          {trimmedImage && !isLocalPath && !previewError && (
            <div className="mt-2">
              <div className="aspect-[4/3] max-w-xs overflow-hidden rounded-lg border border-bronze-100 bg-charcoal-50 flex items-center justify-center shadow-xs">
                <img
                  src={trimmedImage}
                  alt="Cover preview"
                  onError={() => setPreviewError(true)}
                  className="h-full w-full object-contain"
                />
              </div>
              {form.coverImagePublicId && (
                <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Uploaded to Cloudinary
                </span>
              )}
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
      <div className="flex flex-wrap items-center gap-3 pt-2">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-charcoal-950/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-bronze-100 bg-white p-6 shadow-lg my-auto">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-charcoal-950/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-bronze-100 bg-white p-6 shadow-lg my-auto">
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
// Staged Photo Thumbnail component
// ---------------------------------------------------------------------------

function StagedThumbnail({ file, onRemove, disabled }) {
  const [objectUrl, setObjectUrl] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="group relative aspect-[4/3] rounded-md overflow-hidden border border-charcoal-200 bg-white flex items-center justify-center shadow-2xs">
      {objectUrl && (
        <img
          src={objectUrl}
          alt={file.name}
          className="h-full w-full object-contain"
        />
      )}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-charcoal-900/80 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-0"
        title="Remove file"
      >
        ✕
      </button>
      <div className="absolute bottom-0 inset-x-0 bg-charcoal-900/60 px-1 py-0.5 text-[9px] text-white truncate pointer-events-none text-center">
        {file.name}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Album Photos Management View
// ---------------------------------------------------------------------------

function AlbumPhotosView({ album, onBack, onAlbumUpdated, setToast }) {
  const [currentAlbum, setCurrentAlbum] = useState(album);
  const [photoTab, setPhotoTab] = useState('upload'); // 'upload' | 'url'

  // Cloudinary batch file upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Single URL add state
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

  // Handle local file selection for batch upload
  function handleFilesChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const invalidTypes = files.filter((f) => !f.type || !f.type.startsWith('image/'));
    if (invalidTypes.length > 0) {
      setUploadError('Only image files (JPEG, PNG, WebP, GIF, AVIF) are allowed.');
      return;
    }

    const oversized = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      setUploadError(`Some files exceed the 10 MB limit (${oversized.map((f) => f.name).join(', ')}).`);
      return;
    }

    setUploadError('');
    const newFiles = [...selectedFiles, ...files];
    if (newFiles.length > 30) {
      setUploadError('You can upload a maximum of 30 images at once.');
      return;
    }

    setSelectedFiles(newFiles);
    e.target.value = '';
  }

  function handleRemoveSelectedFile(indexToRemove) {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  function handleClearSelectedFiles() {
    setSelectedFiles([]);
    setUploadError('');
  }

  // Upload staged files to Cloudinary and append to current album
  async function handleUploadFiles() {
    if (!selectedFiles.length) return;

    setIsUploadingFiles(true);
    setUploadError('');

    try {
      const results = await uploadGalleryImages(selectedFiles);
      if (!results || results.length === 0) {
        throw new Error('No images were uploaded');
      }

      const currentPhotos = currentAlbum.photos || [];
      const maxOrder = currentPhotos.reduce(
        (max, p) => Math.max(max, p.order ?? 0),
        -1
      );

      const newPhotos = results.map((res, idx) => ({
        imageUrl: res.url,
        publicId: res.publicId,
        order: maxOrder + 1 + idx,
      }));

      const updatedPhotos = [...currentPhotos, ...newPhotos];

      const updated = await updateAlbum(currentAlbum._id, {
        photos: updatedPhotos,
      });

      setCurrentAlbum(updated);
      onAlbumUpdated(updated);
      setSelectedFiles([]);
      setToast(`Successfully uploaded ${results.length} photo${results.length > 1 ? 's' : ''}`);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload images to Cloudinary');
    } finally {
      setIsUploadingFiles(false);
    }
  }

  // Add Photo by URL
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
  async function handleSelectCover(photo) {
    if (currentAlbum.coverImage === photo.imageUrl) return;
    setSettingCoverUrl(photo.imageUrl);

    try {
      const updated = await updateAlbum(currentAlbum._id, {
        coverImage: photo.imageUrl,
        coverImagePublicId: photo.publicId || '',
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

      {/* Add Photo Section */}
      <div className="rounded-xl border border-bronze-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-charcoal-100">
          <div>
            <h3 className="text-base font-semibold text-charcoal-900">Add Photos</h3>
            <p className="mt-0.5 text-xs text-charcoal-500">
              Upload photo files directly to Cloudinary or enter an external image URL.
            </p>
          </div>
          <div className="flex rounded-md bg-charcoal-100 p-0.5 text-xs shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setPhotoTab('upload')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                photoTab === 'upload'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Upload Files (Cloudinary)
            </button>
            <button
              type="button"
              onClick={() => setPhotoTab('url')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                photoTab === 'url'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Add by URL
            </button>
          </div>
        </div>

        {photoTab === 'upload' ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label
                htmlFor="multiPhotoInput"
                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-bronze-300 bg-bronze-50/50 px-4 py-2.5 text-sm font-medium text-bronze-800 hover:bg-bronze-50 hover:border-bronze-400 transition-colors"
              >
                <svg className="h-4 w-4 text-bronze-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Select Images from Computer</span>
                <input
                  id="multiPhotoInput"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFilesChange}
                  disabled={isUploadingFiles}
                  className="hidden"
                />
              </label>

              <span className="text-xs text-charcoal-500">
                Supports multiple images (JPEG, PNG, WebP, GIF, AVIF up to 10 MB each, max 30 per batch)
              </span>
            </div>

            {uploadError && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                {uploadError}
              </p>
            )}

            {/* Staged files preview list */}
            {selectedFiles.length > 0 && (
              <div className="rounded-xl border border-charcoal-200 bg-charcoal-50/60 p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-charcoal-200">
                  <span className="text-xs font-semibold text-charcoal-800">
                    {selectedFiles.length} {selectedFiles.length === 1 ? 'image' : 'images'} ready to upload
                  </span>
                  <button
                    type="button"
                    onClick={handleClearSelectedFiles}
                    disabled={isUploadingFiles}
                    className="text-xs font-medium text-charcoal-500 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    Clear selection
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto pr-1">
                  {selectedFiles.map((file, idx) => (
                    <StagedThumbnail
                      key={`${file.name}-${file.size}-${idx}`}
                      file={file}
                      onRemove={() => handleRemoveSelectedFile(idx)}
                      disabled={isUploadingFiles}
                    />
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-charcoal-200">
                  <button
                    type="button"
                    onClick={handleUploadFiles}
                    disabled={isUploadingFiles}
                    className="inline-flex items-center gap-2 rounded-lg bg-bronze-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-bronze-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploadingFiles && (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    )}
                    {isUploadingFiles
                      ? `Uploading ${selectedFiles.length} photo(s)...`
                      : `Upload ${selectedFiles.length} Photo${selectedFiles.length > 1 ? 's' : ''} to Cloudinary`}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleAddPhoto} noValidate className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
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
                  Local file paths (e.g. C:\...) cannot be used directly in web browsers. Please switch to "Upload Files" above to upload local images to Cloudinary.
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
        )}
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

                    {/* Cloudinary indicator */}
                    {!isCover && photo.publicId && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-charcoal-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-xs backdrop-blur-xs pointer-events-none">
                        ☁ Cloud
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
                        onClick={() => handleSelectCover(photo)}
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
                {/* Desktop / tablet table */}
                <div className="hidden overflow-x-auto rounded-xl border border-bronze-100 bg-white shadow-sm md:block">
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
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-bronze-50 pt-3">
                        <span className="inline-flex items-center rounded-full bg-bronze-100/70 px-2.5 py-0.5 text-xs font-semibold text-bronze-800">
                          {album.category}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
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
