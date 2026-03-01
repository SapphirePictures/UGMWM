import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { LogOut, Save, Calendar, Clock, Loader2, RefreshCw, Upload, Plus, Trash2, CalendarDays } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface AdminHomepageEventPageProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

interface EventDay {
  dayNumber: number;
  title: string;
  content: string;
  bannerImage: string;
  liveDate: string;
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

export function AdminHomepageEventPage({ onNavigate, onLogout }: AdminHomepageEventPageProps) {
  const [event, setEvent] = useState<HomepageEvent>({
    title: '',
    description: '',
    date: '',
    time: '',
    isUpcoming: true,
    totalDays: 1,
    days: [],
  });
  const [selectedDay, setSelectedDay] = useState(1);
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
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch homepage event');
      }

      const data = await response.json();
      if (data.event) {
        setEvent(data.event);
        // Initialize days array if it doesn't exist
        if (!data.event.days || data.event.days.length === 0) {
          initializeDays(data.event.totalDays || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching homepage event:', error);
      toast.error('Failed to load homepage event');
    } finally {
      setIsFetching(false);
    }
  };

  const initializeDays = (totalDays: number) => {
    const days: EventDay[] = [];
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        dayNumber: i,
        title: '',
        content: '',
        bannerImage: '',
        liveDate: new Date(Date.now() + (i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isManuallyLive: false,
      });
    }
    setEvent(prev => ({ ...prev, days }));
  };

