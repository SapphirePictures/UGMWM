// IndexedDB wrapper for larger storage capacity (vs localStorage's 5-10MB limit)

const DB_NAME = 'ChurchEventsDB';
const STORE_NAME = 'events';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

// Image transformation utilities for Supabase Storage
export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Transform Supabase storage URL with image optimization parameters
 * @param url - Original Supabase storage URL or any image URL
 * @param options - Transformation options (width, height, quality, format, resize mode)
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  url: string | undefined,
  options: ImageTransformOptions = {}
): string => {
  if (!url) return '';

  // Don't transform base64 data URLs
  if (url.startsWith('data:')) {
    return url;
  }

  // Check if it's a Supabase storage URL
  const isSupabaseUrl = url.includes('.supabase.co/storage/v1/object/public/');
  
  if (!isSupabaseUrl) {
    // For external URLs (Unsplash, etc.), return as-is
    return url;
  }

  // Parse the URL to get the bucket and path
  const urlParts = url.split('/storage/v1/object/public/');
  if (urlParts.length < 2) return url;

  const baseUrl = urlParts[0];
  const [bucketRaw, ...pathPartsRaw] = urlParts[1].split('/');

  // Encode bucket and path segments (decode first to avoid double-encoding pre-encoded %20, etc.)
  const bucket = encodeURIComponent(decodeURIComponent(bucketRaw));
  const path = pathPartsRaw
    .map((p) => encodeURIComponent(decodeURIComponent(p)))
    .join('/');

  // Build transformation URL
  const transformUrl = `${baseUrl}/storage/v1/render/image/public/${bucket}/${path}`;
  
  // Build query parameters
  const params = new URLSearchParams();
  
  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.quality) params.append('quality', options.quality.toString());
  if (options.format) params.append('format', options.format);
  if (options.resize) params.append('resize', options.resize);

  const queryString = params.toString();
  return queryString ? `${transformUrl}?${queryString}` : transformUrl;
};

/**
 * Get responsive image URLs for different screen sizes
 * @param url - Original image URL
 * @returns Object with URLs for different viewport sizes
 */
export const getResponsiveImageUrls = (url: string | undefined) => {
  if (!url) return {
    mobile: '',
    tablet: '',
    desktop: '',
    thumbnail: ''
  };

  return {
    thumbnail: getOptimizedImageUrl(url, { width: 150, height: 150, quality: 75, format: 'webp', resize: 'cover' }),
    mobile: getOptimizedImageUrl(url, { width: 640, quality: 80, format: 'webp' }),
    tablet: getOptimizedImageUrl(url, { width: 1024, quality: 85, format: 'webp' }),
    desktop: getOptimizedImageUrl(url, { width: 1920, quality: 85, format: 'webp' }),
    original: url
  };
};

/**
 * Generate srcset attribute for responsive images
 * @param url - Original image URL
 * @returns srcset string for use in img tags
 */
export const getImageSrcSet = (url: string | undefined): string => {
  if (!url) return '';
  
  // Don't generate srcset for non-Supabase URLs or base64 data URLs
  const isSupabaseUrl = url.includes('.supabase.co/storage/v1/object/public/');
  const isDataUrl = url.startsWith('data:');
  
  if (!isSupabaseUrl || isDataUrl) {
    return '';
  }
  
  const urls = getResponsiveImageUrls(url);
  return `${urls.mobile} 640w, ${urls.tablet} 1024w, ${urls.desktop} 1920w`;
};

// Initialize IndexedDB
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// Get all events from IndexedDB
export const getAllEvents = async (): Promise<any[]> => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting events from IndexedDB:', error);
    // Fallback to localStorage
    const stored = localStorage.getItem('churchEvents');
    return stored ? JSON.parse(stored) : [];
  }
};

// Save all events to IndexedDB
export const saveAllEvents = async (events: any[]): Promise<void> => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing data
    await new Promise((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve(true);
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Add all events
    for (const event of events) {
      await new Promise((resolve, reject) => {
        const addRequest = store.put(event);
        addRequest.onsuccess = () => resolve(true);
        addRequest.onerror = () => reject(addRequest.error);
      });
    }

    // Also save to localStorage as backup (without large media)
    const lightweightEvents = events.map(e => ({
      ...e,
      media: e.media?.filter((m: any) => !m.url.startsWith('data:')) || [],
      image: e.image?.startsWith('data:') ? '' : e.image,
    }));
    localStorage.setItem('churchEvents', JSON.stringify(lightweightEvents));
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
    throw error;
  }
};

