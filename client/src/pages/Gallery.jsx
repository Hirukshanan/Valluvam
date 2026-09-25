import { useState, useEffect, useCallback } from 'react';
import { fetchGalleryAlbums } from '../services/galleryService';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';

/**
 * Format ISO date string into readable British English date.
 * Example: "14 March 2025"
 */
function formatAlbumDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return String(dateStr).slice(0, 10);
  }
}

/**
 * Album Card component.
 * Displays cover image (in 4:3 frame with object-contain), title, category, date, and photo count.
 */
function AlbumCard({ album, onClick }) {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const photoCount =
    album.photos && album.photos.length > 0
      ? album.photos.length
      : album.coverImage
        ? 1
        : 0;

  const displayImage =
    album.coverImage || (album.photos && album.photos[0]?.imageUrl) || '';

  const formattedDate = formatAlbumDate(album.date);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onClick(album)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(album);
        }
      }}
      className="group flex flex-col overflow-hidden rounded-xl border border-bronze-100 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-bronze-300 hover:shadow-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-500"
      aria-label={`${t('gallery.viewAlbum')} ${album.title}`}
    >
      {/* 4:3 fixed aspect-ratio image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-charcoal-50 flex items-center justify-center">
        {displayImage && !imgError ? (
          <img
            src={displayImage}
            alt={album.title}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-charcoal-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="mt-1 text-xs">No image</span>
          </div>
        )}

        {/* Photo count badge */}
        <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-charcoal-900/75 px-2 py-0.5 text-xs font-medium text-white shadow-xs backdrop-blur-xs pointer-events-none">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>{photoCount} {photoCount === 1 ? t('gallery.singlePhoto') : t('gallery.multiplePhotos')}</span>
        </div>
      </div>

      {/* Album metadata */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {album.category && (
            <span className="mb-2 inline-block rounded-full bg-bronze-50 px-2.5 py-0.5 text-xs font-medium text-bronze-700 ring-1 ring-inset ring-bronze-200">
              {album.category}
            </span>
          )}

          <h3 className="text-base font-semibold leading-snug text-charcoal-950 group-hover:text-bronze-700 transition-colors line-clamp-2">
            {album.title}
          </h3>

          {album.description && (
            <p className="mt-1.5 text-xs text-charcoal-600 line-clamp-2">
              {album.description}
            </p>
          )}
        </div>

        {formattedDate && (
          <div className="mt-3 pt-2.5 border-t border-charcoal-100 flex items-center justify-between text-xs text-charcoal-500">
            <time dateTime={album.date}>{formattedDate}</time>
            <span className="font-medium text-bronze-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              {t('gallery.viewAlbum')}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Animated skeleton placeholder cards shown during loading state.
 */
function GalleryLoadingSkeleton() {
  const { t } = useLanguage();
  return (
    <div
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label={t('gallery.loadingAlbums')}
    >
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className="overflow-hidden rounded-xl border border-bronze-100 bg-white shadow-xs animate-pulse"
        >
          <div className="aspect-[4/3] w-full bg-charcoal-100" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-20 rounded-full bg-charcoal-100" />
            <div className="h-5 w-3/4 rounded bg-charcoal-100" />
            <div className="h-3.5 w-full rounded bg-charcoal-50" />
            <div className="pt-2 border-t border-charcoal-100 flex justify-between">
              <div className="h-3 w-24 rounded bg-charcoal-100" />
              <div className="h-3 w-16 rounded bg-charcoal-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Error state with retry action.
 */
function GalleryErrorState({ error, onRetry }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/60 p-8 text-center sm:p-12">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-charcoal-900">
        {t('gallery.errorTitle')}
      </h3>
      <p className="mt-1 max-w-md text-sm text-charcoal-600">
        {error || t('gallery.errorDefault')}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-bronze-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-bronze-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('common.tryAgain')}
        </button>
      )}
    </div>
  );
}

/**
 * Shown when no gallery albums are available yet.
 */
function GalleryEmptyState() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-bronze-200 bg-bronze-50 px-6 py-24 text-center">
      <div
        aria-hidden="true"
        className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-bronze-400 shadow-sm ring-1 ring-bronze-100"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <path d="M2.25 15.75 7.5 10.5l3 3L13.5 9l4.5 6M21 6.75A2.25 2.25 0 0 0 18.75 4.5h-13.5A2.25 2.25 0 0 0 3 6.75v10.5A2.25 2.25 0 0 0 5.25 19.5h13.5A2.25 2.25 0 0 0 21 17.25V6.75Z" />
          <circle cx="8.25" cy="9" r="1.5" />
        </svg>
      </div>
      <p className="text-base font-medium text-charcoal-950">
        {t('gallery.emptyTitle', { org: settings.organizationName })}
      </p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-charcoal-500">
        {t('gallery.emptyDesc')}
      </p>
    </div>
  );
}

/**
 * Album Viewer Modal (Full-photo viewer).
 * Displays large photo, title, current position (1 / 10), Previous, Next, and Close controls.
 * Supports keyboard navigation (Left, Right, Escape) and locks background scrolling.
 */
