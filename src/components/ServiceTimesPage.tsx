import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Clock, MapPin, Calendar, Users, BookOpen, Heart } from 'lucide-react';

interface ServiceTimesPageProps {
  onNavigate?: (page: string) => void;
}

export function ServiceTimesPage({ onNavigate }: ServiceTimesPageProps) {
  const weeklyServices = [
    {
      name: 'Sunday Service',
      day: 'Sunday',
      time: '8:00 AM - 12:00 PM',
      description: 'Our main worship service featuring powerful worship, inspiring messages, and fellowship.',
      icon: Users,
      color: 'bg-[var(--wine)]',
    },
    {
      name: 'Bible Study',
      day: 'Tuesday',
      time: '5:30 PM - 7:00 PM',
      description: 'A time to grow deeper in the Word through systematic Bible study and discussions.',
      icon: BookOpen,
      color: 'bg-[var(--wine)]',
    },
    {
      name: 'Miracle Hour',
      day: 'Thursday',
      time: '5:30 PM - 7:00 PM',
      description: 'A prayer and breakthrough service where we seek God for miracles and divine intervention.',
      icon: Heart,
      color: 'bg-[var(--wine)]',
    },
  ];

  const specialServices = [
    {
      name: 'Happy Home for Sisters',
      schedule: 'Every Monday',
      time: '4:30 PM - 6:00 PM',
      description: 'A program where sisters, single and married, pray for their homes.',
    },
    {
      name: 'Evangelism',
      schedule: 'Every Wednesday',
      time: '5:30 PM - 7:00 PM',
      description: 'Join us as we take the gospel to the streets, sharing the love of Christ with our community and winning souls for the Kingdom.',
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1626954499077-b56bd315594d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjB3b3JzaGlwJTIwTmlnZXJpYXxlbnwxfHx8fDE3NjMzOTc3Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Service Times"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[var(--wine)]/80"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-['Montserrat'] text-4xl md:text-5xl lg:text-6xl mb-4">
            Service Times
          </h1>
          <div className="w-24 h-1 bg-[var(--gold)] mx-auto mb-4"></div>
          <p className="font-['Merriweather'] text-lg md:text-xl max-w-2xl mx-auto">
            Join us for worship, prayer, and fellowship
          </p>
        </div>
      </section>

      {/* Weekly Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              Weekly Services
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto mb-4"></div>
            <p className="text-gray-600 font-['Merriweather'] text-lg max-w-2xl mx-auto">
              Our regular weekly gatherings for worship, growth, and community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {weeklyServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="p-8 text-center hover:shadow-xl transition-all duration-300 border-t-4 border-[var(--wine)] rounded-2xl"
                >
                  <div
                    className={`w-20 h-20 ${service.color} rounded-full flex items-center justify-center mx-auto mb-6`}
                  >
                    <Icon className="w-10 h-10 text-[var(--gold)]" />
                  </div>
                  <h3 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-2">
                    {service.name}
                  </h3>
                  <p className="text-[var(--gold)] font-['Montserrat'] mb-4">{service.day}</p>
                  <div className="w-full h-px bg-[var(--gold)] my-4"></div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-[var(--wine)]" />
                    <p className="text-[var(--wine)] font-['Montserrat'] text-lg">
                      {service.time}
                    </p>
                  </div>
                  <p className="text-gray-600 font-['Merriweather']">{service.description}</p>
                </Card>
              );
            })}
          </div>

          {/* Location Info */}
          <Card className="p-8 bg-gray-50 border-2 border-[var(--gold)] rounded-2xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-[var(--wine)] rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-[var(--gold)]" />
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-2">
                  Location
                </h3>
                <p className="text-gray-700 font-['Merriweather'] text-lg mb-2">
                  Unlimited Grace and Mercy Worldwide Mission Inc.
                </p>
                <p className="text-gray-600 font-['Merriweather']">
                  No. 01 Unlimited Grace & Mercy Crescent, Welcome Area, Ogbomoso, Oyo State, Nigeria
                </p>
              </div>
              <Button 
                onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=No.+01+Unlimited+Grace+%26+Mercy+Crescent,+Welcome+Area,+Ogbomoso,+Oyo+State,+Nigeria', '_blank')}
                className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
              >
                Get Directions
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Special Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              Special Services & Fellowships
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {specialServices.map((service, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[var(--wine)]/10 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-[var(--wine)]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[var(--gold)] font-['Montserrat'] text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>{service.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--wine)] font-['Montserrat'] text-sm mb-3">
                      <Clock className="w-4 h-4" />
                      <span>{service.time}</span>
                    </div>
                    <p className="text-gray-600 font-['Merriweather'] text-sm">
                      {service.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Featured: Monthly Revival */}
          <div className="mt-8">
            <Card className="bg-[var(--wine)] overflow-hidden rounded-2xl hover:shadow-xl transition-shadow">
              <div className="p-8 md:p-12">
                {/* Title */}
                <h3 className="font-['Montserrat'] text-[var(--gold)] text-2xl md:text-3xl text-center mb-8">
                  Our Monthly Revival
                </h3>

                {/* Three Time Slots */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                  {/* First Monday, Tuesday, Wednesday */}
                  <div className="flex flex-col gap-3 items-start md:items-center">
                    <p className="font-['Merriweather'] text-base md:text-lg md:text-center">
                      Every First Monday, Tuesday, & Wednesday of the month
                    </p>
                    <p className="font-['Montserrat'] font-bold text-xl md:text-2xl uppercase md:text-center">
                      5:00 PM - 7:00 PM
                    </p>
                  </div>

                  {/* Friday Vigil */}
                  <div className="flex flex-col gap-3 items-start md:items-center">
                    <p className="font-['Merriweather'] text-base md:text-lg text-center">
                      Friday Vigil
                    </p>
                    <p className="font-['Montserrat'] font-bold text-xl md:text-2xl uppercase">
                      FROM 11:00 PM
                    </p>
                  </div>

                  {/* Covenant Sunday */}
                  <div className="flex flex-col gap-3 items-start md:items-center">
                    <p className="font-['Merriweather'] text-base md:text-lg text-center">
                      Following Sunday
                      <br />
                      (Covenant Sunday)
                    </p>
                    <p className="font-['Montserrat'] font-bold text-xl md:text-2xl uppercase">
                      8:00 AM - 12:00 NOON
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              What to Expect
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 rounded-2xl">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-3">
                Warm Welcome
              </h3>
              <p className="text-gray-600 font-['Merriweather']">
                Our ushers and greeters will welcome you with warm smiles and help you find your
                seat. First-time visitors are especially celebrated!
              </p>
            </Card>

            <Card className="p-6 rounded-2xl">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-3">
                Spirit-Filled Worship
              </h3>
              <p className="text-gray-600 font-['Merriweather']">
                Experience powerful worship led by our talented worship team. We blend contemporary
                and traditional songs to create an atmosphere of praise.
              </p>
            </Card>

            <Card className="p-6 rounded-2xl">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-3">
                Relevant Messages
              </h3>
              <p className="text-gray-600 font-['Merriweather']">
                Our messages are biblically grounded and practically applicable to your everyday
                life. Expect to be inspired, challenged, and encouraged.
              </p>
            </Card>

            <Card className="p-6 rounded-2xl">
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-3">
                Genuine Fellowship
              </h3>
              <p className="text-gray-600 font-['Merriweather']">
                Connect with others before and after the service. We value authentic relationships
                and community.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-['Montserrat'] text-3xl md:text-4xl mb-6">
            We Can't Wait to Meet You!
          </h2>
          <p className="text-white/90 font-['Merriweather'] text-lg mb-8 max-w-2xl mx-auto">
            Join us this Sunday and experience the unlimited grace and mercy of God in a welcoming,
            Spirit-filled atmosphere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-[var(--gold)] text-[var(--wine-dark)] hover:bg-[var(--gold-light)] font-['Montserrat'] text-lg px-8 py-6">
              Plan Your Visit
            </Button>
            <Button
              onClick={() => onNavigate && onNavigate('about')}
              variant="outline"
              className="border-white text-[var(--wine)] hover:bg-white hover:text-[var(--wine)] font-['Montserrat'] text-lg px-8 py-6"
            >
              Learn More About Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}