import React, { useState } from 'react';
import { Save, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileViewProps {
  onBack: () => void;
}

export default function ProfileView({ onBack }: ProfileViewProps) {
  const { currentUser, updateProfile, logout } = useAuth();

  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  if (!currentUser) return null;

  const initials = ((currentUser.firstName[0] || '') + (currentUser.lastName[0] || '')).toUpperCase() || '?';

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const updates: Parameters<typeof updateProfile>[0] = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      bio: bio.trim(),
    };
    if (newPassword) updates.password = newPassword;
    updateProfile(updates);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <main className="flex-1 px-4 md:px-6 py-6 md:py-8 w-full max-w-2xl mx-auto flex flex-col gap-6 md:gap-8 pb-20 md:pb-12 overflow-y-auto bg-grid-pattern">
      {/* Avatar + Username Header */}
      <div className="flex flex-col items-center gap-3 pb-6 border-b border-surface-highlight">
        <div className="size-20 md:size-24 rounded-full bg-primary/20 border-2 border-primary text-primary flex items-center justify-center font-bold text-2xl md:text-3xl shadow-[0_0_20px_rgba(13,242,13,0.2)]">
          {initials}
        </div>
        <span className="text-primary font-mono tracking-widest text-sm uppercase">@{currentUser.username}</span>
      </div>

      {/* Edit Form */}
      <div className="bg-surface-glass backdrop-blur-xl border border-primary/40 shadow-[0_0_30px_rgba(13,242,13,0.15)] rounded-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-primary/20 bg-surface-dark/40">
          <h2 className="text-white text-lg font-bold tracking-wide uppercase">Profile Settings</h2>
        </div>

        <div className="p-4 md:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="relative group">
              <input
                id="profile-first"
                className="peer block w-full rounded border border-slate-600 bg-background-dark/50 px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200"
                placeholder="First Name"
                type="text"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setError(''); setSaved(false); }}
              />
              <label
                htmlFor="profile-first"
                className="absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary"
              >
                First Name
              </label>
            </div>
            <div className="relative group">
              <input
                id="profile-last"
                className="peer block w-full rounded border border-slate-600 bg-background-dark/50 px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200"
                placeholder="Last Name"
                type="text"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setError(''); setSaved(false); }}
              />
              <label
                htmlFor="profile-last"
                className="absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary"
              >
                Last Name
              </label>
            </div>
          </div>

          <div className="relative group">
            <textarea
              id="profile-bio"
              className="peer block w-full rounded border border-slate-600 bg-background-dark/50 px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200 resize-none"
              placeholder="Bio"
              rows={3}
              value={bio}
              onChange={(e) => { setBio(e.target.value); setSaved(false); }}
            />
            <label
              htmlFor="profile-bio"
              className="absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary"
            >
              Bio
            </label>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/0 group-hover:border-primary/50 transition-all duration-300"></div>
          </div>

          <div className="border-t border-surface-highlight pt-5">
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">Change Password</p>
            <div className="space-y-4">
              <div className="relative group">
                <input
                  id="profile-newpass"
                  className="peer block w-full rounded border border-slate-600 bg-background-dark/50 px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200"
                  placeholder="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); setSaved(false); }}
                />
                <label
                  htmlFor="profile-newpass"
                  className="absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary"
                >
                  New Password
                </label>
              </div>
              <div className="relative group">
                <input
                  id="profile-confirm"
                  className="peer block w-full rounded border border-slate-600 bg-background-dark/50 px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200"
                  placeholder="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); setSaved(false); }}
                />
                <label
                  htmlFor="profile-confirm"
                  className="absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary"
                >
                  Confirm Password
                </label>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm font-mono">{error}</p>}
          {saved && <p className="text-primary text-sm font-mono">Profile updated successfully</p>}
        </div>

        <div className="px-4 md:px-6 py-4 bg-surface-dark/60 border-t border-primary/20 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 px-4 py-2 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-medium tracking-wide"
          >
            <X className="group-hover:rotate-90 transition-transform duration-300" size={20} />
            CANCEL
          </button>
          <button
            onClick={handleSave}
            className="relative overflow-hidden bg-primary hover:bg-primary-dark text-background-dark font-bold text-sm px-8 py-2.5 rounded shadow-[0_0_15px_rgba(13,242,13,0.4)] hover:shadow-[0_0_25px_rgba(13,242,13,0.6)] transition-all duration-200 flex items-center gap-2 group"
          >
            <Save size={20} />
            SAVE CHANGES
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
          </button>
        </div>

        <div className="h-1 w-full flex">
          <div className="h-full bg-primary/20 w-1/4"></div>
          <div className="h-full bg-primary/40 w-1/4"></div>
          <div className="h-full bg-primary/60 w-1/4"></div>
          <div className="h-full bg-primary w-1/4"></div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="flex justify-center pb-8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-2.5 rounded border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-bold tracking-wide"
        >
          <LogOut size={18} />
          SIGN OUT
        </button>
      </div>
    </main>
  );
}
