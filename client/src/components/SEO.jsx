import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

const DEFAULT_ORIGIN = 'https://valluvam.org';

/**
 * Reusable SEO component for managing document head metadata across public pages:
 * - document.title
 * - <meta name="description">
 * - <meta name="robots">
 * - <meta property="og:title">
 * - <meta property="og:description">
 * - <meta property="og:type">
 * - <meta property="og:url">
 * - <meta property="og:image">
 */
export function SEO({ title, description, robots = 'index, follow', url, image }) {
  const { settings } = useSettings();
  const orgName = settings?.organizationName || 'Valluvam';

  useEffect(() => {
    // 1. Format and update document.title
    let fullTitle = '';
    if (!title) {
      fullTitle = `${orgName} — Nonprofit Organization`;
    } else if (title === orgName || title.includes(orgName)) {
      fullTitle = title;
    } else {
      fullTitle = `${title} | ${orgName}`;
    }
    document.title = fullTitle;

    // Helper to safely find or create a meta tag
    function setMeta(attribute, nameOrProperty, content) {
      if (!content) return;
      let el = document.head.querySelector(`meta[${attribute}="${nameOrProperty}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, nameOrProperty);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    }

    // 2. Update meta description
    const metaDesc =
      description ||
      `${orgName} is a registered nonprofit organization supporting students, families, and communities through education and social service.`;
    setMeta('name', 'description', metaDesc);

    // 3. Update meta robots
    setMeta('name', 'robots', robots);

    // 4. Update Open Graph tags for Facebook and WhatsApp sharing
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', metaDesc);
    setMeta('property', 'og:type', 'website');

    // 5. Update Open Graph URL & Image
    const currentOrigin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : DEFAULT_ORIGIN;

    const pageUrl =
      url ||
      (typeof window !== 'undefined' && window.location.href
        ? window.location.href
        : `${DEFAULT_ORIGIN}/`);
    setMeta('property', 'og:url', pageUrl);

    let pageImage = image || '/logo.jpg';
    if (!/^https?:\/\//i.test(pageImage)) {
      const cleanPath = pageImage.startsWith('/') ? pageImage : `/${pageImage}`;
      pageImage = `${currentOrigin}${cleanPath}`;
    }
    setMeta('property', 'og:image', pageImage);
  }, [title, description, robots, url, image, orgName]);

  return null;
}

export default SEO;
