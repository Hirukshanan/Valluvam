import { useState, useEffect } from 'react';
import {
  fetchAdminTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  uploadTeamPhoto,
} from '../services/adminTeamService';

// ---------------------------------------------------------------------------
// Constants & Role Presets
// ---------------------------------------------------------------------------
const ROLE_PRESETS = [
  'President',
  'Secretary',
  'Treasurer',
  'Vice President',
  'Committee Member',
];

const emptyForm = {
  name: '',
  role: '',
  photo: '',
  photoPublicId: '',
  bio: '',
  displayOrder: 1,
  active: true,
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
      <span>{message}</span>
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
// Delete Member Confirmation Dialog
// ---------------------------------------------------------------------------
function DeleteDialog({ memberName, memberRole, onConfirm, onCancel, isDeleting }) {
  const displayName = memberName?.trim()
    ? `"${memberName}" (${memberRole})`
    : `"${memberRole}"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-charcoal-950/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-bronze-100 bg-white p-6 shadow-lg my-auto">
        <h3 className="text-lg font-semibold text-charcoal-900">Delete Team Member</h3>
        <p className="mt-2 text-sm text-charcoal-600">
          Are you sure you want to delete <span className="font-medium text-charcoal-900">{displayName}</span>?
          This action cannot be undone.
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
// Team Member Form (Create / Edit)
// ---------------------------------------------------------------------------
function MemberForm({ initial, onSubmit, onCancel, isSubmitting, nextOrder = 1 }) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name || '',
          role: initial.role || '',
          photo: initial.photo || '',
          photoPublicId: initial.photoPublicId || '',
          bio: initial.bio || '',
          displayOrder: initial.displayOrder !== undefined ? initial.displayOrder : nextOrder,
          active: initial.active !== undefined ? initial.active : true,
        }
      : { ...emptyForm, displayOrder: nextOrder }
  );

  const [errors, setErrors] = useState({});
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        role: initial.role || '',
        photo: initial.photo || '',
        photoPublicId: initial.photoPublicId || '',
        bio: initial.bio || '',
        displayOrder: initial.displayOrder !== undefined ? initial.displayOrder : nextOrder,
        active: initial.active !== undefined ? initial.active : true,
      });
    } else {
      setForm({ ...emptyForm, displayOrder: nextOrder });
    }
    setErrors({});
    setUploadError('');
    setPreviewError(false);
  }, [initial, nextOrder]);

  function validate() {
    const e = {};
    if (!form.role.trim()) {
      e.role = 'Role is required (e.g. President, Secretary, Treasurer)';
    }
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
    setIsUploadingPhoto(true);
    try {
      const result = await uploadTeamPhoto(file);
      if (result && result.url) {
        setForm((prev) => ({
          ...prev,
          photo: result.url,
          photoPublicId: result.publicId,
        }));
        setPreviewError(false);
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to upload photo to Cloudinary');
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  function handleRemovePhoto() {
    setForm((prev) => ({
      ...prev,
      photo: '',
      photoPublicId: '',
    }));
    setPreviewError(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      photo: form.photo.trim(),
      photoPublicId: form.photoPublicId.trim(),
      bio: form.bio.trim(),
      displayOrder: Number(form.displayOrder) || 0,
      active: Boolean(form.active),
    };

    onSubmit(payload);
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-charcoal-200 bg-white px-3 py-2 text-sm text-charcoal-950 placeholder:text-charcoal-400 transition-colors focus:border-bronze-400 focus:ring-2 focus:ring-bronze-200 focus:outline-none disabled:opacity-60';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-charcoal-800">
          Role / Position <span className="text-red-500">*</span>
        </label>
        <input
          id="role"
          name="role"
          type="text"
          value={form.role}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="e.g. President, Secretary, Treasurer"
          className={inputClass}
        />
        {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}

        {/* Quick role preset suggestions */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-charcoal-500">Quick suggestions:</span>
          {ROLE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setForm((prev) => ({ ...prev, role: preset }));
                if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
              }}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                form.role === preset
                  ? 'bg-bronze-100 text-bronze-800 font-semibold'
                  : 'bg-charcoal-100 text-charcoal-700 hover:bg-bronze-50 hover:text-bronze-700'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="name" className="block text-sm font-medium text-charcoal-800">
            Full Name
          </label>
          <span className="text-xs text-charcoal-400">Optional</span>
        </div>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="e.g. K. Selvam (leave empty if position is to be announced)"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-charcoal-500">
          Leave blank if role is vacant or name is yet to be announced (renders as &ldquo;Name to be updated&rdquo; on the public site).
        </p>
      </div>

      {/* Photo upload with Cloudinary */}
      <div>
        <label className="block text-sm font-medium text-charcoal-800">
          Photo
        </label>
        <p className="text-xs text-charcoal-500 mb-2">
          Select a local image file to upload directly to Cloudinary.
        </p>

        {form.photo ? (
          <div className="flex items-center gap-4 rounded-lg border border-bronze-100 bg-bronze-50/40 p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-bronze-200">
              <img
                src={form.photo}
                alt="Member preview"
                onError={() => setPreviewError(true)}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                ✓ Photo Uploaded
              </span>
              {previewError && (
                <p className="mt-1 text-xs text-red-600">Failed to load image preview.</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isSubmitting}
              className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <label
              htmlFor="photoUploadInput"
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-charcoal-200 bg-charcoal-50/50 p-4 text-center cursor-pointer transition-colors hover:border-bronze-300 hover:bg-bronze-50/30 ${
                isUploadingPhoto ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <svg
                className="mb-2 h-7 w-7 text-charcoal-400"
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
                Click to browse and upload photo
              </span>
              <span className="mt-0.5 text-[11px] text-charcoal-500">
                JPEG, PNG, WebP up to 10 MB (Square recommended)
              </span>
              <input
                id="photoUploadInput"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploadingPhoto || isSubmitting}
                className="sr-only"
              />
            </label>

            {isUploadingPhoto && (
              <div className="mt-2 flex items-center space-x-2 text-xs text-bronze-700">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bronze-600 border-t-transparent" />
                <span>Uploading photo to Cloudinary...</span>
              </div>
            )}

            {uploadError && (
              <p className="mt-1.5 text-xs text-red-600">{uploadError}</p>
            )}
          </div>
        )}
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-charcoal-800">
          Biography
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          value={form.bio}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="Short biography or background summary"
          className={inputClass}
        />
      </div>

      {/* Display Order & Active */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="displayOrder" className="block text-sm font-medium text-charcoal-800">
            Display Order
          </label>
          <input
            id="displayOrder"
            name="displayOrder"
            type="number"
            min="0"
            step="1"
            value={form.displayOrder}
            onChange={handleChange}
            disabled={isSubmitting}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-charcoal-500">
            Lower numbers appear first (e.g. 1 = President, 2 = Secretary, 3 = Treasurer).
          </p>
        </div>

        <div className="flex flex-col justify-end pb-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-charcoal-300 text-bronze-600 focus:ring-bronze-500"
            />
            <span className="text-sm font-medium text-charcoal-800">
              Active (Visible on public About Us page)
            </span>
          </label>
          <p className="mt-1 text-xs text-charcoal-500 pl-6.5">
            Uncheck to hide this member from public view without deleting.
          </p>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-bronze-100">
        <button
          type="submit"
          disabled={isSubmitting || isUploadingPhoto}
          className="inline-flex items-center gap-2 rounded-lg bg-bronze-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-bronze-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          {initial ? 'Update Member' : 'Create Member'}
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
// Main AdminTeam Component
// ---------------------------------------------------------------------------
function AdminTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deletingMember, setDeletingMember] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status updating map (for inline toggle spinners)
  const [updatingId, setUpdatingId] = useState(null);

  async function loadMembers() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminTeamMembers();
      // Sort members by displayOrder asc
      const sorted = [...(data || [])].sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
      );
      setMembers(sorted);
    } catch (err) {
      setError(err.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  function handleOpenCreate() {
    setEditingMember(null);
    setShowForm(true);
  }

  function handleEdit(member) {
    setEditingMember(member);
    setShowForm(true);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingMember(null);
  }

  async function handleFormSubmit(formData) {
    setIsSubmitting(true);
    setError('');
    try {
      if (editingMember) {
        const updated = await updateTeamMember(editingMember._id, formData);
        setMembers((prev) =>
          prev
            .map((m) => (m._id === editingMember._id ? updated : m))
            .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        );
        setToast(`Team member "${updated.role}" updated successfully`);
      } else {
        const created = await createTeamMember(formData);
        setMembers((prev) =>
          [...prev, created].sort(
            (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
          )
        );
        setToast(`Team member "${created.role}" created successfully`);
      }
      setShowForm(false);
      setEditingMember(null);
    } catch (err) {
      setError(err.message || 'Failed to save team member');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(member) {
    setUpdatingId(member._id);
    try {
      const updated = await updateTeamMember(member._id, {
        active: !member.active,
      });
      setMembers((prev) =>
        prev.map((m) => (m._id === member._id ? updated : m))
      );
      setToast(
        `"${member.role}" is now ${updated.active ? 'active' : 'inactive'}`
      );
    } catch (err) {
      setError(err.message || 'Failed to toggle status');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDisplayOrderChange(member, newOrder) {
    const parsedOrder = Number(newOrder);
    if (isNaN(parsedOrder) || parsedOrder === member.displayOrder) return;

    setUpdatingId(member._id);
    try {
      const updated = await updateTeamMember(member._id, {
        displayOrder: parsedOrder,
      });
      setMembers((prev) =>
        prev
          .map((m) => (m._id === member._id ? updated : m))
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      );
      setToast(`Display order for "${member.role}" updated to ${parsedOrder}`);
    } catch (err) {
      setError(err.message || 'Failed to change display order');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingMember) return;
    setIsDeleting(true);
    try {
      await deleteTeamMember(deletingMember._id);
      setMembers((prev) => prev.filter((m) => m._id !== deletingMember._id));
      setToast(`Team member "${deletingMember.role}" deleted`);
      setDeletingMember(null);
    } catch (err) {
      setError(err.message || 'Failed to delete team member');
    } finally {
      setIsDeleting(false);
    }
  }

  // Next recommended display order for new member
  const nextOrder =
    members.length > 0
      ? Math.max(...members.map((m) => m.displayOrder || 0)) + 1
      : 1;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-charcoal-900 sm:text-2xl">
            Team Management
          </h2>
          <p className="mt-1 text-sm text-charcoal-500">
            Manage Valluvam leadership and team members displayed on the About Us page.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-bronze-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-bronze-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Team Member
          </button>
        )}
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            className="ml-3 font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form Card (Create / Edit) */}
      {showForm && (
        <div className="mt-6 rounded-xl border border-bronze-100 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-charcoal-900">
            {editingMember ? 'Edit Team Member' : 'Add Team Member'}
          </h3>
          <MemberForm
            initial={editingMember}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
            nextOrder={nextOrder}
          />
        </div>
      )}

      {/* Team Members List */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-bronze-100 bg-white py-16">
            <div className="flex items-center gap-3 text-charcoal-500">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Loading team members…
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-bronze-200 bg-white px-6 py-16 text-center">
            <p className="text-base font-medium text-charcoal-800">No team members yet</p>
            <p className="mt-1 text-sm text-charcoal-500">
              Add your first team member to display on the About Us page.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-bronze-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-bronze-700"
            >
              Add Team Member
            </button>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="hidden overflow-x-auto rounded-xl border border-bronze-100 bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-bronze-100 bg-bronze-50/60">
                    <th className="px-4 py-3 font-semibold text-charcoal-800 w-16 text-center">Order</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Member</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Role</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Bio</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-charcoal-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bronze-50">
                  {members.map((member) => (
                    <tr key={member._id} className="hover:bg-bronze-50/40 transition-colors">
                      {/* Display Order */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-medium text-charcoal-800 text-xs bg-bronze-100/70 px-2 py-0.5 rounded">
                            {member.displayOrder}
                          </span>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              title="Move up in order"
                              disabled={updatingId === member._id || member.displayOrder <= 1}
                              onClick={() => handleDisplayOrderChange(member, member.displayOrder - 1)}
                              className="text-charcoal-400 hover:text-bronze-700 disabled:opacity-30 p-0.5"
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                                <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              title="Move down in order"
                              disabled={updatingId === member._id}
                              onClick={() => handleDisplayOrderChange(member, member.displayOrder + 1)}
                              className="text-charcoal-400 hover:text-bronze-700 disabled:opacity-30 p-0.5"
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Photo & Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {member.photo ? (
                            <img
                              src={member.photo}
                              alt={member.name || member.role}
                              className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-bronze-200"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bronze-100 text-bronze-500">
                              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                <path
                                  fillRule="evenodd"
                                  d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-charcoal-900 truncate">
                              {member.name || (
                                <span className="italic text-charcoal-400">Name to be updated</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3 font-medium text-bronze-700 whitespace-nowrap">
                        {member.role}
                      </td>

                      {/* Bio */}
                      <td className="px-4 py-3 text-charcoal-600 max-w-xs truncate text-xs">
                        {member.bio || <span className="text-charcoal-400 italic">No biography</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(member)}
                          disabled={updatingId === member._id}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-80 ${
                            member.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-charcoal-100 text-charcoal-600'
                          } ${updatingId === member._id ? 'opacity-50 cursor-wait' : ''}`}
                          title={member.active ? 'Click to deactivate' : 'Click to activate'}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              member.active ? 'bg-emerald-600' : 'bg-charcoal-400'
                            }`}
                          />
                          {member.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(member)}
                            disabled={updatingId === member._id}
                            className="rounded-md px-2 py-1 text-xs font-medium text-charcoal-600 transition-colors hover:bg-bronze-50"
                          >
                            {member.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(member)}
                            className="rounded-md px-2.5 py-1 text-xs font-medium text-bronze-700 transition-colors hover:bg-bronze-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingMember(member)}
                            className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
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

            {/* Mobile Card View */}
            <div className="flex flex-col gap-3 md:hidden">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="rounded-xl border border-bronze-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name || member.role}
                        className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-bronze-200"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bronze-100 text-bronze-500">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                          <path
                            fillRule="evenodd"
                            d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-charcoal-900 truncate">
                          {member.name || (
                            <span className="italic text-charcoal-400">Name to be updated</span>
                          )}
                        </h4>
                        <span
                          className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            member.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-charcoal-100 text-charcoal-600'
                          }`}
                        >
                          {member.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-bronze-700">{member.role}</p>
                      <p className="mt-1 text-xs text-charcoal-500">
                        Display Order: <span className="font-semibold">{member.displayOrder}</span>
                      </p>
                    </div>
                  </div>

                  {member.bio && (
                    <p className="mt-2 text-xs text-charcoal-600 line-clamp-2 bg-bronze-50/40 p-2 rounded">
                      {member.bio}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-bronze-50 pt-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(member)}
                      disabled={updatingId === member._id}
                      className="rounded-md border border-charcoal-200 px-2.5 py-1 text-xs font-medium text-charcoal-700 transition-colors hover:bg-charcoal-50"
                    >
                      {member.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(member)}
                      className="rounded-md border border-bronze-200 px-2.5 py-1 text-xs font-medium text-bronze-700 transition-colors hover:bg-bronze-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingMember(member)}
                      className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
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
      {deletingMember && (
        <DeleteDialog
          memberName={deletingMember.name}
          memberRole={deletingMember.role}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingMember(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Success Toast */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

export default AdminTeam;
