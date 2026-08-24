import React, { useState } from 'react';
import { Calendar, Clock, MapPin, QrCode, CheckCircle, AlertCircle, ArrowRight, UserCheck, CreditCard } from 'lucide-react';
import { RaceBibBadge, RaceBibCard } from './RaceBibBadge';

export function MyRuns({ currentUser, events = [], onSelectEvent, onOpenQRScanner }) {
  const [activeTab, setActiveTab] = useState('UPCOMING');

  if (!currentUser) return null;

  const userRegisteredEvents = events.filter((ev) =>
    ev.registrations?.some((r) => r.userId === currentUser.id)
  );

  const userWaitlistedEvents = events.filter((ev) =>
    ev.waitlists?.some((w) => w.userId === currentUser.id)
  );

  const upcomingRuns = userRegisteredEvents.filter((ev) => {
    const reg = ev.registrations?.find((r) => r.userId === currentUser.id);
    return !reg?.attended;
  });

  const attendedRuns = userRegisteredEvents.filter((ev) => {
    const reg = ev.registrations?.find((r) => r.userId === currentUser.id);
    return reg?.attended;
  });

  const displayEvents =
    activeTab === 'UPCOMING'
      ? upcomingRuns
      : activeTab === 'ATTENDED'
      ? attendedRuns
      : userWaitlistedEvents;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bib-card p-6 rounded-lg bg-[#276F6E] text-white border-2 border-[#2C3333] shadow-[6px_6px_0px_#2C3333] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RaceBibBadge text="RUNNER PORTAL" variant="orange" size="sm" />
            <span className="font-mono text-xs opacity-90">{currentUser.name}</span>
          </div>
          <h2 className="font-black text-2xl tracking-tight">MY RUN PASSPORT</h2>
          <p className="text-xs opacity-90 font-mono mt-0.5">
            Track your registered runs, payment status, and race-day check-ins.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#1E5756] p-2.5 rounded border border-white/20 font-mono text-xs">
          <div className="text-center px-3 border-r border-white/20">
            <div className="text-lg font-black text-[#E85D2C]">{userRegisteredEvents.length}</div>
            <div className="text-[10px] opacity-80 uppercase">Registered</div>
          </div>
          <div className="text-center px-3">
            <div className="text-lg font-black text-green-400">{attendedRuns.length}</div>
            <div className="text-[10px] opacity-80 uppercase">Attended</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#EDEAE2] p-1.5 rounded-md border-2 border-[#2C3333] shadow-[3px_3px_0px_#2C3333]">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`flex-1 py-2 font-mono font-bold text-xs uppercase rounded transition-all flex items-center justify-center gap-2 ${
            activeTab === 'UPCOMING'
              ? 'bg-[#276F6E] text-white shadow-[2px_2px_0px_#2C3333]'
              : 'text-[#2C3333] hover:bg-[#E4E0D5]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Upcoming Runs ({upcomingRuns.length})
        </button>

        <button
          onClick={() => setActiveTab('ATTENDED')}
          className={`flex-1 py-2 font-mono font-bold text-xs uppercase rounded transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ATTENDED'
              ? 'bg-[#276F6E] text-white shadow-[2px_2px_0px_#2C3333]'
              : 'text-[#2C3333] hover:bg-[#E4E0D5]'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Attended ({attendedRuns.length})
        </button>

        <button
          onClick={() => setActiveTab('WAITLIST')}
          className={`flex-1 py-2 font-mono font-bold text-xs uppercase rounded transition-all flex items-center justify-center gap-2 ${
            activeTab === 'WAITLIST'
              ? 'bg-[#276F6E] text-white shadow-[2px_2px_0px_#2C3333]'
              : 'text-[#2C3333] hover:bg-[#E4E0D5]'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Waitlist ({userWaitlistedEvents.length})
        </button>
      </div>

      {/* Runs List */}
      {displayEvents.length === 0 ? (
        <div className="bib-card p-12 text-center rounded-lg space-y-3">
          <UserCheck className="w-10 h-10 mx-auto text-[#276F6E]" />
          <h3 className="font-extrabold text-lg text-[#2C3333]">NO RUNS IN THIS CATEGORY</h3>
          <p className="text-xs text-[#5C6565]">
            {activeTab === 'UPCOMING'
              ? 'You have not registered for any upcoming runs yet.'
              : activeTab === 'ATTENDED'
              ? 'No attended runs recorded yet.'
              : 'You are currently not on any waitlists.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayEvents.map((ev) => {
            const reg = ev.registrations?.find((r) => r.userId === currentUser.id);

            return (
              <RaceBibCard key={ev.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <RaceBibBadge text={ev.club?.name || 'CLUB'} variant="teal" size="sm" />
                    <div className="flex items-center gap-1.5">
                      {ev.price > 0 && reg && (
                        <RaceBibBadge
                          text={reg.paymentStatus === 'PAID' ? 'PAID' : 'PAYMENT PENDING'}
                          variant={reg.paymentStatus === 'PAID' ? 'success' : 'orange'}
                          size="sm"
                        />
                      )}
                      {reg?.attended ? (
                        <RaceBibBadge text="CHECKED IN" variant="success" size="sm" />
                      ) : reg ? (
                        <RaceBibBadge text={`PACE: ${reg.paceGroup}`} variant="stone" size="sm" />
                      ) : (
                        <RaceBibBadge text="WAITLISTED" variant="stone" size="sm" />
                      )}
                    </div>
                  </div>

                  <h3 className="font-extrabold text-lg text-[#2C3333] mb-2">{ev.name}</h3>

                  <div className="space-y-1 text-xs text-[#5C6565] font-mono mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#276F6E]" />
                      <span>{ev.date}</span>
                      <Clock className="w-3.5 h-3.5 ml-2 text-[#276F6E]" />
                      <span>{ev.time}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#E85D2C] shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-dashed border-[#2C3333] flex items-center justify-between mt-auto">
                  <button
                    onClick={() => onSelectEvent(ev)}
                    className="text-xs font-mono font-bold text-[#276F6E] hover:underline flex items-center gap-1"
                  >
                    View Details & Payment <ArrowRight className="w-3 h-3" />
                  </button>

                  {activeTab === 'UPCOMING' && reg && !reg.attended && (
                    <button
                      onClick={onOpenQRScanner}
                      className="px-3 py-1.5 bg-[#276F6E] hover:bg-[#1E5756] text-white font-mono font-bold text-xs rounded border-2 border-[#2C3333] shadow-[2px_2px_0px_#2C3333] flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Check In (QR)
                    </button>
                  )}
                </div>
              </RaceBibCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
