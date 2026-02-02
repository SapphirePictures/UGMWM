import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

const BANNER_IMAGES_KEY = 'homepage-banner-images';

// GET banner images
app.get('/', async (c) => {
  try {
    const images = await kv.get(BANNER_IMAGES_KEY);
    
    // Return empty array if no images exist
    if (!images) {
      return c.json({ images: [] });
    }

    return c.json({ images });
  } catch (error) {
    console.error('Error fetching banner images:', error);
    return c.json({ error: 'Failed to fetch banner images' }, 500);
  }
});

// POST/UPDATE banner images
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { images } = body;

    // Validation
    if (!Array.isArray(images)) {
      return c.json(
        { error: 'images must be an array' },
        400
      );
    }

    // Validate each image is a base64 string
    for (const img of images) {
      if (typeof img !== 'string' || !img.startsWith('data:image/')) {
        return c.json(
          { error: 'All images must be valid base64 data URLs' },
          400
        );
      }
    }

    // Store images
    await kv.set(BANNER_IMAGES_KEY, images);

    return c.json({
      success: true,
      message: 'Banner images saved successfully',
      count: images.length,
    });
  } catch (error) {
    console.error('Error saving banner images:', error);
    return c.json({ error: 'Failed to save banner images' }, 500);
  }
});

// DELETE all banner images
app.delete('/', async (c) => {
  try {
    await kv.del(BANNER_IMAGES_KEY);
    return c.json({
      success: true,
      message: 'All banner images deleted',
    });
  } catch (error) {
    console.error('Error deleting banner images:', error);
    return c.json({ error: 'Failed to delete banner images' }, 500);
  }
});

export default app;
