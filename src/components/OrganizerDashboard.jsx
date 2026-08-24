import React, { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, PlusCircle, QrCode, UserCheck, Mail, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { RaceBibBadge, RaceBibCard } from './RaceBibBadge';

export function OrganizerDashboard({
  currentUser,
  events = [],
  onOpenCreateEvent,
  onOpenRoster,
  onOpenVenueQR,
  onNavigateMemberDirectory,
}) {
  const [stats, setStats] = useState({
    totalMembers: 0,
    avgAttendanceRate: 100,
    upcomingEventsCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [reminderStatus, setReminderStatus] = useState('');

  const club = currentUser?.ownedClub || currentUser?.club;

  useEffect(() => {
    if (club?.id) {
      fetchClubStats();
    }
  }, [club?.id]);

  const fetchClubStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clubs/${club.id}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminders = async (eventId) => {
    setReminderStatus('Sending...');
    try {
      const res = await fetch('/api/notifications/remind-24h', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      if (res.ok) {
        setReminderStatus('24h Email Reminders Sent! ✉️');
        setTimeout(() => setReminderStatus(''), 3000);
      }
    } catch (e) {
      setReminderStatus('Error sending reminders');
    }
  };

  const clubEvents = events.filter((e) => e.clubId === club?.id);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bib-card p-6 md:p-8 rounded-lg bg-gradient-to-r from-[#276F6E] to-[#1E5756] text-white border-2 border-[#2C3333] shadow-[6px_6px_0px_#2C3333] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="bib-pinhole-tl bg-[#FBF9F5]" />
        <div className="bib-pinhole-tr bg-[#FBF9F5]" />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <RaceBibBadge text="ORGANIZER DASHBOARD" variant="orange" size="md" />
            <span className="font-mono text-xs opacity-90">{club?.name || 'My Run Club'}</span>
          </div>

          <h1 className="font-black text-2xl md:text-3xl tracking-tight leading-tight">
            CLUB COMMAND CENTER
          </h1>

          <p className="text-xs md:text-sm opacity-90 font-medium max-w-xl">
            Manage your upcoming runs, track attendance rates, and open Venue QR codes for race-day check-ins.
          </p>
        </div>

        <button
          onClick={onOpenCreateEvent}
          className="px-5 py-3 bg-[#E85D2C] hover:bg-[#CF4E20] text-white font-black font-mono text-sm uppercase rounded border-2 border-[#2C3333] shadow-[3px_3px_0px_#2C3333] flex items-center gap-2 transition-all shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Event
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RaceBibCard className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono font-bold uppercase text-[#5C6565]">
              Total Club Members
            </p>
            <h3 className="font-black text-3xl text-[#2C3333] mt-1">{stats.totalMembers}</h3>
            <button
              onClick={onNavigateMemberDirectory}
              className="text-[11px] font-mono font-bold text-[#276F6E] hover:underline flex items-center gap-1 mt-2"
            >
              View Directory <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-12 h-12 bg-[#276F6E]/10 border-2 border-[#2C3333] rounded-lg flex items-center justify-center text-[#276F6E]">
            <Users className="w-6 h-6" />
          </div>
        </RaceBibCard>

        <RaceBibCard className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono font-bold uppercase text-[#5C6565]">
              Upcoming Runs
            </p>
            <h3 className="font-black text-3xl text-[#2C3333] mt-1">{clubEvents.length}</h3>
            <p className="text-[11px] font-mono text-[#5C6565] mt-2">Active registrations open</p>
          </div>
          <div className="w-12 h-12 bg-[#E85D2C]/10 border-2 border-[#2C3333] rounded-lg flex items-center justify-center text-[#E85D2C]">
            <Calendar className="w-6 h-6" />
          </div>
        </RaceBibCard>

        <RaceBibCard className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono font-bold uppercase text-[#5C6565]">
              Avg Attendance Rate
            </p>
            <h3 className="font-black text-3xl text-green-700 mt-1">{stats.avgAttendanceRate}%</h3>
            <p className="text-[11px] font-mono text-[#5C6565] mt-2">Verified via QR & Roster</p>
          </div>
          <div className="w-12 h-12 bg-green-100 border-2 border-[#2C3333] rounded-lg flex items-center justify-center text-green-800">
            <TrendingUp className="w-6 h-6" />
          </div>
        </RaceBibCard>
      </div>

      {/* Upcoming Events Overview */}
      <div className="bg-[#FBF9F5] p-6 rounded-lg border-2 border-[#2C3333] shadow-[4px_4px_0px_#2C3333] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-xl text-[#2C3333]">UPCOMING CLUB EVENTS</h3>
            <p className="text-xs font-mono text-[#5C6565]">Live capacity, rosters, and check-in codes</p>
          </div>

          {reminderStatus && (
            <span className="px-3 py-1 bg-green-100 border border-green-700 text-green-800 text-xs font-mono font-bold rounded">
              {reminderStatus}
            </span>
          )}
        </div>

        {clubEvents.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-[#2C3333] rounded space-y-3">
            <Calendar className="w-8 h-8 mx-auto text-[#5C6565]" />
            <p className="font-mono font-bold text-sm text-[#2C3333]">NO UPCOMING EVENTS CREATED YET</p>
            <button
              onClick={onOpenCreateEvent}
              className="px-4 py-2 bg-[#E85D2C] text-white font-mono font-bold text-xs uppercase rounded border-2 border-[#2C3333]"
            >
              + Create First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubEvents.map((ev) => {
              const registeredCount = ev.registrations ? ev.registrations.length : 0;
              const waitlistCount = ev.waitlists ? ev.waitlists.length : 0;

              return (
                <RaceBibCard key={ev.id} className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-base text-[#2C3333]">{ev.name}</h4>
                      <p className="text-xs font-mono text-[#5C6565]">
                        {ev.date} at {ev.time} • {ev.location}
                      </p>
                    </div>

                    <RaceBibBadge
                      text={`${registeredCount}/${ev.capacity}`}
                      variant={registeredCount >= ev.capacity ? 'orange' : 'teal'}
                      size="sm"
                    />
                  </div>

                  <div className="p-3 bg-[#EDEAE2] rounded border border-[#2C3333] space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span>Registrations: {registeredCount}</span>
                      <span>Waitlist: {waitlistCount}</span>
                    </div>
                    <div className="w-full bg-white h-2.5 rounded-full border border-[#2C3333] overflow-hidden">
                      <div
                        className="bg-[#276F6E] h-full"
                        style={{ width: `${Math.min(100, (registeredCount / ev.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-[#2C3333]">
                    <button
                      onClick={() => onOpenRoster(ev)}
                      className="flex-1 px-3 py-1.5 bg-[#276F6E] hover:bg-[#1E5756] text-white font-mono text-xs font-bold rounded border-2 border-[#2C3333] flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Live Roster ({registeredCount})
                    </button>

                    <button
                      onClick={() => onOpenVenueQR(ev)}
                      className="px-3 py-1.5 bg-[#E85D2C] hover:bg-[#CF4E20] text-white font-mono text-xs font-bold rounded border-2 border-[#2C3333] flex items-center gap-1.5"
                      title="Open Venue QR Screen for race day check-in"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Venue QR
                    </button>

                    <button
                      onClick={() => handleSendReminders(ev.id)}
                      className="px-2.5 py-1.5 bg-white hover:bg-[#EDEAE2] text-[#2C3333] font-mono text-xs font-bold rounded border border-[#2C3333]"
                      title="Send 24h email reminder to registered runners"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </RaceBibCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
