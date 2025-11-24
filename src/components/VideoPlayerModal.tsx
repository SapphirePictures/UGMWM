import React from 'react';
import { X, Calendar, User, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sermon: {
    id: string;
    title: string;
    description: string;
    speaker: string;
    date: string;
    videoUrl?: string;
    duration?: string;
  } | null;
}

export function VideoPlayerModal({ isOpen, onClose, sermon }: VideoPlayerModalProps) {
  // Extract video ID and determine platform
  const getEmbedUrl = (url: string) => {
    if (!url) return null;

    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      return {
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
        platform: 'youtube'
      };
    }

    // Vimeo patterns
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      return {
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
        platform: 'vimeo'
      };
    }

    return null;
  };

  const videoData = sermon?.videoUrl ? getEmbedUrl(sermon.videoUrl) : null;

  // Close modal on ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !sermon) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Video Container */}
        <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
          {videoData ? (
            <iframe
              src={videoData.embedUrl}
              className="absolute top-0 left-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={sermon.title}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <p className="text-xl font-['Montserrat'] mb-2">Video not available</p>
                <p className="text-sm text-white/70 font-['Merriweather']">
                  Please check the video URL
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sermon Details */}
        <div className="p-6 md:p-8 bg-gradient-to-b from-white to-gray-50">
          <h2 className="font-['Montserrat'] text-2xl md:text-3xl text-[var(--wine)] mb-4">
            {sermon.title}
          </h2>
          
          <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--gold)]" />
              <span className="font-['Montserrat']">{sermon.speaker}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--gold)]" />
              <span className="font-['Montserrat']">
                {new Date(sermon.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            {sermon.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--gold)]" />
                <span className="font-['Montserrat']">{sermon.duration}</span>
              </div>
            )}
          </div>

          <p className="text-gray-700 font-['Merriweather'] leading-relaxed">
            {sermon.description}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClose}
              className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
            >
              Close
            </Button>
            
            {sermon.videoUrl && (
              <Button
                onClick={() => window.open(sermon.videoUrl, '_blank')}
                variant="outline"
                className="border-[var(--wine)] text-[var(--wine)] hover:bg-[var(--wine)] hover:text-white font-['Montserrat']"
              >
                Watch on {videoData?.platform === 'youtube' ? 'YouTube' : videoData?.platform === 'vimeo' ? 'Vimeo' : 'Platform'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}