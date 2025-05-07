// src/pages/LoginPage.jsx
// Handles user authentication
import React, { useState } from 'react';
import { ShieldPlus, LogIn } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Form';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../apiConfig';

export const LoginPage = () => {
  const { login } = useAuth(); // login function from AuthContext
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // data should be UserLoginSuccessResponse

      if (!response.ok) {
        throw new Error(data.detail || `Login failed with status: ${response.status}`);
      }

      console.log("Login successful:", data);
      // Pass the necessary user info (user_id and email) to the login function from AuthContext
      login({ userId: data.user_id, email: data.email }); // Pass an object with userId and email
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // This is a placeholder for the user_id. In a real scenario, this would
    // likely come from a previous step (e.g., after creating a basic user profile via POST /users).
    const mockUserIdForRegistration = Math.floor(Math.random() * 10000) + 1; // Example

    // First, conceptual step: create user profile (POST /users) if not done automatically by backend
    // For this example, we assume /auth/register_login needs an existing user_id.
    // This part might need adjustment based on your actual backend flow for user creation.
    // If your backend creates the user and profile together with /auth/register_login, this step is different.

    // Example: If you need to create a user profile first
    // let userIdToRegister = mockUserIdForRegistration;
    // try {
    //   const profileCreateResponse = await fetch(`${API_BASE_URL}/users`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email: email, age: null /* other required fields */ }),
    //   });
    //   if (!profileCreateResponse.ok) {
    //     const profileErrorData = await profileCreateResponse.json();
    //     throw new Error(profileErrorData.detail || `Failed to create user profile: ${profileCreateResponse.status}`);
    //   }
    //   const profileData = await profileCreateResponse.json();
    //   userIdToRegister = profileData.user_id; // Get the actual user_id
    //   console.log("User profile created with ID:", userIdToRegister);
    // } catch (profileErr) {
    //   console.error("Profile creation error during registration:", profileErr);
    //   setError(`Profile creation failed: ${profileErr.message}`);
    //   setIsLoading(false);
    //   return;
    // }


    try {
      const response = await fetch(`${API_BASE_URL}/auth/register_login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: mockUserIdForRegistration, email, password }), // Use userIdToRegister if obtained from profile creation
      });

      const data = await response.json(); // data should be UserLoginResponse

      if (!response.ok) {
        let errorMessage = `Registration failed with status: ${response.status}`;
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            errorMessage = data.detail.map(err => `${err.loc.join(' -> ')}: ${err.msg}`).join('; ');
          } else {
            errorMessage = data.detail;
          }
        }
        throw new Error(errorMessage);
      }

      console.log("Registration successful, login credentials created:", data);
      // After successful registration of login credentials, automatically log the user in.
      // The `data` from /auth/register_login is UserLoginResponse, which contains user_id and email.
      login({ userId: data.user_id, email: data.email });
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFormMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 dark:from-gray-900 dark:to-gray-800 px-4 py-8 font-sans">
      <Card className="w-full max-w-md p-0 overflow-hidden shadow-2xl rounded-xl bg-white dark:bg-gray-800">
        <CardHeader className="text-center bg-slate-50 dark:bg-gray-700/50 p-8 border-b dark:border-gray-700">
          <div className="flex justify-center items-center mb-4">
            <ShieldPlus className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-3xl justify-center font-bold text-slate-800 dark:text-white">
            {isRegistering ? 'Create Account' : 'Welcome to SafeNest'}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
            {isRegistering ? 'Sign up to access your financial dashboard.' : 'Securely access your financial dashboard.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">Error:</p>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 !py-3 text-base"
              />
            </div>
            <div>
              {/* <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                {!isRegistering && (
                  <Button variant="link" type="button" className="p-0 h-auto text-xs">Forgot password?</Button>
                )}
              </div> */}
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isRegistering ? 8 : undefined}
                className="mt-1 !py-3 text-base"
              />
               {isRegistering && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Password must be at least 8 characters.</p>}
            </div>
            <Button type="submit" className="w-full !py-3 text-base font-semibold" disabled={isLoading} icon={isLoading ? null : LogIn}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (isRegistering ? 'Register' : 'Login Securely')}
            </Button>
          </form>

          {/* <div className="text-center text-sm mt-6 text-slate-500 dark:text-slate-400">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            <Button variant="link" onClick={toggleFormMode} className="p-0 h-auto font-medium ml-1">
              {isRegistering ? 'Login here' : 'Sign up'}
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
};
