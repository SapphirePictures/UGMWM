import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { syncEventsWithSupabase } from '../utils/storage';
import eventsHeroImg from '../assets/a02d98e1848270468d8689a4d10185e04425697c.png';

interface EventsPageProps {
  onNavigate?: (page: string) => void;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  displayDate: string;
  time: string;
  location: string;
  description: string;
  image?: string;
}

export function EventsPage({ onNavigate }: EventsPageProps) {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Load events from IndexedDB on component mount and when page becomes visible
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const events = await syncEventsWithSupabase();
        setAllEvents(Array.isArray(events) ? events : []);
      } catch (error) {
        console.error('Error loading events:', error);
        setAllEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    loadEvents();

    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', loadEvents);
    // Listen for custom event for same-tab updates
    window.addEventListener('localStorageUpdate', loadEvents);
    
    return () => {
      window.removeEventListener('storage', loadEvents);
      window.removeEventListener('localStorageUpdate', loadEvents);
    };
  }, []);

  // Get today's date at midnight for accurate comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Automatically filter events based on current date
  const upcomingEvents = allEvents.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const allPastEvents = allEvents.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Display only the 3 most recent past events
  const recentPastEvents = allPastEvents.slice(0, 3);
  
  // All other events (both upcoming and past combined for the all events section)
  const allEventsForSection = [...upcomingEvents, ...allPastEvents].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={eventsHeroImg}
            alt="Events"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[var(--wine)]/80"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-['Montserrat'] text-4xl md:text-5xl lg:text-6xl mb-4">
            Events & Programmes
          </h1>
          <div className="w-24 h-1 bg-[var(--gold)] mx-auto mb-4"></div>
          <p className="font-['Merriweather'] text-lg md:text-xl max-w-2xl mx-auto">
            Join us for life-changing gatherings and special events
          </p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              Upcoming Events
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
          </div>

          <div className="space-y-8">
            {isLoadingEvents ? (
              [...Array(2)].map((_, index) => (
                <Card key={`event-loader-${index}`} className="overflow-hidden rounded-2xl">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 animate-pulse">
                    <div className="lg:col-span-1 h-64 lg:h-auto bg-gray-200"></div>
                    <div className="lg:col-span-2 p-8">
                      <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
                      <div className="space-y-3 mb-6">
                        <div className="h-5 w-1/2 bg-gray-200 rounded"></div>
                        <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
                        <div className="h-5 w-2/3 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-5 w-full bg-gray-200 rounded mb-2"></div>
                      <div className="h-5 w-5/6 bg-gray-200 rounded mb-6"></div>
                      <div className="h-10 w-40 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </Card>
              ))
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-xl transition-shadow duration-300 rounded-2xl cursor-pointer"
                  onClick={() => onNavigate?.(`event-detail-${event.id}`)}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                    {/* Image */}
                    <div className="lg:col-span-1 h-64 lg:h-auto bg-gray-200">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)]"><svg class="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)]">
                          <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-2 p-8">
                      <h3 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-4">
                        {event.title}
                      </h3>

                      <div className="flex flex-col gap-3 mb-6">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Calendar className="w-5 h-5 text-[var(--gold)]" />
                          <span className="font-['Merriweather']">{event.displayDate}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Clock className="w-5 h-5 text-[var(--gold)]" />
                          <span className="font-['Merriweather']">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <MapPin className="w-5 h-5 text-[var(--gold)]" />
                          <span className="font-['Merriweather']">{event.location}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 font-['Merriweather'] mb-6 leading-relaxed">
                        {event.description}
                      </p>

                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate?.(`event-detail-${event.id}`);
                        }}
                        className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
                      >
                        View Event Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 rounded-2xl text-center">
                <p className="text-gray-600 font-['Merriweather']">No upcoming events available.</p>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Regular Activities */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              Regular Activities
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[var(--wine)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">
                Sunday Service
              </h3>
              <p className="text-gray-600 font-['Merriweather'] text-sm mb-2">Every Sunday</p>
              <p className="text-[var(--gold)] font-['Montserrat']">8:00 AM - 12:00 PM</p>
            </Card>

            <Card className="p-6 text-center rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[var(--wine)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">Bible Study</h3>
              <p className="text-gray-600 font-['Merriweather'] text-sm mb-2">Every Tuesday</p>
              <p className="text-[var(--gold)] font-['Montserrat']">5:30 PM - 7:00 PM</p>
            </Card>

            <Card className="p-6 text-center rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[var(--wine)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">
                Miracle Hour
              </h3>
              <p className="text-gray-600 font-['Merriweather'] text-sm mb-2">Every Thursday</p>
              <p className="text-[var(--gold)] font-['Montserrat']">5:30 PM - 7:00 PM</p>
            </Card>

            <Card className="p-6 text-center rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[var(--wine)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">
                Youth Meetings
              </h3>
              <p className="text-gray-600 font-['Merriweather'] text-sm mb-2">1st & 3rd Friday</p>
              <p className="text-[var(--gold)] font-['Montserrat']">6:00 PM - 8:00 PM</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Past Events */}
      {recentPastEvents.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
                Recent Past Events
              </h2>
              <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPastEvents.map((event, index) => (
                <Card 
                  key={index} 
                  className="p-6 rounded-2xl hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onNavigate?.(`event-detail-${event.id}`)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-[var(--gold)]" />
                    <span className="text-[var(--gold)] font-['Montserrat']">{event.displayDate}</span>
                  </div>
                  <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-3">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 font-['Merriweather'] text-sm">{event.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* View All Events Button */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-6">
            Looking for More Events?
          </h2>
          <p className="text-gray-600 font-['Merriweather'] text-lg mb-8 max-w-2xl mx-auto">
            Browse through our complete archive of events - both past and upcoming
          </p>
          <Button 
            onClick={() => onNavigate?.('all-events')}
            className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat'] text-lg px-8 py-6"
          >
            View All Events
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[var(--wine)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-['Montserrat'] text-3xl md:text-4xl mb-6">
            Don't Miss Our Next Event
          </h2>
          <p className="text-white/90 font-['Merriweather'] text-lg mb-8 max-w-2xl mx-auto">
            Stay connected and be the first to know about upcoming events and programs
          </p>
          <Button className="bg-[var(--gold)] text-[var(--wine-dark)] hover:bg-[var(--gold-light)] font-['Montserrat'] text-lg px-8 py-6">
            Subscribe to Updates
          </Button>
        </div>
      </section>
    </div>
  );
}
