import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { LogOut, Save, Calendar, Clock, Loader2, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface AdminHomepageEventPageProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

interface HomepageEvent {
  title: string;
  description: string;
  date: string;
  time: string;
}

export function AdminHomepageEventPage({ onNavigate, onLogout }: AdminHomepageEventPageProps) {
  const [event, setEvent] = useState<HomepageEvent>({
    title: '',
    description: '',
    date: '',
    time: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchHomepageEvent();
  }, []);

  const fetchHomepageEvent = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/homepage-event`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch homepage event');
      }

      const data = await response.json();
      if (data.event) {
        setEvent(data.event);
      }
    } catch (error) {
      console.error('Error fetching homepage event:', error);
      toast.error('Failed to load homepage event');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!event.title.trim()) {
      toast.error('Please enter an event title');
      return;
    }
    if (!event.description.trim()) {
      toast.error('Please enter an event description');
      return;
    }
    if (!event.date.trim()) {
      toast.error('Please enter an event date');
      return;
    }
    if (!event.time.trim()) {
      toast.error('Please enter an event time');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/homepage-event`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save homepage event');
      }

      toast.success('Homepage event updated successfully!');
    } catch (error) {
      console.error('Error saving homepage event:', error);
      toast.error('Failed to save homepage event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Montserrat'] text-3xl text-[var(--wine)] mb-2">
              Homepage Event Manager
            </h1>
            <p className="text-gray-600 font-['Merriweather']">
              Update the featured event card displayed on the homepage below the hero section
            </p>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="border-[var(--wine)] text-[var(--wine)] hover:bg-[var(--wine)] hover:text-white font-['Montserrat']"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {isFetching ? (
          <Card className="p-12 rounded-2xl">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-[var(--wine)] mb-4" />
              <p className="text-gray-600 font-['Merriweather']">Loading event data...</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Event Form */}
            <Card className="p-8 rounded-2xl border-t-4 border-[var(--wine)]">
              <h2 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-6">
                Event Details
              </h2>

              <div className="space-y-6">
                {/* Event Title */}
                <div>
                  <label className="block text-sm font-['Montserrat'] text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <Input
                    type="text"
                    value={event.title}
                    onChange={(e) => setEvent({ ...event, title: e.target.value })}
                    placeholder="e.g., Annual Thanksgiving Service 2024"
                    className="font-['Merriweather']"
                  />
                </div>

                {/* Event Description */}
                <div>
                  <label className="block text-sm font-['Montserrat'] text-gray-700 mb-2">
                    Event Description *
                  </label>
                  <Textarea
                    value={event.description}
                    onChange={(e) => setEvent({ ...event, description: e.target.value })}
                    placeholder="Enter a compelling description of the event..."
                    rows={4}
                    className="font-['Merriweather']"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Date */}
                  <div>
                    <label className="block text-sm font-['Montserrat'] text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        value={event.date}
                        onChange={(e) => setEvent({ ...event, date: e.target.value })}
                        placeholder="e.g., December 15, 2024"
                        className="pl-10 font-['Merriweather']"
                      />
                    </div>
                  </div>

                  {/* Event Time */}
                  <div>
                    <label className="block text-sm font-['Montserrat'] text-gray-700 mb-2">
                      Event Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        value={event.time}
                        onChange={(e) => setEvent({ ...event, time: e.target.value })}
                        placeholder="e.g., 8:00 AM - 2:00 PM"
                        className="pl-10 font-['Merriweather']"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat'] flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Event
                    </>
                  )}
                </Button>
                <Button
                  onClick={fetchHomepageEvent}
                  disabled={isLoading || isFetching}
                  variant="outline"
                  className="border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white font-['Montserrat']"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </Card>

            {/* Preview Card */}
            <Card className="p-8 rounded-2xl bg-[var(--wine)] text-white border-2 border-[var(--gold)]">
              <h2 className="font-['Montserrat'] text-xl text-[var(--gold)] mb-4">
                Live Preview
              </h2>
              <p className="text-white/70 font-['Merriweather'] text-sm mb-6">
                This is how the event will appear on the homepage
              </p>

              <div className="bg-[var(--wine-dark)] rounded-2xl p-8 border-2 border-[var(--gold)]">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-6 h-6 text-[var(--gold)]" />
                  <span className="text-[var(--gold)] font-['Montserrat']">
                    Upcoming Event
                  </span>
                </div>
                <h2 className="font-['Montserrat'] text-3xl md:text-4xl mb-4">
                  {event.title || 'Event Title'}
                </h2>
                <p className="text-white/80 font-['Merriweather'] mb-4 text-lg">
                  {event.description || 'Event description will appear here...'}
                </p>
                <div className="flex items-center gap-4 text-white/90">
                  <span className="font-['Montserrat']">{event.date || 'Event Date'}</span>
                  <span>•</span>
                  <span className="font-['Montserrat']">{event.time || 'Event Time'}</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
