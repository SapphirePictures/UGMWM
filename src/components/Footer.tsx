import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const [clickCount, setClickCount] = React.useState(0);
  const [clickTimeout, setClickTimeout] = React.useState<NodeJS.Timeout | null>(null);

  const handleNavClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Clear existing timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }

    // Navigate to admin after 3 clicks
    if (newCount === 3) {
      if (onNavigate) {
        onNavigate('you-are-unlimited');
      }
      setClickCount(0);
      setClickTimeout(null);
    } else {
      // Reset counter after 2 seconds of no clicks
      const timeout = setTimeout(() => {
        setClickCount(0);
      }, 2000);
      setClickTimeout(timeout);
    }
  };

  return (
    <footer className="bg-[var(--wine)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section with Logo */}
          <div>
            <div
              onClick={handleLogoClick}
              className="cursor-pointer mb-4"
            >
              <h3 className="font-['Montserrat'] text-[var(--gold)] mb-1">
                Unlimited Grace and Mercy
              </h3>
              <p className="font-['Montserrat'] text-sm text-[var(--gold-light)]">
                Worldwide Mission Inc.
              </p>
            </div>
            <p className="text-white/80 mb-4 font-['Merriweather']">
              A gathering of souls enjoying the unlimited grace and mercy of God.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Montserrat'] text-[var(--gold)] mb-4">
              Quick Links
            </h4>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleNavClick('about')}
                className="text-white/80 hover:text-[var(--gold)] transition-colors text-left font-['Montserrat']"
              >
                About
              </button>
              <button
                onClick={() => handleNavClick('events')}
                className="text-white/80 hover:text-[var(--gold)] transition-colors text-left font-['Montserrat']"
              >
                Events
              </button>
              <button
                onClick={() => handleNavClick('sermons')}
                className="text-white/80 hover:text-[var(--gold)] transition-colors text-left font-['Montserrat']"
              >
                Sermons
              </button>
              <button
                onClick={() => handleNavClick('service-times')}
                className="text-white/80 hover:text-[var(--gold)] transition-colors text-left font-['Montserrat']"
              >
                Service Times
              </button>
              <button
                onClick={() => handleNavClick('giving')}
                className="text-white/80 hover:text-[var(--gold)] transition-colors text-left font-['Montserrat']"
              >
                Giving
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-['Montserrat'] text-[var(--gold)] mb-4">
              Contact Us
            </h4>
            <div className="flex flex-col space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-[var(--gold)] mt-1 flex-shrink-0" />
                <span className="text-white/80 font-['Merriweather']">
                  Oyo State, Nigeria
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[var(--gold)] flex-shrink-0" />
                <span className="text-white/80 font-['Merriweather']">
                  +234 70 0020 0099
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[var(--gold)] flex-shrink-0" />
                <span className="text-white/80 font-['Merriweather']">
                  unlimitedgraceandmercy@yahoo.com
                </span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[var(--gold)] flex items-center justify-center text-[var(--wine)] hover:bg-[var(--gold-light)] transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[var(--gold)] flex items-center justify-center text-[var(--wine)] hover:bg-[var(--gold-light)] transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[var(--gold)] flex items-center justify-center text-[var(--wine)] hover:bg-[var(--gold-light)] transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[var(--gold)] flex items-center justify-center text-[var(--wine)] hover:bg-[var(--gold-light)] transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6 text-center">
          <p className="text-white/60 font-['Merriweather']">
            © 2024 Unlimited Grace and Mercy Worldwide Mission Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
