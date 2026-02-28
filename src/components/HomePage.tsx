import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  BookOpen,
  Users,
  Heart,
  Calendar,
  ArrowRight,
  Play,
  Gift,
  Mic,
  Music,
  Video,
  Handshake,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import generalOverseerImg from 'figma:asset/8f13c1881c45e0dbc04673497bba198b313dad45.png';
import churchLogo from 'figma:asset/a02d98e1848270468d8689a4d10185e04425697c.png';
import { VideoPlayerModal } from './VideoPlayerModal';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';
import { LiveStreamBanner } from './LiveStreamBanner';

interface HomePageProps {
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

interface HomepageEvent {
  title: string;
  description: string;
  date: string;
  time: string;
  isUpcoming: boolean;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [bannerImages, setBannerImages] = React.useState<string[]>([]);
  const [bannerIndex, setBannerIndex] = React.useState(0);
  const [isLoadingBannerImages, setIsLoadingBannerImages] = React.useState(true);
  const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= 768);
  const [sermons, setSermons] = React.useState<Sermon[]>([]);
  const [selectedSermon, setSelectedSermon] = React.useState<Sermon | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [videoLoaded, setVideoLoaded] = React.useState(false);
  const [homepageEvent, setHomepageEvent] = React.useState<HomepageEvent | null>(null);
  const [isLoadingHomepageEvent, setIsLoadingHomepageEvent] = React.useState(true);

  const loadBannerImages = React.useCallback(async () => {
    setIsLoadingBannerImages(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/banner-images`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        console.log('⚠️ [HomePage] Banner images endpoint not available yet');
        setBannerImages([]);
        return;
      }

      const data = await response.json();
      const images = data.images || [];
      console.log('✅ [HomePage] Fetched', images.length, 'banner images from server');
      console.log('📦 [HomePage] Raw images:', images);
      
      const sanitized = Array.isArray(images)
        ? images.filter((item) => {
            const isValid = typeof item === 'string' && item.length > 0;
            if (!isValid) console.warn('⚠️ [HomePage] Filtered out invalid item:', item);
            return isValid;
          })
        : [];
      
      console.log('✅ [HomePage] After sanitization:', sanitized.length, 'valid images');
      console.log('📸 [HomePage] Setting state with images, first image length:', sanitized[0]?.length);
      setBannerImages(sanitized);
    } catch (error) {
      console.error('❌ [HomePage] Error loading banner images:', error);
      setBannerImages([]);
    } finally {
      setIsLoadingBannerImages(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSermons();
    fetchHomepageEvent();
    loadBannerImages();
  }, [loadBannerImages]);

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchHomepageEvent = async () => {
    setIsLoadingHomepageEvent(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/homepage-event`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        // Silently fail - this is expected when backend is not deployed
        return;
      }

      const data = await response.json();
      if (data.event) {
        setHomepageEvent(data.event);
      }
    } catch (error) {
      // Silently fail - this is expected when backend is not deployed
    } finally {
      setIsLoadingHomepageEvent(false);
    }
  };

