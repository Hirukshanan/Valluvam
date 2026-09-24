import { useState, useEffect } from 'react';
import {
  fetchAdminVolunteers,
  updateVolunteerStatus,
  deleteVolunteerSubmission,
} from '../services/adminVolunteerService';

// ---------------------------------------------------------------------------
// Status Configuration
// ---------------------------------------------------------------------------
const STATUSES = ['new', 'reviewed', 'contacted', 'archived'];

const STATUS_CONFIG = {
  new: {
    label: 'New',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    dotClass: 'bg-sky-500',
  },
  reviewed: {
    label: 'Reviewed',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  contacted: {
    label: 'Contacted',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  archived: {
    label: 'Archived',
    badgeClass: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
    dotClass: 'bg-charcoal-400',
  },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

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
// Delete Confirmation Dialog
// ---------------------------------------------------------------------------
function DeleteDialog({ volunteerName, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/40 px-4">
      <div className="w-full max-w-sm rounded-xl border border-bronze-100 bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-charcoal-900">Delete Submission</h3>
        <p className="mt-2 text-sm text-charcoal-600">
          Are you sure you want to delete the submission from{' '}
          <span className="font-semibold text-charcoal-900">&ldquo;{volunteerName}&rdquo;</span>?
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
// Details Modal
// ---------------------------------------------------------------------------
function DetailsModal({
  volunteer,
  onClose,
  onStatusChange,
  onDeleteClick,
  isUpdatingStatus,
}) {
  if (!volunteer) return null;

  const currentConfig = STATUS_CONFIG[volunteer.status] || STATUS_CONFIG.new;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/40 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-bronze-100 bg-white p-6 shadow-xl sm:p-8 my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-bronze-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-charcoal-950">
                {volunteer.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${currentConfig.badgeClass}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${currentConfig.dotClass}`} />
                {currentConfig.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-charcoal-500">
              Submitted on {formatDate(volunteer.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-charcoal-400 hover:bg-bronze-50 hover:text-charcoal-700 transition-colors"
            aria-label="Close details"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Info Grid */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* Email */}
          <div className="rounded-lg border border-bronze-100 bg-bronze-50/30 p-3.5">
            <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider block">
              Email Address
            </span>
            <a
              href={`mailto:${volunteer.email}`}
              className="mt-1 text-sm font-semibold text-bronze-700 hover:underline break-all block"
            >
              {volunteer.email}
            </a>
          </div>

          {/* Phone */}
          <div className="rounded-lg border border-bronze-100 bg-bronze-50/30 p-3.5">
            <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider block">
              Phone Number
            </span>
            {volunteer.phone ? (
              <a
                href={`tel:${volunteer.phone}`}
                className="mt-1 text-sm font-semibold text-charcoal-900 hover:text-bronze-700 block"
              >
                {volunteer.phone}
              </a>
            ) : (
              <span className="mt-1 text-sm text-charcoal-400 italic block">
                Not provided
              </span>
            )}
          </div>

          {/* Location */}
          <div className="rounded-lg border border-bronze-100 bg-bronze-50/30 p-3.5">
            <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider block">
              Area / Location
            </span>
            <p className="mt-1 text-sm font-semibold text-charcoal-900">
              {volunteer.location || (
                <span className="font-normal italic text-charcoal-400">Not provided</span>
              )}
            </p>
          </div>

          {/* Volunteer Area */}
          <div className="rounded-lg border border-bronze-100 bg-bronze-50/30 p-3.5">
            <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider block">
              Volunteer Area
            </span>
            <p className="mt-1 text-sm font-semibold text-charcoal-900">
              {volunteer.volunteerArea || (
                <span className="font-normal italic text-charcoal-400">Not specified</span>
              )}
            </p>
          </div>

          {/* Availability */}
          <div className="rounded-lg border border-bronze-100 bg-bronze-50/30 p-3.5 sm:col-span-2">
            <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider block">
              Availability
            </span>
            <p className="mt-1 text-sm font-semibold text-charcoal-900">
              {volunteer.availability || (
                <span className="font-normal italic text-charcoal-400">Not specified</span>
              )}
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="mt-5">
          <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider block">
            Volunteer Message
          </span>
          <div className="mt-1.5 rounded-lg border border-bronze-200 bg-white p-4 text-sm leading-relaxed text-charcoal-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
            {volunteer.message || (
              <span className="italic text-charcoal-400">No message provided.</span>
            )}
          </div>
        </div>

        {/* Status Change Selector inside Modal */}
        <div className="mt-6 rounded-xl border border-bronze-200 bg-bronze-50/40 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <label htmlFor="modal-status-select" className="text-sm font-semibold text-charcoal-900 block">
                Update Status
              </label>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Track review and communication progress with this volunteer.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                id="modal-status-select"
                value={volunteer.status}
                disabled={isUpdatingStatus}
                onChange={(e) => onStatusChange(volunteer, e.target.value)}
                className="rounded-lg border border-charcoal-300 bg-white px-3 py-1.5 text-sm font-medium text-charcoal-900 focus:border-bronze-600 focus:outline-none focus:ring-1 focus:ring-bronze-600 disabled:opacity-60"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {STATUS_CONFIG[st].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-bronze-100 pt-4">
          <button
            type="button"
            onClick={() => onDeleteClick(volunteer)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 hover:border-red-300"
          >
            Delete Submission
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-charcoal-900 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-charcoal-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AdminVolunteers Component
// ---------------------------------------------------------------------------
function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Filtering
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'new' | 'reviewed' | 'contacted' | 'archived'

  // Details Modal
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  // Status updating map
  const [updatingId, setUpdatingId] = useState(null);

  // Deletion state
  const [deletingVolunteer, setDeletingVolunteer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadVolunteers() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminVolunteers();
      setVolunteers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load volunteer submissions');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVolunteers();
  }, []);

  async function handleStatusChange(volunteer, newStatus) {
    if (!newStatus || newStatus === volunteer.status) return;

    setUpdatingId(volunteer._id);
    try {
      const updated = await updateVolunteerStatus(volunteer._id, newStatus);
      setVolunteers((prev) =>
        prev.map((v) => (v._id === volunteer._id ? updated : v))
      );
      if (selectedVolunteer && selectedVolunteer._id === volunteer._id) {
        setSelectedVolunteer(updated);
      }
      setToast(
        `Status for "${volunteer.name}" updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`
      );
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  }

  function handleDeleteClick(volunteer) {
    setDeletingVolunteer(volunteer);
  }

  async function handleConfirmDelete() {
    if (!deletingVolunteer) return;
    setIsDeleting(true);
    try {
      await deleteVolunteerSubmission(deletingVolunteer._id);
      setVolunteers((prev) =>
        prev.filter((v) => v._id !== deletingVolunteer._id)
      );
      if (selectedVolunteer && selectedVolunteer._id === deletingVolunteer._id) {
        setSelectedVolunteer(null);
      }
      setToast(`Submission from "${deletingVolunteer.name}" deleted successfully`);
      setDeletingVolunteer(null);
    } catch (err) {
      setError(err.message || 'Failed to delete volunteer submission');
    } finally {
      setIsDeleting(false);
    }
  }

  // Filtered submissions based on active tab
  const filteredVolunteers =
    activeTab === 'all'
      ? volunteers
      : volunteers.filter((v) => v.status === activeTab);

  // Count per status
  const counts = {
    all: volunteers.length,
    new: volunteers.filter((v) => v.status === 'new').length,
    reviewed: volunteers.filter((v) => v.status === 'reviewed').length,
    contacted: volunteers.filter((v) => v.status === 'contacted').length,
    archived: volunteers.filter((v) => v.status === 'archived').length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-charcoal-900 sm:text-2xl">
            Volunteer Submissions
          </h2>
          <p className="mt-1 text-sm text-charcoal-500">
            Review and manage volunteer interest forms submitted through the website.
          </p>
        </div>
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

      {/* Status Filter Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-bronze-100 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-bronze-600 text-white font-semibold shadow-xs'
              : 'text-charcoal-600 hover:bg-bronze-50 hover:text-charcoal-900'
          }`}
        >
          All
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              activeTab === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-bronze-100 text-bronze-800'
            }`}
          >
            {counts.all}
          </span>
        </button>

        {STATUSES.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setActiveTab(st)}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              activeTab === st
                ? 'bg-bronze-600 text-white font-semibold shadow-xs'
                : 'text-charcoal-600 hover:bg-bronze-50 hover:text-charcoal-900'
            }`}
          >
            {STATUS_CONFIG[st].label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                activeTab === st
                  ? 'bg-white/20 text-white'
                  : 'bg-bronze-100 text-bronze-800'
              }`}
            >
              {counts[st]}
            </span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-bronze-100 bg-white py-16">
            <div className="flex items-center gap-3 text-charcoal-500">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Loading volunteer submissions…
            </div>
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-bronze-200 bg-white px-6 py-16 text-center">
            <p className="text-base font-medium text-charcoal-800">
              {activeTab === 'all'
                ? 'No volunteer submissions yet'
                : `No submissions with status "${STATUS_CONFIG[activeTab]?.label || activeTab}"`}
            </p>
            <p className="mt-1 text-sm text-charcoal-500">
              New submissions from the public volunteer form will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden overflow-hidden rounded-xl border border-bronze-100 bg-white shadow-xs md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-bronze-100 bg-bronze-50/60">
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Volunteer</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Area / Location</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Availability</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Status</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Submitted</th>
                    <th className="px-4 py-3 text-right font-semibold text-charcoal-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bronze-50">
                  {filteredVolunteers.map((vol) => {
                    const stConfig = STATUS_CONFIG[vol.status] || STATUS_CONFIG.new;

                    return (
                      <tr key={vol._id} className="hover:bg-bronze-50/40 transition-colors">
                        {/* Name & Contact */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-charcoal-900">{vol.name}</span>
                            <span className="text-xs text-bronze-700">{vol.email}</span>
                            {vol.phone && (
                              <span className="text-xs text-charcoal-500">{vol.phone}</span>
                            )}
                          </div>
                        </td>

                        {/* Volunteer Area & Location */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-charcoal-900 text-xs">
                              {vol.volunteerArea || '—'}
                            </span>
                            {vol.location && (
                              <span className="text-xs text-charcoal-500">{vol.location}</span>
                            )}
                          </div>
                        </td>

                        {/* Availability */}
                        <td className="px-4 py-3 text-xs text-charcoal-700">
                          {vol.availability || '—'}
                        </td>

                        {/* Status with Inline Dropdown */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={vol.status}
                              disabled={updatingId === vol._id}
                              onChange={(e) => handleStatusChange(vol, e.target.value)}
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold border cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-bronze-600 disabled:opacity-60 ${stConfig.badgeClass}`}
                            >
                              {STATUSES.map((st) => (
                                <option key={st} value={st} className="bg-white text-charcoal-900">
                                  {STATUS_CONFIG[st].label}
                                </option>
                              ))}
                            </select>
                            {updatingId === vol._id && (
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bronze-600 border-t-transparent" />
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-xs text-charcoal-500 whitespace-nowrap">
                          {formatDate(vol.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedVolunteer(vol)}
                              className="rounded-md px-2.5 py-1 text-xs font-semibold text-bronze-700 transition-colors hover:bg-bronze-100"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(vol)}
                              className="rounded-md px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="flex flex-col gap-3 md:hidden">
              {filteredVolunteers.map((vol) => {
                const stConfig = STATUS_CONFIG[vol.status] || STATUS_CONFIG.new;

                return (
                  <div
                    key={vol._id}
                    className="rounded-xl border border-bronze-100 bg-white p-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-charcoal-900">{vol.name}</h4>
                        <a
                          href={`mailto:${vol.email}`}
                          className="text-xs text-bronze-700 hover:underline block"
                        >
                          {vol.email}
                        </a>
                        {vol.phone && (
                          <span className="text-xs text-charcoal-500 block">{vol.phone}</span>
                        )}
                      </div>
                      <select
                        value={vol.status}
                        disabled={updatingId === vol._id}
                        onChange={(e) => handleStatusChange(vol, e.target.value)}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold border cursor-pointer focus:outline-none ${stConfig.badgeClass}`}
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-white text-charcoal-900">
                            {STATUS_CONFIG[st].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-bronze-50 pt-2.5 text-charcoal-600">
                      <div>
                        <span className="text-charcoal-400 block text-[11px]">Area:</span>
                        <span className="font-medium text-charcoal-900 truncate block">
                          {vol.volunteerArea || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-charcoal-400 block text-[11px]">Availability:</span>
                        <span className="font-medium text-charcoal-900 truncate block">
                          {vol.availability || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-bronze-50 pt-3">
                      <span className="text-[11px] text-charcoal-400">
                        {formatDate(vol.createdAt)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedVolunteer(vol)}
                          className="rounded-md border border-bronze-200 px-2.5 py-1 text-xs font-medium text-bronze-700 hover:bg-bronze-50"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(vol)}
                          className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Volunteer Details Modal */}
      {selectedVolunteer && (
        <DetailsModal
          volunteer={selectedVolunteer}
          onClose={() => setSelectedVolunteer(null)}
          onStatusChange={handleStatusChange}
          onDeleteClick={handleDeleteClick}
          isUpdatingStatus={updatingId === selectedVolunteer._id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingVolunteer && (
        <DeleteDialog
          volunteerName={deletingVolunteer.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingVolunteer(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Success Toast */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

export default AdminVolunteers;
