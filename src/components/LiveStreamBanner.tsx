import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LiveStreamBannerProps {
  onNavigate?: (page: string) => void;
}

export function LiveStreamBanner({ onNavigate }: LiveStreamBannerProps) {
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLiveStatus();
    // Check live status every 60 seconds
    const interval = setInterval(fetchLiveStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveStatus = async () => {
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
          setIsLive(data.data.isLive);
        }
      }
    } catch (error) {
      // Silently fail - this is expected when backend is not deployed
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show anything if not live or still loading
  if (!isLive || isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-4 shadow-lg"
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Radio className="w-6 h-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></span>
              </div>
              <div>
                <h3 className="font-['Montserrat'] font-semibold text-lg">
                  WE ARE LIVE NOW!
                </h3>
                <p className="font-['Merriweather'] text-sm text-white/90">
                  Join our service streaming right now
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onNavigate?.('watch-live')}
            className="bg-white text-red-600 px-6 py-3 rounded-full font-['Montserrat'] font-semibold hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2 group"
          >
            <Radio className="w-5 h-5 group-hover:animate-pulse" />
            Watch Live Stream
            <span className="text-xl">→</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}