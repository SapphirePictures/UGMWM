import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { AboutPage } from './components/AboutPage';
import { EventsPage } from './components/EventsPage';
import { AllEventsPage } from './components/AllEventsPage';
import { EventGalleryPage } from './components/EventGalleryPage';
import { EventDetailPage } from './components/EventDetailPage';
import { SermonsPage } from './components/SermonsPage';
import { ServiceTimesPage } from './components/ServiceTimesPage';
import { GivingPage } from './components/GivingPage';
import { JoinUnitPage } from './components/JoinUnitPage';
import { AdminVolunteersPage } from './components/AdminVolunteersPage';
import { SetupInstructionsPage } from './components/SetupInstructionsPage';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ResourcesPage } from './components/ResourcesPage';
import { WatchLivePage } from './components/WatchLivePage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [preSelectedUnit, setPreSelectedUnit] = useState<string | undefined>(undefined);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Handle URL hash changes on load and when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the '#' symbol
      if (hash) {
        handleNavigate(hash);
      }
    };

    // Check for hash on initial load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleNavigate = (page: string) => {
    // Check if page has query parameters (e.g., "join-unit?unit=choir")
    if (page.includes('?')) {
      const [pageName, queryString] = page.split('?');
      const params = new URLSearchParams(queryString);
      const unit = params.get('unit');
      
      if (unit) {
        setPreSelectedUnit(unit);
      }
      setCurrentPage(pageName);
      // Update URL hash
      window.location.hash = page;
    } else {
      setPreSelectedUnit(undefined);
      setCurrentPage(page);
      // Update URL hash
      window.location.hash = page;
    }
    
    // Scroll to top of page on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    // Check if trying to access admin pages without login
    const adminPages = ['admin-volunteers', 'setup-instructions', 'temporary-dashboard'];
    if (adminPages.includes(currentPage) && !isAdminLoggedIn) {
      return <AdminLoginPage onNavigate={handleNavigate} onLogin={() => setIsAdminLoggedIn(true)} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'events':
        return <EventsPage onNavigate={handleNavigate} />;
      case 'all-events':
        return <AllEventsPage onNavigate={handleNavigate} />;
      case 'event-gallery':
        return <EventGalleryPage onNavigate={handleNavigate} />;
      case 'sermons':
        return <SermonsPage onNavigate={handleNavigate} />;
      case 'service-times':
        return <ServiceTimesPage onNavigate={handleNavigate} />;
      case 'giving':
        return <GivingPage onNavigate={handleNavigate} />;
      case 'join-unit':
        return <JoinUnitPage onNavigate={handleNavigate} preSelectedUnit={preSelectedUnit} />;
      case 'you-are-unlimited':
        return <AdminLoginPage onNavigate={handleNavigate} onLogin={() => setIsAdminLoggedIn(true)} />;
      case 'temporary-dashboard':
        return <AdminDashboard key={`admin-dashboard-${Date.now()}`} onNavigate={handleNavigate} onLogout={() => setIsAdminLoggedIn(false)} />;
      case 'admin-volunteers':
        return <AdminVolunteersPage onNavigate={handleNavigate} onLogout={() => setIsAdminLoggedIn(false)} />;
      case 'setup-instructions':
        return <SetupInstructionsPage onNavigate={handleNavigate} onLogout={() => setIsAdminLoggedIn(false)} />;
      case 'resources':
        return <ResourcesPage onNavigate={handleNavigate} />;
      case 'watch-live':
        return <WatchLivePage onNavigate={handleNavigate} />;
      default:
        // Handle event detail pages (event-detail-{id})
        if (currentPage.startsWith('event-detail-')) {
          const eventId = currentPage.replace('event-detail-', '');
          return <EventDetailPage eventId={eventId} onNavigate={handleNavigate} />;
        }
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      {renderPage()}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}