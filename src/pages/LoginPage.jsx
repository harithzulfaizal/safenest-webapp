// src/pages/LoginPage.jsx
// Handles user authentication (currently mock)
import React from 'react';
import { Mail, Github, ShieldPlus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Form';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, you'd validate credentials against a backend
    console.log("Attempting login...");
    login(); // Directly logs in for this mock version
  };

  const handleOAuth = (provider) => {
    console.log(`Attempting OAuth login with ${provider}...`);
    // Implement OAuth logic here
    login(); // Directly logs in for this mock version
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 dark:from-gray-900 dark:to-gray-800 px-4 py-8 font-sans">
      <Card className="w-full max-w-md p-0 overflow-hidden shadow-2xl rounded-xl bg-white dark:bg-gray-800">
        <CardHeader className="text-center bg-slate-50 dark:bg-gray-700/50 p-8 border-b dark:border-gray-700">
          <div className="flex justify-center items-center mb-4">
            <ShieldPlus className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-3xl justify-center font-bold text-slate-800 dark:text-white">
            Welcome to SafeNest
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
            Securely access your financial dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-3">
            <Button
              variant="secondary"
              className="w-full !py-3 text-base border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => handleOAuth('Google')}
              icon={Mail}
            >
              Login with Google
            </Button>
            <Button
              variant="secondary"
              className="w-full !py-3 text-base border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => handleOAuth('GitHub')}
              icon={Github}
            >
              Login with GitHub
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-300 dark:border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-800 px-3 text-slate-500 dark:text-slate-400">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                className="mt-1 !py-3 text-base"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="p-0 h-auto text-xs">Forgot password?</Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="mt-1 !py-3 text-base"
              />
            </div>
            <Button type="submit" className="w-full !py-3 text-base font-semibold">
              Login Securely
            </Button>
          </form>

          <div className="text-center text-sm mt-6 text-slate-500 dark:text-slate-400">
            Don't have an account? <Button variant="link" className="p-0 h-auto font-medium">Sign up</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
