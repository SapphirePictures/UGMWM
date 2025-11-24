import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface EventsPageProps {
  onNavigate?: (page: string) => void;
}

export function EventsPage({ onNavigate }: EventsPageProps) {
  const upcomingEvents = [
    {
      title: 'Annual Thanksgiving Service 2024',
      date: 'December 15, 2024',
      time: '8:00 AM - 2:00 PM',
      location: 'Main Sanctuary, Oyo State',
      description:
        'Join us for a special time of worship, thanksgiving, and testimonies as we celebrate God\'s goodness and faithfulness throughout the year. Expect powerful worship, inspiring messages, and a time of corporate thanksgiving.',
      image:
        'https://images.unsplash.com/photo-1626954499077-b56bd315594d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjB3b3JzaGlwJTIwTmlnZXJpYXxlbnwxfHx8fDE3NjMzOTc3Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'Youth Conference 2024',
      date: 'December 20-22, 2024',
      time: '6:00 PM - 9:00 PM Daily',
      location: 'Church Premises',
      description:
        'A three-day conference designed specifically for our youth. Powerful teachings, dynamic worship, and fellowship opportunities await. Theme: "Limitless in Christ" - Discovering your potential in God\'s grace.',
      image:
        'https://images.unsplash.com/photo-1551327420-4b280d52cc68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjBjb21tdW5pdHklMjBmZWxsb3dzaGlwfGVufDF8fHx8MTc2MzM5NzczMXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'End of Year Prayer & Praise Night',
      date: 'December 31, 2024',
      time: '9:00 PM - 12:30 AM',
      location: 'Main Sanctuary',
      description:
        'Cross over into the new year with us in prayer and praise. Join us for an evening of worship, thanksgiving, and prophetic declarations as we enter 2025 with faith and expectation.',
      image:
        'https://images.unsplash.com/photo-1729089049653-24312fdca908?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBwcmF5aW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzYzMzA4NDExfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  const pastEvents = [
    {
      title: 'Harvest Celebration',
      date: 'October 2024',
      description: 'A blessed time of thanksgiving for God\'s provision and abundance.',
    },
    {
      title: 'Grace Conference',
      date: 'September 2024',
      description: 'Three days of powerful teachings on living in God\'s grace.',
    },
    {
      title: 'Family Fun Day',
      date: 'August 2024',
      description: 'A day of fellowship, games, and bonding for families.',
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1626954499077-b56bd315594d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjB3b3JzaGlwJTIwTmlnZXJpYXxlbnwxfHx8fDE3NjMzOTc3Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080"
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
            {upcomingEvents.map((event, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-xl transition-shadow duration-300 rounded-2xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  {/* Image */}
                  <div className="lg:col-span-1 h-64 lg:h-auto">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-2 p-8">
                    <h3 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-4">
                      {event.title}
                    </h3>

                    <div className="flex flex-col gap-3 mb-6">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="w-5 h-5 text-[var(--gold)]" />
                        <span className="font-['Merriweather']">{event.date}</span>
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

                    <Button className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']">
                      Register Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              Past Events
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastEvents.map((event, index) => (
              <Card key={index} className="p-6 rounded-2xl hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-[var(--gold)]" />
                  <span className="text-[var(--gold)] font-['Montserrat']">{event.date}</span>
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
