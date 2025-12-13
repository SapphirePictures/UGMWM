import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Trash2, Edit, Image as ImageIcon, Loader2, Calendar, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { createClient } from '@supabase/supabase-js';

const apiBase = `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76`;
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

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

export function AdminEventGalleryPage() {
  const [galleries, setGalleries] = useState<EventGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGallery, setEditingGallery] = useState<EventGallery | null>(null);
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    description: '',
    coverImage: '',
  });
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCaption, setNewMediaCaption] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const EVENT_GALLERY_BUCKET = 'event-gallery';

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/event-galleries`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Supabase responded with ${res.status}`);
      }

      const data = await res.json();
      const remote = data?.galleries || [];
      const sorted = remote.sort(
        (a: EventGallery, b: EventGallery) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      );
      setGalleries(sorted);
      localStorage.setItem('eventGalleries', JSON.stringify(sorted));
    } catch (error) {
      console.warn('Falling back to cached galleries:', error);
      const cached = localStorage.getItem('eventGalleries');
      if (cached) {
        const parsed = JSON.parse(cached);
        const sorted = parsed.sort(
          (a: EventGallery, b: EventGallery) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
        );
        setGalleries(sorted);
      } else {
        toast.error('Failed to load event galleries');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (gallery?: EventGallery) => {
    if (gallery) {
      setEditingGallery(gallery);
      setFormData({
        eventName: gallery.eventName,
        eventDate: gallery.eventDate,
        description: gallery.description,
        coverImage: gallery.coverImage || '',
      });
      setMediaItems(gallery.media || []);
    } else {
      setEditingGallery(null);
      setFormData({
        eventName: '',
        eventDate: '',
        description: '',
        coverImage: '',
      });
      setMediaItems([]);
    }
    setShowModal(true);
  };

  const handleAddMedia = () => {
    if (!newMediaUrl.trim()) {
      toast.error('Please enter a media URL');
      return;
    }

    const newItem: MediaItem = {
      id: Date.now().toString(),
      type: newMediaType,
      url: newMediaUrl,
      caption: newMediaCaption || undefined,
    };

    setMediaItems([...mediaItems, newItem]);
    setNewMediaUrl('');
    setNewMediaCaption('');
    toast.success('Media item added');
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems(mediaItems.filter(item => item.id !== id));
    toast.success('Media item removed');
  };

  const handleSaveGallery = async () => {
    if (!formData.eventName || !formData.eventDate) {
      toast.error('Please fill in event name and date');
      return;
    }

    if (mediaItems.length === 0) {
      toast.error('Please add at least one photo or video');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        media: mediaItems,
      };

      const endpoint = editingGallery
        ? `${apiBase}/event-galleries/${editingGallery.id}`
        : `${apiBase}/event-galleries`;

      const res = await fetch(endpoint, {
        method: editingGallery ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Supabase responded with ${res.status}`);
      }

      const data = await res.json();
      const updated = data?.gallery as EventGallery | undefined;

      if (updated) {
        const nextGalleries = editingGallery
          ? galleries.map(g => (g.id === updated.id ? updated : g))
          : [...galleries, updated];
        setGalleries(nextGalleries);
        localStorage.setItem('eventGalleries', JSON.stringify(nextGalleries));
      }

      toast.success(editingGallery ? 'Gallery updated successfully' : 'Gallery created successfully');

      setShowModal(false);
      fetchGalleries();
    } catch (error) {
      console.error('Error saving gallery:', error);
      toast.error('Failed to save gallery');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event gallery?')) return;

    try {
      const res = await fetch(`${apiBase}/event-galleries/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Supabase responded with ${res.status}`);
      }

      const updatedGalleries = galleries.filter(g => g.id !== id);
      setGalleries(updatedGalleries);
      localStorage.setItem('eventGalleries', JSON.stringify(updatedGalleries));

      toast.success('Gallery deleted successfully');
      fetchGalleries();
    } catch (error) {
      console.error('Error deleting gallery:', error);
      toast.error('Failed to delete gallery');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Montserrat'] text-3xl text-[var(--wine)] mb-2">
            Event Galleries
          </h1>
          <p className="text-gray-600 font-['Merriweather']">
            Manage photos and videos from church events
          </p>
        </div>
        <Button
          type="button"
          onClick={() => handleOpenModal()}
          className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event Gallery
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--wine)]" />
        </div>
      ) : galleries.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="font-['Montserrat'] text-xl text-gray-700 mb-2">No Event Galleries Yet</h3>
          <p className="text-gray-500 font-['Merriweather'] mb-6">
            Start by adding photos and videos from your first event
          </p>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event Gallery
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <Card key={gallery.id} className="overflow-hidden rounded-2xl hover:shadow-lg transition-shadow">
              {gallery.coverImage ? (
                <img
                  src={gallery.coverImage}
                  alt={gallery.eventName}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)] flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-white opacity-50" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-['Merriweather']">
                    {new Date(gallery.eventDate).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">
                  {gallery.eventName}
                </h3>
                <p className="text-gray-600 font-['Merriweather'] text-sm mb-4 line-clamp-2">
                  {gallery.description}
                </p>
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                  <ImageIcon className="w-4 h-4" />
                  <span className="font-['Montserrat']">
                    {gallery.media?.filter(m => m.type === 'image').length || 0} photos
                  </span>
                  <Video className="w-4 h-4 ml-2" />
                  <span className="font-['Montserrat']">
                    {gallery.media?.filter(m => m.type === 'video').length || 0} videos
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenModal(gallery)}
                    variant="outline"
                    className="flex-1 font-['Montserrat']"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteGallery(gallery.id)}
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 font-['Montserrat']"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Montserrat'] text-2xl text-[var(--wine)]">
              {editingGallery ? 'Edit Event Gallery' : 'Add New Event Gallery'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Manage photos and videos for your event
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)]">Event Information</h3>
              
              <div>
                <Label htmlFor="eventName" className="font-['Montserrat']">
                  Event Name *
                </Label>
                <Input
                  id="eventName"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  placeholder="e.g., Women's Conference 2024"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="eventDate" className="font-['Montserrat']">
                  Event Date *
                </Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description" className="font-['Montserrat']">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the event"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="coverImage" className="font-['Montserrat']">
                  Cover Image URL
                </Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be the main image displayed for the gallery
                </p>
              </div>
            </div>

            {/* Media Items */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)]">Photos & Videos</h3>
              
              {/* Add Media Form */}
              <Card className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="font-['Montserrat'] mb-2 block">Media Type</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={newMediaType === 'image'}
                          onChange={() => setNewMediaType('image')}
                          className="w-4 h-4"
                        />
                        <span className="font-['Montserrat']">Photo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={newMediaType === 'video'}
                          onChange={() => setNewMediaType('video')}
                          className="w-4 h-4"
                        />
                        <span className="font-['Montserrat']">Video</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept={newMediaType === 'image' ? 'image/*' : 'video/*'}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setIsUploading(true);
                        const loadingToast = toast.loading('Uploading to Supabase...');
                        try {
                          const fileExt = file.name.split('.').pop();
                          const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
                          const path = `event-gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt || 'file'}`;
                          const { error: uploadError } = await supabase.storage
                            .from(EVENT_GALLERY_BUCKET)
                            .upload(path, file, {
                              cacheControl: '3600',
                              upsert: false,
                            });

                          if (uploadError) {
                            throw uploadError;
                          }

                          const { data: publicData } = supabase.storage
                            .from(EVENT_GALLERY_BUCKET)
                            .getPublicUrl(path);

                          const publicUrl = publicData?.publicUrl;
                          if (!publicUrl) {
                            throw new Error('Could not resolve public URL');
                          }

                          const newItem: MediaItem = {
                            id: Date.now().toString(),
                            type: newMediaType,
                            url: publicUrl,
                            caption: newMediaCaption || sanitizedName,
                          };

                          setMediaItems((prev) => [...prev, newItem]);
                          setNewMediaUrl('');
                          setNewMediaCaption('');
                          toast.success('Uploaded and added to gallery');
                        } catch (uploadErr) {
                          console.error('Upload failed:', uploadErr);
                          toast.error('Upload failed. Is the "event-gallery" bucket public?');
                        } finally {
                          toast.dismiss(loadingToast);
                          setIsUploading(false);
                          e.target.value = '';
                        }
                      }}
                      disabled={isUploading}
                    />
                    {isUploading && <Loader2 className="w-5 h-5 animate-spin text-[var(--wine)]" />}
                  </div>
                  <p className="text-xs text-gray-500">
                    Uploads go to Supabase storage bucket "event-gallery". For videos, prefer links if files are large.
                  </p>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-50 text-gray-500 font-['Montserrat']">OR</span>
                    </div>
                  </div>

                  <Input
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder={newMediaType === 'image' ? 'Image URL (https://...)' : 'Video URL (YouTube, Vimeo, etc.)'}
                  />
                  <Input
                    value={newMediaCaption}
                    onChange={(e) => setNewMediaCaption(e.target.value)}
                    placeholder="Caption (optional)"
                  />
                  <Button
                    onClick={handleAddMedia}
                    type="button"
                    className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
                    disabled={isUploading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {newMediaType === 'image' ? 'Photo' : 'Video'}
                  </Button>
                </div>
              </Card>

              {/* Media List */}
              {mediaItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-['Montserrat']">
                    {mediaItems.length} item{mediaItems.length !== 1 ? 's' : ''} added
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mediaItems.map((item) => (
                      <Card key={item.id} className="p-3 flex items-start gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          {item.type === 'image' ? (
                            <ImageIcon className="w-6 h-6 text-gray-600" />
                          ) : (
                            <Video className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-['Montserrat'] text-[var(--wine)] truncate">
                            {item.caption || 'No caption'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{item.url}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveMedia(item.id)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleSaveGallery}
                disabled={isSaving}
                className="flex-1 bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{editingGallery ? 'Update Gallery' : 'Create Gallery'}</>
                )}
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex-1 font-['Montserrat']"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
