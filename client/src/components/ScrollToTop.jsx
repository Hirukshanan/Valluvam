import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollToTop component
 *
 * Centralized route-scroll mechanism for public pages.
 * Automatically scrolls the window to the top whenever the route changes.
 *
 * Requirements & Features:
 * - Scrolls to top on standard navigation (PUSH and REPLACE).
 * - Preserves native browser scroll position when navigating back/forward (POP).
 * - Preserves intentional anchor/hash navigation (e.g. #section-id).
 * - Does not interfere with modals, form inputs, or internal element scrolling.
 */
function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // 1. If an anchor/hash is present in the URL, scroll to that element
    if (hash) {
      const id = hash.replace(/^#/, '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      // If element is not in DOM yet (e.g. async/mounting content), retry shortly
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    // 2. On browser Back / Forward (POP), let the browser's native scroll restoration take effect
    if (navType === 'POP') {
      return;
    }

    // 3. For all normal route changes (PUSH or REPLACE), scroll to the top immediately
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname, hash, key, navType]);

  return null;
}

export default ScrollToTop;
