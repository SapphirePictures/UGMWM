import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { getAllEvents } from '../utils/storage';

interface AllEventsPageProps {
  onNavigate?: (page: string) => void;
}

export function AllEventsPage({ onNavigate }: AllEventsPageProps) {
  const [allEvents, setAllEvents] = useState<any[]>([]);

  // Load events from IndexedDB on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const events = await getAllEvents();
        setAllEvents(events);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    loadEvents();

    // Listen for storage updates
    window.addEventListener('storage', loadEvents);
    window.addEventListener('localStorageUpdate', loadEvents);
    
    return () => {
      window.removeEventListener('storage', loadEvents);
      window.removeEventListener('localStorageUpdate', loadEvents);
    };
  }, []);

  // Get today's date at midnight for accurate comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort all events by date (most recent first)
  const sortedEvents = [...allEvents].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1626954499077-b56bd315594d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjB3b3JzaGlwJTIwTmlnZXJpYXxlbnwxfHx8fDE3NjMzOTc3Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="All Events"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[var(--wine)]/80"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-['Montserrat'] text-4xl md:text-5xl lg:text-6xl mb-4">
            All Events
          </h1>
          <div className="w-24 h-1 bg-[var(--gold)] mx-auto mb-4"></div>
          <p className="font-['Merriweather'] text-lg md:text-xl max-w-2xl mx-auto">
            Complete archive of all our church events
          </p>
        </div>
      </section>

      {/* Back Button */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            onClick={() => onNavigate?.('events')}
            variant="outline"
            className="font-['Montserrat']"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </section>

      {/* All Events Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              Browse All Events
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto mb-4"></div>
            <p className="text-gray-600 font-['Merriweather'] text-lg">
              {sortedEvents.length} events total
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event, index) => {
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0);
              const isPast = eventDate < today;

              return (
                <Card 
                  key={index} 
                  className="p-6 rounded-2xl hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onNavigate?.(`event-detail-${event.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[var(--gold)]" />
                      <span className="text-[var(--gold)] font-['Montserrat']">{event.displayDate}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-['Montserrat'] ${
                      isPast 
                        ? 'bg-gray-200 text-gray-600' 
                        : 'bg-[var(--wine)]/10 text-[var(--wine)]'
                    }`}>
                      {isPast ? 'Past' : 'Upcoming'}
                    </span>
                  </div>
                  <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-3">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 font-['Merriweather'] text-sm mb-4">{event.description}</p>
                  {event.time && event.location && (
                    <div className="space-y-1 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="font-['Merriweather']">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span className="font-['Merriweather']">{event.location}</span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