function AlbumViewerModal({ album, onClose }) {
  const { t } = useLanguage();
  // Sort photos by order; fallback to cover image if photos list is empty
  const rawPhotos = album.photos && album.photos.length > 0 ? album.photos : [];
  const sortedPhotos = [...rawPhotos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const photos =
    sortedPhotos.length > 0
      ? sortedPhotos
      : album.coverImage
        ? [{ imageUrl: album.coverImage, caption: album.title }]
        : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoErrorIndex, setPhotoErrorIndex] = useState(null);
  const isPhotoError = photoErrorIndex === currentIndex;

  const totalPhotos = photos.length;
  const currentPhoto = photos[currentIndex];

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPhotos - 1));
  }, [totalPhotos]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalPhotos - 1 ? prev + 1 : 0));
  }, [totalPhotos]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  // Lock body scroll while modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('gallery.modalAria', { title: album.title })}
      className="fixed inset-0 z-50 flex flex-col bg-charcoal-950/95 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      {/* Header Bar */}
      <div
        className="flex items-center justify-between border-b border-charcoal-800 bg-charcoal-950/80 px-4 py-3 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0 pr-4">
          {album.category && (
            <span className="hidden sm:inline-block rounded-full bg-bronze-900/60 px-2.5 py-0.5 text-xs font-semibold text-bronze-300 ring-1 ring-inset ring-bronze-700/60 shrink-0">
              {album.category}
            </span>
          )}
          <h2 className="text-sm sm:text-base font-bold text-white truncate">
            {album.title}
          </h2>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {totalPhotos > 0 && (
            <span className="rounded-full bg-charcoal-800 px-3 py-1 text-xs font-medium text-charcoal-300">
              {currentIndex + 1} / {totalPhotos}
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label={t('gallery.closeModal')}
            className="rounded-lg bg-charcoal-800 p-1.5 text-charcoal-300 hover:bg-charcoal-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-bronze-400"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden p-2 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        {totalPhotos > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label={t('gallery.prevPhoto')}
            className="absolute left-2 sm:left-6 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-charcoal-900/80 text-white shadow-lg backdrop-blur-xs transition hover:bg-bronze-600 focus:outline-none focus:ring-2 focus:ring-bronze-400"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Current Large Photo */}
        {currentPhoto?.imageUrl && !isPhotoError ? (
          <div className="flex h-full w-full items-center justify-center">
            <img
              src={currentPhoto.imageUrl}
              alt={`${album.title} - photo ${currentIndex + 1}`}
              decoding="async"
              onError={() => setPhotoErrorIndex(currentIndex)}
              className="max-h-[68vh] sm:max-h-[75vh] max-w-full w-auto h-auto object-contain rounded-lg shadow-2xl select-none"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-charcoal-400 p-8">
            <svg className="h-12 w-12 text-charcoal-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">{t('gallery.noImageForPhoto')}</p>
          </div>
        )}

        {/* Next Button */}
        {totalPhotos > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label={t('gallery.nextPhoto')}
            className="absolute right-2 sm:right-6 z-10 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-charcoal-900/80 text-white shadow-lg backdrop-blur-xs transition hover:bg-bronze-600 focus:outline-none focus:ring-2 focus:ring-bronze-400"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {totalPhotos > 1 && (
        <div
          className="border-t border-charcoal-800 bg-charcoal-950/80 px-4 py-2.5 sm:px-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 max-w-full">
            {photos.map((photo, index) => {
              const isSelected = index === currentIndex;
              return (
                <button
                  key={photo._id || `${photo.imageUrl}-${index}`}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={t('gallery.jumpToPhoto', { index: index + 1 })}
                  className={`relative aspect-[4/3] h-11 sm:h-13 shrink-0 overflow-hidden rounded-md border bg-charcoal-900 transition-all ${
                    isSelected
                      ? 'border-bronze-400 ring-2 ring-bronze-400/80 opacity-100 scale-105'
                      : 'border-charcoal-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo.imageUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="h-full w-full object-contain"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Gallery() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  async function loadAlbums() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchGalleryAlbums();
      setAlbums(data || []);
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
    <main>
      <SEO
        title="Gallery"
        description={`Browse photos from ${settings.organizationName}'s activities, educational programmes, rural school visits, and community relief initiatives.`}
      />
      {/* Page header */}
      <header className="bg-bronze-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
            <h1 className="text-4xl font-bold tracking-tight text-charcoal-950 sm:text-5xl">
              {t('gallery.title')}
            </h1>
            <p className="mt-6 text-base leading-8 text-charcoal-700 sm:text-lg">
              {t('gallery.subhead', { org: settings.organizationName })}
            </p>
          </div>
        </div>
      </header>

      {/* Gallery Section */}
      <section
        aria-labelledby="gallery-section-title"
        className="bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div aria-hidden="true" className="mb-6 h-1 w-14 rounded-full bg-bronze-500" />
              <h2
                id="gallery-section-title"
                className="text-3xl font-bold tracking-tight text-charcoal-950 sm:text-4xl"
              >
                {t('gallery.albumsHeading')}
              </h2>
              <p className="mt-4 text-base leading-8 text-charcoal-700 sm:text-lg">
                {t('gallery.albumsSubhead', { org: settings.organizationName })}
              </p>
            </div>

            {!loading && !error && albums.length > 0 && (
              <span className="text-sm font-medium text-charcoal-500 shrink-0">
                {albums.length} {albums.length === 1 ? t('gallery.singleAlbum') : t('gallery.multipleAlbums')}
              </span>
            )}
          </div>

          <div className="mt-10">
            {/* Loading State */}
            {loading && <GalleryLoadingSkeleton />}

            {/* Error State */}
            {!loading && error && (
              <GalleryErrorState error={error} onRetry={loadAlbums} />
            )}

            {/* Empty State */}
            {!loading && !error && albums.length === 0 && <GalleryEmptyState />}

            {/* Success State — Albums Grid */}
            {!loading && !error && albums.length > 0 && (
              <div
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                aria-label={t('gallery.albumsAriaLabel', { org: settings.organizationName })}
              >
                {albums.map((album) => (
                  <AlbumCard
                    key={album._id}
                    album={album}
                    onClick={setSelectedAlbum}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Album Viewer Modal */}
      {selectedAlbum && (
        <AlbumViewerModal
          album={selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
        />
      )}
    </main>
  );
}

export default Gallery;
