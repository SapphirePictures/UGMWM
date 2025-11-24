import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, Edit, FileText, Loader2, Download, DollarSign } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

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

export function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Books',
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    fileType: '',
    thumbnailUrl: '',
    price: 0,
    isPaid: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

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

  const handleOpenModal = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        title: resource.title,
        description: resource.description,
        category: resource.category,
        fileUrl: resource.fileUrl,
        fileName: resource.fileName,
        fileSize: resource.fileSize,
        fileType: resource.fileType,
        thumbnailUrl: resource.thumbnailUrl || '',
        price: resource.price,
        isPaid: resource.isPaid,
      });
    } else {
      setEditingResource(null);
      setFormData({
        title: '',
        description: '',
        category: 'Books',
        fileUrl: '',
        fileName: '',
        fileSize: 0,
        fileType: '',
        thumbnailUrl: '',
        price: 0,
        isPaid: false,
      });
    }
    setShowModal(true);
  };

  const handleSaveResource = async () => {
    if (!formData.title || !formData.fileUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const url = editingResource
        ? `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/resources/${editingResource.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/resources`;

      const method = editingResource ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save resource');

      toast.success(editingResource ? 'Resource updated successfully' : 'Resource created successfully');
      setShowModal(false);
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/resources/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (!response.ok) throw new Error('Failed to delete resource');

      toast.success('Resource deleted successfully');
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Montserrat'] text-3xl text-[var(--wine)] mb-2">
            Manage Resources
          </h1>
          <p className="text-gray-600 font-['Merriweather']">
            Upload and manage downloadable resources
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--wine)]" />
        </div>
      ) : resources.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="font-['Montserrat'] text-xl text-gray-700 mb-2">No Resources Yet</h3>
          <p className="text-gray-500 font-['Merriweather'] mb-6">
            Start by adding your first downloadable resource
          </p>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="overflow-hidden rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-br from-[var(--gold)] to-[var(--wine)] flex items-center justify-center">
                <FileText className="w-16 h-16 text-white opacity-50" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-1 bg-[var(--wine)]/10 text-[var(--wine)] rounded-full font-['Montserrat']">
                    {resource.category}
                  </span>
                  {resource.isPaid && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-['Montserrat'] flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${resource.price}
                    </span>
                  )}
                </div>
                <h3 className="font-['Montserrat'] text-lg text-[var(--wine)] mb-2">
                  {resource.title}
                </h3>
                <p className="text-gray-600 font-['Merriweather'] text-sm mb-4 line-clamp-2">
                  {resource.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span className="font-['Merriweather']">{resource.downloadCount}</span>
                  </div>
                  <span className="font-['Merriweather']">{formatFileSize(resource.fileSize)}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenModal(resource)}
                    variant="outline"
                    className="flex-1 font-['Montserrat']"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteResource(resource.id)}
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
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title" className="font-['Montserrat']">
                Resource Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter resource title"
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
                placeholder="Enter resource description"
                rows={4}
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
                  <SelectItem value="Books">Books</SelectItem>
                  <SelectItem value="Study Guides">Study Guides</SelectItem>
                  <SelectItem value="Audio">Audio</SelectItem>
                  <SelectItem value="Documents">Documents</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fileUrl" className="font-['Montserrat']">
                File URL *
              </Label>
              <Input
                id="fileUrl"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1 font-['Merriweather']">
                Upload your file to Google Drive, Dropbox, or another hosting service and paste the public URL here
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fileName" className="font-['Montserrat']">
                  File Name
                </Label>
                <Input
                  id="fileName"
                  value={formData.fileName}
                  onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                  placeholder="e.g., resource.pdf"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="fileType" className="font-['Montserrat']">
                  File Type
                </Label>
                <Input
                  id="fileType"
                  value={formData.fileType}
                  onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                  placeholder="e.g., PDF, MP3"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="fileSize" className="font-['Montserrat']">
                File Size (in bytes)
              </Label>
              <Input
                id="fileSize"
                type="number"
                value={formData.fileSize}
                onChange={(e) => setFormData({ ...formData, fileSize: parseInt(e.target.value) || 0 })}
                placeholder="e.g., 1048576"
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="price" className="font-['Montserrat']">
                  Price (USD)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={formData.isPaid}
                  onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isPaid" className="font-['Montserrat'] cursor-pointer">
                  Paid Resource
                </Label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveResource}
                disabled={isSaving}
                className="flex-1 bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{editingResource ? 'Update Resource' : 'Add Resource'}</>
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