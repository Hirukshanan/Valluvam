import { useState, useEffect, useMemo } from 'react';
import {
  fetchAdminContacts,
  updateContactStatus,
  deleteContactMessage,
} from '../services/adminContactService';

// ---------------------------------------------------------------------------
// Status Configuration
// ---------------------------------------------------------------------------
const STATUSES = ['new', 'read', 'replied', 'archived'];

const STATUS_CONFIG = {
  new: {
    label: 'New',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    dotClass: 'bg-sky-500',
  },
  read: {
    label: 'Read',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  replied: {
    label: 'Replied',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  archived: {
    label: 'Archived',
    badgeClass: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
    dotClass: 'bg-charcoal-400',
  },
};

const METHOD_CONFIG = {
  email: {
    label: 'Email',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  whatsapp: {
    label: 'WhatsApp',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  phone: {
    label: 'Phone',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
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
function DeleteDialog({ messageItem, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-charcoal-950/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-bronze-100 bg-white p-6 shadow-lg my-auto">
        <h3 className="text-lg font-semibold text-charcoal-900">Delete Message</h3>
        <p className="mt-2 text-sm text-charcoal-600">
          Are you sure you want to delete the message from{' '}
          <span className="font-semibold text-charcoal-900">&ldquo;{messageItem.name}&rdquo;</span>?
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
  messageItem,
  onClose,
  onStatusChange,
  onDeleteClick,
  isUpdatingStatus,
}) {
  if (!messageItem) return null;

  const currentConfig = STATUS_CONFIG[messageItem.status] || STATUS_CONFIG.new;
  const methodConfig = METHOD_CONFIG[messageItem.preferredContactMethod] || METHOD_CONFIG.email;

  // Format clean WhatsApp link if number is present
  const cleanWaNumber = messageItem.whatsappNumber
    ? messageItem.whatsappNumber.replace(/[^0-9]/g, '')
    : '';

  return (
    <div className="fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-charcoal-950/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-bronze-100 bg-white p-4 shadow-xl sm:p-8 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-bronze-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-charcoal-950">
                {messageItem.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${currentConfig.badgeClass}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${currentConfig.dotClass}`} />
                {currentConfig.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-charcoal-500">
              Submitted on {formatDate(messageItem.createdAt)}
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

        {/* Subject */}
        <div className="mt-4 rounded-lg bg-bronze-50/60 p-3.5 border border-bronze-100">
          <span className="text-xs font-medium uppercase tracking-wider text-charcoal-500 block">
            Subject
          </span>
          <p className="mt-1 text-base font-semibold text-charcoal-900">
            {messageItem.subject}
          </p>
        </div>

        {/* Info Grid */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Email */}
          <div className="rounded-lg border border-bronze-100 bg-bronze-50/30 p-3.5">
            <span className="text-xs font-medium uppercase tracking-wider text-charcoal-500 block">
              Email Address
            </span>
            <a
              href={`mailto:${messageItem.email}`}
              className="mt-1 block text-sm font-semibold text-bronze-700 hover:underline break-all"
            >
              {messageItem.email}
            </a>
          </div>

          {/* Preferred Contact Method */}
          <div className="rounded-lg border border-bronze-100 bg-bronze-50/30 p-3.5">
            <span className="text-xs font-medium uppercase tracking-wider text-charcoal-500 block">
              Preferred Contact Method
            </span>
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold border ${methodConfig.badgeClass}`}
              >
                {methodConfig.label}
              </span>
            </div>
          </div>

          {/* Phone (when provided) */}
          <div className="rounded-lg border border-bronze-100 bg-bronze-50/30 p-3.5">
            <span className="text-xs font-medium uppercase tracking-wider text-charcoal-500 block">
              Phone Number
            </span>
            {messageItem.phoneNumber ? (
              <a
                href={`tel:${messageItem.phoneNumber}`}
                className="mt-1 block text-sm font-semibold text-charcoal-900 hover:text-bronze-700"
              >
                {messageItem.phoneNumber}
              </a>
            ) : (
              <span className="mt-1 block text-sm italic text-charcoal-400">
                Not provided
              </span>
            )}
          </div>

          {/* WhatsApp (when provided) */}
          <div className="rounded-lg border border-bronze-100 bg-bronze-50/30 p-3.5">
            <span className="text-xs font-medium uppercase tracking-wider text-charcoal-500 block">
              WhatsApp Number
            </span>
            {messageItem.whatsappNumber ? (
              <div className="mt-1 flex items-center gap-2">
                <a
                  href={cleanWaNumber ? `https://wa.me/${cleanWaNumber}` : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-emerald-700 hover:underline"
                >
                  {messageItem.whatsappNumber}
                </a>
                {cleanWaNumber && (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-medium text-emerald-800">
                    Chat
                  </span>
                )}
              </div>
            ) : (
              <span className="mt-1 block text-sm italic text-charcoal-400">
                Not provided
              </span>
            )}
          </div>
        </div>

        {/* Full Message */}
        <div className="mt-5">
          <span className="text-xs font-medium uppercase tracking-wider text-charcoal-500 block">
            Full Message
          </span>
          <div className="mt-1.5 max-h-60 overflow-y-auto whitespace-pre-wrap rounded-lg border border-bronze-200 bg-white p-4 text-sm leading-relaxed text-charcoal-800">
            {messageItem.message || (
              <span className="italic text-charcoal-400">No message content.</span>
            )}
          </div>
        </div>

        {/* Status Change Selector inside Modal */}
        <div className="mt-6 rounded-xl border border-bronze-200 bg-bronze-50/40 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <label htmlFor="modal-status-select" className="block text-sm font-semibold text-charcoal-900">
                Update Status
              </label>
              <p className="mt-0.5 text-xs text-charcoal-500">
                Mark as read, replied, or archive this message.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                id="modal-status-select"
                value={messageItem.status}
                disabled={isUpdatingStatus}
                onChange={(e) => onStatusChange(messageItem, e.target.value)}
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
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-bronze-100 pt-4">
          <button
            type="button"
            onClick={() => onDeleteClick(messageItem)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
          >
            Delete Message
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-charcoal-900 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-charcoal-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AdminMessages Component
// ---------------------------------------------------------------------------
function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Filtering & search
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'new' | 'read' | 'replied' | 'archived'
  const [searchQuery, setSearchQuery] = useState('');

  // Details Modal
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Status updating tracking
  const [updatingId, setUpdatingId] = useState(null);

  // Deletion state
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadMessages() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminContacts();
      setMessages(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function handleStatusChange(messageItem, newStatus) {
    if (!newStatus || newStatus === messageItem.status) return;

    setUpdatingId(messageItem._id);
    try {
      const updated = await updateContactStatus(messageItem._id, newStatus);
      setMessages((prev) =>
        prev.map((m) => (m._id === messageItem._id ? updated : m))
      );
      if (selectedMessage && selectedMessage._id === messageItem._id) {
        setSelectedMessage(updated);
      }
      setToast(
        `Status for message from "${messageItem.name}" updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`
      );
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  }

  function handleDeleteClick(messageItem) {
    setDeletingMessage(messageItem);
  }

  async function handleConfirmDelete() {
    if (!deletingMessage) return;
    setIsDeleting(true);
    try {
      await deleteContactMessage(deletingMessage._id);
      setMessages((prev) =>
        prev.filter((m) => m._id !== deletingMessage._id)
      );
      if (selectedMessage && selectedMessage._id === deletingMessage._id) {
        setSelectedMessage(null);
      }
      setToast(`Message from "${deletingMessage.name}" deleted successfully`);
      setDeletingMessage(null);
    } catch (err) {
      setError(err.message || 'Failed to delete contact message');
    } finally {
      setIsDeleting(false);
    }
  }

  // Filtered messages based on active tab and search query
  const filteredMessages = useMemo(() => {
    let list = messages;
    if (activeTab !== 'all') {
      list = list.filter((m) => m.status === activeTab);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.name?.toLowerCase().includes(query) ||
          m.email?.toLowerCase().includes(query) ||
          m.subject?.toLowerCase().includes(query) ||
          m.message?.toLowerCase().includes(query)
      );
    }
    return list;
  }, [messages, activeTab, searchQuery]);

  // Count per status
  const counts = {
    all: messages.length,
    new: messages.filter((m) => m.status === 'new').length,
    read: messages.filter((m) => m.status === 'read').length,
    replied: messages.filter((m) => m.status === 'replied').length,
    archived: messages.filter((m) => m.status === 'archived').length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-charcoal-900 sm:text-2xl">
            Contact Messages
          </h2>
          <p className="mt-1 text-sm text-charcoal-500">
            View, review, and manage messages submitted through the website Contact form.
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

      {/* Status Filter Tabs & Search Bar */}
      <div className="mt-6 flex flex-col gap-4 border-b border-bronze-100 pb-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-bronze-600 font-semibold text-white shadow-xs'
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
                  ? 'bg-bronze-600 font-semibold text-white shadow-xs'
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

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full rounded-lg border border-charcoal-200 bg-white py-1.5 pl-9 pr-3 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:border-bronze-600 focus:outline-none focus:ring-1 focus:ring-bronze-600"
          />
          <svg
            className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-charcoal-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
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
              Loading contact messages…
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-bronze-200 bg-white px-6 py-16 text-center">
            <p className="text-base font-medium text-charcoal-800">
              {searchQuery
                ? 'No messages match your search criteria'
                : activeTab === 'all'
                ? 'No contact messages yet'
                : `No messages with status "${STATUS_CONFIG[activeTab]?.label || activeTab}"`}
            </p>
            <p className="mt-1 text-sm text-charcoal-500">
              {searchQuery
                ? 'Try adjusting your search terms or clearing the filter.'
                : 'New inquiries submitted via the Contact Us form will appear here.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="hidden overflow-x-auto rounded-xl border border-bronze-100 bg-white shadow-xs md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-bronze-100 bg-bronze-50/60">
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Sender</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Subject</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Contact Method</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Status</th>
                    <th className="px-4 py-3 font-semibold text-charcoal-800">Submitted</th>
                    <th className="px-4 py-3 text-right font-semibold text-charcoal-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bronze-50">
                  {filteredMessages.map((msg) => {
                    const stConfig = STATUS_CONFIG[msg.status] || STATUS_CONFIG.new;
                    const methConfig = METHOD_CONFIG[msg.preferredContactMethod] || METHOD_CONFIG.email;

                    return (
                      <tr key={msg._id} className="hover:bg-bronze-50/40 transition-colors">
                        {/* Sender info */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-charcoal-900">{msg.name}</span>
                            <span className="text-xs text-bronze-700">{msg.email}</span>
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="px-4 py-3 max-w-xs">
                          <div className="truncate font-medium text-charcoal-900" title={msg.subject}>
                            {msg.subject}
                          </div>
                          <div className="truncate text-xs text-charcoal-500" title={msg.message}>
                            {msg.message}
                          </div>
                        </td>

                        {/* Preferred Method */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${methConfig.badgeClass}`}
                          >
                            {methConfig.label}
                          </span>
                        </td>

                        {/* Status with Inline Dropdown */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={msg.status}
                              disabled={updatingId === msg._id}
                              onChange={(e) => handleStatusChange(msg, e.target.value)}
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold border cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-bronze-600 disabled:opacity-60 ${stConfig.badgeClass}`}
                            >
                              {STATUSES.map((st) => (
                                <option key={st} value={st} className="bg-white text-charcoal-900">
                                  {STATUS_CONFIG[st].label}
                                </option>
                              ))}
                            </select>
                            {updatingId === msg._id && (
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bronze-600 border-t-transparent" />
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-xs text-charcoal-500 whitespace-nowrap">
                          {formatDate(msg.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedMessage(msg)}
                              className="rounded-md px-2.5 py-1 text-xs font-semibold text-bronze-700 transition-colors hover:bg-bronze-100"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(msg)}
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
              {filteredMessages.map((msg) => {
                const stConfig = STATUS_CONFIG[msg.status] || STATUS_CONFIG.new;
                const methConfig = METHOD_CONFIG[msg.preferredContactMethod] || METHOD_CONFIG.email;

                return (
                  <div
                    key={msg._id}
                    className="rounded-xl border border-bronze-100 bg-white p-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-charcoal-900">{msg.name}</h4>
                        <a
                          href={`mailto:${msg.email}`}
                          className="text-xs text-bronze-700 hover:underline block"
                        >
                          {msg.email}
                        </a>
                      </div>
                      <select
                        value={msg.status}
                        disabled={updatingId === msg._id}
                        onChange={(e) => handleStatusChange(msg, e.target.value)}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold border cursor-pointer focus:outline-none ${stConfig.badgeClass}`}
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-white text-charcoal-900">
                            {STATUS_CONFIG[st].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm font-medium text-charcoal-900 truncate">
                        {msg.subject}
                      </p>
                      <p className="mt-0.5 text-xs text-charcoal-500 line-clamp-2">
                        {msg.message}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-bronze-50 pt-2.5 text-xs text-charcoal-600">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-medium border ${methConfig.badgeClass}`}
                        >
                          {methConfig.label}
                        </span>
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMessage(msg)}
                          className="font-semibold text-bronze-700 hover:underline"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(msg)}
                          className="font-semibold text-red-600 hover:underline"
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

      {/* Details Modal */}
      {selectedMessage && (
        <DetailsModal
          messageItem={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onStatusChange={handleStatusChange}
          onDeleteClick={(msg) => {
            setSelectedMessage(null);
            handleDeleteClick(msg);
          }}
          isUpdatingStatus={updatingId === selectedMessage._id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingMessage && (
        <DeleteDialog
          messageItem={deletingMessage}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingMessage(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

export default AdminMessages;
