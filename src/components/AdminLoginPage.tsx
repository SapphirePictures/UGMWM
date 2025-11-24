import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AdminLoginPageProps {
  onNavigate?: (page: string) => void;
  onLogin: () => void;
}

export function AdminLoginPage({ onNavigate, onLogin }: AdminLoginPageProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get password from server
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f158f76/admin/get-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && password === data.password) {
        toast.success('Login successful!');
        onLogin();
        if (onNavigate) {
          onNavigate('temporary-dashboard');
        }
      } else {
        toast.error('Incorrect password. Please try again.');
        setPassword('');
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('An error occurred. Please try again.');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--wine)] to-[var(--wine-dark)] flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 rounded-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--wine)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[var(--wine)]" />
          </div>
          <h1 className="font-['Montserrat'] text-3xl text-[var(--wine)] mb-2">
            Admin Access
          </h1>
          <p className="font-['Merriweather'] text-gray-600">
            Enter your admin password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="password" className="font-['Montserrat'] text-[var(--wine)]">
              Admin Password
            </Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="pr-10"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[var(--wine)] text-white hover:bg-[var(--wine-dark)] font-['Montserrat']"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Login'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => onNavigate?.('home')}
            className="text-sm text-gray-500 hover:text-[var(--wine)] font-['Merriweather'] mx-auto block"
          >
            ← Back to Website
          </button>
        </div>
      </Card>
    </div>
  );
}