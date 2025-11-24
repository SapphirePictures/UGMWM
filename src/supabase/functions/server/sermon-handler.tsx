import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const BUCKET_NAME = 'make-9f158f76-sermons';

// Initialize storage bucket
export async function initializeSermonBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 524288000, // 500MB
      });
      console.log('Sermon bucket created successfully');
    }
  } catch (error) {
    console.error('Error initializing sermon bucket:', error);
  }
}

interface Sermon {
  id: string;
  title: string;
  description: string;
  speaker: string;
  date: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

// Create sermon
export async function createSermon(data: Omit<Sermon, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const sermon: Sermon = {
    id,
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  
  await kv.set(`sermon:${id}`, sermon);
  
  const index = await kv.get('sermon:index') || [];
  index.push(id);
  await kv.set('sermon:index', index);
  
  return sermon;
}

// Get all sermons
export async function getAllSermons(): Promise<Sermon[]> {
  try {
    const index = await kv.get('sermon:index') || [];
    if (index.length === 0) {
      console.log('No sermons found in index, returning empty array');
      return [];
    }
    const sermons = await kv.mget(index.map((id: string) => `sermon:${id}`));
    return sermons.filter(Boolean).sort((a: Sermon, b: Sermon) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Error in getAllSermons:', error);
    return []; // Return empty array on error instead of throwing
  }
}

// Get sermon by ID
export async function getSermonById(id: string): Promise<Sermon | null> {
  return await kv.get(`sermon:${id}`);
}

// Update sermon
export async function updateSermon(id: string, data: Partial<Sermon>) {
  const existing = await getSermonById(id);
  if (!existing) {
    throw new Error('Sermon not found');
  }
  
  const updated: Sermon = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  await kv.set(`sermon:${id}`, updated);
  return updated;
}

// Delete sermon
export async function deleteSermon(id: string) {
  const sermon = await getSermonById(id);
  if (!sermon) {
    throw new Error('Sermon not found');
  }
  
  // Delete from storage if video exists
  if (sermon.videoUrl) {
    const fileName = sermon.videoUrl.split('/').pop();
    if (fileName) {
      await supabase.storage.from(BUCKET_NAME).remove([fileName]);
    }
  }
  
  await kv.del(`sermon:${id}`);
  
  const index = await kv.get('sermon:index') || [];
  const newIndex = index.filter((sermonId: string) => sermonId !== id);
  await kv.set('sermon:index', newIndex);
  
  return { success: true };
}

// Upload sermon video
export async function uploadSermonVideo(file: File, sermonId: string) {
  const fileName = `${sermonId}-${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file);
  
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  // Get signed URL (valid for 1 year)
  const { data: signedUrl } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(fileName, 31536000);
  
  return signedUrl?.signedUrl || '';
}