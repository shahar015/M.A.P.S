import React, { useState } from 'react';
import { Radar, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SignUpViewProps {
  onSwitchToLogin: () => void;
}

export default function SignUpView({ onSwitchToLogin }: SignUpViewProps) {
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }
    const result = signup({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      password,
    });
    if (!result.success) setError(result.error || 'Signup failed');
  };

  const clearError = () => { if (error) setError(''); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark bg-grid-pattern p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="size-10 text-primary flex items-center justify-center border border-primary/50 rounded bg-primary/10 shadow-[0_0_15px_rgba(13,242,13,0.3)]">
            <Radar size={24} />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold tracking-widest leading-none uppercase drop-shadow-[0_0_5px_rgba(13,242,13,0.5)]">
              M.A.P.S. <span className="text-primary">Command</span>
            </h1>
            <p className="text-xs text-primary/60 font-mono tracking-widest">TACTICAL PLANNING SYSTEM</p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-surface-glass backdrop-blur-xl border border-primary/40 shadow-[0_0_30px_rgba(13,242,13,0.15)] rounded-lg overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-primary/20 bg-surface-dark/40">
            <h2 className="text-white text-lg font-bold tracking-wide uppercase">Create New Account</h2>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <input
                  id="signup-first"
                  className="peer block w-full rounded border border-slate-600 bg-background-dark/50 px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200"
                  placeholder="First Name"
                  type="text"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); clearError(); }}
                />
                <label
                  htmlFor="signup-first"
                  className="absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary"
                >
                  First Name
                </label>
              </div>
              <div className="relative group">
                <input
                  id="signup-last"
                  className="peer block w-full rounded border border-slate-600 bg-background-dark/50 px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200"
                  placeholder="Last Name"
                  type="text"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); clearError(); }}
                />
                <label
                  htmlFor="signup-last"
                  className="absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary"
                >
                  Last Name
                </label>
              </div>
            </div>

            <div className="relative group">
              <input
                id="signup-username"
                className="peer block w-full rounded border border-slate-600 bg-background-dark/50 px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200"
                placeholder="Username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearError(); }}
              />
              <label
                htmlFor="signup-username"
                className="absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary"
              >
                Username
              </label>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/0 group-hover:border-primary/50 transition-all duration-300"></div>
            </div>

            <div className="relative group">
              <input
                id="signup-password"
                className="peer block w-full rounded border border-slate-600 bg-background-dark/50 px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
              />
              <label
                htmlFor="signup-password"
                className="absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary"
              >
                Password
              </label>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/0 group-hover:border-primary/50 transition-all duration-300"></div>
            </div>

            {/* Avatar Preview */}
            {(firstName || lastName) && (
              <div className="flex items-center gap-3 pt-1">
                <div className="size-10 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center font-bold text-sm">
                  {(firstName[0] || '').toUpperCase()}{(lastName[0] || '').toUpperCase()}
                </div>
                <span className="text-xs text-slate-500 font-mono">Your avatar initials</span>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm font-mono">{error}</p>
            )}
          </div>

          <div className="px-6 py-4 bg-surface-dark/60 border-t border-primary/20 flex items-center justify-end">
            <button
              type="submit"
              className="relative overflow-hidden bg-primary hover:bg-primary-dark text-background-dark font-bold text-sm px-8 py-2.5 rounded shadow-[0_0_15px_rgba(13,242,13,0.4)] hover:shadow-[0_0_25px_rgba(13,242,13,0.6)] transition-all duration-200 flex items-center gap-2 group"
            >
              <UserPlus size={20} />
              CREATE ACCOUNT
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
            </button>
          </div>

          <div className="h-1 w-full flex">
            <div className="h-full bg-primary/20 w-1/4"></div>
            <div className="h-full bg-primary/40 w-1/4"></div>
            <div className="h-full bg-primary/60 w-1/4"></div>
            <div className="h-full bg-primary w-1/4"></div>
          </div>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Already have an account?{' '}
          <span onClick={onSwitchToLogin} className="text-primary hover:underline cursor-pointer font-medium">
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
