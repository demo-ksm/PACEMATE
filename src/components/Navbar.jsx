import React, { useState } from 'react';
import { Flag, Calendar, Users, QrCode, LogOut, UserCheck, ChevronDown, PlusCircle, Shield, Award } from 'lucide-react';
import { RaceBibBadge } from './RaceBibBadge';

export function Navbar({
  currentUser,
  demoUsers = [],
  onSelectUser,
  onOpenAuth,
  onLogout,
  currentView,
  setCurrentView,
  onOpenCreateEvent,
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isOrganizer = currentUser?.role === 'ORGANIZER';

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5F0] border-b-2 border-[#2C3333] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView(isOrganizer ? 'organizer-dashboard' : 'events')}>
            <div className="w-10 h-10 bg-[#E85D2C] border-2 border-[#2C3333] shadow-[2px_2px_0px_#2C3333] flex items-center justify-center rounded text-white font-mono font-black text-xl transform rotate-[-2deg]">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#2C3333]">PACEMATE</span>
                <RaceBibBadge text="RUN CLUB" variant="teal" size="sm" />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {isOrganizer ? (
              <>
                <button
                  onClick={() => setCurrentView('organizer-dashboard')}
                  className={`px-3.5 py-1.5 rounded-md font-semibold text-sm transition-all flex items-center gap-2 border-2 ${
                    currentView === 'organizer-dashboard'
                      ? 'bg-[#276F6E] text-white border-[#2C3333] shadow-[2px_2px_0px_#2C3333]'
                      : 'border-transparent text-[#2C3333] hover:bg-[#EDEAE2]'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Dashboard
                </button>

                <button
                  onClick={() => setCurrentView('events')}
                  className={`px-3.5 py-1.5 rounded-md font-semibold text-sm transition-all flex items-center gap-2 border-2 ${
                    currentView === 'events'
                      ? 'bg-[#276F6E] text-white border-[#2C3333] shadow-[2px_2px_0px_#2C3333]'
                      : 'border-transparent text-[#2C3333] hover:bg-[#EDEAE2]'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  All Events
                </button>

                <button
                  onClick={() => setCurrentView('member-directory')}
                  className={`px-3.5 py-1.5 rounded-md font-semibold text-sm transition-all flex items-center gap-2 border-2 ${
                    currentView === 'member-directory'
                      ? 'bg-[#276F6E] text-white border-[#2C3333] shadow-[2px_2px_0px_#2C3333]'
                      : 'border-transparent text-[#2C3333] hover:bg-[#EDEAE2]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Member Directory
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentView('events')}
                  className={`px-3.5 py-1.5 rounded-md font-semibold text-sm transition-all flex items-center gap-2 border-2 ${
                    currentView === 'events'
                      ? 'bg-[#276F6E] text-white border-[#2C3333] shadow-[2px_2px_0px_#2C3333]'
                      : 'border-transparent text-[#2C3333] hover:bg-[#EDEAE2]'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  Find Runs
                </button>

                {currentUser && (
                  <button
                    onClick={() => setCurrentView('my-runs')}
                    className={`px-3.5 py-1.5 rounded-md font-semibold text-sm transition-all flex items-center gap-2 border-2 ${
                      currentView === 'my-runs'
                        ? 'bg-[#276F6E] text-white border-[#2C3333] shadow-[2px_2px_0px_#2C3333]'
                        : 'border-transparent text-[#2C3333] hover:bg-[#EDEAE2]'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    My Runs
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Right Action Menu: Create Event (Organizer), Demo Profile Switcher, and Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isOrganizer && (
              <button
                onClick={onOpenCreateEvent}
                className="px-3 py-1.5 bg-[#E85D2C] hover:bg-[#CF4E20] text-white font-bold text-xs sm:text-sm rounded-md border-2 border-[#2C3333] shadow-[2px_2px_0px_#2C3333] flex items-center gap-1.5 transition-all transform active:translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">New Event</span>
              </button>
            )}

            {/* Quick Demo User Dropdown */}
            {demoUsers.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="px-2.5 py-1.5 bg-[#EDEAE2] hover:bg-[#E4E0D5] text-[#2C3333] font-mono text-xs font-bold rounded-md border-2 border-[#2C3333] flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#2C3333]"
                  title="Switch profile for live demo"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E85D2C] animate-pulse" />
                  <span className="truncate max-w-[90px] sm:max-w-[140px]">
                    {currentUser ? currentUser.name : 'Select Profile'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#FBF9F5] border-2 border-[#2C3333] shadow-[4px_4px_0px_#2C3333] rounded-md py-2 z-50">
                    <div className="px-3 py-1.5 border-b border-[#2C3333] bg-[#EDEAE2]">
                      <p className="text-[11px] font-mono font-bold text-[#5C6565] uppercase">
                        ⚡ Quick Demo Profile Switcher
                      </p>
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1">
                      <p className="px-3 py-1 text-[10px] font-mono font-bold text-[#276F6E] uppercase">
                        Organizers
                      </p>
                      {demoUsers
                        .filter((u) => u.role === 'ORGANIZER')
                        .map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSelectUser(u);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-[#EDEAE2] flex items-center justify-between ${
                              currentUser?.id === u.id ? 'bg-[#276F6E]/10 font-bold text-[#276F6E]' : 'text-[#2C3333]'
                            }`}
                          >
                            <div>
                              <div className="font-bold flex items-center gap-1.5">
                                <Shield className="w-3 h-3 text-[#276F6E]" />
                                {u.name}
                              </div>
                              <div className="text-[10px] text-[#5C6565]">{u.ownedClub?.name || 'Run Organizer'}</div>
                            </div>
                            <RaceBibBadge text="ORGANIZER" variant="teal" size="sm" />
                          </button>
                        ))}

                      <div className="border-t border-dashed border-[#2C3333] my-1" />

                      <p className="px-3 py-1 text-[10px] font-mono font-bold text-[#E85D2C] uppercase">
                        Runners
                      </p>
                      {demoUsers
                        .filter((u) => u.role === 'RUNNER')
                        .map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSelectUser(u);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-[#EDEAE2] flex items-center justify-between ${
                              currentUser?.id === u.id ? 'bg-[#E85D2C]/10 font-bold text-[#E85D2C]' : 'text-[#2C3333]'
                            }`}
                          >
                            <div>
                              <div className="font-bold flex items-center gap-1.5">
                                <Award className="w-3 h-3 text-[#E85D2C]" />
                                {u.name}
                              </div>
                              <div className="text-[10px] text-[#5C6565]">{u.phone}</div>
                            </div>
                            <RaceBibBadge text="RUNNER" variant="orange" size="sm" />
                          </button>
                        ))}
                    </div>

                    <div className="border-t border-[#2C3333] p-2 bg-[#EDEAE2] flex flex-col gap-1.5">
                      <button
                        onClick={() => {
                          onOpenAuth();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-center py-1 bg-[#2C3333] text-white font-mono text-[11px] font-bold rounded hover:bg-[#1A202C]"
                      >
                        + Create New Account
                      </button>

                      {currentUser && (
                        <button
                          onClick={() => {
                            onLogout();
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-center py-1 bg-red-100 border border-red-500 text-red-800 font-mono text-[11px] font-bold rounded hover:bg-red-200 flex items-center justify-center gap-1"
                        >
                          <LogOut className="w-3 h-3" /> Log Out Current User
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Prominent Header Logout Button */}
            {currentUser ? (
              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 bg-[#EDEAE2] hover:bg-red-100 text-[#2C3333] hover:text-red-700 font-mono font-bold text-xs rounded-md border-2 border-[#2C3333] shadow-[2px_2px_0px_#2C3333] flex items-center gap-1 transition-colors"
                title="Log out and clear session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Log Out</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 bg-[#276F6E] hover:bg-[#1E5756] text-white font-bold text-xs sm:text-sm rounded-md border-2 border-[#2C3333] shadow-[2px_2px_0px_#2C3333] transition-all"
              >
                Sign Up / Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
