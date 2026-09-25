import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import OurWork from './pages/OurWork';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Volunteer from './pages/Volunteer';
import Support from './pages/Support';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEvents from './pages/AdminEvents';
import AdminGallery from './pages/AdminGallery';
import AdminTeam from './pages/AdminTeam';
import AdminVolunteers from './pages/AdminVolunteers';
import AdminMessages from './pages/AdminMessages';
import AdminSettings from './pages/AdminSettings';
import AdminSupport from './pages/AdminSupport';

function PublicLayout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/our-work" element={<OurWork />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/support" element={<Support />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <LanguageProvider>
              <Routes>
                {/* Admin login — no layout chrome */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Admin area — wrapped in layout + route protection */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="gallery" element={<AdminGallery />} />
                  <Route path="team" element={<AdminTeam />} />
                  <Route path="volunteers" element={<AdminVolunteers />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="support" element={<AdminSupport />} />
                </Route>

                {/* Public routes — with Navbar + Footer */}
                <Route path="/*" element={<PublicLayout />} />
              </Routes>
            </LanguageProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
