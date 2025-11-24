import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Music, Handshake, Video, Heart, Users, Mic, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface JoinUnitPageProps {
  onNavigate?: (page: string) => void;
  preSelectedUnit?: string;
}

const ministryUnits = [
  { id: 'choir', name: 'Choir', icon: Music, description: 'Lead worship through song' },
  { id: 'ushering', name: 'Ushering', icon: Handshake, description: 'Welcome and assist members' },
  { id: 'media', name: 'Media', icon: Video, description: 'Technical and production support' },
  { id: 'prayer', name: 'Prayer Team', icon: Heart, description: 'Intercession and spiritual support' },
  { id: 'youth', name: 'Youth Ministry', icon: Users, description: 'Minister to young people' },
  { id: 'outreach', name: 'Outreach', icon: Mic, description: 'Evangelism and community service' },
];

export function JoinUnitPage({ onNavigate, preSelectedUnit }: JoinUnitPageProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    
    // Ministry Selection
    selectedUnit: preSelectedUnit || '',
    secondChoiceUnit: '',
    
    // Availability
    availableSunday: false,
    availableTuesday: false,
    availableThursday: false,
    preferredServiceTime: '',
    
    // Experience & Skills
    previousExperience: '',
    relevantSkills: '',
    
    // Spiritual Background
    membershipStatus: '',
    salvationStatus: '',
    baptismStatus: '',
    howLongAttending: '',
    
    // Commitment
    reasonForJoining: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    
    // Agreement
    agreedToCommitment: false,
  });

  useEffect(() => {
    if (preSelectedUnit) {
      setFormData((prev) => ({ ...prev, selectedUnit: preSelectedUnit }));
    }
  }, [preSelectedUnit]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.selectedUnit) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!formData.agreedToCommitment) {
      toast.error('Please agree to the volunteer commitment');
      return;
    }
    
    setIsSubmitting(true);
    
    // Submit to backend
    const submitApplication = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/volunteer/submit`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify(formData),
          }
        );
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to submit application');
        }
        
        const result = await response.json();
        console.log('Application submitted successfully:', result);
        
        setIsSubmitted(true);
        toast.success('Application submitted successfully!');
        
        // Reset form after 3 seconds and navigate back
        setTimeout(() => {
          setIsSubmitted(false);
          setIsSubmitting(false);
          if (onNavigate) {
            onNavigate('home');
          }
        }, 3000);
      } catch (error) {
        console.error('Error submitting application:', error);
        toast.error(`Failed to submit application: ${error.message}`);
        setIsSubmitting(false);
      }
    };
    
    submitApplication();
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const selectedUnitData = ministryUnits.find((unit) => unit.id === formData.selectedUnit);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)] flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full p-12 text-center rounded-2xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="font-['Montserrat'] text-3xl text-[var(--wine)] mb-4">
            Thank You for Volunteering!
          </h2>
          <p className="text-gray-600 font-['Merriweather'] text-lg mb-6">
            Your application to join the <span className="text-[var(--wine)]">{selectedUnitData?.name}</span> has been received. 
            A ministry coordinator will contact you within 3-5 business days.
          </p>
          <p className="text-gray-500 font-['Merriweather']">
            Redirecting you to homepage...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--wine)] to-[var(--wine-dark)] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[var(--gold)] hover:text-white transition-colors mb-6 font-['Montserrat']"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="font-['Montserrat'] text-4xl md:text-5xl mb-4">
            Join a Ministry Unit
          </h1>
          <p className="font-['Merriweather'] text-lg text-white/90">
            Use your gifts and talents to serve in God's kingdom. Fill out the form below to get started.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card className="p-8 rounded-2xl">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName" className="font-['Montserrat'] text-[var(--wine)]">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="mt-2"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="font-['Montserrat'] text-[var(--wine)]">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-2"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="font-['Montserrat'] text-[var(--wine)]">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-2"
                  placeholder="+234 XXX XXX XXXX"
                  required
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth" className="font-['Montserrat'] text-[var(--wine)]">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="gender" className="font-['Montserrat'] text-[var(--wine)]">
                  Gender
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address" className="font-['Montserrat'] text-[var(--wine)]">
                  Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-2"
                  placeholder="Your full address"
                />
              </div>
            </div>
          </Card>

          {/* Ministry Selection */}
          <Card className="p-8 rounded-2xl">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Ministry Selection
            </h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="selectedUnit" className="font-['Montserrat'] text-[var(--wine)]">
                  Primary Ministry Choice <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.selectedUnit}
                  onValueChange={(value) => handleInputChange('selectedUnit', value)}
                  required
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a ministry unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {ministryUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} - {unit.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="secondChoiceUnit" className="font-['Montserrat'] text-[var(--wine)]">
                  Second Choice (Optional)
                </Label>
                <Select
                  value={formData.secondChoiceUnit}
                  onValueChange={(value) => handleInputChange('secondChoiceUnit', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select an alternative ministry" />
                  </SelectTrigger>
                  <SelectContent>
                    {ministryUnits
                      .filter((unit) => unit.id !== formData.selectedUnit)
                      .map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Availability */}
          <Card className="p-8 rounded-2xl">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Availability
            </h2>
            <div className="space-y-4">
              <p className="font-['Merriweather'] text-gray-600 mb-4">
                Which service times are you available to serve? (Check all that apply)
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="availableSunday"
                    checked={formData.availableSunday}
                    onCheckedChange={(checked) => handleInputChange('availableSunday', checked as boolean)}
                  />
                  <Label htmlFor="availableSunday" className="font-['Montserrat'] cursor-pointer">
                    Sunday Service (8:00 AM - 12:00 PM)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="availableTuesday"
                    checked={formData.availableTuesday}
                    onCheckedChange={(checked) => handleInputChange('availableTuesday', checked as boolean)}
                  />
                  <Label htmlFor="availableTuesday" className="font-['Montserrat'] cursor-pointer">
                    Tuesday Bible Study (5:30 PM - 7:00 PM)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="availableThursday"
                    checked={formData.availableThursday}
                    onCheckedChange={(checked) => handleInputChange('availableThursday', checked as boolean)}
                  />
                  <Label htmlFor="availableThursday" className="font-['Montserrat'] cursor-pointer">
                    Thursday Miracle Hour (5:30 PM - 7:00 PM)
                  </Label>
                </div>
              </div>

              <div className="mt-6">
                <Label htmlFor="preferredServiceTime" className="font-['Montserrat'] text-[var(--wine)]">
                  Preferred Service Time
                </Label>
                <Select
                  value={formData.preferredServiceTime}
                  onValueChange={(value) => handleInputChange('preferredServiceTime', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your preferred time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Every Week</SelectItem>
                    <SelectItem value="biweekly">Every Other Week</SelectItem>
                    <SelectItem value="monthly">Once a Month</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Experience & Skills */}
          <Card className="p-8 rounded-2xl">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Experience & Skills
            </h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="previousExperience" className="font-['Montserrat'] text-[var(--wine)]">
                  Previous Ministry Experience
                </Label>
                <Textarea
                  id="previousExperience"
                  value={formData.previousExperience}
                  onChange={(e) => handleInputChange('previousExperience', e.target.value)}
                  className="mt-2 min-h-[100px]"
                  placeholder="Tell us about any previous volunteer or ministry experience you have..."
                />
              </div>

              <div>
                <Label htmlFor="relevantSkills" className="font-['Montserrat'] text-[var(--wine)]">
                  Relevant Skills & Talents
                </Label>
                <Textarea
                  id="relevantSkills"
                  value={formData.relevantSkills}
                  onChange={(e) => handleInputChange('relevantSkills', e.target.value)}
                  className="mt-2 min-h-[100px]"
                  placeholder="What skills, talents, or gifts can you bring to this ministry? (e.g., musical instruments, technical skills, public speaking, etc.)"
                />
              </div>
            </div>
          </Card>

          {/* Spiritual Background */}
          <Card className="p-8 rounded-2xl">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Spiritual Background
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="membershipStatus" className="font-['Montserrat'] text-[var(--wine)]">
                  Membership Status
                </Label>
                <Select
                  value={formData.membershipStatus}
                  onValueChange={(value) => handleInputChange('membershipStatus', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="new-member">New Member</SelectItem>
                    <SelectItem value="regular-attendee">Regular Attendee</SelectItem>
                    <SelectItem value="first-time">First Time Visitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="howLongAttending" className="font-['Montserrat'] text-[var(--wine)]">
                  How Long Have You Been Attending?
                </Label>
                <Select
                  value={formData.howLongAttending}
                  onValueChange={(value) => handleInputChange('howLongAttending', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less-3-months">Less than 3 months</SelectItem>
                    <SelectItem value="3-6-months">3-6 months</SelectItem>
                    <SelectItem value="6-12-months">6-12 months</SelectItem>
                    <SelectItem value="1-2-years">1-2 years</SelectItem>
                    <SelectItem value="over-2-years">Over 2 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="salvationStatus" className="font-['Montserrat'] text-[var(--wine)]">
                  Have You Accepted Jesus as Your Personal Savior?
                </Label>
                <Select
                  value={formData.salvationStatus}
                  onValueChange={(value) => handleInputChange('salvationStatus', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="not-sure">Not Sure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="baptismStatus" className="font-['Montserrat'] text-[var(--wine)]">
                  Have You Been Baptized?
                </Label>
                <Select
                  value={formData.baptismStatus}
                  onValueChange={(value) => handleInputChange('baptismStatus', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="planning">Planning to be baptized</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Reason for Joining */}
          <Card className="p-8 rounded-2xl">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Why Do You Want to Serve?
            </h2>
            <div>
              <Label htmlFor="reasonForJoining" className="font-['Montserrat'] text-[var(--wine)]">
                Tell Us Your Motivation <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reasonForJoining"
                value={formData.reasonForJoining}
                onChange={(e) => handleInputChange('reasonForJoining', e.target.value)}
                className="mt-2 min-h-[120px]"
                placeholder="Share why you want to join this ministry and how you hope to contribute..."
                required
              />
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card className="p-8 rounded-2xl">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="emergencyName" className="font-['Montserrat'] text-[var(--wine)]">
                  Contact Name
                </Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyName}
                  onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                  className="mt-2"
                  placeholder="Full name"
                />
              </div>

              <div>
                <Label htmlFor="emergencyPhone" className="font-['Montserrat'] text-[var(--wine)]">
                  Contact Phone
                </Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  className="mt-2"
                  placeholder="+234 XXX XXX XXXX"
                />
              </div>

              <div>
                <Label htmlFor="emergencyRelationship" className="font-['Montserrat'] text-[var(--wine)]">
                  Relationship
                </Label>
                <Input
                  id="emergencyRelationship"
                  value={formData.emergencyRelationship}
                  onChange={(e) => handleInputChange('emergencyRelationship', e.target.value)}
                  className="mt-2"
                  placeholder="e.g., Spouse, Parent"
                />
              </div>
            </div>
          </Card>

          {/* Agreement */}
          <Card className="p-8 rounded-2xl border-2 border-[var(--gold)]">
            <h2 className="font-['Montserrat'] text-2xl text-[var(--wine)] mb-6">
              Volunteer Commitment
            </h2>
            <div className="space-y-4">
              <p className="font-['Merriweather'] text-gray-700 leading-relaxed">
                By joining this ministry, I commit to:
              </p>
              <ul className="font-['Merriweather'] text-gray-700 space-y-2 ml-6 list-disc">
                <li>Serve faithfully and consistently as my schedule allows</li>
                <li>Maintain a Christ-like character and conduct</li>
                <li>Work cooperatively with ministry leaders and team members</li>
                <li>Attend required training sessions and team meetings</li>
                <li>Communicate in advance if I'm unable to serve as scheduled</li>
                <li>Support the vision and mission of Unlimited Grace and Mercy Worldwide Mission Inc.</li>
              </ul>

              <div className="flex items-start space-x-3 mt-6 p-4 bg-[var(--wine)]/5 rounded-lg">
                <Checkbox
                  id="agreedToCommitment"
                  checked={formData.agreedToCommitment}
                  onCheckedChange={(checked) => handleInputChange('agreedToCommitment', checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="agreedToCommitment" className="font-['Montserrat'] text-[var(--wine)] cursor-pointer">
                  I have read and agree to the volunteer commitment stated above <span className="text-red-500">*</span>
                </Label>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              onClick={handleBack}
              variant="outline"
              className="font-['Montserrat'] border-[var(--wine)] text-[var(--wine)] hover:bg-[var(--wine)]/10"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat'] px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}