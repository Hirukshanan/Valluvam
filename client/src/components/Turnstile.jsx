import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/**
 * Cloudflare Turnstile component configured in Invisible Mode.
 *
 * Runs challenge execution invisibly in the background.
 * Exposes an `execute()` method returning a Promise that resolves with
 * a fresh security token when the form is submitted.
 */
const Turnstile = forwardRef(function Turnstile(
  {
    siteKey,
    onSuccess,
    onExpire,
    onError,
    action = 'contact_form',
  },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const tokenRef = useRef('');
  const pendingPromiseRef = useRef(null);

  // Trigger invisible challenge and return Promise resolving with fresh token
  const executeChallenge = () => {
    return new Promise((resolve, reject) => {
      tokenRef.current = '';

      if (pendingPromiseRef.current) {
        if (pendingPromiseRef.current.timeout) {
          clearTimeout(pendingPromiseRef.current.timeout);
        }
        pendingPromiseRef.current = null;
      }

      const timeout = setTimeout(() => {
        if (pendingPromiseRef.current) {
          pendingPromiseRef.current = null;
          reject(new Error('Security verification timed out. Please try again.'));
        }
      }, 10000);

      pendingPromiseRef.current = { resolve, reject, timeout };

      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
          window.turnstile.execute(widgetIdRef.current);
        } catch (err) {
          clearTimeout(timeout);
          pendingPromiseRef.current = null;
          reject(err);
        }
      }
    });
  };

  // Reset widget and invalidate token
  const resetWidget = () => {
    tokenRef.current = '';
    if (pendingPromiseRef.current) {
      if (pendingPromiseRef.current.timeout) {
        clearTimeout(pendingPromiseRef.current.timeout);
      }
      pendingPromiseRef.current = null;
    }
    if (widgetIdRef.current !== null && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (err) {
        console.warn('Error resetting Turnstile widget:', err);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    execute: executeChallenge,
    reset: resetWidget,
    getToken: () => tokenRef.current,
    getWidgetId: () => widgetIdRef.current,
  }));

  useEffect(() => {
    let isMounted = true;

    if (!siteKey) {
      console.warn('Turnstile site key is missing. Please configure VITE_TURNSTILE_SITE_KEY.');
      return;
    }

    function renderWidget() {
      if (!isMounted || !containerRef.current || !window.turnstile) return;

      if (widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }

      containerRef.current.innerHTML = '';

      try {
        // Official Cloudflare Turnstile Invisible Configuration
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          size: 'invisible',
          execution: 'execute',
          action,
          callback: (token) => {
            if (!isMounted) return;
            onSuccess?.(token);

            if (pendingPromiseRef.current) {
              if (pendingPromiseRef.current.timeout) {
                clearTimeout(pendingPromiseRef.current.timeout);
              }
              const resolve = pendingPromiseRef.current.resolve;
              pendingPromiseRef.current = null;
              tokenRef.current = '';
              resolve(token);
            } else {
              tokenRef.current = token;
            }
          },
          'expired-callback': () => {
            if (!isMounted) return;
            tokenRef.current = '';
            onExpire?.();

            if (widgetIdRef.current !== null && window.turnstile) {
              try {
                window.turnstile.reset(widgetIdRef.current);
              } catch {}
            }
          },
          'error-callback': (code) => {
            if (!isMounted) return;
            tokenRef.current = '';
            onError?.(code);

            if (pendingPromiseRef.current) {
              if (pendingPromiseRef.current.timeout) {
                clearTimeout(pendingPromiseRef.current.timeout);
              }
              pendingPromiseRef.current.reject(
                new Error('Security verification failed. Please try again.')
              );
              pendingPromiseRef.current = null;
            }
          },
        });

        widgetIdRef.current = id;

        // If execution was queued before render completed, trigger execute now
        if (pendingPromiseRef.current) {
          try {
            window.turnstile.execute(id);
          } catch (execErr) {
            if (pendingPromiseRef.current.timeout) {
              clearTimeout(pendingPromiseRef.current.timeout);
            }
            pendingPromiseRef.current.reject(execErr);
            pendingPromiseRef.current = null;
          }
        }
      } catch (err) {
        console.error('Error rendering invisible Turnstile widget:', err);
        if (pendingPromiseRef.current) {
          if (pendingPromiseRef.current.timeout) {
            clearTimeout(pendingPromiseRef.current.timeout);
          }
          pendingPromiseRef.current.reject(err);
          pendingPromiseRef.current = null;
        }
      }
    }

    let script = document.getElementById(TURNSTILE_SCRIPT_ID);

    if (window.turnstile) {
      renderWidget();
    } else if (script) {
      const handleLoad = () => renderWidget();
      script.addEventListener('load', handleLoad);
      return () => {
        script.removeEventListener('load', handleLoad);
      };
    } else {
      script = document.createElement('script');
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SRC;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (isMounted) {
          renderWidget();
        }
      };

      script.onerror = () => {
        if (isMounted && pendingPromiseRef.current) {
          if (pendingPromiseRef.current.timeout) {
            clearTimeout(pendingPromiseRef.current.timeout);
          }
          pendingPromiseRef.current.reject(
            new Error('Failed to load security verification. Please check your connection.')
          );
          pendingPromiseRef.current = null;
        }
      };

      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
      if (pendingPromiseRef.current) {
        if (pendingPromiseRef.current.timeout) {
          clearTimeout(pendingPromiseRef.current.timeout);
        }
        pendingPromiseRef.current = null;
      }
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, action, onSuccess, onExpire, onError]);

  // Cloudflare Turnstile invisible widget renders here without any visual UI
  return <div ref={containerRef} aria-hidden="true" />;
});

export default Turnstile;
