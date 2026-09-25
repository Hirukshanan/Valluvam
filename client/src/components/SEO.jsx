import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

/**
 * Reusable SEO component for managing document head metadata across public pages:
 * - document.title
 * - <meta name="description">
 * - <meta name="robots">
 * - <meta property="og:title">
 * - <meta property="og:description">
 * - <meta property="og:type">
 */
export function SEO({ title, description, robots = 'index, follow' }) {
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

    // 4. Update Open Graph tags for rich previews
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', metaDesc);
    setMeta('property', 'og:type', 'website');
  }, [title, description, robots, orgName]);

  return null;
}

export default SEO;
