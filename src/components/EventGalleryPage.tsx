import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Calendar, Image as ImageIcon, Video, Loader2, X, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedImageUrl, getImageSrcSet } from '../utils/storage';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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

interface EventGalleryPageProps {
  onNavigate?: (page: string) => void;
}

export function EventGalleryPage({ onNavigate }: EventGalleryPageProps) {
  const [galleries, setGalleries] = useState<EventGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGallery, setSelectedGallery] = useState<EventGallery | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const apiBase = `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76`;

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    setLoading(true);
    try {
      // 1) Try Supabase function (shared for all users)
      const res = await fetch(`${apiBase}/event-galleries`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const remote = data?.galleries || data || [];
        const sorted = remote.sort(
          (a: EventGallery, b: EventGallery) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
        );
        setGalleries(sorted);
        localStorage.setItem('eventGalleries', JSON.stringify(sorted)); // cache for offline
        return;
      }

      console.warn('Falling back to cached galleries; Supabase returned', res.status);
    } catch (error) {
      console.warn('Supabase gallery fetch failed, using cache', error);
    }

    // 2) Fallback to local cache
    try {
      const stored = localStorage.getItem('eventGalleries');
      if (stored) {
        const cached = JSON.parse(stored);
        const sorted = cached.sort(
          (a: EventGallery, b: EventGallery) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
        );
        setGalleries(sorted);
      } else {
        setGalleries([]);
      }
    } catch (cacheErr) {
      console.error('Error reading cached galleries:', cacheErr);
      setGalleries([]);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (media: MediaItem, gallery: EventGallery) => {
    setSelectedMedia(media);
    setSelectedGallery(gallery);
    const index = gallery.media.findIndex(m => m.id === media.id);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
    setSelectedGallery(null);
  };

  const nextMedia = () => {
    if (!selectedGallery) return;
    const nextIndex = (lightboxIndex + 1) % selectedGallery.media.length;
    setLightboxIndex(nextIndex);
    setSelectedMedia(selectedGallery.media[nextIndex]);
  };

  const prevMedia = () => {
    if (!selectedGallery) return;
    const prevIndex = lightboxIndex === 0 ? selectedGallery.media.length - 1 : lightboxIndex - 1;
    setLightboxIndex(prevIndex);
    setSelectedMedia(selectedGallery.media[prevIndex]);
  };

  const getVideoEmbedUrl = (url: string) => {
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

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getOptimizedImageUrl("https://images.unsplash.com/photo-1511578314322-379afb476865?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjBldmVudCUyMGdhbGxlcnl8ZW58MXx8fHwxNzYzMzk3NzI5fDA&ixlib=rb-4.1.0&q=80&w=1080", { width: 1920, quality: 85, format: 'webp' })}
            alt="Event Gallery"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-[var(--wine)]/80"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-['Montserrat'] text-4xl md:text-5xl lg:text-6xl mb-4">
            Event Gallery
          </h1>
          <div className="w-24 h-1 bg-[var(--gold)] mx-auto mb-4"></div>
          <p className="font-['Merriweather'] text-lg md:text-xl max-w-2xl mx-auto">
            Relive the moments and memories from our church events
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--wine)]" />
            </div>
          ) : galleries.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="font-['Montserrat'] text-xl text-gray-700 mb-2">
                No Event Galleries Yet
              </h3>
              <p className="text-gray-500 font-['Merriweather']">
                Check back soon for photos and videos from our events
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {galleries.map((gallery) => (
                <div key={gallery.id}>
                  {/* Gallery Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2 text-[var(--gold)]">
                      <Calendar className="w-5 h-5" />
                      <span className="font-['Montserrat']">
                        {new Date(gallery.eventDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-3">
                      {gallery.eventName}
                    </h2>
                    {gallery.description && (
                      <p className="text-gray-600 font-['Merriweather'] text-lg max-w-3xl">
                        {gallery.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span className="font-['Montserrat']">
                          {gallery.media.filter(m => m.type === 'image').length} photos
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        <span className="font-['Montserrat']">
                          {gallery.media.filter(m => m.type === 'video').length} videos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Media Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gallery.media.map((media) => (
                      <Card
                        key={media.id}
                        className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group rounded-xl"
                        onClick={() => openLightbox(media, gallery)}
                      >
                        <div className="relative aspect-square">
                          {media.type === 'image' ? (
                            <img
                              src={media.url}
                              srcSet=""
                              alt={media.caption || 'Event photo'}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                const img = e.currentTarget;
                                if (img.dataset.fallback !== 'true') {
                                  img.dataset.fallback = 'true';
                                  img.src = media.url;
                                  img.srcset = '';
                                }
                              }}
                            />
                          ) : (
                            <div className="relative w-full h-full bg-gray-900">
                              <iframe
                                src={getVideoEmbedUrl(media.url)}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="autoplay; fullscreen"
                                title={media.caption || 'Event video'}
                              ></iframe>
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
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox - Simple fixed positioning */}
      {selectedMedia && selectedGallery && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.98)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Close Button - Top Right */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              zIndex: 10001,
              background: 'rgba(255, 255, 255, 0.3)',
              border: 'none',
              color: 'white',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <X size={24} />
          </button>

          {/* Previous Button - FAR LEFT */}
          {selectedGallery.media.length > 1 && (
            <button
              onClick={prevMedia}
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10001,
                background: 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                color: 'white',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              <ChevronLeft size={32} strokeWidth={3} />
            </button>
          )}

          {/* Next Button - FAR RIGHT */}
          {selectedGallery.media.length > 1 && (
            <button
              onClick={nextMedia}
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10001,
                background: 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                color: 'white',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              <ChevronRight size={32} strokeWidth={3} />
            </button>
          )}

          {/* Media Container - Centered */}
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.caption || 'Event photo'}
                style={{
                  maxHeight: '80vh',
                  maxWidth: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                }}
              />
            ) : (
              <div style={{
                aspectRatio: '16 / 9',
                width: '100%',
                maxWidth: '1000px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}>
                <iframe
                  src={getVideoEmbedUrl(selectedMedia.url)}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title={selectedMedia.caption || 'Event video'}
                ></iframe>
              </div>
            )}

            {/* Caption and Counter */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: 0,
              right: 0,
              textAlign: 'center',
              color: 'white',
              padding: '16px'
            }}>
              {selectedMedia.caption && (
                <p style={{
                  fontSize: '18px',
                  marginBottom: '8px',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                  fontFamily: 'Merriweather'
                }}>
                  {selectedMedia.caption}
                </p>
              )}
              <p style={{
                fontSize: '14px',
                color: '#ddd',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                fontFamily: 'Montserrat'
              }}>
                {lightboxIndex + 1} / {selectedGallery.media.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
