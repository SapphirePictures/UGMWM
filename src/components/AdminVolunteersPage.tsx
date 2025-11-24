import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, Loader2, Download, RefreshCw, Mail, Phone, Calendar, LogOut, Key } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ChangePasswordModal } from './ChangePasswordModal';

interface VolunteerApplication {
  id: string;
  submittedAt: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  selectedUnit: string;
  secondChoiceUnit: string;
  availableSunday: boolean;
  availableTuesday: boolean;
  availableThursday: boolean;
  preferredServiceTime: string;
  previousExperience: string;
  relevantSkills: string;
  membershipStatus: string;
  salvationStatus: string;
  baptismStatus: string;
  howLongAttending: string;
  reasonForJoining: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  agreedToCommitment: boolean;
}

interface AdminVolunteersPageProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

const ministryUnits: { [key: string]: string } = {
  choir: 'Choir',
  ushering: 'Ushering',
  media: 'Media',
  prayer: 'Prayer Team',
  youth: 'Youth Ministry',
  outreach: 'Outreach',
};

export function AdminVolunteersPage({ onNavigate, onLogout }: AdminVolunteersPageProps) {
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<VolunteerApplication | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/volunteer/applications`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load volunteer applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleBack = () => {
    if (selectedApplication) {
      setSelectedApplication(null);
    } else if (onNavigate) {
      onNavigate('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const downloadAsCSV = () => {
    if (applications.length === 0) {
      toast.error('No applications to download');
      return;
    }

    const headers = [
      'Submitted At',
      'Full Name',
      'Email',
      'Phone',
      'Address',
      'Date of Birth',
      'Gender',
      'Primary Ministry',
      'Second Choice',
      'Available Sunday',
      'Available Tuesday',
      'Available Thursday',
      'Preferred Frequency',
      'Previous Experience',
      'Relevant Skills',
      'Membership Status',
      'Salvation Status',
      'Baptism Status',
      'Time Attending',
      'Reason for Joining',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Emergency Contact Relationship',
    ];

    const rows = applications.map((app) => [
      new Date(app.submittedAt).toLocaleString(),
      app.fullName,
      app.email,
      app.phone,
      app.address,
      app.dateOfBirth,
      app.gender,
      ministryUnits[app.selectedUnit] || app.selectedUnit,
      ministryUnits[app.secondChoiceUnit] || app.secondChoiceUnit || '',
      app.availableSunday ? 'Yes' : 'No',
      app.availableTuesday ? 'Yes' : 'No',
      app.availableThursday ? 'Yes' : 'No',
      app.preferredServiceTime,
      app.previousExperience,
      app.relevantSkills,
      app.membershipStatus,
      app.salvationStatus,
      app.baptismStatus,
      app.howLongAttending,
      app.reasonForJoining,
      app.emergencyName,
      app.emergencyPhone,
      app.emergencyRelationship,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volunteer-applications-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Applications downloaded successfully');
  };

  if (selectedApplication) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--wine)] to-[var(--wine-dark)] text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[var(--gold)] hover:text-white transition-colors mb-6 font-['Montserrat']"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Applications
            </button>
            <h1 className="font-['Montserrat'] text-4xl md:text-5xl mb-4">
              Application Details
            </h1>
            <p className="font-['Merriweather'] text-lg text-white/90">
              {selectedApplication.fullName} - {ministryUnits[selectedApplication.selectedUnit]}
            </p>
          </div>
        </div>

        {/* Application Details */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          {/* Personal Information */}
          <Card className="p-8 rounded-2xl">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-['Merriweather']">
              <div>
                <p className="text-gray-500 text-sm">Full Name</p>
                <p className="text-gray-900">{selectedApplication.fullName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${selectedApplication.email}`} className="text-[var(--wine)] hover:underline">
                    {selectedApplication.email}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                <p className="text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${selectedApplication.phone}`} className="text-[var(--wine)] hover:underline">
                    {selectedApplication.phone}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Date of Birth</p>
                <p className="text-gray-900">{selectedApplication.dateOfBirth || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Gender</p>
                <p className="text-gray-900 capitalize">{selectedApplication.gender || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Submitted</p>
                <p className="text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedApplication.submittedAt).toLocaleString()}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-500 text-sm">Address</p>
                <p className="text-gray-900">{selectedApplication.address || 'Not provided'}</p>
              </div>
            </div>
          </Card>

          {/* Ministry Selection */}
          <Card className="p-8 rounded-2xl">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Ministry Selection
            </h2>
            <div className="space-y-4 font-['Merriweather']">
              <div>
                <p className="text-gray-500 text-sm">Primary Choice</p>
                <p className="text-gray-900">{ministryUnits[selectedApplication.selectedUnit]}</p>
              </div>
              {selectedApplication.secondChoiceUnit && (
                <div>
                  <p className="text-gray-500 text-sm">Second Choice</p>
                  <p className="text-gray-900">{ministryUnits[selectedApplication.secondChoiceUnit]}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Availability */}
          <Card className="p-8 rounded-2xl">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Availability
            </h2>
            <div className="space-y-4 font-['Merriweather']">
              <div>
                <p className="text-gray-500 text-sm mb-2">Available Service Times</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedApplication.availableSunday ? 'bg-green-500' : 'bg-gray-300'}`} />
                    Sunday Service
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedApplication.availableTuesday ? 'bg-green-500' : 'bg-gray-300'}`} />
                    Tuesday Bible Study
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedApplication.availableThursday ? 'bg-green-500' : 'bg-gray-300'}`} />
                    Thursday Miracle Hour
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Preferred Frequency</p>
                <p className="text-gray-900 capitalize">{selectedApplication.preferredServiceTime || 'Not specified'}</p>
              </div>
            </div>
          </Card>

          {/* Experience & Skills */}
          <Card className="p-8 rounded-2xl">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Experience & Skills
            </h2>
            <div className="space-y-4 font-['Merriweather']">
              <div>
                <p className="text-gray-500 text-sm">Previous Experience</p>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.previousExperience || 'None provided'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Relevant Skills</p>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.relevantSkills || 'None provided'}</p>
              </div>
            </div>
          </Card>

          {/* Spiritual Background */}
          <Card className="p-8 rounded-2xl">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Spiritual Background
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-['Merriweather']">
              <div>
                <p className="text-gray-500 text-sm">Membership Status</p>
                <p className="text-gray-900 capitalize">{selectedApplication.membershipStatus?.replace(/-/g, ' ')}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Time Attending</p>
                <p className="text-gray-900 capitalize">{selectedApplication.howLongAttending?.replace(/-/g, ' ')}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Salvation Status</p>
                <p className="text-gray-900 capitalize">{selectedApplication.salvationStatus}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Baptism Status</p>
                <p className="text-gray-900 capitalize">{selectedApplication.baptismStatus}</p>
              </div>
            </div>
          </Card>

          {/* Motivation */}
          <Card className="p-8 rounded-2xl">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Motivation
            </h2>
            <p className="text-gray-900 font-['Merriweather'] whitespace-pre-wrap">
              {selectedApplication.reasonForJoining}
            </p>
          </Card>

          {/* Emergency Contact */}
          <Card className="p-8 rounded-2xl">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-['Merriweather']">
              <div>
                <p className="text-gray-500 text-sm">Contact Name</p>
                <p className="text-gray-900">{selectedApplication.emergencyName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Contact Phone</p>
                <p className="text-gray-900">{selectedApplication.emergencyPhone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Relationship</p>
                <p className="text-gray-900">{selectedApplication.emergencyRelationship || 'Not provided'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--wine)] to-[var(--wine-dark)] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[var(--gold)] hover:text-white transition-colors mb-6 font-['Montserrat']"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-['Montserrat'] text-4xl md:text-5xl mb-4">
                Volunteer Applications
              </h1>
              <p className="font-['Merriweather'] text-lg text-white/90">
                Manage and review ministry volunteer applications
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchApplications}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-['Montserrat']"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={downloadAsCSV}
                className="bg-[var(--gold)] text-[var(--wine)] hover:bg-[var(--gold)]/90 font-['Montserrat']"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={() => {
                  if (onLogout) onLogout();
                  if (onNavigate) onNavigate('home');
                }}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-['Montserrat']"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button
                onClick={() => setShowChangePasswordModal(true)}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-['Montserrat']"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[var(--wine)] animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <Card className="p-12 text-center rounded-2xl">
            <p className="text-gray-500 font-['Merriweather'] text-lg">
              No volunteer applications yet.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => (
              <Card
                key={app.id}
                className="p-6 rounded-2xl hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedApplication(app)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-2">
                      {app.fullName}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-['Merriweather']">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {app.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {app.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-4 py-2 bg-[var(--wine)]/10 text-[var(--wine)] rounded-full font-['Montserrat'] text-sm">
                      {ministryUnits[app.selectedUnit]}
                    </span>
                    <span className="text-sm text-gray-500 font-['Merriweather']">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}