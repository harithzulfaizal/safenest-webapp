import React from 'react';
import { Mail, Github } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Form';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  
  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Attempting login...");
    login();
  };
  
  const handleOAuth = (provider) => {
    console.log(`Attempting OAuth login with ${provider}...`);
    login();
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md p-0 overflow-hidden">
        <CardHeader className="text-center bg-gray-50 dark:bg-gray-800/50 p-6">
          <CardTitle className="text-2xl justify-center">Login</CardTitle>
          <CardDescription>Access your financial dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={() => handleOAuth('Google')} 
              icon={Mail}
            >
              Login with Google
            </Button>
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={() => handleOAuth('GitHub')} 
              icon={Github}
            >
              Login with GitHub
            </Button>
          </div>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                className="mt-1" 
              />
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
          
          <div className="text-center text-sm mt-4">
            <Button variant="link" className="p-0 h-auto">Forgot password?</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};