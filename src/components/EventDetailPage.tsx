import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Calendar, MapPin, Clock, ArrowLeft, Image as ImageIcon, Video, X, Play, Loader2 } from 'lucide-react';
import { syncEventsWithSupabase } from '../utils/storage';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
      // Load events from Supabase (with cache sync)
      const events = await syncEventsWithSupabase();
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
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--wine)] mx-auto mb-4" />
          <p className="text-gray-600 font-['Merriweather']">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
        <Card className="p-8 rounded-2xl text-center max-w-md w-full">
          <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-3">Event Not Found</h2>
          <p className="text-gray-600 font-['Merriweather'] mb-6">The event you are trying to view is unavailable.</p>
          <Button
            onClick={() => onNavigate?.('events')}
            className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[420px] md:min-h-[500px] flex items-center justify-center overflow-hidden pt-32 md:pt-36 pb-12">
        <div className="absolute inset-0">
          {event.image ? (
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)]"></div>
          )}
          <div className="absolute inset-0 bg-[var(--wine)]/82"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
          <Button
            onClick={() => onNavigate?.('events')}
            variant="outline"
            className="mb-6 border-white text-white hover:bg-white hover:text-[var(--wine)] font-['Montserrat']"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>

          <h1 className="font-['Montserrat'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-white/90">
            {event.displayDate && (
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Calendar className="w-5 h-5 text-[var(--gold)]" />
                <span className="font-['Montserrat'] text-sm md:text-base">{event.displayDate}</span>
              </div>
            )}
            {event.time && (
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Clock className="w-5 h-5 text-[var(--gold)]" />
                <span className="font-['Montserrat'] text-sm md:text-base">{event.time}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <MapPin className="w-5 h-5 text-[var(--gold)]" />
                <span className="font-['Montserrat'] text-sm md:text-base">{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Description */}
          <Card className="p-6 md:p-8 rounded-2xl mb-10 md:mb-12 bg-white border-gray-200">
            <h2 className="font-['Montserrat'] text-2xl md:text-3xl text-[var(--wine)] mb-4">About This Event</h2>
            <p className="text-gray-700 font-['Merriweather'] text-base md:text-lg leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </Card>

          {/* Media Gallery */}
          {event.media && event.media.length > 0 && (
            <Card className="p-6 md:p-8 rounded-2xl bg-white border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="font-['Montserrat'] text-2xl md:text-3xl text-[var(--wine)]">Event Gallery</h2>
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                    <ImageIcon className="w-4 h-4 text-[var(--wine)]" />
                    <span className="font-['Montserrat'] text-xs md:text-sm">
                      {event.media.filter(m => m.type === 'image').length} photos
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                    <Video className="w-4 h-4 text-[var(--wine)]" />
                    <span className="font-['Montserrat'] text-xs md:text-sm">
                      {event.media.filter(m => m.type === 'video').length} videos
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {event.media.map((media) => (
                  <Card
                    key={media.id}
                    className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group rounded-xl border-gray-200"
                    onClick={() => openLightbox(media)}
                  >
                    <div className="relative aspect-[4/3] bg-gray-200">
                      {media.type === 'image' ? (
                        <ImageWithFallback
                          src={media.url}
                          alt={media.caption || 'Event photo'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
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
            </Card>
          )}

          {(!event.media || event.media.length === 0) && (
            <Card className="text-center py-12 rounded-2xl bg-white border-gray-200">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 font-['Merriweather']">
                No photos or videos have been added to this event yet.
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedMedia && event.media && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-6">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-[var(--gold)] transition-colors z-10 bg-white/10 rounded-full p-2"
          >
            <X className="w-8 h-8" />
          </button>

          {event.media.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                className="absolute left-4 text-white hover:text-[var(--gold)] transition-colors text-5xl bg-white/10 rounded-full w-12 h-12 flex items-center justify-center"
                style={{ fontSize: '3rem' }}
              >
                ‹
              </button>
              <button
                onClick={nextMedia}
                className="absolute right-4 text-white hover:text-[var(--gold)] transition-colors text-5xl bg-white/10 rounded-full w-12 h-12 flex items-center justify-center"
                style={{ fontSize: '3rem' }}
              >
                ›
              </button>
            </>
          )}

          <div className="max-w-6xl w-full">
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.caption || 'Event photo'}
                className="w-full h-auto max-h-[78vh] object-contain rounded-lg"
              />
            ) : (
              <div className="aspect-video w-full rounded-lg overflow-hidden">
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
            <div className="mt-4 text-center">
              {selectedMedia.caption && (
                <p className="text-white font-['Merriweather'] text-lg">
                  {selectedMedia.caption}
                </p>
              )}
              <p className="text-gray-400 font-['Montserrat'] text-sm mt-2">
                {lightboxIndex + 1} / {event.media.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