// Delete an event from IndexedDB
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(eventId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error deleting from IndexedDB:', error);
    throw error;
  }
};

// Migrate data from localStorage to IndexedDB
export const migrateFromLocalStorage = async (): Promise<void> => {
  try {
    const stored = localStorage.getItem('churchEvents');
    if (stored) {
      const events = JSON.parse(stored);
      await saveAllEvents(events);
      console.log('Migration from localStorage to IndexedDB complete');
    }
  } catch (error) {
    console.error('Error migrating from localStorage:', error);
  }
};

// Supabase configuration
const SUPABASE_PROJECT_ID = 'jhbpbopvzcxbfgyemhpa';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoYnBib3B2emN4YmZneWVtaHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTA3MDQsImV4cCI6MjA3OTE4NjcwNH0.KiAGv6PaE1b0Sl9FPs8-2DM9M2A88YJjPBkr13c0G0Y';
const SUPABASE_API_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-9f158f76`;

// Clear browser-only events cache (safe: does not touch Supabase data)
export const clearEventsBrowserCache = async (): Promise<void> => {
  try {
    const database = await initDB();
    await new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Could not clear IndexedDB cache:', error);
  }

  localStorage.removeItem('churchEvents');
};

// Sync events with Supabase backend
export const syncEventsWithSupabase = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${SUPABASE_API_URL}/events`, {
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn('Supabase backend not available, using local cache');
      return await getAllEvents();
    }

    const data = await response.json();
    const supabaseEvents = data.events || [];

    // Save to IndexedDB as cache
    await saveAllEvents(supabaseEvents);
    
    return supabaseEvents;
  } catch (error) {
    console.error('Error syncing with Supabase:', error);
    // Fallback to local cache
    return await getAllEvents();
  }
};

// Create event in Supabase and sync to IndexedDB
export const createEventWithSync = async (eventData: any): Promise<any> => {
  try {
    const response = await fetch(`${SUPABASE_API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: 'no-store',
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error('Failed to create event on server');
    }

    const result = await response.json();
    const newEvent = result.event;

    // Also save to local IndexedDB cache
    const allEvents = await getAllEvents();
    await saveAllEvents([...allEvents, newEvent]);

    return newEvent;
  } catch (error) {
    console.error('Error creating event with sync:', error);
    // Fallback to local-only creation
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const event = {
      id,
      createdAt: now,
      updatedAt: now,
      ...eventData,
    };
    
    const allEvents = await getAllEvents();
    await saveAllEvents([...allEvents, event]);
    
    return event;
  }
};

// Update event in Supabase and sync to IndexedDB
export const updateEventWithSync = async (eventId: string, eventData: any): Promise<any> => {
  try {
    const response = await fetch(`${SUPABASE_API_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: 'no-store',
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error('Failed to update event on server');
    }

    const result = await response.json();
    const updatedEvent = result.event;

    // Also update in local IndexedDB cache
    const allEvents = await getAllEvents();
    const updatedEvents = allEvents.map(e => e.id === eventId ? updatedEvent : e);
    await saveAllEvents(updatedEvents);

    return updatedEvent;
  } catch (error) {
    console.error('Error updating event with sync:', error);
    // Fallback to local-only update
    const allEvents = await getAllEvents();
    const updatedEvents = allEvents.map(e => 
      e.id === eventId ? { ...e, ...eventData, updatedAt: new Date().toISOString() } : e
    );
    await saveAllEvents(updatedEvents);
    
    return updatedEvents.find(e => e.id === eventId);
  }
};

// Delete event from Supabase and IndexedDB
export const deleteEventWithSync = async (eventId: string): Promise<void> => {
  try {
    const response = await fetch(`${SUPABASE_API_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to delete event on server');
    }

    // Also delete from local IndexedDB cache
    await deleteEvent(eventId);
  } catch (error) {
    console.error('Error deleting event with sync:', error);
    // Fallback to local-only deletion
    await deleteEvent(eventId);
  }
};
