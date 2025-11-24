import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

const HOMEPAGE_EVENT_KEY = 'homepage-event';

// GET homepage event
app.get('/', async (c) => {
  try {
    const event = await kv.get(HOMEPAGE_EVENT_KEY);
    
    // Return default event if none exists
    if (!event) {
      return c.json({
        event: {
          title: 'Annual Thanksgiving Service 2024',
          description: 'Join us for a special time of worship, thanksgiving, and testimonies as we celebrate God\'s goodness and faithfulness throughout the year.',
          date: 'December 15, 2024',
          time: '8:00 AM - 2:00 PM',
        },
      });
    }

    return c.json({ event });
  } catch (error) {
    console.error('Error fetching homepage event:', error);
    return c.json({ error: 'Failed to fetch homepage event' }, 500);
  }
});

// POST/UPDATE homepage event
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, date, time } = body;

    // Validation
    if (!title || !description || !date || !time) {
      return c.json(
        { error: 'Missing required fields: title, description, date, and time are required' },
        400
      );
    }

    const event = {
      title: title.trim(),
      description: description.trim(),
      date: date.trim(),
      time: time.trim(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(HOMEPAGE_EVENT_KEY, event);

    return c.json({ success: true, event });
  } catch (error) {
    console.error('Error saving homepage event:', error);
    return c.json({ error: 'Failed to save homepage event' }, 500);
  }
});

export default app;
