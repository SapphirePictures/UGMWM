import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, Edit, Calendar as CalendarIcon, Loader2, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  imageUrl?: string;
  registrationRequired: boolean;
  registrationLink?: string;
  createdAt: string;
  updatedAt: string;
}

export function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Service',
    imageUrl: '',
    registrationRequired: false,
    registrationLink: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/events`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch events');

      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        category: event.category,
        imageUrl: event.imageUrl || '',
        registrationRequired: event.registrationRequired,
        registrationLink: event.registrationLink || '',
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: 'Service',
        imageUrl: '',
        registrationRequired: false,
        registrationLink: '',
      });
    }
    setShowModal(true);
  };

  const handleSaveEvent = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const url = editingEvent
        ? `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/events/${editingEvent.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/events`;

      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save event');

      toast.success(editingEvent ? 'Event updated successfully' : 'Event created successfully');
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/events/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (!response.ok) throw new Error('Failed to delete event');

      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Montserrat'] text-3xl text-[var(--wine)] mb-2">
            Manage Events
          </h1>
          <p className="text-gray-600 font-['Merriweather']">
            Create and manage church events
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--wine)]" />
        </div>
      ) : events.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="font-['Montserrat'] text-xl text-gray-700 mb-2">No Events Yet</h3>
          <p className="text-gray-500 font-['Merriweather'] mb-6">
            Start by adding your first event
          </p>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden rounded-2xl hover:shadow-lg transition-shadow">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)] flex items-center justify-center">
                  <CalendarIcon className="w-16 h-16 text-white opacity-50" />
                </div>
              )}
              <div className="p-6">
                <span className="text-xs px-2 py-1 bg-[var(--wine)]/10 text-[var(--wine)] rounded-full font-['Montserrat']">
                  {event.category}
                </span>
                <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2 mt-2">
                  {event.title}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="font-['Merriweather']">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-['Merriweather']">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="font-['Merriweather']">{event.location}</span>
                  </div>
                </div>
                <p className="text-gray-600 font-['Merriweather'] text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenModal(event)}
                    variant="outline"
                    className="flex-1 font-['Montserrat']"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteEvent(event.id)}
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 font-['Montserrat']"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Montserrat'] text-2xl text-[var(--wine)]">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title" className="font-['Montserrat']">
                Event Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="font-['Montserrat']">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter event description"
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="font-['Montserrat']">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="time" className="font-['Montserrat']">
                  Time *
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="font-['Montserrat']">
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter event location"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category" className="font-['Montserrat']">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Retreat">Retreat</SelectItem>
                  <SelectItem value="Outreach">Outreach</SelectItem>
                  <SelectItem value="Fellowship">Fellowship</SelectItem>
                  <SelectItem value="Special">Special Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="imageUrl" className="font-['Montserrat']">
                Event Image URL
              </Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="registrationRequired"
                  checked={formData.registrationRequired}
                  onChange={(e) => setFormData({ ...formData, registrationRequired: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="registrationRequired" className="font-['Montserrat'] cursor-pointer">
                  Registration Required
                </Label>
              </div>
            </div>

            {formData.registrationRequired && (
              <div>
                <Label htmlFor="registrationLink" className="font-['Montserrat']">
                  Registration Link
                </Label>
                <Input
                  id="registrationLink"
                  value={formData.registrationLink}
                  onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveEvent}
                disabled={isSaving}
                className="flex-1 bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{editingEvent ? 'Update Event' : 'Add Event'}</>
                )}
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex-1 font-['Montserrat']"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}