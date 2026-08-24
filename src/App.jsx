import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EventBrowser } from './components/EventBrowser';
import { EventDetailModal } from './components/EventDetailModal';
import { MyRuns } from './components/MyRuns';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { MemberDirectory } from './components/MemberDirectory';
import { AuthModal } from './components/AuthModal';
import { CreateEventModal } from './components/CreateEventModal';
import { QRScannerModal } from './components/QRScannerModal';
import { VenueQRModal } from './components/VenueQRModal';
import { EventRosterManager } from './components/EventRosterManager';
import { RaceBibBadge } from './components/RaceBibBadge';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [demoUsers, setDemoUsers] = useState([]);
  const [events, setEvents] = useState([]);

  // Views & Routing
  const [currentView, setCurrentView] = useState('events');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [selectedVenueQREvent, setSelectedVenueQREvent] = useState(null);
  const [selectedRosterEvent, setSelectedRosterEvent] = useState(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Initial Load: Fetch demo users & events
  useEffect(() => {
    loadDemoUsers();
    loadEvents();
  }, []);

  const loadDemoUsers = async () => {
    try {
      const res = await fetch('/api/auth/demo-users');
      if (res.ok) {
        const users = await res.json();
        setDemoUsers(users);

        // Auto-login as first Organizer for immediate rich demo!
        const organizer = users.find((u) => u.role === 'ORGANIZER') || users[0];
        if (organizer) {
          setCurrentUser(organizer);
          setCurrentView('organizer-dashboard');
        }
      }
    } catch (err) {
      console.error('Error loading demo users:', err);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  // Switch demo user session
  const handleSelectUser = (user) => {
    setCurrentUser(user);
    if (user.role === 'ORGANIZER') {
      setCurrentView('organizer-dashboard');
      showToast(`Switched profile to Organizer: ${user.name} (${user.ownedClub?.name || 'Run Club'})`);
    } else {
      setCurrentView('events');
      showToast(`Switched profile to Runner: ${user.name}`);
    }
  };

  // Explicit Logout Action: Clears state, localStorage/sessionStorage, returns to logged-out landing page
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setCurrentUser(null);
    setCurrentView('events');
    setIsAuthOpen(false);
    setIsCreateEventOpen(false);
    setSelectedEventDetail(null);
    setIsQRScannerOpen(false);
    setSelectedVenueQREvent(null);
    setSelectedRosterEvent(null);
    showToast('Logged out successfully. Session cleared.');
  };

  return (
    <div className="min-h-screen bg-[#EDEAE2] flex flex-col font-sans text-[#2C3333]">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#276F6E] text-white px-4 py-3 rounded-md border-2 border-[#2C3333] shadow-[4px_4px_0px_#2C3333] font-mono text-xs font-bold animate-in fade-in slide-in-from-top-4">
          ⚡ {toastMessage}
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        demoUsers={demoUsers}
        onSelectUser={handleSelectUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenCreateEvent={() => setIsCreateEventOpen(true)}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'organizer-dashboard' && currentUser?.role === 'ORGANIZER' && (
          <OrganizerDashboard
            currentUser={currentUser}
            events={events}
            onOpenCreateEvent={() => setIsCreateEventOpen(true)}
            onOpenRoster={(ev) => setSelectedRosterEvent(ev)}
            onOpenVenueQR={(ev) => setSelectedVenueQREvent(ev)}
            onNavigateMemberDirectory={() => setCurrentView('member-directory')}
          />
        )}

        {currentView === 'events' && (
          <EventBrowser
            events={events}
            currentUser={currentUser}
            onSelectEvent={(ev) => setSelectedEventDetail(ev)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentView === 'my-runs' && currentUser && (
          <MyRuns
            currentUser={currentUser}
            events={events}
            onSelectEvent={(ev) => setSelectedEventDetail(ev)}
            onOpenQRScanner={() => setIsQRScannerOpen(true)}
          />
        )}

        {currentView === 'member-directory' && (
          <MemberDirectory currentUser={currentUser} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#F7F5F0] border-t-2 border-[#2C3333] py-6 text-center text-xs font-mono text-[#5C6565]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-[#2C3333]">PACEMATE</span>
            <span>• Built for Scrappy, Community-Driven Run Clubs</span>
          </div>
          <div className="flex items-center gap-3">
            <RaceBibBadge text="V1.0 DEPLOY READY" variant="stone" size="sm" />
            <span>QR Venue Check-In • Resend Email Engine</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          handleSelectUser(user);
          loadEvents();
        }}
      />

      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        currentUser={currentUser}
        onEventCreated={() => {
          loadEvents();
          showToast('New run event successfully created!');
        }}
      />

      <EventDetailModal
        isOpen={Boolean(selectedEventDetail)}
        event={selectedEventDetail}
        onClose={() => setSelectedEventDetail(null)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onRegisterSuccess={() => {
          loadEvents();
          setSelectedEventDetail(null);
          showToast('Registration confirmed!');
        }}
        onCancelSuccess={(msg) => {
          loadEvents();
          setSelectedEventDetail(null);
          showToast(msg || 'Registration cancelled');
        }}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        currentUser={currentUser}
        events={events}
        onCheckInSuccess={() => {
          loadEvents();
          showToast('CHECK-IN CONFIRMED! 🎉');
        }}
      />

      <VenueQRModal
        isOpen={Boolean(selectedVenueQREvent)}
        event={selectedVenueQREvent}
        onClose={() => setSelectedVenueQREvent(null)}
      />

      <EventRosterManager
        isOpen={Boolean(selectedRosterEvent)}
        event={selectedRosterEvent}
        onClose={() => setSelectedRosterEvent(null)}
        onOpenVenueQR={(ev) => {
          setSelectedRosterEvent(null);
          setSelectedVenueQREvent(ev);
        }}
      />
    </div>
  );
}
