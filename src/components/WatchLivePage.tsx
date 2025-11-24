import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Calendar, Clock, Radio, ArrowLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface WatchLivePageProps {
  onNavigate?: (page: string) => void;
}

interface LiveStreamData {
  isLive: boolean;
  youtubeUrl: string;
  scheduleText: string;
}

interface Sermon {
  id: string;
  title: string;
  date: string;
  speaker: string;
  videoUrl: string;
  thumbnail: string;
  description: string;
}

export function WatchLivePage({ onNavigate }: WatchLivePageProps) {
  const [liveData, setLiveData] = useState<LiveStreamData>({
    isLive: false,
    youtubeUrl: '',
    scheduleText: 'Check back soon for our next live service!'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentSermons, setRecentSermons] = useState<Sermon[]>([]);

  useEffect(() => {
    fetchLiveStreamData();
    fetchRecentSermons();
  }, []);

  const fetchLiveStreamData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/live-stream/get`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLiveData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching live stream data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentSermons = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/sermons`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Get the 3 most recent sermons
          setRecentSermons(data.sermons.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error fetching recent sermons:', error);
    }
  };

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Handle various YouTube URL formats
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/live/')) {
      videoId = url.split('live/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0` : '';
  };

  const embedUrl = getYouTubeEmbedUrl(liveData.youtubeUrl);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--wine)] to-[var(--wine-dark)] text-white py-16">
        <div className="container mx-auto px-4">
          <button
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors font-['Merriweather']"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            {liveData.isLive && (
              <div className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-full animate-pulse">
                <Radio className="w-5 h-5" />
                <span className="font-['Montserrat'] font-semibold">LIVE NOW</span>
              </div>
            )}
          </div>
          
          <h1 className="font-['Montserrat'] text-4xl md:text-5xl mb-4">
            {liveData.isLive ? 'Join Our Live Service' : 'Watch Live'}
          </h1>
          <p className="font-['Merriweather'] text-xl text-white/90 max-w-2xl">
            {liveData.isLive 
              ? 'Experience worship and the Word of God with us in real-time'
              : 'Join us for our next live service and experience the presence of God'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--wine)] mx-auto"></div>
            <p className="font-['Merriweather'] text-gray-600 mt-4">Loading...</p>
          </div>
        ) : (
          <>
            {/* Live Stream Player or Service Schedule */}
            {liveData.isLive && embedUrl ? (
              <Card className="overflow-hidden rounded-2xl shadow-xl mb-12">
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={embedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Live Stream"
                  ></iframe>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center rounded-2xl shadow-lg mb-12 bg-gradient-to-br from-gray-50 to-white">
                <div className="w-20 h-20 bg-[var(--wine)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-[var(--wine)]" />
                </div>
                <h2 className="font-['Montserrat'] text-2xl md:text-3xl text-[var(--wine)] mb-4">
                  Stream Currently Offline
                </h2>
                <p className="font-['Merriweather'] text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                  {liveData.scheduleText}
                </p>

                {/* Service Times */}
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">Sunday Service</h3>
                    <p className="font-['Merriweather'] text-gray-600">9:00 AM - 11:30 AM</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">Bible Study</h3>
                    <p className="font-['Merriweather'] text-gray-600">Wednesday 5:00 PM</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">Prayer Meeting</h3>
                    <p className="font-['Merriweather'] text-gray-600">Friday 6:00 PM</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Recent Sermons Section */}
            {recentSermons.length > 0 && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="font-['Montserrat'] text-3xl text-[var(--wine)] mb-3">
                    Recent Sermons
                  </h2>
                  <p className="font-['Merriweather'] text-gray-600">
                    Catch up on what you might have missed
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  {recentSermons.map((sermon) => (
                    <Card key={sermon.id} className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                      <div className="relative aspect-video bg-gray-200">
                        <img
                          src={sermon.thumbnail}
                          alt={sermon.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">
                          {sermon.title}
                        </h3>
                        <p className="font-['Merriweather'] text-sm text-gray-600 mb-4">
                          {sermon.speaker} • {new Date(sermon.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <Button
                          onClick={() => {
                            window.open(sermon.videoUrl, '_blank');
                          }}
                          className="w-full bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
                        >
                          Watch Sermon
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="text-center">
                  <Button
                    onClick={() => onNavigate?.('sermons')}
                    variant="outline"
                    className="font-['Montserrat'] border-[var(--wine)] text-[var(--wine)] hover:bg-[var(--wine)] hover:text-white"
                  >
                    View All Sermons
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}