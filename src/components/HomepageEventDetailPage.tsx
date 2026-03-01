import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Calendar, Clock, ChevronLeft, ChevronRight, Lock, ArrowLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface EventDay {
  dayNumber: number;
  title: string;
  content: string;
  bannerImage?: string;
  liveDate: string; // ISO date string
  isManuallyLive: boolean;
}

interface HomepageEvent {
  title: string;
  description: string;
  date: string;
  time: string;
  isUpcoming: boolean;
  totalDays: number;
  days: EventDay[];
}

interface HomepageEventDetailPageProps {
  onNavigate?: (page: string) => void;
}

export function HomepageEventDetailPage({ onNavigate }: HomepageEventDetailPageProps) {
  const [event, setEvent] = useState<HomepageEvent | null>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();

    const handleHomepageEventUpdate = () => {
      fetchEventDetails(false);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchEventDetails(false);
      }
    };

    window.addEventListener('homepageEventUpdated', handleHomepageEventUpdate);
    window.addEventListener('focus', handleHomepageEventUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const refreshInterval = window.setInterval(() => {
      fetchEventDetails(false);
    }, 60000);

    return () => {
      window.removeEventListener('homepageEventUpdated', handleHomepageEventUpdate);
      window.removeEventListener('focus', handleHomepageEventUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearInterval(refreshInterval);
    };
  }, []);

  const getLiveDateStart = (liveDateValue: string): Date | null => {
    if (!liveDateValue) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(liveDateValue)) {
      const [year, month, day] = liveDateValue.split('-').map(Number);
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    const parsedDate = new Date(liveDateValue);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  const fetchEventDetails = async (showLoader: boolean = true) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const cacheBuster = Date.now();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/homepage-event?t=${cacheBuster}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Cache-Control': 'no-cache',
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }

      const data = await response.json();
      if (data.event) {
        setEvent(data.event);
        // Find the latest accessible day
        const accessibleDays = (data.event.days || [])
          .filter((day: EventDay) => isDayAccessible(day))
          .sort((a: EventDay, b: EventDay) => a.dayNumber - b.dayNumber);

        if (accessibleDays.length > 0) {
          setCurrentDay(accessibleDays[accessibleDays.length - 1].dayNumber);
        } else {
          setCurrentDay(1);
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  };

  const isDayAccessible = (day: EventDay): boolean => {
    if (!day) return false;
    
    // Manual override takes precedence
    if (day.isManuallyLive) return true;
    
    // Check if day is live based on date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const liveDate = getLiveDateStart(day.liveDate);
    if (!liveDate) return false;

    return liveDate <= today;
  };

  const getCurrentDayData = (): EventDay | null => {
    if (!event || !event.days) return null;
    return event.days.find(day => day.dayNumber === currentDay) || null;
  };

  const canNavigateToPrevious = (): boolean => {
    if (!event || !event.days) return false;
    return event.days.some(day => day.dayNumber < currentDay && isDayAccessible(day));
  };

  const canNavigateToNext = (): boolean => {
    if (!event || !event.days) return false;
    return event.days.some(day => day.dayNumber > currentDay && isDayAccessible(day));
  };

  const navigateToPrevious = () => {
    if (!event || !event.days) return;
    const previousDays = event.days
      .filter(day => day.dayNumber < currentDay && isDayAccessible(day))
      .sort((a, b) => b.dayNumber - a.dayNumber);
    
    if (previousDays.length > 0) {
      setCurrentDay(previousDays[0].dayNumber);
    }
  };

  const navigateToNext = () => {
    if (!event || !event.days) return;
    const nextDays = event.days
      .filter(day => day.dayNumber > currentDay && isDayAccessible(day))
      .sort((a, b) => a.dayNumber - b.dayNumber);
    
    if (nextDays.length > 0) {
      setCurrentDay(nextDays[0].dayNumber);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--wine)] mx-auto mb-4"></div>
          <p className="text-gray-600 font-['Merriweather']">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600 font-['Merriweather'] mb-4">Event not found</p>
          <Button onClick={() => onNavigate?.('home')} variant="outline">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const currentDayData = getCurrentDayData();
  const totalAccessibleDays = event.days?.filter(day => isDayAccessible(day)).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="bg-[var(--wine)] text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            onClick={() => onNavigate?.('home')}
            variant="outline"
            className="mb-6 border-white text-white hover:bg-white hover:text-[var(--wine)] font-['Montserrat']"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-6 h-6 text-[var(--gold)]" />
            {event.isUpcoming && (
              <span className="text-[var(--gold)] font-['Montserrat']">Upcoming Event</span>
            )}
          </div>

          <h1 className="font-['Montserrat'] text-3xl sm:text-4xl md:text-5xl mb-4 leading-tight">
            {event.title}
          </h1>

          <p className="text-white/80 font-['Merriweather'] text-lg mb-6 max-w-3xl">
            {event.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="font-['Montserrat']">{event.date}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-['Montserrat']">{event.time}</span>
            </div>
            {event.totalDays && (
              <>
                <span>•</span>
                <span className="font-['Montserrat']">{event.totalDays} Day Event</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Day Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        {/* Day Navigation */}
        <Card className="p-5 md:p-6 rounded-2xl mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-1">
                Day {currentDay} {currentDayData?.title && `- ${currentDayData.title}`}
              </h2>
              <p className="text-gray-600 font-['Merriweather'] text-sm">
                {totalAccessibleDays} of {event.totalDays || 1} days accessible
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={navigateToPrevious}
                disabled={!canNavigateToPrevious()}
                variant="outline"
                className="border-[var(--wine)] text-[var(--wine)] hover:bg-[var(--wine)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={navigateToNext}
                disabled={!canNavigateToNext()}
                variant="outline"
                className="border-[var(--wine)] text-[var(--wine)] hover:bg-[var(--wine)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Day Content */}
        {currentDayData ? (
          <div className="space-y-8">
            {/* Banner Image */}
            {currentDayData.bannerImage && (
              <Card className="overflow-hidden rounded-2xl">
                <ImageWithFallback
                  src={currentDayData.bannerImage}
                  alt={`Day ${currentDay} Banner`}
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: '500px' }}
                />
              </Card>
            )}

            {/* Content */}
            <Card className="p-8 rounded-2xl">
              <div 
                className="prose max-w-none font-['Merriweather'] text-gray-700"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {currentDayData.content || 'No content available for this day yet.'}
              </div>
            </Card>

            {/* Day Status Info */}
            <Card className="p-4 rounded-xl bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-['Montserrat'] text-sm text-blue-900 font-semibold mb-1">
                    Day {currentDay} Status
                  </p>
                  <p className="font-['Merriweather'] text-sm text-blue-700">
                    {currentDayData.isManuallyLive 
                      ? 'This day has been made available by the event organizers'
                      : `This day became available on ${new Date(currentDayData.liveDate).toLocaleDateString()}`
                    }
                  </p>
                </div>
              </div>
            </Card>

            {/* Locked Days Preview */}
            {event.days && event.days.some(day => !isDayAccessible(day)) && (
              <Card className="p-6 rounded-xl bg-gray-100 border-gray-300">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-['Montserrat'] text-sm text-gray-700 font-semibold mb-1">
                      More Content Coming Soon
                    </p>
                    <p className="font-['Merriweather'] text-sm text-gray-600">
                      Additional days will be unlocked according to the event schedule. Check back daily for new content!
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center rounded-2xl">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-['Montserrat'] text-xl text-gray-700 mb-2">
              Day {currentDay} Not Available Yet
            </h3>
            <p className="font-['Merriweather'] text-gray-600">
              This day's content hasn't been released yet. Please check back later!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