  const handleTotalDaysChange = (newTotal: number) => {
    const total = Math.max(1, Math.min(365, newTotal)); // Cap at 365 days
    setEvent(prev => {
      const existingDays = prev.days || [];
      const days: EventDay[] = [];
      
      for (let i = 1; i <= total; i++) {
        const existing = existingDays.find(d => d.dayNumber === i);
        if (existing) {
          days.push(existing);
        } else {
          days.push({
            dayNumber: i,
            title: '',
            content: '',
            bannerImage: '',
            liveDate: new Date(Date.now() + (i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isManuallyLive: false,
          });
        }
      }
      
      return { ...prev, totalDays: total, days };
    });
    
    // Adjust selectedDay if needed
    if (selectedDay > total) {
      setSelectedDay(total);
    }
  };

  const updateDayField = <K extends keyof EventDay>(field: K, value: EventDay[K]) => {
    setEvent(prev => ({
      ...prev,
      days: prev.days.map(day =>
        day.dayNumber === selectedDay ? { ...day, [field]: value } : day
      ),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateDayField('bannerImage', base64);
      toast.success('Image uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const getCurrentDay = (): EventDay | undefined => {
    return event.days.find(d => d.dayNumber === selectedDay);
  };

  const buildNormalizedDaysForSave = (): EventDay[] => {
    const totalDays = Math.max(1, Number(event.totalDays) || 1);
    const existingDays = Array.isArray(event.days) ? event.days : [];

    return Array.from({ length: totalDays }, (_, index) => {
      const dayNumber = index + 1;
      const existing = existingDays.find((day) => Number(day.dayNumber) === dayNumber);

      return {
        dayNumber,
        title: existing?.title || '',
        content: existing?.content || '',
        bannerImage: existing?.bannerImage || '',
        liveDate: existing?.liveDate || new Date().toISOString().split('T')[0],
        isManuallyLive: Boolean(existing?.isManuallyLive),
      };
    });
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

    const normalizedDays = buildNormalizedDaysForSave();
    const payload = {
      ...event,
      totalDays: Math.max(1, Number(event.totalDays) || 1),
      days: normalizedDays,
    };

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
          cache: 'no-store',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save homepage event');
      }

      setEvent(payload);
      window.dispatchEvent(new Event('homepageEventUpdated'));
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

                {/* Upcoming Event Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex-1">
                    <label className="block text-sm font-['Montserrat'] text-gray-700 font-semibold mb-1">
                      Mark as Upcoming Event
                    </label>
                    <p className="text-xs text-gray-500 font-['Merriweather']">
                      {event.isUpcoming 
                        ? '✓ "Upcoming Event" tag will be displayed on the homepage banner' 
                        : '✗ "Upcoming Event" tag will NOT be displayed on the homepage banner'}
                    </p>
                  </div>
                  <Switch
                    checked={event.isUpcoming}
                    onCheckedChange={(checked) => setEvent({ ...event, isUpcoming: checked })}
                    style={{
                      backgroundColor: event.isUpcoming ? '#16a34a' : '#9ca3af'
                    }}
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

                  {/* Total Days */}
                  <div>
                    <label className="block text-sm font-['Montserrat'] text-gray-700 mb-2">
                      Total Days *
                    </label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={event.totalDays}
                        onChange={(e) => handleTotalDaysChange(parseInt(e.target.value) || 1)}
                        placeholder="e.g., 30"
                        className="pl-10 font-['Merriweather']"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-['Merriweather']">
                      Number of days this event spans (1-365)
                    </p>
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

            {/* Day Management Card */}
            {event.totalDays >= 1 && (
              <Card className="p-8 rounded-2xl border-t-4 border-[var(--gold)]">
                <h2 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-6">
                  Daily Content Management
                </h2>

                <Tabs value={`day-${selectedDay}`} onValueChange={(value) => setSelectedDay(parseInt(value.split('-')[1]))}>
                  <TabsList className="mb-6 flex-wrap h-auto bg-gray-100 p-2 rounded-lg gap-2">
                    {event.days.map((day) => (
                      <TabsTrigger 
                        key={day.dayNumber} 
                        value={`day-${day.dayNumber}`}
                        className="data-[state=active]:bg-[var(--wine)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-[var(--gold)] data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:border border-gray-200 font-['Montserrat'] font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 data-[state=active]:hover:bg-[var(--wine)]"
                      >
                        Day {day.dayNumber}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {event.days.map((day) => (
                    <TabsContent key={day.dayNumber} value={`day-${day.dayNumber}`} className="space-y-6">
                      {/* Day Title */}
                      <div>
                        <label className="block text-sm font-['Montserrat'] text-gray-700 mb-2">
                          Day {day.dayNumber} Title
                        </label>
                        <Input
                          type="text"
                          value={day.title}
                          onChange={(e) => updateDayField('title', e.target.value)}
                          placeholder="e.g., Opening Ceremony"
                          className="font-['Merriweather']"
                        />
                      </div>

                      {/* Day Content */}
                      <div>
                        <label className="block text-sm font-['Montserrat'] text-gray-700 mb-2">
                          Day {day.dayNumber} Content
                        </label>
                        <Textarea
                          value={day.content}
                          onChange={(e) => updateDayField('content', e.target.value)}
                          placeholder="Enter the content for this day..."
                          rows={8}
                          className="font-['Merriweather']"
                        />
                      </div>

                      {/* Banner Image Upload */}
                      <div>
                        <label className="block text-sm font-['Montserrat'] text-gray-700 mb-2">
                          Day {day.dayNumber} Banner Image
                        </label>
                        <div className="space-y-4">
                          {day.bannerImage && (
                            <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                              <img
                                src={day.bannerImage}
                                alt={`Day ${day.dayNumber} Banner`}
                                className="w-full h-48 object-cover"
                              />
                              <Button
                                onClick={() => updateDayField('bannerImage', '')}
                                size="sm"
                                variant="destructive"
                                className="absolute top-2 right-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              id={`image-upload-${day.dayNumber}`}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              onClick={() => document.getElementById(`image-upload-${day.dayNumber}`)?.click()}
                              variant="outline"
                              className="w-full border-[var(--wine)] text-[var(--wine)] hover:bg-[var(--wine)] hover:text-white"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {day.bannerImage ? 'Change Banner Image' : 'Upload Banner Image'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Live Date */}
                        <div>
                          <label className="block text-sm font-['Montserrat'] text-gray-700 mb-2">
                            Automatic Live Date
                          </label>
                          <Input
                            type="date"
                            value={day.liveDate.split('T')[0]}
                            onChange={(e) => updateDayField('liveDate', e.target.value)}
                            className="font-['Merriweather']"
                          />
                          <p className="text-xs text-gray-500 mt-1 font-['Merriweather']">
                            Day automatically becomes available on this date
                          </p>
                        </div>

                        {/* Manual Live Toggle */}
                        <div>
                          <label className="block text-sm font-['Montserrat'] text-gray-700 mb-2">
                            Manual Override
                          </label>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-1">
                              <p className="text-sm font-['Montserrat'] text-gray-700 font-semibold">
                                Make Available Now
                              </p>
                              <p className="text-xs text-gray-500 font-['Merriweather']">
                                {day.isManuallyLive ? 'Visible to users' : 'Hidden from users'}
                              </p>
                            </div>
                            <Switch
                              checked={day.isManuallyLive}
                              onCheckedChange={(checked) => updateDayField('isManuallyLive', checked)}
                              style={{
                                backgroundColor: day.isManuallyLive ? '#16a34a' : '#9ca3af'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </Card>
            )}

            {/* Preview Card */}
            <Card className="p-8 rounded-2xl bg-[var(--wine)] text-white border-2 border-[var(--gold)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-['Montserrat'] text-xl text-[var(--gold)]">
                  Live Preview
                </h2>
                {!event.isUpcoming && (
                  <span className="text-xs bg-white/10 text-white/70 px-3 py-1 rounded-full font-['Montserrat']">
                    Upcoming Tag: Hidden
                  </span>
                )}
              </div>
              <p className="text-white/70 font-['Merriweather'] text-sm mb-6">
                This is how the event will appear on the homepage
              </p>

              <div className="bg-[var(--wine-dark)] rounded-2xl p-8 border-2 border-[var(--gold)]">
                {event.isUpcoming && (
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-6 h-6 text-[var(--gold)]" />
                    <span className="text-[var(--gold)] font-['Montserrat']">
                      Upcoming Event
                    </span>
                  </div>
                )}
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
