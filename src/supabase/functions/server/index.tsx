import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { saveVolunteerApplication, getAllVolunteerApplications, sendEmailNotification, sendToGoogleSheets } from './volunteer-handler.tsx';
import { createSermon, getAllSermons, getSermonById, updateSermon, deleteSermon, initializeSermonBucket } from './sermon-handler.tsx';
import { createResource, getAllResources, getResourceById, updateResource, deleteResource, initializeResourceBucket, incrementDownloadCount } from './resource-handler.tsx';
import { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, getUpcomingEvents } from './event-handler.tsx';
import homepageEventHandler from './homepage-event-handler.tsx';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Initialize storage buckets on startup
initializeSermonBucket();
initializeResourceBucket();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Health check
app.get('/make-server-9f158f76/health', (c) => {
  return c.json({ status: 'ok', message: 'Server is running' });
});

// Submit volunteer application
app.post('/make-server-9f158f76/volunteer/submit', async (c) => {
  try {
    const data = await c.req.json();
    
    // Validate required fields
    if (!data.fullName || !data.email || !data.phone || !data.selectedUnit) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Save to database
    const application = await saveVolunteerApplication(data);
    
    // Send email notification (non-blocking)
    sendEmailNotification(application).catch(err => {
      console.error('Email notification error:', err);
    });
    
    // Send to Google Sheets (non-blocking)
    sendToGoogleSheets(application).catch(err => {
      console.error('Google Sheets error:', err);
    });
    
    return c.json({ 
      success: true, 
      message: 'Application submitted successfully',
      applicationId: application.id 
    });
  } catch (error) {
    console.error('Error submitting volunteer application:', error);
    return c.json({ error: 'Failed to submit application', details: error.message }, 500);
  }
});

// Get all volunteer applications
app.get('/make-server-9f158f76/volunteer/applications', async (c) => {
  try {
    const applications = await getAllVolunteerApplications();
    return c.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching volunteer applications:', error);
    return c.json({ error: 'Failed to fetch applications', details: error.message }, 500);
  }
});

// Admin password management routes
app.post('/make-server-9f158f76/admin/get-password', async (c) => {
  try {
    let password = await kv.get('admin_password');
    
    // If no password exists, set default password
    if (!password) {
      const defaultPassword = 'ugm-admin-2024';
      await kv.set('admin_password', defaultPassword);
      password = defaultPassword;
    }
    
    return c.json({ success: true, password });
  } catch (error) {
    console.error('Error getting admin password:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-9f158f76/admin/change-password', async (c) => {
  try {
    const { currentPassword, newPassword } = await c.req.json();
    
    // Get current stored password
    let storedPassword = await kv.get('admin_password');
    
    // If no password exists, set default
    if (!storedPassword) {
      storedPassword = 'ugm-admin-2024';
      await kv.set('admin_password', storedPassword);
    }
    
    // Verify current password
    if (currentPassword !== storedPassword) {
      return c.json({ success: false, error: 'Current password is incorrect' }, 401);
    }
    
    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return c.json({ success: false, error: 'New password must be at least 8 characters' }, 400);
    }
    
    // Update password
    await kv.set('admin_password', newPassword);
    
    console.log('Admin password changed successfully');
    return c.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing admin password:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== SERMON ROUTES =====

// Get all sermons (public)
app.get('/make-server-9f158f76/sermons', async (c) => {
  try {
    console.log('Fetching all sermons...');
    const sermons = await getAllSermons();
    console.log(`Found ${sermons.length} sermons`);
    return c.json({ success: true, sermons });
  } catch (error) {
    console.error('Error fetching sermons in route handler:', error);
    // Return empty array instead of error to prevent frontend crashes
    return c.json({ success: true, sermons: [] });
  }
});

// Get sermon by ID (public)
app.get('/make-server-9f158f76/sermons/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const sermon = await getSermonById(id);
    if (!sermon) {
      return c.json({ error: 'Sermon not found' }, 404);
    }
    return c.json({ success: true, sermon });
  } catch (error) {
    console.error('Error fetching sermon:', error);
    return c.json({ error: 'Failed to fetch sermon', details: error.message }, 500);
  }
});

// Create sermon (admin)
app.post('/make-server-9f158f76/sermons', async (c) => {
  try {
    const data = await c.req.json();
    const sermon = await createSermon(data);
    return c.json({ success: true, sermon });
  } catch (error) {
    console.error('Error creating sermon:', error);
    return c.json({ error: 'Failed to create sermon', details: error.message }, 500);
  }
});

// Update sermon (admin)
app.put('/make-server-9f158f76/sermons/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    const sermon = await updateSermon(id, data);
    return c.json({ success: true, sermon });
  } catch (error) {
    console.error('Error updating sermon:', error);
    return c.json({ error: 'Failed to update sermon', details: error.message }, 500);
  }
});

// Delete sermon (admin)
app.delete('/make-server-9f158f76/sermons/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await deleteSermon(id);
    return c.json({ success: true, message: 'Sermon deleted successfully' });
  } catch (error) {
    console.error('Error deleting sermon:', error);
    return c.json({ error: 'Failed to delete sermon', details: error.message }, 500);
  }
});

