import React, { useState } from 'react';
import { X, Shield, Award, MapPin, Building, Smartphone, Mail, User } from 'lucide-react';
import { RaceBibBadge } from './RaceBibBadge';

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [role, setRole] = useState('RUNNER'); // 'RUNNER' | 'ORGANIZER'

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Organizer Club Fields
  const [clubName, setClubName] = useState('');
  const [clubCity, setClubCity] = useState('');
  const [clubDescription, setClubDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const payload = {
          name,
          phone,
          email,
          role,
          ...(role === 'ORGANIZER' && {
            clubName,
            clubCity,
            clubDescription,
          }),
        };

        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');

        onAuthSuccess(data.user || data.result?.user);
        onClose();
      } else {
        const res = await fetch('/api/auth/demo-users');
        const users = await res.json();
        const found = users.find(
          (u) => u.phone.includes(phone) || (email && u.email?.toLowerCase() === email.toLowerCase())
        );

        if (!found) {
          throw new Error('User not found. Try signing up or using demo switcher!');
        }

        onAuthSuccess(found);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[90vh] bg-[#FBF9F5] border-2 border-[#2C3333] shadow-[6px_6px_0px_#2C3333] rounded-lg overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-150">
        <div className="bib-pinhole-tl" />
        <div className="bib-pinhole-tr" />

        {/* Modal Header */}
        <div className="p-5 bg-[#EDEAE2] border-b-2 border-[#2C3333] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-black text-xl text-[#2C3333] tracking-tight">
              {mode === 'signup' ? 'JOIN PACEMATE' : 'WELCOME BACK'}
            </h3>
            <p className="text-xs font-mono font-medium text-[#5C6565]">
              {mode === 'signup' ? 'Step into your local run club community' : 'Access your run rosters & check-ins'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#E4E0D5] text-[#2C3333] transition-colors border border-[#2C3333]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Signup vs Login */}
        <div className="flex border-b-2 border-[#2C3333] bg-[#E8E4DA] shrink-0">
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 text-center font-mono font-bold text-xs uppercase transition-colors ${
              mode === 'signup' ? 'bg-[#FBF9F5] text-[#2C3333] border-r-2 border-[#2C3333]' : 'text-[#5C6565] hover:text-[#2C3333]'
            }`}
          >
            Sign Up (New Account)
          </button>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 text-center font-mono font-bold text-xs uppercase transition-colors ${
              mode === 'login' ? 'bg-[#FBF9F5] text-[#2C3333] border-l-2 border-[#2C3333]' : 'text-[#5C6565] hover:text-[#2C3333]'
            }`}
          >
            Log In
          </button>
        </div>

        {/* Scrollable Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-500 text-red-800 text-xs font-bold rounded">
              ⚠️ {error}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-2">
                I am signing up as a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('RUNNER')}
                  className={`p-3 rounded-md border-2 text-left transition-all flex flex-col items-center gap-1 ${
                    role === 'RUNNER'
                      ? 'bg-[#E85D2C] text-white border-[#2C3333] shadow-[2px_2px_0px_#2C3333]'
                      : 'bg-[#EDEAE2] text-[#2C3333] border-[#2C3333] hover:bg-[#E4E0D5]'
                  }`}
                >
                  <Award className="w-5 h-5" />
                  <span className="font-bold text-sm">RUNNER</span>
                  <span className="text-[10px] opacity-80 text-center">Join events & check in</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('ORGANIZER')}
                  className={`p-3 rounded-md border-2 text-left transition-all flex flex-col items-center gap-1 ${
                    role === 'ORGANIZER'
                      ? 'bg-[#276F6E] text-white border-[#2C3333] shadow-[2px_2px_0px_#2C3333]'
                      : 'bg-[#EDEAE2] text-[#2C3333] border-[#2C3333] hover:bg-[#E4E0D5]'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-bold text-sm">ORGANIZER</span>
                  <span className="text-[10px] opacity-80 text-center">Create club & events</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-[#5C6565]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#2C3333] rounded font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#276F6E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 absolute left-3 top-3 text-[#5C6565]" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#2C3333] rounded font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#276F6E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#5C6565]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="runner@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#2C3333] rounded font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#276F6E]"
                />
              </div>
            </div>
          </div>

          {/* Organizer-Specific Club Creation Fields */}
          {mode === 'signup' && role === 'ORGANIZER' && (
            <div className="p-4 bg-[#EDEAE2] border-2 border-[#2C3333] rounded space-y-3">
              <div className="flex items-center gap-2 border-b border-[#2C3333] pb-2">
                <Building className="w-4 h-4 text-[#276F6E]" />
                <h4 className="font-mono font-bold text-xs uppercase text-[#276F6E]">
                  Create Your Run Club
                </h4>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-1">
                  Club Name *
                </label>
                <input
                  type="text"
                  required={role === 'ORGANIZER'}
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="e.g. Harbor Pace Club"
                  className="w-full px-3 py-1.5 bg-white border-2 border-[#2C3333] rounded text-sm font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-1">
                  City / Location *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-[#5C6565]" />
                  <input
                    type="text"
                    required={role === 'ORGANIZER'}
                    value={clubCity}
                    onChange={(e) => setClubCity(e.target.value)}
                    placeholder="e.g. Boston, MA"
                    className="w-full pl-9 pr-3 py-1.5 bg-white border-2 border-[#2C3333] rounded text-sm font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-1">
                  Club Description
                </label>
                <textarea
                  rows={2}
                  value={clubDescription}
                  onChange={(e) => setClubDescription(e.target.value)}
                  placeholder="Tell runners what your club is about..."
                  className="w-full p-2 bg-white border-2 border-[#2C3333] rounded text-xs font-medium focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#E85D2C] hover:bg-[#CF4E20] text-white font-extrabold text-sm uppercase font-mono rounded border-2 border-[#2C3333] shadow-[3px_3px_0px_#2C3333] transition-all transform active:translate-y-0.5 mt-2"
          >
            {loading ? 'Processing...' : mode === 'signup' ? 'Complete Registration' : 'Log In Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
