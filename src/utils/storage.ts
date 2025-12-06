// IndexedDB wrapper for larger storage capacity (vs localStorage's 5-10MB limit)

const DB_NAME = 'ChurchEventsDB';
const STORE_NAME = 'events';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

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
