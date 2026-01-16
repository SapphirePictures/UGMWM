import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import churchLogo from 'figma:asset/a02d98e1848270468d8689a4d10185e04425697c.png';

interface NavigationProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function Navigation({ currentPage = 'home', onNavigate }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const desktopLinkBase =
    "relative pb-1 font-['Montserrat'] transition-colors after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:scale-x-0 after:bg-[var(--gold)] after:origin-left after:transition-transform after:duration-200 hover:after:scale-x-100";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    setMobileMenuOpen(false);
  };

  const desktopLinkColor =
    currentPage === 'home' && !isScrolled ? 'text-white' : isScrolled ? 'text-white' : 'text-black';

  const getDesktopLinkClass = (page: string) =>
    `${desktopLinkBase} ${desktopLinkColor} ${currentPage === page ? 'text-[var(--gold)] after:scale-x-100' : 'hover:text-[var(--gold)]'}`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[var(--wine)] shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 md:h-28">
          {/* Logo */}
          <div className="flex items-center cursor-pointer py-2" onClick={() => handleNavClick('home')}>
            <img
              src={churchLogo}
              alt="Unlimited Grace & Mercy Worldwide Mission Inc."
              className="h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 bg-[rgba(0,0,0,0)]">
            <button
              onClick={() => handleNavClick('home')}
              className={getDesktopLinkClass('home')}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={getDesktopLinkClass('about')}
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('watch-live')}
              className={getDesktopLinkClass('watch-live')}
            >
              Watch Live
            </button>
            <button
              onClick={() => handleNavClick('events')}
              className={getDesktopLinkClass('events')}
            >
              Events
            </button>
            {/* Temporarily hidden during development */}
            {/* 
            <button
              onClick={() => handleNavClick('event-gallery')}
              className={getDesktopLinkClass('event-gallery')}
            >
              Gallery
            </button>
            <button
              onClick={() => handleNavClick('sermons')}
              className={getDesktopLinkClass('sermons')}
            >
              Sermons
            </button>
            <button
              onClick={() => handleNavClick('resources')}
              className={getDesktopLinkClass('resources')}
            >
              Resources
            </button>
            */}
            <button
              onClick={() => handleNavClick('service-times')}
              className={getDesktopLinkClass('service-times')}
            >
              Service Times
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 transition-colors ${
              currentPage === 'home' || isScrolled ? 'text-white' : 'text-black'
            }`}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[var(--wine-dark)] rounded-lg mb-4 py-4">
            <div className="flex flex-col space-y-4 px-4">
              <button
                onClick={() => handleNavClick('home')}
                className={`text-white hover:text-[var(--gold)] transition-colors text-left font-['Montserrat'] ${
                  currentPage === 'home' ? 'text-[var(--gold)]' : ''
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className={`text-white hover:text-[var(--gold)] transition-colors text-left font-['Montserrat'] ${
                  currentPage === 'about' ? 'text-[var(--gold)]' : ''
                }`}
              >
                About
              </button>
              <button
                onClick={() => handleNavClick('watch-live')}
                className={`text-white hover:text-[var(--gold)] transition-colors text-left font-['Montserrat'] ${
                  currentPage === 'watch-live' ? 'text-[var(--gold)]' : ''
                }`}
              >
                Watch Live
              </button>
              <button
                onClick={() => handleNavClick('events')}
                className={`text-white hover:text-[var(--gold)] transition-colors text-left font-['Montserrat'] ${
                  currentPage === 'events' ? 'text-[var(--gold)]' : ''
                }`}
              >
                Events
              </button>
              {/* Temporarily hidden during development */}
              {/* 
              <button
                onClick={() => handleNavClick('event-gallery')}
                className={`text-white hover:text-[var(--gold)] transition-colors text-left font-['Montserrat'] ${
                  currentPage === 'event-gallery' ? 'text-[var(--gold)]' : ''
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => handleNavClick('sermons')}
                className={`text-white hover:text-[var(--gold)] transition-colors text-left font-['Montserrat'] ${
                  currentPage === 'sermons' ? 'text-[var(--gold)]' : ''
                }`}
              >
                Sermons
              </button>
              <button
                onClick={() => handleNavClick('resources')}
                className={`text-white hover:text-[var(--gold)] transition-colors text-left font-['Montserrat'] ${
                  currentPage === 'resources' ? 'text-[var(--gold)]' : ''
                }`}
              >
                Resources
              </button>
              */}
              <button
                onClick={() => handleNavClick('service-times')}
                className={`text-white hover:text-[var(--gold)] transition-colors text-left font-['Montserrat'] ${
                  currentPage === 'service-times' ? 'text-[var(--gold)]' : ''
                }`}
              >
                Service Times
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}