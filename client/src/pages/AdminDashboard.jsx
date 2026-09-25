import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardStats } from '../services/adminDashboardService';

// ---------------------------------------------------------------------------
// Status badge styles
// ---------------------------------------------------------------------------
const EVENT_STATUS_STYLES = {
  published: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  draft: 'bg-amber-100 text-amber-800 border-amber-200',
};

const VOLUNTEER_STATUS_STYLES = {
  new: 'bg-sky-100 text-sky-800 border-sky-200',
  reviewed: 'bg-amber-100 text-amber-800 border-amber-200',
  contacted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  archived: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
};

const MESSAGE_STATUS_STYLES = {
  new: 'bg-sky-100 text-sky-800 border-sky-200',
  read: 'bg-amber-100 text-amber-800 border-amber-200',
  replied: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  archived: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return '—';
  }
}

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------
const icons = {
  events: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  published: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  gallery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  volunteers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  messages: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  team: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  arrowRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Card definitions
  const summaryCards = [
    {
      title: 'Total Events',
      count: stats?.eventsTotal ?? 0,
      description: 'All recorded community events',
      to: '/admin/events',
      icon: icons.events,
      colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeClass: 'text-amber-800 bg-amber-100',
    },
    {
      title: 'Published Events',
      count: stats?.eventsPublished ?? 0,
      description: `${stats?.eventsPublished ?? 0} of ${stats?.eventsTotal ?? 0} live on public site`,
      to: '/admin/events',
      icon: icons.published,
      colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeClass: 'text-emerald-800 bg-emerald-100',
    },
    {
      title: 'Gallery Albums',
      count: stats?.galleryAlbums ?? 0,
      description: 'Photo collections & event albums',
      to: '/admin/gallery',
      icon: icons.gallery,
      colorClass: 'bg-sky-50 text-sky-700 border-sky-200',
      badgeClass: 'text-sky-800 bg-sky-100',
    },
    {
      title: 'Volunteer Submissions',
      count: stats?.volunteersTotal ?? 0,
      description: 'Applications received from volunteers',
      to: '/admin/volunteers',
      icon: icons.volunteers,
      colorClass: 'bg-violet-50 text-violet-700 border-violet-200',
      badgeClass: 'text-violet-800 bg-violet-100',
    },
    {
      title: 'Contact Messages',
      count: stats?.contactMessages ?? 0,
      description: 'Inquiries sent via contact form',
      to: '/admin/messages',
      icon: icons.messages,
      colorClass: 'bg-rose-50 text-rose-700 border-rose-200',
      badgeClass: 'text-rose-800 bg-rose-100',
    },
    {
      title: 'Active Team Members',
      count: stats?.activeTeamMembers ?? 0,
      description: 'Active members on Team page',
      to: '/admin/team',
      icon: icons.team,
      colorClass: 'bg-bronze-50 text-bronze-700 border-bronze-200',
      badgeClass: 'text-bronze-800 bg-bronze-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-charcoal-900 sm:text-2xl">
            Welcome back, {user?.name || 'Admin'}
          </h2>
          <p className="mt-1 text-sm text-charcoal-500">
            Real-time overview of Valluvam's community activities, submissions, and content.
          </p>
        </div>
        <button
          type="button"
          onClick={loadStats}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-bronze-200 bg-white px-3.5 py-2 text-sm font-medium text-charcoal-700 shadow-sm transition-colors hover:bg-bronze-50 hover:text-charcoal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600 disabled:opacity-50 sm:self-auto"
        >
          <span className={loading ? 'animate-spin' : ''}>{icons.refresh}</span>
          Refresh
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="text-red-600 mt-0.5 shrink-0">{icons.alert}</span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">
                Failed to load dashboard statistics
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={loadStats}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                {icons.refresh}
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && !stats && (
        <div className="space-y-8">
          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-bronze-100 bg-white p-5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-charcoal-100" />
                  <div className="h-4 w-12 rounded bg-charcoal-100" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-8 w-16 rounded bg-charcoal-200" />
                  <div className="h-4 w-28 rounded bg-charcoal-100" />
                  <div className="h-3 w-40 rounded bg-charcoal-50" />
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Activity */}
          <div className="rounded-xl border border-bronze-100 bg-white p-6 shadow-xs">
            <div className="h-5 w-40 rounded bg-charcoal-200 animate-pulse" />
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {[1, 2, 3].map((col) => (
                <div key={col} className="space-y-3">
                  <div className="h-4 w-28 rounded bg-charcoal-100 animate-pulse" />
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="h-14 rounded-lg bg-charcoal-50 animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Loaded State ── */}
      {stats && (
        <>
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {summaryCards.map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className="group relative flex flex-col justify-between rounded-xl border border-bronze-100 bg-white p-5 shadow-xs transition-all hover:border-bronze-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${card.colorClass}`}
                    >
                      {card.icon}
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-charcoal-400 group-hover:text-bronze-600 transition-colors">
                      View
                      <span className="transition-transform group-hover:translate-x-0.5">
                        {icons.arrowRight}
                      </span>
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-3xl font-bold tracking-tight text-charcoal-900">
                      {card.count.toLocaleString()}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-charcoal-800">
                      {card.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-charcoal-500">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Recent Activity Section ── */}
          <div className="rounded-xl border border-bronze-100 bg-white p-5 sm:p-6 shadow-xs">
            <div className="border-b border-bronze-100 pb-4">
              <h3 className="text-lg font-bold text-charcoal-900">Recent Activity</h3>
              <p className="mt-0.5 text-xs text-charcoal-500">
                Latest updates across events, volunteer applications, and incoming messages.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* 1. Recent Events */}
              <div>
                <div className="flex items-center justify-between pb-3">
                  <h4 className="text-sm font-semibold text-charcoal-800 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Latest Events
                  </h4>
                  <Link
                    to="/admin/events"
                    className="text-xs font-medium text-bronze-600 hover:text-bronze-700"
                  >
                    View all &rarr;
                  </Link>
                </div>

                {(!stats.recentActivity?.events || stats.recentActivity.events.length === 0) ? (
                  <p className="py-6 text-center text-xs text-charcoal-400 border border-dashed border-bronze-100 rounded-lg">
                    No events created yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-bronze-50">
                    {stats.recentActivity.events.map((event) => (
                      <li key={event._id} className="py-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-charcoal-900 truncate">
                            {event.title}
                          </p>
                          <span
                            className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                              EVENT_STATUS_STYLES[event.status] || 'bg-charcoal-100 text-charcoal-700'
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-charcoal-500">
                          <span>{formatDate(event.date)}</span>
                          <span className="text-[11px] text-charcoal-400">
                            {formatDate(event.createdAt)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 2. Recent Volunteer Submissions */}
              <div>
                <div className="flex items-center justify-between pb-3">
                  <h4 className="text-sm font-semibold text-charcoal-800 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    Latest Volunteers
                  </h4>
                  <Link
                    to="/admin/volunteers"
                    className="text-xs font-medium text-bronze-600 hover:text-bronze-700"
                  >
                    View all &rarr;
                  </Link>
                </div>

                {(!stats.recentActivity?.volunteers || stats.recentActivity.volunteers.length === 0) ? (
                  <p className="py-6 text-center text-xs text-charcoal-400 border border-dashed border-bronze-100 rounded-lg">
                    No volunteer applications yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-bronze-50">
                    {stats.recentActivity.volunteers.map((vol) => (
                      <li key={vol._id} className="py-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-charcoal-900 truncate">
                            {vol.name}
                          </p>
                          <span
                            className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                              VOLUNTEER_STATUS_STYLES[vol.status] || 'bg-charcoal-100 text-charcoal-700'
                            }`}
                          >
                            {vol.status || 'new'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-charcoal-500">
                          <span className="truncate max-w-[150px]">
                            {vol.volunteerArea || vol.email}
                          </span>
                          <span className="text-[11px] text-charcoal-400">
                            {formatDate(vol.createdAt)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 3. Recent Contact Messages */}
              <div>
                <div className="flex items-center justify-between pb-3">
                  <h4 className="text-sm font-semibold text-charcoal-800 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Latest Messages
                  </h4>
                  <Link
                    to="/admin/messages"
                    className="text-xs font-medium text-bronze-600 hover:text-bronze-700"
                  >
                    View all &rarr;
                  </Link>
                </div>

                {(!stats.recentActivity?.messages || stats.recentActivity.messages.length === 0) ? (
                  <p className="py-6 text-center text-xs text-charcoal-400 border border-dashed border-bronze-100 rounded-lg">
                    No contact messages yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-bronze-50">
                    {stats.recentActivity.messages.map((msg) => (
                      <li key={msg._id} className="py-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-charcoal-900 truncate">
                            {msg.subject || msg.name}
                          </p>
                          <span
                            className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                              MESSAGE_STATUS_STYLES[msg.status] || 'bg-charcoal-100 text-charcoal-700'
                            }`}
                          >
                            {msg.status || 'new'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-charcoal-500">
                          <span className="truncate max-w-[150px]">{msg.name}</span>
                          <span className="text-[11px] text-charcoal-400">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
