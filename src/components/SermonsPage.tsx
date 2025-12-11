import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Play, Download, Share2, Clock, Loader2, Video } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { VideoPlayerModal } from './VideoPlayerModal';
import { getOptimizedImageUrl, getImageSrcSet } from '../utils/storage';

interface SermonsPageProps {
  onNavigate?: (page: string) => void;
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

export function SermonsPage({ onNavigate }: SermonsPageProps) {
  const [sermons, setSermons] = React.useState<Sermon[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedSermon, setSelectedSermon] = React.useState<Sermon | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/sermons`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch sermons');

      const data = await response.json();
      // Sermons are already sorted by date (newest first) from the API
      setSermons(data.sermons || []);
    } catch (error) {
      console.error('Error fetching sermons:', error);
      toast.error('Failed to load sermons');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchSermon = (sermon: Sermon) => {
    if (sermon.videoUrl) {
      setSelectedSermon(sermon);
      setIsModalOpen(true);
    } else {
      toast.error('Video not available');
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getOptimizedImageUrl("https://images.unsplash.com/photo-1655392030885-8468507fb045?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjBpbnRlcmlvciUyMHdvcnNoaXB8ZW58MXx8fHwxNzYzMzAxNTMwfDA&ixlib=rb-4.1.0&q=80&w=1080", { width: 1920, quality: 85, format: 'webp' })}
            alt="Sermons"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-[var(--wine)]/80"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-['Montserrat'] text-4xl md:text-5xl lg:text-6xl mb-4">Sermons</h1>
          <div className="w-24 h-1 bg-[var(--gold)] mx-auto mb-4"></div>
          <p className="font-['Merriweather'] text-lg md:text-xl max-w-2xl mx-auto">
            Messages to strengthen your faith and transform your life
          </p>
        </div>
      </section>

      {/* Filter and Search */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-wrap">
              <Button
                variant="outline"
                className="border-[var(--wine)] text-[var(--wine)] hover:bg-[var(--wine)] hover:text-white font-['Montserrat']"
              >
                All Sermons
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-100 font-['Montserrat']"
              >
                Recent
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-100 font-['Montserrat']"
              >
                Popular
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sermons Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[var(--wine)] animate-spin mb-4" />
              <p className="text-gray-500 font-['Merriweather'] text-lg">Loading sermons...</p>
            </div>
          ) : sermons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Video className="w-20 h-20 text-gray-300 mb-6" />
              <h3 className="font-['Montserrat'] text-2xl text-gray-700 mb-3">No Sermons Yet</h3>
              <p className="text-gray-500 font-['Merriweather'] text-lg mb-8 max-w-md text-center">
                Sermons will be available soon. Check back later for inspiring messages.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sermons.map((sermon) => (
                  <Card
                    key={sermon.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 rounded-2xl group cursor-pointer"
                    onClick={() => handleWatchSermon(sermon)}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)] overflow-hidden">
                      {sermon.thumbnailUrl ? (
                        <img
                          src={getOptimizedImageUrl(sermon.thumbnailUrl, { width: 480, height: 320, quality: 85, format: 'webp', resize: 'cover' })}
                          srcSet={getImageSrcSet(sermon.thumbnailUrl)}
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          alt={sermon.title}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-16 h-16 text-white opacity-30" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-[var(--gold)] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-[var(--wine)] ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2 group-hover:text-[var(--gold)] transition-colors">
                        {sermon.title}
                      </h3>
                      <p className="text-gray-600 font-['Merriweather'] text-sm mb-3 line-clamp-2">
                        {sermon.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="font-['Montserrat']">{sermon.speaker}</span>
                        {sermon.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span className="font-['Montserrat']">{sermon.duration}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                        <span className="font-['Montserrat']">
                          {new Date(sermon.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          className="flex-1 bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
                          onClick={() => handleWatchSermon(sermon)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Watch
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[var(--wine)] text-[var(--wine)] hover:bg-[var(--wine)] hover:text-white"
                          onClick={() => {
                            if (navigator.share && sermon.videoUrl) {
                              navigator.share({
                                title: sermon.title,
                                text: sermon.description,
                                url: sermon.videoUrl,
                              }).catch(() => {
                                toast.error('Sharing not supported');
                              });
                            } else {
                              toast.success('Share feature coming soon!');
                            }
                          }}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Sermon Series - Only show if there are sermons */}
      {sermons.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
                Latest Sermons
              </h2>
              <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
              <p className="font-['Merriweather'] text-gray-600 mt-4">
                Sorted by most recent upload
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-[var(--wine)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-['Montserrat'] text-3xl md:text-4xl mb-6">
            Subscribe to Our Channel
          </h2>
          <p className="text-white/90 font-['Merriweather'] text-lg mb-8 max-w-2xl mx-auto">
            Never miss a message. Subscribe to receive notifications when new sermons are uploaded.
          </p>
          <Button className="bg-[var(--gold)] text-[var(--wine-dark)] hover:bg-[var(--gold-light)] font-['Montserrat'] text-lg px-8 py-6">
            Subscribe Now
          </Button>
        </div>
      </section>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sermon={selectedSermon}
      />
    </div>
  );
}