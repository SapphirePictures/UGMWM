import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, Edit, Calendar as CalendarIcon, Loader2, MapPin, Clock, Image as ImageIcon, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { getAllEvents, saveAllEvents, migrateFromLocalStorage } from '../utils/storage';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  displayDate?: string;
  time?: string;
  location?: string;
  category?: string;
  image?: string;
  media?: MediaItem[];
  registrationRequired?: boolean;
  registrationLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    displayDate: '',
    time: '',
    location: '',
    category: 'Service',
    image: '',
    registrationRequired: false,
    registrationLink: '',
  });
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCaption, setNewMediaCaption] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    initializeStorage();
  }, []);

  const initializeStorage = async () => {
    try {
      // Migrate from localStorage to IndexedDB if needed
      await migrateFromLocalStorage();
      await fetchEvents();
      toast.success('Using IndexedDB - Much larger storage capacity!', { duration: 3000 });
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const events = await getAllEvents();
      setEvents(events);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date,
        displayDate: event.displayDate || '',
        time: event.time || '',
        location: event.location || '',
        category: event.category || 'Service',
        image: event.image || '',
        registrationRequired: event.registrationRequired || false,
        registrationLink: event.registrationLink || '',
      });
      setMediaItems(event.media || []);
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        displayDate: '',
        time: '',
        location: '',
        category: 'Service',
        image: '',
        registrationRequired: false,
        registrationLink: '',
      });
      setMediaItems([]);
    }
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file');
      e.target.value = ''; // Reset input
      return;
    }

    // File size limits for IndexedDB storage
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const maxVideoSize = 10 * 1024 * 1024; // 10MB
    
    if (isImage && file.size > maxImageSize) {
      toast.error('Image is too large. Please use an image under 5MB or use a URL instead (recommended for better performance).');
      e.target.value = ''; // Reset input
      return;
    }
    
    if (isVideo && file.size > maxVideoSize) {
      toast.error('Video is too large. Please upload to YouTube/Vimeo and use the URL option instead.');
      e.target.value = ''; // Reset input
      return;
    }

    try {
      if (isImage) {
        setIsProcessingImage(true);
        const loadingToast = toast.loading('Processing image...', { duration: Infinity });
        
        // Aggressive compression for localStorage
        const img = new Image();
        const reader = new FileReader();
        
        reader.onerror = () => {
          toast.dismiss(loadingToast);
          toast.error('Failed to read image file');
          setIsProcessingImage(false);
          e.target.value = ''; // Reset input
        };
        
        reader.onload = (event) => {
          img.src = event.target?.result as string;
          
          img.onerror = () => {
            toast.dismiss(loadingToast);
            toast.error('Failed to load image. Please try a different file.');
            setIsProcessingImage(false);
            e.target.value = ''; // Reset input
          };
          
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              
              // More aggressive resizing - max 800px
              const maxDimension = 800;
              if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                  height = (height / width) * maxDimension;
                  width = maxDimension;
                } else {
                  width = (width / height) * maxDimension;
                  height = maxDimension;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                toast.dismiss(loadingToast);
                toast.error('Failed to process image');
                setIsProcessingImage(false);
                e.target.value = ''; // Reset input
                return;
              }
              
              ctx.drawImage(img, 0, 0, width, height);
              
              // More aggressive compression (0.6 quality)
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
              
              // Check final size
              const sizeInBytes = (compressedBase64.length * 3) / 4;
              const finalSizeMB = sizeInBytes / 1024 / 1024;
              
              toast.dismiss(loadingToast);
              
              if (finalSizeMB > 0.5) {
                toast.warning(`Image compressed to ${finalSizeMB.toFixed(2)}MB. Consider using a URL for better performance.`, { duration: 5000 });
              } else {
                toast.success(`✓ Image ready! (${finalSizeMB.toFixed(2)}MB) Add a caption and click "Add Photo"`);
              }
              
              setNewMediaUrl(compressedBase64);
              setNewMediaType('image');
              setIsProcessingImage(false);
              
              // Reset file input so same file can be selected again if needed
              e.target.value = '';
            } catch (err) {
              toast.dismiss(loadingToast);
              toast.error('Failed to compress image');
              console.error('Compression error:', err);
              setIsProcessingImage(false);
              e.target.value = ''; // Reset input
            }
          };
        };
        
        reader.readAsDataURL(file);
      } else if (isVideo) {
        toast.error('Please upload videos to YouTube/Vimeo and use the URL option. Videos are too large for direct upload.');
        e.target.value = ''; // Reset input
        return;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      setIsProcessingImage(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleAddMedia = () => {
    if (!newMediaUrl.trim()) {
      toast.error('Please enter a media URL or upload a file');
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

  const handleSaveEvent = async () => {
    if (!formData.title || !formData.date) {
      toast.error('Please fill in event title and date');
      return;
    }

    setIsSaving(true);
    try {
      // Get existing events from IndexedDB
      const existingEvents: Event[] = await getAllEvents();

      if (editingEvent) {
        // Update existing event
        const updatedEvents = existingEvents.map(e =>
          e.id === editingEvent.id
            ? {
                ...e,
                ...formData,
                media: mediaItems,
                updatedAt: new Date().toISOString(),
              }
            : e
        );
        
        await saveAllEvents(updatedEvents);
        window.dispatchEvent(new Event('localStorageUpdate'));
        toast.success('Event updated successfully');
      } else {
        // Create new event
        const newEvent: Event = {
          id: `event-${Date.now()}`,
          ...formData,
          media: mediaItems,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        existingEvents.push(newEvent);
        
        await saveAllEvents(existingEvents);
        window.dispatchEvent(new Event('localStorageUpdate'));
        toast.success('Event created successfully');
      }

      setShowModal(false);
      await fetchEvents();
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      // Get existing events from IndexedDB
      const existingEvents: Event[] = await getAllEvents();
      
      // Filter out the deleted event
      const updatedEvents = existingEvents.filter(e => e.id !== id);
      await saveAllEvents(updatedEvents);

      // Trigger custom event for other components in same tab
      window.dispatchEvent(new Event('localStorageUpdate'));

      toast.success('Event deleted successfully');
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const clearAllMedia = async () => {
    if (!window.confirm('⚠️ This will remove all uploaded images/videos from ALL events (keeping only URLs). Continue?')) return;
    
    try {
      const events = await getAllEvents();
      const cleanedEvents = events.map((event: Event) => ({
        ...event,
        // Keep only URL-based media (not base64)
        media: event.media?.filter(m => !m.url.startsWith('data:')) || [],
        // Keep only URL-based cover images
        image: event.image?.startsWith('data:') ? '' : event.image,
      }));
      
      await saveAllEvents(cleanedEvents);
      window.dispatchEvent(new Event('localStorageUpdate'));
      toast.success('All uploaded media cleared. Storage freed up!');
      await fetchEvents();
    } catch (error) {
      console.error('Error clearing media:', error);
      toast.error('Failed to clear media');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Montserrat'] text-3xl text-[var(--wine)] mb-2">
            Manage Events
          </h1>
          <p className="text-gray-600 font-['Merriweather']">
            Create and manage church events
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={clearAllMedia}
            variant="outline"
            className="text-red-600 hover:bg-red-50 font-['Montserrat']"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Storage
          </Button>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--wine)]" />
        </div>
      ) : events.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="font-['Montserrat'] text-xl text-gray-700 mb-2">No Events Yet</h3>
          <p className="text-gray-500 font-['Merriweather'] mb-6">
            Start by adding your first event
          </p>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden rounded-2xl hover:shadow-lg transition-shadow">
              {event.image ? (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)] flex items-center justify-center">
                  <CalendarIcon className="w-16 h-16 text-white opacity-50" />
                </div>
              )}
              <div className="p-6">
                {event.category && (
                  <span className="text-xs px-2 py-1 bg-[var(--wine)]/10 text-[var(--wine)] rounded-full font-['Montserrat']">
                    {event.category}
                  </span>
                )}
                <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2 mt-2">
                  {event.title}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="font-['Merriweather']">
                      {event.displayDate || new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  {event.time && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-['Merriweather']">{event.time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="font-['Merriweather']">{event.location}</span>
                    </div>
                  )}
                  {event.media && event.media.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-[var(--gold)]">
                      <ImageIcon className="w-4 h-4" />
                      <span className="font-['Montserrat']">
                        {event.media.length} media item{event.media.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 font-['Merriweather'] text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenModal(event)}
                    variant="outline"
                    className="flex-1 font-['Montserrat']"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteEvent(event.id)}
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
      <Dialog open={showModal} onOpenChange={(open) => setShowModal(open)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="font-['Montserrat'] text-2xl text-[var(--wine)]">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </DialogTitle>
            <DialogDescription className="sr-only">
Manage your church events
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4 overflow-y-auto overflow-x-hidden flex-1 px-1">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)]">Basic Information</h3>
              
              <div>
                <Label htmlFor="title" className="font-['Montserrat']">
                  Event Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter event title"
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
                  placeholder="Enter event description"
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="font-['Montserrat']">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="displayDate" className="font-['Montserrat']">
                    Display Date (Optional)
                  </Label>
                  <Input
                    id="displayDate"
                    value={formData.displayDate}
                    onChange={(e) => setFormData({ ...formData, displayDate: e.target.value })}
                    placeholder="e.g., December 15, 2024"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time" className="font-['Montserrat']">
                    Time
                  </Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g., 8:00 AM - 2:00 PM"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="font-['Montserrat']">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter event location"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category" className="font-['Montserrat']">
                  Category
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                    <SelectItem value="Retreat">Retreat</SelectItem>
                    <SelectItem value="Outreach">Outreach</SelectItem>
                    <SelectItem value="Fellowship">Fellowship</SelectItem>
                    <SelectItem value="Special">Special Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-['Montserrat'] mb-2 block">
                  Cover Image
                </Label>
                <div className="space-y-3">
                  <div>
                    <Label className="font-['Montserrat'] text-sm mb-1 block">
                      Upload from Device (Max 5MB)
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('Image too large. Use an image under 5MB or paste a URL instead.');
                            e.target.value = '';
                            return;
                          }
                          
                          const loadingToast = toast.loading('Processing cover image...', { duration: Infinity });
                          
                          const img = new Image();
                          const reader = new FileReader();
                          
                          reader.onerror = () => {
                            toast.dismiss(loadingToast);
                            toast.error('Failed to read image file');
                            e.target.value = '';
                          };
                          
                          reader.onload = (event) => {
                            img.src = event.target?.result as string;
                            
                            img.onerror = () => {
                              toast.dismiss(loadingToast);
                              toast.error('Failed to load image. Please try a different file.');
                              e.target.value = '';
                            };
                            
                            img.onload = () => {
                              try {
                                const canvas = document.createElement('canvas');
                                let width = img.width;
                                let height = img.height;
                                
                                // Max 800px
                                const maxDimension = 800;
                                if (width > maxDimension || height > maxDimension) {
                                  if (width > height) {
                                    height = (height / width) * maxDimension;
                                    width = maxDimension;
                                  } else {
                                    width = (width / height) * maxDimension;
                                    height = maxDimension;
                                  }
                                }
                                
                                canvas.width = width;
                                canvas.height = height;
                                
                                const ctx = canvas.getContext('2d');
                                if (!ctx) {
                                  toast.dismiss(loadingToast);
                                  toast.error('Failed to process image');
                                  e.target.value = '';
                                  return;
                                }
                                
                                ctx.drawImage(img, 0, 0, width, height);
                                
                                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
                                
                                // Calculate size
                                const sizeInBytes = (compressedBase64.length * 3) / 4;
                                const finalSizeMB = sizeInBytes / 1024 / 1024;
                                
                                setFormData({ ...formData, image: compressedBase64 });
                                
                                toast.dismiss(loadingToast);
                                toast.success(`✓ Cover image ready! (${finalSizeMB.toFixed(2)}MB)`, { duration: 3000 });
                                
                                e.target.value = '';
                              } catch (err) {
                                toast.dismiss(loadingToast);
                                toast.error('Failed to compress image');
                                console.error('Compression error:', err);
                                e.target.value = '';
                              }
                            };
                          };
                          
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500 font-['Montserrat']">OR</span>
                    </div>
                  </div>
                  <div>
                    <Label className="font-['Montserrat'] text-sm mb-1 block">
                      Enter Image URL
                    </Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://..."
                      className="mt-1"
                    />
                  </div>
                  {formData.image && (
                    <div className="mt-2">
                      <img 
                        src={formData.image} 
                        alt="Cover preview" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Photos & Videos Section */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)]">Event Photos & Videos</h3>
              
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
                  <div>
                    <Label className="font-['Montserrat'] mb-2 block">
                      Option 1: Upload from Computer
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept={newMediaType === 'image' ? 'image/*' : 'video/*'}
                        onChange={handleFileUpload}
                        disabled={isProcessingImage}
                        className="flex-1"
                      />
                      {isProcessingImage && (
                        <Loader2 className="w-5 h-5 animate-spin text-[var(--wine)]" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {newMediaType === 'image' ? 'Upload a photo from your device (max 5MB). For best performance, use Supabase Storage URLs.' : 'Upload a video from your device (max 10MB). For best performance, use YouTube/Vimeo URLs.'}
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-50 text-gray-500 font-['Montserrat']">OR</span>
                    </div>
                  </div>

                  <div>
                    <Label className="font-['Montserrat'] mb-2 block">
                      Option 2: Enter URL
                    </Label>
                    <Input
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      placeholder={newMediaType === 'image' ? 'Image URL (https://...)' : 'Video URL (YouTube, Vimeo, etc.)'}
                    />
                  </div>

                  <Input
                    value={newMediaCaption}
                    onChange={(e) => setNewMediaCaption(e.target.value)}
                    placeholder="Caption (optional)"
                  />
                  
                  {/* Media Preview */}
                  {newMediaUrl && (
                    <div className="mt-3 p-3 border-2 border-green-500 rounded-lg bg-green-50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        <Label className="font-['Montserrat'] text-sm text-green-700">Ready to add:</Label>
                      </div>
                      {newMediaType === 'image' ? (
                        <img 
                          src={newMediaUrl} 
                          alt="Preview" 
                          className="w-full h-40 object-cover rounded-lg border-2 border-green-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            toast.error('Failed to load image preview');
                          }}
                        />
                      ) : (
                        <div className="bg-white p-4 rounded-lg text-center border-2 border-green-200">
                          <Video className="w-12 h-12 mx-auto mb-2 text-green-600" />
                          <p className="text-sm text-green-700 font-['Montserrat']">Video ready to add</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button
                    onClick={handleAddMedia}
                    type="button"
                    className="w-full bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
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
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.type === 'image' ? (
                            <img 
                              src={item.url} 
                              alt={item.caption || 'Media'} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                              }}
                            />
                          ) : (
                            <Video className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-['Montserrat'] text-[var(--wine)] truncate">
                            {item.caption || 'No caption'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {item.url.startsWith('data:') ? 'Uploaded file' : item.url}
                          </p>
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
          </div>

          {/* Footer with Buttons */}
          <div className="flex gap-3 pt-4 border-t bg-white">
            <Button
              onClick={handleSaveEvent}
              disabled={isSaving}
              className="flex-1 bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{editingEvent ? 'Update Event' : 'Add Event'}</>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}