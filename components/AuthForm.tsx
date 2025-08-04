'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authApi, ApiError } from '@/lib/api';
import ForgotPasswordForm from './ForgotPasswordForm';

interface AuthFormProps {
  onLogin: (user: any) => void;
}

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If showing forgot password form, render it instead
  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(loginForm.email, loginForm.password);
      
      // Store token and user data
      localStorage.setItem('ap1700_token', response.token);
      localStorage.setItem('ap1700_user', JSON.stringify(response.user));
      
      onLogin(response.user);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.register(
        registerForm.name,
        registerForm.email,
        registerForm.password
      );
      
      // Store token and user data
      localStorage.setItem('ap1700_token', response.token);
      localStorage.setItem('ap1700_user', JSON.stringify(response.user));
      
      onLogin(response.user);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex-shrink-0 bg-white rounded-xl shadow-lg p-2 sm:p-3">
              <img 
                src="/bpg.png"
                alt="AP1700 Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            PragatiBook
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base text-gray-600 px-2">
            Professional Bill Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-9 sm:h-10">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="text-sm sm:text-base h-9 sm:h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs sm:text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="text-sm sm:text-base h-9 sm:h-10"
                  />
                </div>
                {error && <p className="text-red-500 text-xs sm:text-sm bg-red-50 p-2 rounded">{error}</p>}
                <Button type="submit" className="w-full text-sm sm:text-base h-9 sm:h-10 mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                <div className="text-center mt-4">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 p-0 h-auto"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs sm:text-sm font-medium">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="text-sm sm:text-base h-9 sm:h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-xs sm:text-sm font-medium">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="text-sm sm:text-base h-9 sm:h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-xs sm:text-sm font-medium">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="text-sm sm:text-base h-9 sm:h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-xs sm:text-sm font-medium">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="text-sm sm:text-base h-9 sm:h-10"
                  />
                </div>
                {error && <p className="text-red-500 text-xs sm:text-sm bg-red-50 p-2 rounded">{error}</p>}
                <Button type="submit" className="w-full text-sm sm:text-base h-9 sm:h-10 mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}