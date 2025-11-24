import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Radio, Save, Eye, ArrowLeft, LogOut } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface AdminLiveStreamPageProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

interface LiveStreamData {
  isLive: boolean;
  youtubeUrl: string;
  scheduleText: string;
}

export function AdminLiveStreamPage({ onNavigate, onLogout }: AdminLiveStreamPageProps) {
  const [formData, setFormData] = useState<LiveStreamData>({
    isLive: false,
    youtubeUrl: '',
    scheduleText: 'Check back soon for our next live service!'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLiveStreamData();
  }, []);

  const fetchLiveStreamData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/live-stream/get`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFormData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching live stream data:', error);
      toast.error('Failed to load live stream data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/live-stream/update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Live stream settings updated successfully!');
      } else {
        toast.error('Failed to update live stream settings');
      }
    } catch (error) {
      console.error('Error saving live stream data:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/live/')) {
      videoId = url.split('live/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0` : '';
  };

  const embedUrl = getYouTubeEmbedUrl(formData.youtubeUrl);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--wine)] to-[var(--wine-dark)] text-white py-8 sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate?.('temporary-dashboard')}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-['Merriweather']"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[var(--wine)] font-['Montserrat']"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
          <h1 className="font-['Montserrat'] text-3xl md:text-4xl mt-4">
            Manage Live Stream
          </h1>
          <p className="font-['Merriweather'] text-white/90 mt-2">
            Control your YouTube live stream settings and status
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--wine)] mx-auto"></div>
            <p className="font-['Merriweather'] text-gray-600 mt-4">Loading...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Settings Form */}
            <div>
              <Card className="p-8 rounded-2xl shadow-lg">
                <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
                  Stream Settings
                </h2>

                <div className="space-y-6">
                  {/* Live Status Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Radio className={`w-6 h-6 ${formData.isLive ? 'text-red-600' : 'text-gray-400'}`} />
                      <div>
                        <Label className="font-['Montserrat'] text-lg">
                          Stream Status
                        </Label>
                        <p className="font-['Merriweather'] text-sm text-gray-600">
                          {formData.isLive ? 'Currently streaming live' : 'Stream is offline'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.isLive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isLive: checked })}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </div>

                  {/* YouTube URL */}
                  <div>
                    <Label htmlFor="youtubeUrl" className="font-['Montserrat'] text-[var(--wine)]">
                      YouTube Live Stream URL
                    </Label>
                    <p className="font-['Merriweather'] text-sm text-gray-600 mb-2">
                      Paste your YouTube live stream URL or video URL
                    </p>
                    <Input
                      id="youtubeUrl"
                      type="url"
                      value={formData.youtubeUrl}
                      onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="font-['Merriweather']"
                    />
                    <p className="font-['Merriweather'] text-xs text-gray-500 mt-1">
                      Supported formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/live/...
                    </p>
                  </div>

                  {/* Schedule Text */}
                  <div>
                    <Label htmlFor="scheduleText" className="font-['Montserrat'] text-[var(--wine)]">
                      Offline Message
                    </Label>
                    <p className="font-['Merriweather'] text-sm text-gray-600 mb-2">
                      This message appears when the stream is offline
                    </p>
                    <Textarea
                      id="scheduleText"
                      value={formData.scheduleText}
                      onChange={(e) => setFormData({ ...formData, scheduleText: e.target.value })}
                      placeholder="Join us for our next service on Sunday at 9:00 AM!"
                      rows={4}
                      className="font-['Merriweather']"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      onClick={() => onNavigate?.('watch-live')}
                      variant="outline"
                      className="border-[var(--wine)] text-[var(--wine)] hover:bg-[var(--wine)] hover:text-white font-['Montserrat']"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Instructions */}
              <Card className="p-6 rounded-2xl shadow-lg mt-6 bg-blue-50 border-blue-200">
                <h3 className="font-['Montserrat'] text-lg text-blue-900 mb-3">
                  📺 How to Get Your YouTube Live URL
                </h3>
                <ol className="font-['Merriweather'] text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Go to YouTube Studio and start a live stream</li>
                  <li>Copy the live stream URL from the address bar</li>
                  <li>Paste the URL in the field above</li>
                  <li>Toggle "Stream Status" to ON when you're live</li>
                  <li>Toggle it OFF when the stream ends</li>
                </ol>
              </Card>
            </div>

            {/* Live Preview */}
            <div>
              <Card className="p-6 rounded-2xl shadow-lg sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)]">
                    Live Preview
                  </h2>
                  {formData.isLive && (
                    <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span className="font-['Montserrat'] font-semibold">LIVE</span>
                    </div>
                  )}
                </div>

                {formData.isLive && embedUrl ? (
                  <div>
                    <div className="relative bg-black rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={embedUrl}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Live Stream Preview"
                      ></iframe>
                    </div>
                    <p className="font-['Merriweather'] text-sm text-green-600 mt-3 text-center">
                      ✓ Stream will appear on the Watch Live page
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-xl p-12 text-center">
                    <Radio className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-['Montserrat'] text-lg text-gray-700 mb-2">
                      {formData.isLive ? 'No Stream URL' : 'Stream Offline'}
                    </h3>
                    <p className="font-['Merriweather'] text-gray-600 mb-4">
                      {formData.scheduleText}
                    </p>
                    {!formData.youtubeUrl && (
                      <p className="font-['Merriweather'] text-sm text-gray-500">
                        Add a YouTube URL to see preview
                      </p>
                    )}
                  </div>
                )}

                {/* Quick Tips */}
                <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <h4 className="font-['Montserrat'] text-sm text-yellow-900 mb-2">
                    💡 Quick Tips
                  </h4>
                  <ul className="font-['Merriweather'] text-xs text-yellow-800 space-y-1">
                    <li>• Turn ON "Stream Status" when you go live</li>
                    <li>• Turn OFF "Stream Status" when stream ends</li>
                    <li>• Test the preview before going live</li>
                    <li>• Update offline message for next service</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
