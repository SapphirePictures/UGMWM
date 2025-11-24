import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, Mail, FileSpreadsheet, CheckCircle, Copy } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SetupInstructionsPageProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function SetupInstructionsPage({ onNavigate, onLogout }: SetupInstructionsPageProps) {
  const handleBack = () => {
    if (onNavigate) {
      onNavigate('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

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
            Back to Home
          </button>
          <h1 className="font-['Montserrat'] text-4xl md:text-5xl mb-4">
            Integration Setup Instructions
          </h1>
          <p className="font-['Merriweather'] text-lg text-white/90">
            Configure email notifications and Google Sheets integration for volunteer applications
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Status */}
        <Card className="p-8 rounded-2xl border-2 border-[var(--gold)]">
          <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-4">
            <CheckCircle className="inline w-6 h-6 mr-2 text-green-600" />
            Database Setup Complete
          </h2>
          <p className="font-['Merriweather'] text-gray-700">
            ✅ Your Supabase database is connected and ready to store volunteer applications. All form submissions are automatically saved and can be viewed in the Admin Dashboard.
          </p>
        </Card>

        {/* Email Setup */}
        <Card className="p-8 rounded-2xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-[var(--wine)]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-[var(--wine)]" />
            </div>
            <div>
              <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-2">
                Email Notifications Setup
              </h2>
              <p className="font-['Merriweather'] text-gray-600">
                Receive instant email notifications when volunteers submit applications
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-4">
                Step 1: Get a Free Resend API Key
              </h3>
              <ol className="space-y-3 font-['Merriweather'] text-gray-700 list-decimal ml-6">
                <li>Visit <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-[var(--wine)] underline hover:no-underline">resend.com</a> and create a free account</li>
                <li>Go to <strong>API Keys</strong> in your dashboard</li>
                <li>Click <strong>Create API Key</strong></li>
                <li>Copy your API key (it starts with "re_")</li>
              </ol>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-4">
                Step 2: Configure Environment Variables
              </h3>
              <p className="font-['Merriweather'] text-gray-700 mb-4">
                You'll need to set these environment variables in your Supabase project:
              </p>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm text-gray-600 font-mono">RESEND_API_KEY</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard('RESEND_API_KEY', 'Variable name')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 font-['Merriweather']">Your Resend API key from Step 1</p>
                </div>

                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm text-gray-600 font-mono">CHURCH_NOTIFICATION_EMAIL</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard('CHURCH_NOTIFICATION_EMAIL', 'Variable name')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 font-['Merriweather']">Your church email address (e.g., unlimitedgraceandmercy@yahoo.com)</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="font-['Merriweather'] text-sm text-blue-900">
                <strong>Note:</strong> You can change the notification email address anytime by updating the CHURCH_NOTIFICATION_EMAIL environment variable. No code changes needed!
              </p>
            </div>
          </div>
        </Card>

        {/* Google Sheets Setup */}
        <Card className="p-8 rounded-2xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-[var(--wine)]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-[var(--wine)]" />
            </div>
            <div>
              <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-2">
                Google Sheets Integration
              </h2>
              <p className="font-['Merriweather'] text-gray-600">
                Automatically log volunteer applications to a Google Sheet
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-4">
                Step 1: Create a Google Sheet
              </h3>
              <ol className="space-y-3 font-['Merriweather'] text-gray-700 list-decimal ml-6">
                <li>Create a new Google Sheet</li>
                <li>Name the first sheet tab "Volunteer Applications"</li>
                <li>Add these column headers in row 1:
                  <div className="mt-2 bg-white p-3 rounded text-xs font-mono overflow-x-auto">
                    Submitted At | Full Name | Email | Phone | Address | Date of Birth | Gender | Primary Ministry | Second Choice | Available Sunday | Available Tuesday | Available Thursday | Preferred Frequency | Previous Experience | Relevant Skills | Membership Status | Salvation Status | Baptism Status | Time Attending | Reason for Joining | Emergency Contact Name | Emergency Contact Phone | Emergency Contact Relationship
                  </div>
                </li>
                <li>Copy the Spreadsheet ID from the URL (it's the long string between /d/ and /edit)</li>
              </ol>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-4">
                Step 2: Enable Google Sheets API
              </h3>
              <ol className="space-y-3 font-['Merriweather'] text-gray-700 list-decimal ml-6">
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-[var(--wine)] underline hover:no-underline">Google Cloud Console</a></li>
                <li>Create a new project or select an existing one</li>
                <li>Enable the <strong>Google Sheets API</strong></li>
                <li>Create credentials (API Key)</li>
                <li>Copy your API key</li>
                <li>Make sure your Google Sheet is set to "Anyone with the link can edit"</li>
              </ol>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-4">
                Step 3: Configure Environment Variables
              </h3>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm text-gray-600 font-mono">GOOGLE_SHEETS_API_KEY</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard('GOOGLE_SHEETS_API_KEY', 'Variable name')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 font-['Merriweather']">Your Google Cloud API key from Step 2</p>
                </div>

                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm text-gray-600 font-mono">GOOGLE_SPREADSHEET_ID</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard('GOOGLE_SPREADSHEET_ID', 'Variable name')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 font-['Merriweather']">The Spreadsheet ID from your Google Sheet URL</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-8 rounded-2xl bg-[var(--wine)] text-white">
          <h2 className="font-['Montserrat'] text-2xl mb-4">
            What Happens Next?
          </h2>
          <div className="space-y-3 font-['Merriweather']">
            <p className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>When someone submits a volunteer application, it's automatically saved to your Supabase database</span>
            </p>
            <p className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>If email is configured, you'll receive an instant notification with all application details</span>
            </p>
            <p className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>If Google Sheets is configured, a new row is automatically added to your spreadsheet</span>
            </p>
            <p className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>You can view and manage all applications through the Admin Dashboard</span>
            </p>
            <p className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Export all applications to CSV anytime for offline processing</span>
            </p>
          </div>
        </Card>

        {/* View Dashboard Button */}
        <div className="text-center pt-4 space-y-4">
          <Button
            onClick={() => onNavigate?.('admin-volunteers')}
            className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat'] px-8 py-6 text-lg"
          >
            View Admin Dashboard
          </Button>
          
          <div>
            <Button
              onClick={() => {
                if (onLogout) onLogout();
                if (onNavigate) onNavigate('home');
              }}
              variant="outline"
              className="font-['Montserrat'] border-[var(--wine)] text-[var(--wine)] hover:bg-[var(--wine)]/10"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}