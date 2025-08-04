'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Shield, Key } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSuccess('OTP sent to your email successfully!');
      setCurrentStep('otp');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      setSuccess('OTP verified successfully!');
      setCurrentStep('password');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setCurrentStep('success');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'email':
        return (
          <form onSubmit={handleSendOTP} className="space-y-4 sm:space-y-5">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Forgot Password?</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm sm:text-base h-10 sm:h-11"
              />
            </div>
            
            {error && <p className="text-red-500 text-xs sm:text-sm bg-red-50 p-3 rounded">{error}</p>}
            {success && <p className="text-green-500 text-xs sm:text-sm bg-green-50 p-3 rounded">{success}</p>}
            
            <Button type="submit" className="w-full text-sm sm:text-base h-10 sm:h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        );

      case 'otp':
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-4 sm:space-y-5">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Verify OTP</h3>
              <p className="text-sm sm:text-base text-gray-600">
                We've sent a 6-digit OTP to <strong>{email}</strong>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-sm sm:text-base font-medium">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                className="text-center text-lg sm:text-xl font-mono tracking-widest h-12 sm:h-14"
              />
              <p className="text-xs sm:text-sm text-gray-500 text-center">
                OTP expires in 10 minutes
              </p>
            </div>
            
            {error && <p className="text-red-500 text-xs sm:text-sm bg-red-50 p-3 rounded">{error}</p>}
            {success && <p className="text-green-500 text-xs sm:text-sm bg-green-50 p-3 rounded">{success}</p>}
            
            <div className="space-y-3">
              <Button type="submit" className="w-full text-sm sm:text-base h-10 sm:h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentStep('email')} 
                className="w-full text-sm sm:text-base h-10 sm:h-11"
              >
                Resend OTP
              </Button>
            </div>
          </form>
        );

      case 'password':
        return (
          <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-5">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Reset Password</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Enter your new password below
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm sm:text-base font-medium">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="text-sm sm:text-base h-10 sm:h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm sm:text-base font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="text-sm sm:text-base h-10 sm:h-11"
                />
              </div>
            </div>
            
            {error && <p className="text-red-500 text-xs sm:text-sm bg-red-50 p-3 rounded">{error}</p>}
            
            <Button type="submit" className="w-full text-sm sm:text-base h-10 sm:h-11" disabled={loading}>
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>
        );

      case 'success':
        return (
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Password Reset Successful!</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Your password has been successfully reset. You can now login with your new password.
              </p>
            </div>
            
            <Button onClick={onBack} className="w-full text-sm sm:text-base h-10 sm:h-11">
              Back to Login
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="p-2 h-8 w-8 sm:h-9 sm:w-9"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            
            <div className="flex items-center justify-center flex-1">
              <div className="w-16 h-14 sm:w-20 sm:h-16 md:w-24 md:h-18 lg:w-28 lg:h-20 flex-shrink-0 bg-white rounded-xl shadow-lg p-2 sm:p-3">
                <img 
                  src="/bpg.png"
                  alt="AP1700 Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <div className="w-8 sm:w-9"></div>
          </div>
          
          <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            AP1700
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base text-gray-600 px-2">
            Professional Bill Management System
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
}
