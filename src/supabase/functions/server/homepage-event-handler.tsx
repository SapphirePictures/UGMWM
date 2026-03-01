import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

const HOMEPAGE_EVENT_KEY = 'homepage-event';

// GET homepage event
app.get('/', async (c) => {
  try {
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    c.header('Pragma', 'no-cache');
    c.header('Expires', '0');
    const event = await kv.get(HOMEPAGE_EVENT_KEY);
    
    // Return default event if none exists
    if (!event) {
      return c.json({
        event: {
          title: 'Annual Thanksgiving Service 2024',
          description: 'Join us for a special time of worship, thanksgiving, and testimonies as we celebrate God\'s goodness and faithfulness throughout the year.',
          date: 'December 15, 2024',
          time: '8:00 AM - 2:00 PM',
          isUpcoming: true,
          totalDays: 1,
          days: [
            {
              dayNumber: 1,
              title: '',
              content: '',
              bannerImage: '',
              liveDate: new Date().toISOString(),
              isManuallyLive: true,
            }
          ],
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
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    c.header('Pragma', 'no-cache');
    c.header('Expires', '0');
    const body = await c.req.json();
    const existingEvent = await kv.get(HOMEPAGE_EVENT_KEY);

    const title = (body?.title ?? existingEvent?.title ?? '').toString().trim();
    const description = (body?.description ?? existingEvent?.description ?? '').toString().trim();
    const date = (body?.date ?? existingEvent?.date ?? '').toString().trim();
    const time = (body?.time ?? existingEvent?.time ?? '').toString().trim();

    // Validation
    if (!title || !description || !date || !time) {
      return c.json(
        { error: 'Missing required fields: title, description, date, and time are required' },
        400
      );
    }

    const incomingDays = Array.isArray(body?.days) ? body.days : undefined;
    const existingDays = Array.isArray(existingEvent?.days) ? existingEvent.days : [];

    const computedTotalDays = Math.max(
      1,
      Number(body?.totalDays) || Number(existingEvent?.totalDays) || incomingDays?.length || existingDays.length || 1
    );

    const normalizedDays = Array.from({ length: computedTotalDays }, (_, index) => {
      const dayNumber = index + 1;
      const fromIncoming = incomingDays?.find((day: any) => Number(day?.dayNumber) === dayNumber);
      const fromExisting = existingDays.find((day: any) => Number(day?.dayNumber) === dayNumber);

      return {
        dayNumber,
        title: (fromIncoming?.title ?? fromExisting?.title ?? '').toString(),
        content: (fromIncoming?.content ?? fromExisting?.content ?? '').toString(),
        bannerImage: (fromIncoming?.bannerImage ?? fromExisting?.bannerImage ?? '').toString(),
        liveDate: (fromIncoming?.liveDate ?? fromExisting?.liveDate ?? new Date().toISOString()).toString(),
        isManuallyLive: Boolean(fromIncoming?.isManuallyLive ?? fromExisting?.isManuallyLive ?? false),
      };
    });

    const event = {
      title,
      description,
      date,
      time,
      isUpcoming:
        typeof body?.isUpcoming === 'boolean'
          ? body.isUpcoming
          : typeof existingEvent?.isUpcoming === 'boolean'
            ? existingEvent.isUpcoming
            : true,
      totalDays: computedTotalDays,
      days: normalizedDays,
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
