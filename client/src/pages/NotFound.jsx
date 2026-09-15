import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-bronze-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-charcoal-900 mb-2">
          Page Not Found
        </h2>
        <p className="text-charcoal-500 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-bronze-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-bronze-600 transition-colors duration-200"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;

