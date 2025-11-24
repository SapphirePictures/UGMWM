import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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

// Save volunteer application to database
export async function saveVolunteerApplication(data: Omit<VolunteerApplication, 'id' | 'submittedAt'>) {
  const id = crypto.randomUUID();
  const submittedAt = new Date().toISOString();
  
  const application: VolunteerApplication = {
    id,
    submittedAt,
    ...data,
  };
  
  // Save to KV store
  await kv.set(`volunteer:${id}`, application);
  
  // Also save to an index for easy retrieval
  const index = await kv.get('volunteer:index') || [];
  index.push(id);
  await kv.set('volunteer:index', index);
  
  return application;
}

// Get all volunteer applications
export async function getAllVolunteerApplications(): Promise<VolunteerApplication[]> {
  const index = await kv.get('volunteer:index') || [];
  const applications = await kv.mget(index.map((id: string) => `volunteer:${id}`));
  return applications.filter(Boolean);
}

// Get volunteer application by ID
export async function getVolunteerApplicationById(id: string): Promise<VolunteerApplication | null> {
  return await kv.get(`volunteer:${id}`);
}

// Send email notification
export async function sendEmailNotification(application: VolunteerApplication) {
  const recipientEmail = Deno.env.get('CHURCH_NOTIFICATION_EMAIL');
  
  if (!recipientEmail) {
    console.log('No notification email configured. Skipping email notification.');
    return { success: false, message: 'No email configured' };
  }

  // Using a simple email service (you'll need to configure SMTP settings)
  const emailServiceUrl = 'https://api.resend.com/emails';
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    console.log('No Resend API key configured. Skipping email notification.');
    return { success: false, message: 'No email service configured' };
  }

  const emailBody = `
    <h2>New Volunteer Application</h2>
    <p>A new volunteer has applied to join a ministry unit.</p>
    
    <h3>Personal Information</h3>
    <ul>
      <li><strong>Name:</strong> ${application.fullName}</li>
      <li><strong>Email:</strong> ${application.email}</li>
      <li><strong>Phone:</strong> ${application.phone}</li>
      <li><strong>Address:</strong> ${application.address}</li>
      <li><strong>Date of Birth:</strong> ${application.dateOfBirth}</li>
      <li><strong>Gender:</strong> ${application.gender}</li>
    </ul>
    
    <h3>Ministry Selection</h3>
    <ul>
      <li><strong>Primary Choice:</strong> ${application.selectedUnit}</li>
      <li><strong>Second Choice:</strong> ${application.secondChoiceUnit || 'None'}</li>
    </ul>
    
    <h3>Availability</h3>
    <ul>
      <li><strong>Sunday Service:</strong> ${application.availableSunday ? 'Yes' : 'No'}</li>
      <li><strong>Tuesday Bible Study:</strong> ${application.availableTuesday ? 'Yes' : 'No'}</li>
      <li><strong>Thursday Miracle Hour:</strong> ${application.availableThursday ? 'Yes' : 'No'}</li>
      <li><strong>Preferred Frequency:</strong> ${application.preferredServiceTime}</li>
    </ul>
    
    <h3>Experience & Skills</h3>
    <ul>
      <li><strong>Previous Experience:</strong> ${application.previousExperience || 'None provided'}</li>
      <li><strong>Relevant Skills:</strong> ${application.relevantSkills || 'None provided'}</li>
    </ul>
    
    <h3>Spiritual Background</h3>
    <ul>
      <li><strong>Membership Status:</strong> ${application.membershipStatus}</li>
      <li><strong>Salvation Status:</strong> ${application.salvationStatus}</li>
      <li><strong>Baptism Status:</strong> ${application.baptismStatus}</li>
      <li><strong>Time Attending:</strong> ${application.howLongAttending}</li>
    </ul>
    
    <h3>Motivation</h3>
    <p>${application.reasonForJoining}</p>
    
    <h3>Emergency Contact</h3>
    <ul>
      <li><strong>Name:</strong> ${application.emergencyName}</li>
      <li><strong>Phone:</strong> ${application.emergencyPhone}</li>
      <li><strong>Relationship:</strong> ${application.emergencyRelationship}</li>
    </ul>
    
    <p><em>Submitted on ${new Date(application.submittedAt).toLocaleString()}</em></p>
  `;

  try {
    const response = await fetch(emailServiceUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Church Volunteer System <onboarding@resend.dev>',
        to: [recipientEmail],
        subject: `New Volunteer Application - ${application.fullName} (${application.selectedUnit})`,
        html: emailBody,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Email send failed:', error);
      return { success: false, message: 'Email send failed', error };
    }

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, message: 'Email error', error: error.message };
  }
}

// Send to Google Sheets
export async function sendToGoogleSheets(application: VolunteerApplication) {
  const sheetsApiKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');
  const spreadsheetId = Deno.env.get('GOOGLE_SPREADSHEET_ID');
  
  if (!sheetsApiKey || !spreadsheetId) {
    console.log('Google Sheets not configured. Skipping Google Sheets integration.');
    return { success: false, message: 'Google Sheets not configured' };
  }

  const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Volunteer Applications:append?valueInputOption=USER_ENTERED&key=${sheetsApiKey}`;
  
  const rowData = [
    new Date(application.submittedAt).toLocaleString(),
    application.fullName,
    application.email,
    application.phone,
    application.address,
    application.dateOfBirth,
    application.gender,
    application.selectedUnit,
    application.secondChoiceUnit,
    application.availableSunday ? 'Yes' : 'No',
    application.availableTuesday ? 'Yes' : 'No',
    application.availableThursday ? 'Yes' : 'No',
    application.preferredServiceTime,
    application.previousExperience,
    application.relevantSkills,
    application.membershipStatus,
    application.salvationStatus,
    application.baptismStatus,
    application.howLongAttending,
    application.reasonForJoining,
    application.emergencyName,
    application.emergencyPhone,
    application.emergencyRelationship,
  ];

  try {
    const response = await fetch(sheetsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Sheets append failed:', error);
      return { success: false, message: 'Google Sheets append failed', error };
    }

    return { success: true, message: 'Data sent to Google Sheets successfully' };
  } catch (error) {
    console.error('Google Sheets error:', error);
    return { success: false, message: 'Google Sheets error', error: error.message };
  }
}
