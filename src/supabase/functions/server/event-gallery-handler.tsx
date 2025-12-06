import * as kv from './kv_store.tsx';

const GALLERY_KEY = 'event_galleries';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

interface EventGallery {
  id: string;
  eventName: string;
  eventDate: string;
  description: string;
  coverImage?: string;
  media: MediaItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all event galleries
 */
export async function getAllEventGalleries(): Promise<EventGallery[]> {
  try {
    const galleries = await kv.get(GALLERY_KEY);
    return galleries || [];
  } catch (error) {
    console.error('Error fetching event galleries:', error);
    return [];
  }
}

/**
 * Get event gallery by ID
 */
export async function getEventGalleryById(id: string): Promise<EventGallery | null> {
  try {
    const galleries = await getAllEventGalleries();
    return galleries.find((g: EventGallery) => g.id === id) || null;
  } catch (error) {
    console.error('Error fetching event gallery:', error);
    return null;
  }
}

/**
 * Create new event gallery
 */
export async function createEventGallery(data: Omit<EventGallery, 'id' | 'createdAt' | 'updatedAt'>): Promise<EventGallery> {
  try {
    const galleries = await getAllEventGalleries();
    
    const newGallery: EventGallery = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    galleries.push(newGallery);
    await kv.set(GALLERY_KEY, galleries);
    
    console.log('Event gallery created:', newGallery.id);
    return newGallery;
  } catch (error) {
    console.error('Error creating event gallery:', error);
    throw error;
  }
}

/**
 * Update event gallery
 */
export async function updateEventGallery(
  id: string,
  data: Partial<Omit<EventGallery, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<EventGallery> {
  try {
    const galleries = await getAllEventGalleries();
    const index = galleries.findIndex((g: EventGallery) => g.id === id);
    
    if (index === -1) {
      throw new Error('Event gallery not found');
    }
    
    const updatedGallery: EventGallery = {
      ...galleries[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    galleries[index] = updatedGallery;
    await kv.set(GALLERY_KEY, galleries);
    
    console.log('Event gallery updated:', id);
    return updatedGallery;
  } catch (error) {
    console.error('Error updating event gallery:', error);
    throw error;
  }
}

/**
 * Delete event gallery
 */
export async function deleteEventGallery(id: string): Promise<void> {
  try {
    const galleries = await getAllEventGalleries();
    const filteredGalleries = galleries.filter((g: EventGallery) => g.id !== id);
    
    if (filteredGalleries.length === galleries.length) {
      throw new Error('Event gallery not found');
    }
    
    await kv.set(GALLERY_KEY, filteredGalleries);
    console.log('Event gallery deleted:', id);
  } catch (error) {
    console.error('Error deleting event gallery:', error);
    throw error;
  }
}
