import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Key,
  Calendar,
  TrendingUp,
  Mail,
  FileText,
  ChevronRight,
  RefreshCw,
  Loader2,
  Video,
  Home,
  Radio,
  Image as ImageIcon
} from 'lucide-react';
import { AdminVolunteersPage } from './AdminVolunteersPage';
import { SetupInstructionsPage } from './SetupInstructionsPage';
import { AdminSermonsPage } from './AdminSermonsPage';
import { AdminResourcesPage } from './AdminResourcesPage';
import { AdminEventsPage } from './AdminEventsPage';
import { AdminHomepageEventPage } from './AdminHomepageEventPage';
import { AdminLiveStreamPage } from './AdminLiveStreamPage';
import { AdminEventGalleryPage } from './AdminEventGalleryPage';
import { ChangePasswordModal } from './ChangePasswordModal';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    totalApplications: 0,
    recentApplications: 0,
    emailsSent: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Reset to overview when component mounts or forceReset changes
  useEffect(() => {
    setActiveSection('overview');
  }, []);

  // Fetch statistics
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/volunteer/applications`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      const volunteers = data.applications || [];

      // Calculate statistics
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentCount = volunteers.filter((v: any) => {
        const submittedDate = new Date(v.submittedAt);
        return submittedDate >= sevenDaysAgo;
      }).length;

      setStats({
        totalApplications: volunteers.length,
        recentApplications: recentCount,
        emailsSent: volunteers.length, // Assuming all get notification emails
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      toast.success('Logged out successfully');
      if (onLogout) {
        onLogout();
      }
      if (onNavigate) {
        onNavigate('home');
      }
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'homepage-events', label: 'Homepage Event', icon: Home },
    { id: 'live-stream', label: 'Live Stream', icon: Radio },
    { id: 'volunteers', label: 'Volunteer Applications', icon: Users },
    { id: 'setup', label: 'Setup Instructions', icon: Settings },
    { id: 'sermons', label: 'Sermons', icon: Video },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'event-gallery', label: 'Event Gallery', icon: ImageIcon },
  ];

  const desktopNavBase =
    "relative flex items-center gap-2 px-3 py-2 rounded-full text-sm font-['Montserrat'] transition-all after:absolute after:left-3 after:right-3 after:bottom-1 after:h-0.5 after:scale-x-0 after:origin-left after:bg-[var(--gold)] after:transition-transform after:duration-200";

  const getDesktopNavClass = (sectionId: string) => {
    const isActive = activeSection === sectionId;
    if (isActive) {
      return `${desktopNavBase} bg-[var(--wine)] text-white shadow-sm after:scale-x-100`;
    }
    return `${desktopNavBase} bg-gray-100 text-gray-700 hover:bg-gray-200 hover:after:scale-x-100`;
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render different sections based on active selection
  const renderContent = () => {
    if (activeSection === 'volunteers') {
      return <AdminVolunteersPage onNavigate={onNavigate} onLogout={onLogout} />;
    }

    if (activeSection === 'setup') {
      return <SetupInstructionsPage onNavigate={onNavigate} onLogout={onLogout} />;
    }

    if (activeSection === 'sermons') {
      return <AdminSermonsPage onNavigate={onNavigate} onLogout={onLogout} />;
    }

    if (activeSection === 'resources') {
      return <AdminResourcesPage onNavigate={onNavigate} onLogout={onLogout} />;
    }

    if (activeSection === 'events') {
      return <AdminEventsPage onNavigate={onNavigate} onLogout={onLogout} />;
    }

    if (activeSection === 'homepage-events') {
      return <AdminHomepageEventPage onNavigate={onNavigate} onLogout={onLogout} />;
    }

    if (activeSection === 'live-stream') {
      return <AdminLiveStreamPage onNavigate={onNavigate} onLogout={onLogout} />;
    }

    if (activeSection === 'event-gallery') {
      return <AdminEventGalleryPage />;
    }

    // Overview Dashboard
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-['Montserrat'] text-3xl text-[var(--wine)] mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 font-['Merriweather']">
            Welcome to the Unlimited Grace and Mercy Worldwide Mission admin panel
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-t-4 border-[var(--wine)] rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 font-['Merriweather'] text-sm mb-1">
                  Total Applications
                </p>
                {isLoadingStats ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--wine)]" />
                ) : (
                  <h3 className="font-['Montserrat'] text-3xl text-[var(--wine)]">
                    {stats.totalApplications}
                  </h3>
                )}
              </div>
              <div className="w-12 h-12 bg-[var(--wine)]/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-[var(--wine)]" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-['Montserrat']">All time</span>
            </div>
          </Card>

          <Card className="p-6 border-t-4 border-[var(--gold)] rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 font-['Merriweather'] text-sm mb-1">
                  Recent (7 days)
                </p>
                {isLoadingStats ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--gold)]" />
                ) : (
                  <h3 className="font-['Montserrat'] text-3xl text-[var(--wine)]">
                    {stats.recentApplications}
                  </h3>
                )}
              </div>
              <div className="w-12 h-12 bg-[var(--gold)]/10 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[var(--gold)]" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[var(--gold)]" />
              <span className="text-gray-600 font-['Montserrat']">Last 7 days</span>
            </div>
          </Card>

          <Card className="p-6 border-t-4 border-green-600 rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 font-['Merriweather'] text-sm mb-1">
                  Email Notifications
                </p>
                {isLoadingStats ? (
                  <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                ) : (
                  <h3 className="font-['Montserrat'] text-3xl text-[var(--wine)]">
                    {stats.emailsSent}
                  </h3>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-green-600" />
              <span className="text-gray-600 font-['Montserrat']">Sent successfully</span>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className="p-6 hover:shadow-lg transition-all cursor-pointer rounded-2xl group"
              onClick={() => handleSectionChange('volunteers')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--wine)]/10 rounded-full flex items-center justify-center group-hover:bg-[var(--wine)] transition-colors">
                    <Users className="w-6 h-6 text-[var(--wine)] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-1">
                      View Volunteer Applications
                    </h3>
                    <p className="text-gray-600 font-['Merriweather'] text-sm">
                      Manage and review all volunteer submissions
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[var(--wine)] transition-colors" />
              </div>
            </Card>

            <Card
              className="p-6 hover:shadow-lg transition-all cursor-pointer rounded-2xl group"
              onClick={() => handleSectionChange('homepage-events')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                    <Home className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-1">
                      Homepage Event Card
                    </h3>
                    <p className="text-gray-600 font-['Merriweather'] text-sm">
                      Update the featured event on the homepage
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[var(--wine)] transition-colors" />
              </div>
            </Card>

            <Card
              className="p-6 hover:shadow-lg transition-all cursor-pointer rounded-2xl group"
              onClick={() => handleSectionChange('setup')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--gold)]/10 rounded-full flex items-center justify-center group-hover:bg-[var(--gold)] transition-colors">
                    <Settings className="w-6 h-6 text-[var(--gold)] group-hover:text-[var(--wine-dark)] transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-1">
                      Setup Instructions
                    </h3>
                    <p className="text-gray-600 font-['Merriweather'] text-sm">
                      Configure email and Google Sheets integration
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[var(--wine)] transition-colors" />
              </div>
            </Card>

            <Card
              className="p-6 hover:shadow-lg transition-all cursor-pointer rounded-2xl group"
              onClick={() => setShowPasswordModal(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <Key className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-1">
                      Change Password
                    </h3>
                    <p className="text-gray-600 font-['Merriweather'] text-sm">
                      Update your admin password
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[var(--wine)] transition-colors" />
              </div>
            </Card>

            <Card
              className="p-6 hover:shadow-lg transition-all cursor-pointer rounded-2xl group"
              onClick={fetchStats}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <RefreshCw className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-1">
                      Refresh Statistics
                    </h3>
                    <p className="text-gray-600 font-['Merriweather'] text-sm">
                      Update dashboard data
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[var(--wine)] transition-colors" />
              </div>
            </Card>
          </div>
        </div>

        {/* System Information */}
        <Card className="p-6 bg-gray-50 rounded-2xl">
          <h2 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-4">
            System Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600 font-['Merriweather']">Database Status</span>
              <span className="text-green-600 font-['Montserrat'] flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600 font-['Merriweather']">Email Notifications</span>
              <span className="text-green-600 font-['Montserrat'] flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600 font-['Merriweather']">Google Sheets Sync</span>
              <span className="text-green-600 font-['Montserrat'] flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Syncing
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 md:px-6 py-4">
            <div>
              <p className="font-['Montserrat'] text-lg text-[var(--wine)]">Admin Panel</p>
              <p className="text-gray-600 font-['Merriweather'] text-sm">Manage your church website</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[var(--wine)] text-[var(--wine)] hover:bg-[var(--wine)]/10"
                onClick={() => setShowPasswordModal(true)}
              >
                <Key className="w-4 h-4" />
                <span>Change Password</span>
              </Button>
              <Button
                className="flex items-center gap-2 bg-[var(--wine)] hover:bg-[var(--wine-dark)] text-white"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>

          <div className="px-4 md:px-6 pb-4 border-t border-gray-100">
            <div className="hidden lg:flex flex-wrap items-center gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={getDesktopNavClass(item.id)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-100 text-gray-800 font-['Montserrat']"
              >
                <span>{navigationItems.find((item) => item.id === activeSection)?.label || 'Select Section'}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-90' : ''}`} />
              </button>
              {isMobileMenuOpen && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSectionChange(item.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-['Montserrat'] transition-all ${
                          isActive
                            ? 'bg-[var(--wine)] text-white shadow-sm'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {renderContent()}
        </div>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}