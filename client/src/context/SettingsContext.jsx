import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPublicSettings } from '../services/settingsService';

// Verified default Valluvam organization settings
export const DEFAULT_SETTINGS = {
  organizationName: 'Valluvam',
  slogan: 'Let all your thoughts be set on high aspirations',
  establishedDate: '28 March 2025',
  email: 'valluvamofficial@gmail.com',
  location: 'Pandiruppu, Kalmunai, Ampara District, Sri Lanka',
  facebookUrl: 'https://www.facebook.com/share/1Hw92m6QP2/',
  instagramUrl: 'https://www.instagram.com/valluvam_official_?stkn=bHRjMzZiNzc4ZTZr',
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: false,
  error: null,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicSettings();
      if (data) {
        setSettings({
          organizationName: data.organizationName?.trim() || DEFAULT_SETTINGS.organizationName,
          slogan: data.slogan?.trim() || DEFAULT_SETTINGS.slogan,
          establishedDate: data.establishedDate?.trim() || DEFAULT_SETTINGS.establishedDate,
          email: data.email?.trim() || DEFAULT_SETTINGS.email,
          location: data.location?.trim() || DEFAULT_SETTINGS.location,
          facebookUrl: data.facebookUrl?.trim() || DEFAULT_SETTINGS.facebookUrl,
          instagramUrl: data.instagramUrl?.trim() || DEFAULT_SETTINGS.instagramUrl,
        });
      }
    } catch (err) {
      console.warn('Settings API unavailable; using verified fallback settings:', err.message);
      setError(err);
      // Keep DEFAULT_SETTINGS
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        refreshSettings: loadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  return (
    context || {
      settings: DEFAULT_SETTINGS,
      loading: false,
      error: null,
      refreshSettings: async () => {},
    }
  );
}
