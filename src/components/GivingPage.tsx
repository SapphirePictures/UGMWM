import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Gift, Heart, DollarSign, Building, Users, BookOpen } from 'lucide-react';

interface GivingPageProps {
  onNavigate?: (page: string) => void;
}

export function GivingPage({ onNavigate }: GivingPageProps) {
  const givingMethods = [
    {
      title: 'Online Giving',
      description: 'Give securely online using your debit card, credit card, or bank transfer.',
      icon: DollarSign,
    },
    {
      title: 'Bank Transfer',
      description: 'Transfer directly to our church account. Contact us for account details.',
      icon: Building,
    },
    {
      title: 'In-Person',
      description: 'Give during our services or visit the church office during office hours.',
      icon: Gift,
    },
  ];

  const givingAreas = [
    {
      title: 'Tithes & Offerings',
      description:
        'Support the general operations of the church, including staff, facilities, and ministry programs.',
      icon: Heart,
    },
    {
      title: 'Building Fund',
      description:
        'Help us expand our facilities to accommodate our growing congregation and reach more souls.',
      icon: Building,
    },
    {
      title: 'Missions & Outreach',
      description:
        'Support our local and international mission efforts, community outreach, and evangelism.',
      icon: Users,
    },
    {
      title: 'Special Projects',
      description:
        'Contribute to specific projects like youth programs, women\'s ministry, and special events.',
      icon: BookOpen,
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1551327420-4b280d52cc68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjBjb21tdW5pdHklMjBmZWxsb3dzaGlwfGVufDF8fHx8MTc2MzM5NzczMXww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Giving"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)]/90"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <div className="w-20 h-20 bg-[var(--gold)] rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-[var(--wine)]" />
          </div>
          <h1 className="font-['Montserrat'] text-4xl md:text-5xl lg:text-6xl mb-4">
            Give
          </h1>
          <div className="w-24 h-1 bg-[var(--gold)] mx-auto mb-4"></div>
          <p className="font-['Merriweather'] text-lg md:text-xl max-w-2xl mx-auto">
            Partner with us to spread God's love and reach more souls
          </p>
        </div>
      </section>

      {/* Why Give */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              Why Give?
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
          </div>

          <div className="space-y-6 text-center">
            <p className="text-gray-700 font-['Merriweather'] text-lg leading-relaxed">
              "Give, and it will be given to you. A good measure, pressed down, shaken together and
              running over, will be poured into your lap. For with the measure you use, it will be
              measured to you."
            </p>
            <p className="text-[var(--gold)] font-['Montserrat'] text-lg">— Luke 6:38</p>
          </div>

          <div className="mt-12 space-y-6 text-gray-700 font-['Merriweather'] text-lg leading-relaxed">
            <p>
              Giving is an act of worship and obedience to God. When we give, we acknowledge that
              everything we have comes from Him, and we trust Him to provide for our needs.
            </p>
            <p>
              Your generous giving enables us to continue our mission of spreading the gospel,
              serving our community, and making disciples. Together, we can make a lasting impact for
              the Kingdom of God.
            </p>
            <p>
              Whether through tithes, offerings, or special gifts, every contribution—no matter the
              size—makes a difference in fulfilling God's purposes through our ministry.
            </p>
          </div>
        </div>
      </section>

      {/* Giving Areas */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              Where Your Giving Goes
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {givingAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <Card key={index} className="p-8 hover:shadow-xl transition-shadow rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-[var(--wine)] rounded-full flex items-center justify-center">
                        <Icon className="w-7 h-7 text-[var(--gold)]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-3">
                        {area.title}
                      </h3>
                      <p className="text-gray-600 font-['Merriweather']">{area.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Give */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              How to Give
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {givingMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card
                  key={index}
                  className="p-8 text-center hover:shadow-xl transition-shadow rounded-2xl"
                >
                  <div className="w-16 h-16 bg-[var(--wine)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-[var(--wine)]" />
                  </div>
                  <h3 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-3">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 font-['Merriweather']">{method.description}</p>
                </Card>
              );
            })}
          </div>

          {/* Bank Details */}
          <Card className="p-8 bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] rounded-2xl">
            <div className="text-center mb-6">
              <h3 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-2">
                Bank Account Details
              </h3>
              <p className="text-[var(--wine-dark)] font-['Merriweather']">
                For direct bank transfers
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4 text-[var(--wine-dark)]">
              <div className="flex justify-between items-center border-b border-[var(--wine)]/20 pb-3">
                <span className="font-['Montserrat']">Bank Name:</span>
                <span className="font-['Merriweather']">[Bank Name]</span>
              </div>
              <div className="flex justify-between items-center border-b border-[var(--wine)]/20 pb-3">
                <span className="font-['Montserrat']">Account Name:</span>
                <span className="font-['Merriweather']">
                  Unlimited Grace and Mercy Worldwide Mission Inc.
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[var(--wine)]/20 pb-3">
                <span className="font-['Montserrat']">Account Number:</span>
                <span className="font-['Merriweather']">XXXX XXXX XXXX</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-['Montserrat']">Sort Code:</span>
                <span className="font-['Merriweather']">XXX-XXX</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Online Giving CTA */}
      <section className="py-20 bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-[var(--gold)] rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-[var(--wine)]" />
          </div>
          <h2 className="font-['Montserrat'] text-3xl md:text-4xl mb-6">Give Online Now</h2>
          <p className="text-white/90 font-['Merriweather'] text-lg mb-8 max-w-2xl mx-auto">
            Make a secure online donation today. Your generosity helps us continue to spread God's
            love and transform lives.
          </p>
          <Button className="bg-[var(--gold)] text-[var(--wine-dark)] hover:bg-[var(--gold-light)] font-['Montserrat'] text-lg px-10 py-6">
            Give Now
          </Button>
          <p className="text-white/70 font-['Merriweather'] text-sm mt-6">
            All donations are secure and tax-deductible
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              Impact Stories
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 rounded-2xl">
              <div className="mb-4">
                <div className="w-12 h-12 bg-[var(--wine)]/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-[var(--wine)]" />
                </div>
              </div>
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-3">
                Community Outreach
              </h3>
              <p className="text-gray-600 font-['Merriweather']">
                "Through your giving, we've been able to feed over 500 families in our community and
                share the gospel with hundreds of souls."
              </p>
            </Card>

            <Card className="p-6 rounded-2xl">
              <div className="mb-4">
                <div className="w-12 h-12 bg-[var(--wine)]/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[var(--wine)]" />
                </div>
              </div>
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-3">
                Youth Programs
              </h3>
              <p className="text-gray-600 font-['Merriweather']">
                "Your support has enabled us to mentor and disciple young people, providing them with
                resources and guidance to grow in their faith."
              </p>
            </Card>

            <Card className="p-6 rounded-2xl">
              <div className="mb-4">
                <div className="w-12 h-12 bg-[var(--wine)]/10 rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6 text-[var(--wine)]" />
                </div>
              </div>
              <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-3">
                Facility Expansion
              </h3>
              <p className="text-gray-600 font-['Merriweather']">
                "Thanks to your generosity, we're expanding our facilities to better serve our
                growing congregation and host more impactful events."
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl text-[var(--wine)] mb-4">
              Questions About Giving?
            </h2>
            <div className="w-24 h-1 bg-[var(--gold)] mx-auto mb-6"></div>
            <p className="text-gray-600 font-['Merriweather'] text-lg">
              We're here to help! If you have any questions about giving, please don't hesitate to
              reach out to our church office.
            </p>
          </div>

          <div className="text-center">
            <Button className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']">
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
