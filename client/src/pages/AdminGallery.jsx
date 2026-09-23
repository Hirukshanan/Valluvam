import { useState, useEffect } from 'react';
import { fetchGalleryAlbums } from '../services/adminGalleryService';

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
// Admin Gallery page — read-only album listing
// ---------------------------------------------------------------------------

function AdminGallery() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            onClick={() => { setError(''); loadAlbums(); }}
            className="ml-3 font-medium underline hover:no-underline"
          >
            Retry
          </button>
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
                  <div className="mt-3 border-t border-bronze-50 pt-3">
                    <span className="inline-flex items-center rounded-full bg-bronze-100/70 px-2.5 py-0.5 text-xs font-semibold text-bronze-800">
                      {album.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminGallery;

