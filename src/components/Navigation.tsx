import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function Navigation({ currentPage = 'home', onNavigate }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[var(--wine)] shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNavClick('home')}>
            <div className="flex flex-col">
              <span className={`font-['Montserrat'] font-semibold sm:text-base leading-tight text-[20px] ${
                currentPage === 'home' || isScrolled ? 'text-white' : 'text-white md:text-white max-md:text-black'
              }`}>
                Unlimited Grace and Mercy
              </span>
              <span className={`font-['Montserrat'] text-xs sm:text-sm text-[var(--gold)]`}>
                Worldwide Mission Inc.
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 bg-[rgba(0,0,0,0)]">
            <button
              onClick={() => handleNavClick('home')}
              className={`${currentPage === 'home' && !isScrolled ? 'text-white' : isScrolled ? 'text-white' : 'text-black'} hover:text-[var(--gold)] transition-colors font-['Montserrat'] ${
                currentPage === 'home' ? 'text-[var(--gold)]' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`${currentPage === 'home' && !isScrolled ? 'text-white' : isScrolled ? 'text-white' : 'text-black'} hover:text-[var(--gold)] transition-colors font-['Montserrat'] ${
                currentPage === 'about' ? 'text-[var(--gold)]' : ''
              }`}
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('watch-live')}
              className={`${currentPage === 'home' && !isScrolled ? 'text-white' : isScrolled ? 'text-white' : 'text-black'} hover:text-[var(--gold)] transition-colors font-['Montserrat'] ${
                currentPage === 'watch-live' ? 'text-[var(--gold)]' : ''
              }`}
            >
              Watch Live
            </button>
            <button
              onClick={() => handleNavClick('events')}
              className={`${currentPage === 'home' && !isScrolled ? 'text-white' : isScrolled ? 'text-white' : 'text-black'} hover:text-[var(--gold)] transition-colors font-['Montserrat'] ${
                currentPage === 'events' ? 'text-[var(--gold)]' : ''
              }`}
            >
              Events
            </button>
            <button
              onClick={() => handleNavClick('sermons')}
              className={`${currentPage === 'home' && !isScrolled ? 'text-white' : isScrolled ? 'text-white' : 'text-black'} hover:text-[var(--gold)] transition-colors font-['Montserrat'] ${
                currentPage === 'sermons' ? 'text-[var(--gold)]' : ''
              }`}
            >
              Sermons
            </button>
            <button
              onClick={() => handleNavClick('resources')}
              className={`${currentPage === 'home' && !isScrolled ? 'text-white' : isScrolled ? 'text-white' : 'text-black'} hover:text-[var(--gold)] transition-colors font-['Montserrat'] ${
                currentPage === 'resources' ? 'text-[var(--gold)]' : ''
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => handleNavClick('service-times')}
              className={`${currentPage === 'home' && !isScrolled ? 'text-white' : isScrolled ? 'text-white' : 'text-black'} hover:text-[var(--gold)] transition-colors font-['Montserrat'] ${
                currentPage === 'service-times' ? 'text-[var(--gold)]' : ''
              }`}
            >
              Service Times
            </button>
            <Button
              onClick={() => handleNavClick('giving')}
              className="bg-[var(--gold)] text-[var(--wine-dark)] hover:bg-[var(--gold-light)] font-['Montserrat']"
            >
              Give
            </Button>
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
              <button
                onClick={() => handleNavClick('service-times')}
                className={`text-white hover:text-[var(--gold)] transition-colors text-left font-['Montserrat'] ${
                  currentPage === 'service-times' ? 'text-[var(--gold)]' : ''
                }`}
              >
                Service Times
              </button>
              <Button
                onClick={() => handleNavClick('giving')}
                className="bg-[var(--gold)] text-[var(--wine-dark)] hover:bg-[var(--gold-light)] font-['Montserrat'] w-full"
              >
                Give
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}