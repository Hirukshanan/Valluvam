import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import SEO from '../components/SEO';

function NotFound() {
  const { t } = useLanguage();
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <SEO
        title="Page Not Found"
        description={`The requested page could not be found on ${settings.organizationName}.`}
        robots="noindex, nofollow"
      />
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-bronze-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-charcoal-900 mb-2">
          {t('notFound.heading')}
        </h2>
        <p className="text-charcoal-500 mb-8">
          {t('notFound.message')}
        </p>
        <Link
          to="/"
          className="inline-block bg-bronze-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-bronze-600 transition-colors duration-200"
        >
          {t('notFound.backToHome')}
        </Link>
      </div>
    </div>
  );
}

export default NotFound;