// ===== RESOURCE ROUTES =====

// Get all resources (public)
app.get('/make-server-9f158f76/resources', async (c) => {
  try {
    const resources = await getAllResources();
    return c.json({ success: true, resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return c.json({ error: 'Failed to fetch resources', details: error.message }, 500);
  }
});

// Get resource by ID (public)
app.get('/make-server-9f158f76/resources/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const resource = await getResourceById(id);
    if (!resource) {
      return c.json({ error: 'Resource not found' }, 404);
    }
    return c.json({ success: true, resource });
  } catch (error) {
    console.error('Error fetching resource:', error);
    return c.json({ error: 'Failed to fetch resource', details: error.message }, 500);
  }
});

// Create resource (admin)
app.post('/make-server-9f158f76/resources', async (c) => {
  try {
    const data = await c.req.json();
    const resource = await createResource(data);
    return c.json({ success: true, resource });
  } catch (error) {
    console.error('Error creating resource:', error);
    return c.json({ error: 'Failed to create resource', details: error.message }, 500);
  }
});

// Update resource (admin)
app.put('/make-server-9f158f76/resources/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    const resource = await updateResource(id, data);
    return c.json({ success: true, resource });
  } catch (error) {
    console.error('Error updating resource:', error);
    return c.json({ error: 'Failed to update resource', details: error.message }, 500);
  }
});

// Delete resource (admin)
app.delete('/make-server-9f158f76/resources/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await deleteResource(id);
    return c.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return c.json({ error: 'Failed to delete resource', details: error.message }, 500);
  }
});

// Increment download count
app.post('/make-server-9f158f76/resources/:id/download', async (c) => {
  try {
    const id = c.req.param('id');
    await incrementDownloadCount(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error incrementing download count:', error);
    return c.json({ error: 'Failed to increment download count', details: error.message }, 500);
  }
});

// ===== EVENT ROUTES =====

// Get all events (public)
app.get('/make-server-9f158f76/events', async (c) => {
  try {
    const events = await getAllEvents();
    return c.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return c.json({ error: 'Failed to fetch events', details: error.message }, 500);
  }
});

// Get upcoming events (public)
app.get('/make-server-9f158f76/events/upcoming', async (c) => {
  try {
    const events = await getUpcomingEvents();
    return c.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return c.json({ error: 'Failed to fetch upcoming events', details: error.message }, 500);
  }
});

// Get event by ID (public)
app.get('/make-server-9f158f76/events/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const event = await getEventById(id);
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }
    return c.json({ success: true, event });
  } catch (error) {
    console.error('Error fetching event:', error);
    return c.json({ error: 'Failed to fetch event', details: error.message }, 500);
  }
});

// Create event (admin)
app.post('/make-server-9f158f76/events', async (c) => {
  try {
    const data = await c.req.json();
    const event = await createEvent(data);
    return c.json({ success: true, event });
  } catch (error) {
    console.error('Error creating event:', error);
    return c.json({ error: 'Failed to create event', details: error.message }, 500);
  }
});

// Update event (admin)
app.put('/make-server-9f158f76/events/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    const event = await updateEvent(id, data);
    return c.json({ success: true, event });
  } catch (error) {
    console.error('Error updating event:', error);
    return c.json({ error: 'Failed to update event', details: error.message }, 500);
  }
});

// Delete event (admin)
app.delete('/make-server-9f158f76/events/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await deleteEvent(id);
    return c.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return c.json({ error: 'Failed to delete event', details: error.message }, 500);
  }
});

// ===== HOMEPAGE EVENT ROUTES =====
app.route('/make-server-9f158f76/homepage-event', homepageEventHandler);

// ===== LIVE STREAM ROUTES =====
// Get live stream data
app.get('/make-server-9f158f76/live-stream/get', async (c) => {
  try {
    const liveStreamData = await kv.get('live_stream_settings');
    
    const defaultData = {
      isLive: false,
      youtubeUrl: '',
      scheduleText: 'Check back soon for our next live service!'
    };
    
    return c.json({
      success: true,
      data: liveStreamData || defaultData
    });
  } catch (error) {
    console.error('Error fetching live stream data:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch live stream data' 
    }, 500);
  }
});

// Update live stream data
app.post('/make-server-9f158f76/live-stream/update', async (c) => {
  try {
    const data = await c.req.json();
    
    // Validate data
    if (typeof data.isLive !== 'boolean') {
      return c.json({ error: 'Invalid isLive value' }, 400);
    }
    
    const liveStreamData = {
      isLive: data.isLive,
      youtubeUrl: data.youtubeUrl || '',
      scheduleText: data.scheduleText || 'Check back soon for our next live service!',
      updatedAt: new Date().toISOString()
    };
    
    await kv.set('live_stream_settings', liveStreamData);
    
    return c.json({
      success: true,
      message: 'Live stream settings updated successfully',
      data: liveStreamData
    });
  } catch (error) {
    console.error('Error updating live stream data:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update live stream data' 
    }, 500);
  }
});

Deno.serve(app.fetch);