import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Calendar, MapPin, Clock, ArrowLeft, Image as ImageIcon, Video, X, Play, Loader2 } from 'lucide-react';
import { getAllEvents, getOptimizedImageUrl, getImageSrcSet } from '../utils/storage';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  displayDate?: string;
  time?: string;
  location?: string;
  description: string;
  image?: string;
  media?: MediaItem[];
}

interface EventDetailPageProps {
  eventId: string;
  onNavigate?: (page: string) => void;
}

export function EventDetailPage({ eventId, onNavigate }: EventDetailPageProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvent();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadEvent();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdate', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleStorageChange);
    };
  }, [eventId]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      // Load events from IndexedDB
      const events = await getAllEvents();
      const foundEvent = events.find((e: Event) => e.id === eventId);
      setEvent(foundEvent || null);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVideoEmbedUrl = (url: string) => {
    // Check if it's a base64 encoded video (uploaded from device)
    if (url.startsWith('data:video')) {
      return url; // Return as-is for base64 videos
    }
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const openLightbox = (media: MediaItem) => {
    if (!event?.media) return;
    setSelectedMedia(media);
    const index = event.media.findIndex(m => m.id === media.id);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
  };

  const nextMedia = () => {
    if (!event?.media) return;
    const nextIndex = (lightboxIndex + 1) % event.media.length;
    setLightboxIndex(nextIndex);
    setSelectedMedia(event.media[nextIndex]);
  };

  const prevMedia = () => {
    if (!event?.media) return;
    const prevIndex = lightboxIndex === 0 ? event.media.length - 1 : lightboxIndex - 1;
    setLightboxIndex(prevIndex);
    setSelectedMedia(event.media[prevIndex]);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--wine)]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-4">Event Not Found</h2>
          <Button
            onClick={() => onNavigate?.('events')}
            className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)]';
                (e.target as HTMLImageElement).parentElement?.prepend(fallback);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)]"></div>
          )}
          <div className="absolute inset-0 bg-[var(--wine)]/80"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="font-['Montserrat'] text-4xl md:text-5xl lg:text-6xl mb-6">
            {event.title}
          </h1>
          <div className="flex flex-wrap justify-center gap-6 text-white/90 font-['Merriweather']">
            {event.displayDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--gold)]" />
                <span>{event.displayDate}</span>
              </div>
            )}
            {event.time && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--gold)]" />
                <span>{event.time}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--gold)]" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            onClick={() => onNavigate?.('events')}
            variant="outline"
            className="mb-8 font-['Montserrat']"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>

          {/* Description */}
          <div className="mb-12">
            <h2 className="font-['Montserrat'] text-3xl text-[var(--wine)] mb-4">About This Event</h2>
            <p className="text-gray-700 font-['Merriweather'] text-lg leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Media Gallery */}
          {event.media && event.media.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Montserrat'] text-3xl text-[var(--wine)]">Event Gallery</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span className="font-['Montserrat']">
                      {event.media.filter(m => m.type === 'image').length} photos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    <span className="font-['Montserrat']">
                      {event.media.filter(m => m.type === 'video').length} videos
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {event.media.map((media) => (
                  <Card
                    key={media.id}
                    className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group rounded-xl"
                    onClick={() => openLightbox(media)}
                  >
                    <div className="relative aspect-square bg-gray-200">
                      {media.type === 'image' ? (
                        <>
                          <img
                            src={getOptimizedImageUrl(media.url, { width: 400, height: 400, quality: 85, format: 'webp', resize: 'cover' })}
                            srcSet={getImageSrcSet(media.url)}
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            alt={media.caption || 'Event photo'}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              console.error('Image failed to load:', media.url);
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                              if (img.parentElement) {
                                img.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-300"><svg class="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="absolute bottom-4 text-xs text-gray-600">Image failed to load</p></div>';
                              }
                            }}
                          />
                        </>
                      ) : (
                        <div className="relative w-full h-full bg-gray-900">
                          {media.url.startsWith('data:video') ? (
                            <video
                              src={media.url}
                              className="w-full h-full object-cover"
                              controls={false}
                            />
                          ) : (
                            <iframe
                              src={getVideoEmbedUrl(media.url)}
                              className="w-full h-full pointer-events-none"
                              frameBorder="0"
                              title={media.caption || 'Event video'}
                            ></iframe>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                              <Play className="w-8 h-8 text-[var(--wine)] ml-1" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        {media.caption && (
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-white font-['Merriweather'] text-sm">
                              {media.caption}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {(!event.media || event.media.length === 0) && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 font-['Merriweather']">
                No photos or videos have been added to this event yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedMedia && event.media && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white hover:text-[var(--gold)] transition-colors z-20 bg-black/50 rounded-full p-2 hover:bg-black/70"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation buttons */}
          {event.media.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevMedia();
                }}
                className="absolute left-4 md:left-8 text-white hover:text-[var(--gold)] transition-all z-20 bg-black/50 rounded-full p-3 hover:bg-black/70 hover:scale-110"
                aria-label="Previous"
              >
                <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextMedia();
                }}
                className="absolute right-4 md:right-8 text-white hover:text-[var(--gold)] transition-all z-20 bg-black/50 rounded-full p-3 hover:bg-black/70 hover:scale-110"
                aria-label="Next"
              >
                <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Content */}
          <div 
            className="max-w-7xl w-full px-4 md:px-8"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.caption || 'Event photo'}
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <div className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl">
                {selectedMedia.url.startsWith('data:video') ? (
                  <video
                    src={selectedMedia.url}
                    className="w-full h-full"
                    controls
                    autoPlay
                  />
                ) : (
                  <iframe
                    src={getVideoEmbedUrl(selectedMedia.url)}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title={selectedMedia.caption || 'Event video'}
                  ></iframe>
                )}
              </div>
            )}
            
            {/* Caption and counter */}
            <div className="mt-6 text-center">
              {selectedMedia.caption && (
                <p className="text-white font-['Merriweather'] text-lg mb-2">
                  {selectedMedia.caption}
                </p>
              )}
              <p className="text-gray-300 font-['Montserrat'] text-sm">
                {lightboxIndex + 1} of {event.media.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
