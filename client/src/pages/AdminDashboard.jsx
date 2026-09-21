import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-bronze-50/40">
      {/* Top bar */}
      <header className="border-b border-bronze-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-lg font-semibold text-charcoal-900">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-charcoal-600">
              {user?.name || 'Admin'}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-charcoal-200 px-3 py-1.5 text-sm font-medium text-charcoal-700 transition-colors hover:bg-charcoal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Placeholder content */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-charcoal-800">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-sm text-charcoal-500">
            Dashboard features will be added in a future stage.
          </p>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

