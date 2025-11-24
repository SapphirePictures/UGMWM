import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Trash2, Edit, Video, Loader2, Calendar, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface Sermon {
  id: string;
  title: string;
  description: string;
  speaker: string;
  date: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminSermonsPageProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function AdminSermonsPage({ onNavigate, onLogout }: AdminSermonsPageProps) {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speaker: '',
    date: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/sermons`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch sermons');

      const data = await response.json();
      setSermons(data.sermons || []);
    } catch (error) {
      console.error('Error fetching sermons:', error);
      toast.error('Failed to load sermons');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sermon?: Sermon) => {
    if (sermon) {
      setEditingSermon(sermon);
      setFormData({
        title: sermon.title,
        description: sermon.description,
        speaker: sermon.speaker,
        date: sermon.date,
        videoUrl: sermon.videoUrl || '',
        thumbnailUrl: sermon.thumbnailUrl || '',
        duration: sermon.duration || '',
      });
    } else {
      setEditingSermon(null);
      setFormData({
        title: '',
        description: '',
        speaker: '',
        date: '',
        videoUrl: '',
        thumbnailUrl: '',
        duration: '',
      });
    }
    setShowModal(true);
  };

  const handleSaveSermon = async () => {
    if (!formData.title || !formData.speaker || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const url = editingSermon
        ? `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/sermons/${editingSermon.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/sermons`;

      const method = editingSermon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save sermon');

      toast.success(editingSermon ? 'Sermon updated successfully' : 'Sermon created successfully');
      setShowModal(false);
      fetchSermons();
    } catch (error) {
      console.error('Error saving sermon:', error);
      toast.error('Failed to save sermon');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSermon = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sermon?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/sermons/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (!response.ok) throw new Error('Failed to delete sermon');

      toast.success('Sermon deleted successfully');
      fetchSermons();
    } catch (error) {
      console.error('Error deleting sermon:', error);
      toast.error('Failed to delete sermon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Montserrat'] text-3xl text-[var(--wine)] mb-2">
            Manage Sermons
          </h1>
          <p className="text-gray-600 font-['Merriweather']">
            Upload and manage sermon videos
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sermon
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--wine)]" />
        </div>
      ) : sermons.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl">
          <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="font-['Montserrat'] text-xl text-gray-700 mb-2">No Sermons Yet</h3>
          <p className="text-gray-500 font-['Merriweather'] mb-6">
            Start by adding your first sermon video
          </p>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Sermon
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sermons.map((sermon) => (
            <Card key={sermon.id} className="overflow-hidden rounded-2xl hover:shadow-lg transition-shadow">
              {sermon.thumbnailUrl ? (
                <img
                  src={sermon.thumbnailUrl}
                  alt={sermon.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)] flex items-center justify-center">
                  <Video className="w-16 h-16 text-white opacity-50" />
                </div>
              )}
              <div className="p-6">
                <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">
                  {sermon.title}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-['Merriweather']">{sermon.speaker}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="font-['Merriweather']">
                      {new Date(sermon.date).toLocaleDateString()}
                    </span>
                  </div>
                  {sermon.duration && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Video className="w-4 h-4" />
                      <span className="font-['Merriweather']">{sermon.duration}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 font-['Merriweather'] text-sm mb-4 line-clamp-2">
                  {sermon.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenModal(sermon)}
                    variant="outline"
                    className="flex-1 font-['Montserrat']"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteSermon(sermon.id)}
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
              {editingSermon ? 'Edit Sermon' : 'Add New Sermon'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title" className="font-['Montserrat']">
                Sermon Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter sermon title"
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
                placeholder="Enter sermon description"
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="speaker" className="font-['Montserrat']">
                  Speaker *
                </Label>
                <Input
                  id="speaker"
                  value={formData.speaker}
                  onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                  placeholder="Speaker name"
                  className="mt-1"
                />
              </div>

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
            </div>

            <div>
              <Label htmlFor="videoUrl" className="font-['Montserrat']">
                Video URL (YouTube, Vimeo, etc.)
              </Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1 font-['Merriweather']">
                Paste the URL of your sermon video from YouTube, Vimeo, or other platforms
              </p>
            </div>

            <div>
              <Label htmlFor="thumbnailUrl" className="font-['Montserrat']">
                Thumbnail Image URL
              </Label>
              <Input
                id="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="duration" className="font-['Montserrat']">
                Duration
              </Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 45 minutes"
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveSermon}
                disabled={isSaving}
                className="flex-1 bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{editingSermon ? 'Update Sermon' : 'Add Sermon'}</>
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