  const fetchSermons = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/sermons`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (!response.ok) {
        // Silently fail - this is expected when backend is not deployed
        setSermons([]);
        return;
      }

      const data = await response.json();
      // Get only the first 3 sermons for the homepage
      setSermons((data.sermons || []).slice(0, 3));
    } catch (error) {
      // Silently fail - this is expected when backend is not deployed
      setSermons([]);
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
  
  const handleNavClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleHomepageEventLearnMore = () => {
    const targetHash = '#homepage-event-detail';
    const targetUrl = `${window.location.pathname}${targetHash}`;

    if (window.location.hash !== targetHash) {
      window.location.hash = 'homepage-event-detail';
    }

    onNavigate?.('homepage-event-detail');

    if (window.location.hash !== targetHash) {
      window.location.assign(targetUrl);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Static Background Image - Shows while video loads */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(114, 47, 55, 0.7), rgba(114, 47, 55, 0.5)), url('https://images.unsplash.com/photo-1667068114508-0055f7fb25a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjB3b3JzaGlwJTIwaGFuZHMlMjByYWlzZWR8ZW58MXx8fHwxNzYzNjQ0NjcyfDA&ixlib=rb-4.1.0&q=80&w=1080')`
          }}
        />
        
        {/* Background Video */}
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover"
            onLoadedData={() => {
              setTimeout(() => setVideoLoaded(true), 500);
            }}
            onError={(e) => {
              console.error('Video failed to load:', e);
              console.error('Video src:', e.currentTarget.currentSrc);
            }}
          >
            <source src="https://jhbpbopvzcxbfgyemhpa.supabase.co/storage/v1/object/public/UnlimitedGrace%26Mercy/Church.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Black overlay with 10% opacity - placed outside video container */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none z-[1]"></div>

        {/* Hero Content */}
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="font-['Montserrat'] text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight">
            Welcome to Unlimited Grace and Mercy Worldwide Mission Inc.
          </h1>
          <p className="font-['Merriweather'] text-lg sm:text-xl md:text-2xl mb-8 text-white/90">
            A gathering of souls enjoying the unlimited grace and mercy of God.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => handleNavClick('events')}
              className="bg-[var(--wine-dark)] text-white hover:bg-[var(--wine)] border-2 border-[var(--gold)] font-['Montserrat'] text-lg px-8 py-6 text-[16px]"
            >
              Programmes
            </Button>
            <Button
              onClick={() => handleNavClick('service-times')}
              className="bg-[var(--gold)] text-[var(--wine-dark)] hover:bg-[var(--gold-light)] font-['Montserrat'] text-lg px-8 py-6"
            >
              Worship With Us
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[var(--gold)] rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-[var(--gold)] rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Live Stream Banner */}
      <LiveStreamBanner onNavigate={onNavigate} />

      {/* Home Banner Image Space */}
      <div className="px-4 sm:px-6 lg:px-8 py-20 bg-[var(--wine)]">
        <div className="max-w-7xl mx-auto space-y-6">
          {bannerImages.length > 0 && (
            <div className="bg-[var(--wine-dark)] rounded-2xl p-4 md:p-12 border-2 border-[var(--gold)]">
                <div className="relative w-full h-[160px] md:h-[240px] rounded-xl overflow-hidden">
                  {/* Desktop Grid */}
                  {isDesktop ? (
                    <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${bannerImages.length}, 1fr)` }}>
                      {bannerImages.map((src, index) => (
                        <div key={`banner-${index}`} className="w-full h-full">
                          <img
                            src={src}
                            alt={`Homepage banner ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading={index === 0 ? 'eager' : 'lazy'}
                            onError={(e) => {
                              console.error(`❌ [HomePage] Failed to load banner image ${index + 1}`, e);
                              console.log('Image src was:', src?.substring(0, 100));
                            }}
                            onLoad={() => {
                              console.log(`✅ [HomePage] Desktop banner image ${index + 1} loaded, src length: ${src.length}`);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Mobile Carousel */
                    <div className="relative w-full h-full">
                      <img
                        src={bannerImages[bannerIndex]}
                        alt={`Homepage banner ${bannerIndex + 1}`}
                        className="w-full h-full object-cover transition-all duration-500"
                        loading="eager"
                        onError={(e) => console.error(`❌ [HomePage] Failed to load mobile banner ${bannerIndex + 1}`, e)}
                        onLoad={() => console.log(`✅ [HomePage] Mobile banner image ${bannerIndex + 1} loaded`)}
                      />
                      
                      {/* Mobile Carousel Controls */}
                      {bannerImages.length > 1 && (
                        <>
                          <button
                            onClick={() => setBannerIndex((bannerIndex - 1 + bannerImages.length) % bannerImages.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                            aria-label="Previous image"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setBannerIndex((bannerIndex + 1) % bannerImages.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                            aria-label="Next image"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          
                          {/* Dots Indicator */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {bannerImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setBannerIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === bannerIndex ? 'bg-white w-6' : 'bg-white/50'
                                }`}
                                aria-label={`Go to image ${index + 1}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Upcoming Event Section */}
          <div className="bg-[var(--wine-dark)] rounded-2xl p-8 md:p-12 border-2 border-[var(--gold)]">
            {isLoadingHomepageEvent ? (
              <div className="animate-pulse">
                <div className="h-5 w-40 bg-white/20 rounded mb-4"></div>
                <div className="h-10 w-3/4 bg-white/20 rounded mb-4"></div>
                <div className="h-5 w-full bg-white/20 rounded mb-2"></div>
                <div className="h-5 w-5/6 bg-white/20 rounded mb-6"></div>
                <div className="h-5 w-1/2 bg-white/20 rounded"></div>
              </div>
            ) : homepageEvent ? (
              <div className="flex items-start justify-between flex-col md:flex-row gap-6">
                <div className="flex-1">
                  {homepageEvent.isUpcoming && (
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-6 h-6 text-[var(--gold)]" />
                      <span className="text-[var(--gold)] font-['Montserrat'] text-white">
                        Upcoming Event
                      </span>
                    </div>
                  )}
                  <h2 className="font-['Montserrat'] text-3xl md:text-4xl mb-4 text-white">
                    {homepageEvent.title}
                  </h2>
                  <p className="text-white/80 font-['Merriweather'] mb-4 text-lg">
                    {homepageEvent.description}
                  </p>
                  <div className="flex items-center gap-4 text-white/90">
                    <span className="font-['Montserrat']">{homepageEvent.date}</span>
                    <span>•</span>
                    <span className="font-['Montserrat']">{homepageEvent.time}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleHomepageEventLearnMore}
                  className="bg-[var(--gold)] text-[var(--wine-dark)] hover:bg-[var(--gold-light)] font-['Montserrat'] self-end"
                >
                  Learn More <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="text-white/80 font-['Merriweather'] text-lg">
                No featured event available right now.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* What We Do Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              What We Do
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0 }}
              whileHover={{ y: -8 }}
            >
              <Card className="p-8 hover:shadow-xl transition-shadow duration-300 border-2 border-[var(--wine)]/10 rounded-2xl h-full">
                <motion.div
                  className="w-16 h-16 bg-[var(--wine)] rounded-full flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <BookOpen className="w-8 h-8 text-[var(--gold)]" />
                </motion.div>
                <h3 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-4">
                  Worship & Word
                </h3>
                <p className="text-gray-600 font-['Merriweather'] mb-6">
                  We gather to worship God in spirit and truth, diving deep into His Word to grow in
                  faith and understanding.
                </p>
                <button
                  onClick={() => handleNavClick('about')}
                  className="text-[var(--wine)] hover:text-[var(--gold)] font-['Montserrat'] flex items-center gap-2 transition-colors duration-300"
                >
                  Read More <ArrowRight className="w-4 h-4" />
                </button>
              </Card>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.15 }}
              whileHover={{ y: -8 }}
            >
              <Card className="p-8 hover:shadow-xl transition-shadow duration-300 border-2 border-[var(--wine)]/10 rounded-2xl h-full">
                <motion.div
                  className="w-16 h-16 bg-[var(--wine)] rounded-full flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Users className="w-8 h-8 text-[var(--gold)]" />
                </motion.div>
                <h3 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-4">
                  Fellowship & Growth
                </h3>
                <p className="text-gray-600 font-['Merriweather'] mb-6">
                  Building authentic relationships and growing together through small groups, Bible
                  studies, and community life.
                </p>
                <button
                  onClick={() => handleNavClick('about')}
                  className="text-[var(--wine)] hover:text-[var(--gold)] font-['Montserrat'] flex items-center gap-2 transition-colors duration-300"
                >
                  Read More <ArrowRight className="w-4 h-4" />
                </button>
              </Card>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="p-8 hover:shadow-xl transition-shadow duration-300 border-2 border-[var(--wine)]/10 rounded-2xl h-full">
                <motion.div
                  className="w-16 h-16 bg-[var(--wine)] rounded-full flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Heart className="w-8 h-8 text-[var(--gold)]" />
                </motion.div>
                <h3 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-4">
                  Outreach & Impact
                </h3>
                <p className="text-gray-600 font-['Merriweather'] mb-6">
                  Spreading the love of Christ through community service, missions, and compassionate
                  outreach to those in need.
                </p>
                <button
                  onClick={() => handleNavClick('about')}
                  className="text-[var(--wine)] hover:text-[var(--gold)] font-['Montserrat'] flex items-center gap-2 transition-colors duration-300"
                >
                  Read More <ArrowRight className="w-4 h-4" />
                </button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Us + General Overseer Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: About Text */}
            <div>
              <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-6">
                About Us
              </h2>
              <div className="w-24 h-1 bg-[var(--gold)] mb-6"></div>
              <p className="text-gray-700 font-['Merriweather'] text-lg mb-6 leading-relaxed">
                Unlimited Grace and Mercy Worldwide Mission Inc. is a family of believers who embrace
                God's transforming grace. Based in Oyo State, Nigeria, we exist to spread love, hope,
                and the gospel of Christ.
              </p>
              <p className="text-gray-700 font-['Merriweather'] text-lg mb-6 leading-relaxed">
                We are a community where everyone is welcomed, loved, and empowered to discover their
                God-given purpose. Through worship, discipleship, and service, we are committed to
                making a lasting impact in our generation.
              </p>
              <Button
                onClick={() => handleNavClick('about')}
                className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
              >
                Learn More About Us
              </Button>
            </div>

            {/* Right: General Overseer Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={generalOverseerImg}
                  alt="General Overseer"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--wine)] to-transparent p-8">
                  <h3 className="font-['Montserrat'] text-2xl text-white mb-2">
                    Pastor Simon Y. Ojedapo
                  </h3>
                  <p className="text-[var(--gold)] font-['Montserrat']">General Overseer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Times Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              Our Weekly Services
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto mb-4"></div>
            <p className="text-gray-600 font-['Merriweather'] text-lg max-w-2xl mx-auto">
              Join us as we gather to worship, pray, and grow in the Word of God
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bible Study */}
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-t-4 border-[var(--wine)] rounded-2xl">
              <div className="w-16 h-16 bg-[var(--wine)] rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <h3 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-2">Bible Study</h3>
              <p className="text-[var(--gold)] font-['Montserrat'] mb-4">Tuesday</p>
              <div className="w-full h-px bg-[var(--gold)] my-4"></div>
              <p className="text-gray-600 font-['Merriweather'] mb-4">
                A time to grow deeper in the Word.
              </p>
              <p className="text-[var(--wine)] font-['Montserrat'] text-lg">5:30PM – 7:00PM</p>
            </Card>

            {/* Miracle Hour */}
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-t-4 border-[var(--wine)] rounded-2xl">
              <div className="w-16 h-16 bg-[var(--wine)] rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <h3 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-2">Miracle Hour</h3>
              <p className="text-[var(--gold)] font-['Montserrat'] mb-4">Thursday</p>
              <div className="w-full h-px bg-[var(--gold)] my-4"></div>
              <p className="text-gray-600 font-['Merriweather'] mb-4">
                A prayer and breakthrough service.
              </p>
              <p className="text-[var(--wine)] font-['Montserrat'] text-lg">5:30PM – 7:00PM</p>
            </Card>

            {/* Sunday Service */}
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-t-4 border-[var(--wine)] rounded-2xl">
              <div className="w-16 h-16 bg-[var(--wine)] rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <h3 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-2">
                Sunday Service
              </h3>
              <p className="text-[var(--gold)] font-['Montserrat'] mb-4">Sunday</p>
              <div className="w-full h-px bg-[var(--gold)] my-4"></div>
              <p className="text-gray-600 font-['Merriweather'] mb-4">
                Worship, word, and fellowship.
              </p>
              <p className="text-[var(--wine)] font-['Montserrat'] text-lg">8:00AM – 12:00PM</p>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => handleNavClick('service-times')}
              className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
            >
              View All Service Times
            </Button>
          </div>
        </div>
      </section>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sermon={selectedSermon}
      />

      {/* Join a Unit Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              Serve With Us
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto mb-4"></div>
            <p className="text-gray-600 font-['Merriweather'] text-lg">
              Use your gifts to serve God and His people
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* Choir */}
            <Card
              onClick={() => handleNavClick('join-unit?unit=choir')}
              className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer rounded-2xl"
            >
              <div className="w-16 h-16 bg-[var(--wine)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-[var(--wine)]" />
              </div>
              <h4 className="font-['Montserrat'] text-sm text-[var(--wine)]">Choir</h4>
            </Card>

            {/* Ushering */}
            <Card
              onClick={() => handleNavClick('join-unit?unit=ushering')}
              className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer rounded-2xl"
            >
              <div className="w-16 h-16 bg-[var(--wine)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-8 h-8 text-[var(--wine)]" />
              </div>
              <h4 className="font-['Montserrat'] text-sm text-[var(--wine)]">Ushering</h4>
            </Card>

            {/* Media */}
            <Card
              onClick={() => handleNavClick('join-unit?unit=media')}
              className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer rounded-2xl"
            >
              <div className="w-16 h-16 bg-[var(--wine)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-[var(--wine)]" />
              </div>
              <h4 className="font-['Montserrat'] text-sm text-[var(--wine)]">Media</h4>
            </Card>

            {/* Prayer Team */}
            <Card
              onClick={() => handleNavClick('join-unit?unit=prayer')}
              className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer rounded-2xl"
            >
              <div className="w-16 h-16 bg-[var(--wine)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-[var(--wine)]" />
              </div>
              <h4 className="font-['Montserrat'] text-sm text-[var(--wine)]">Prayer Team</h4>
            </Card>

            {/* Youth */}
            <Card
              onClick={() => handleNavClick('join-unit?unit=youth')}
              className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer rounded-2xl"
            >
              <div className="w-16 h-16 bg-[var(--wine)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[var(--wine)]" />
              </div>
              <h4 className="font-['Montserrat'] text-sm text-[var(--wine)]">Youth</h4>
            </Card>

            {/* Outreach */}
            <Card
              onClick={() => handleNavClick('join-unit?unit=outreach')}
              className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer rounded-2xl"
            >
              <div className="w-16 h-16 bg-[var(--wine)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-[var(--wine)]" />
              </div>
              <h4 className="font-['Montserrat'] text-sm text-[var(--wine)]">Outreach</h4>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => handleNavClick('join-unit')}
              className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
            >
              Join a Unit
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}