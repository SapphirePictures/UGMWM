import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FileText, Download, Loader2, DollarSign, Search } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  thumbnailUrl?: string;
  price: number;
  isPaid: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ResourcesPageProps {
  onNavigate?: (page: string) => void;
}

export function ResourcesPage({ onNavigate }: ResourcesPageProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchQuery, selectedCategory, resources]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/resources`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch resources');

      const data = await response.json();
      setResources(data.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  };

  const handleDownload = async (resource: Resource) => {
    try {
      // Increment download count
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/resources/${resource.id}/download`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      // Open download link
      window.open(resource.fileUrl, '_blank');
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast.error('Failed to download resource');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const categories = ['All', ...Array.from(new Set(resources.map(r => r.category)))];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-['Montserrat'] text-5xl mb-6">
            Resources
          </h1>
          <p className="font-['Merriweather'] text-xl text-gray-200 max-w-3xl mx-auto">
            Explore our collection of books, study guides, audio teachings, and other resources to deepen your faith and knowledge.
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
        <Card className="p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {/* Resources Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[var(--wine)]" />
          </div>
        ) : filteredResources.length === 0 ? (
          <Card className="p-12 text-center rounded-2xl">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="font-['Montserrat'] text-2xl text-gray-700 mb-2">
              No Resources Found
            </h3>
            <p className="text-gray-500 font-['Merriweather']">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Resources will be available soon'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="overflow-hidden rounded-2xl hover:shadow-xl transition-all">
                <div className="w-full h-56 bg-gradient-to-br from-[var(--gold)] to-[var(--wine)] flex items-center justify-center">
                  <FileText className="w-20 h-20 text-white opacity-50" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-3 py-1 bg-[var(--wine)]/10 text-[var(--wine)] rounded-full font-['Montserrat']">
                      {resource.category}
                    </span>
                    {resource.isPaid ? (
                      <span className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full font-['Montserrat'] flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${resource.price.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-['Montserrat']">
                        Free
                      </span>
                    )}
                  </div>

                  <h3 className="font-['Montserrat'] text-xl text-[var(--wine)] mb-3">
                    {resource.title}
                  </h3>

                  <p className="text-gray-600 font-['Merriweather'] text-sm mb-4 line-clamp-3">
                    {resource.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span className="font-['Merriweather']">{resource.downloadCount} downloads</span>
                    </div>
                    <span className="font-['Merriweather']">{formatFileSize(resource.fileSize)}</span>
                  </div>

                  <Button
                    onClick={() => handleDownload(resource)}
                    className="w-full bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {resource.isPaid ? 'Purchase & Download' : 'Download Now'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
