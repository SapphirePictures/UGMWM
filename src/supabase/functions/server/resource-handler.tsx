import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const BUCKET_NAME = 'make-9f158f76-resources';

// Initialize storage bucket
export async function initializeResourceBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 104857600, // 100MB
      });
      console.log('Resource bucket created successfully');
    }
  } catch (error) {
    console.error('Error initializing resource bucket:', error);
  }
}

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  thumbnailUrl?: string;
  price: number; // 0 for free
  isPaid: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Create resource
export async function createResource(data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount'>) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const resource: Resource = {
    id,
    createdAt: now,
    updatedAt: now,
    downloadCount: 0,
    ...data,
  };
  
  await kv.set(`resource:${id}`, resource);
  
  const index = await kv.get('resource:index') || [];
  index.push(id);
  await kv.set('resource:index', index);
  
  return resource;
}

// Get all resources
export async function getAllResources(): Promise<Resource[]> {
  const index = await kv.get('resource:index') || [];
  const resources = await kv.mget(index.map((id: string) => `resource:${id}`));
  return resources.filter(Boolean).sort((a: Resource, b: Resource) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Get resource by ID
export async function getResourceById(id: string): Promise<Resource | null> {
  return await kv.get(`resource:${id}`);
}

// Update resource
export async function updateResource(id: string, data: Partial<Resource>) {
  const existing = await getResourceById(id);
  if (!existing) {
    throw new Error('Resource not found');
  }
  
  const updated: Resource = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  await kv.set(`resource:${id}`, updated);
  return updated;
}

// Delete resource
export async function deleteResource(id: string) {
  const resource = await getResourceById(id);
  if (!resource) {
    throw new Error('Resource not found');
  }
  
  // Delete from storage
  const fileName = resource.fileUrl.split('/').pop();
  if (fileName) {
    await supabase.storage.from(BUCKET_NAME).remove([fileName]);
  }
  
  await kv.del(`resource:${id}`);
  
  const index = await kv.get('resource:index') || [];
  const newIndex = index.filter((resourceId: string) => resourceId !== id);
  await kv.set('resource:index', newIndex);
  
  return { success: true };
}

// Upload resource file
export async function uploadResourceFile(file: File, resourceId: string) {
  const fileName = `${resourceId}-${Date.now()}-${file.name}`;
  
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

// Increment download count
export async function incrementDownloadCount(id: string) {
  const resource = await getResourceById(id);
  if (resource) {
    resource.downloadCount += 1;
    await kv.set(`resource:${id}`, resource);
  }
}
