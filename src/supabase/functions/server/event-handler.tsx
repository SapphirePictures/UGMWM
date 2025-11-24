import * as kv from './kv_store.tsx';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  imageUrl?: string;
  registrationRequired: boolean;
  registrationLink?: string;
  createdAt: string;
  updatedAt: string;
}

// Create event
export async function createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const event: Event = {
    id,
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  
  await kv.set(`event:${id}`, event);
  
  const index = await kv.get('event:index') || [];
  index.push(id);
  await kv.set('event:index', index);
  
  return event;
}

// Get all events
export async function getAllEvents(): Promise<Event[]> {
  const index = await kv.get('event:index') || [];
  const events = await kv.mget(index.map((id: string) => `event:${id}`));
  return events.filter(Boolean).sort((a: Event, b: Event) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

// Get event by ID
export async function getEventById(id: string): Promise<Event | null> {
  return await kv.get(`event:${id}`);
}

// Update event
export async function updateEvent(id: string, data: Partial<Event>) {
  const existing = await getEventById(id);
  if (!existing) {
    throw new Error('Event not found');
  }
  
  const updated: Event = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  await kv.set(`event:${id}`, updated);
  return updated;
}

// Delete event
export async function deleteEvent(id: string) {
  const event = await getEventById(id);
  if (!event) {
    throw new Error('Event not found');
  }
  
  await kv.del(`event:${id}`);
  
  const index = await kv.get('event:index') || [];
  const newIndex = index.filter((eventId: string) => eventId !== id);
  await kv.set('event:index', newIndex);
  
  return { success: true };
}

// Get upcoming events
export async function getUpcomingEvents(): Promise<Event[]> {
  const allEvents = await getAllEvents();
  const now = new Date();
  
  return allEvents.filter((event: Event) => {
    const eventDate = new Date(event.date);
    return eventDate >= now;
  });
}
