import React, { useState } from 'react';
import { Search, MapPin, Calendar, Clock, Users, ArrowRight, ShieldCheck, Filter, AlertCircle, CreditCard } from 'lucide-react';
import { RaceBibBadge, RaceBibCard } from './RaceBibBadge';

export function EventBrowser({ events = [], currentUser, onSelectEvent, onOpenAuth }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPace, setSelectedPace] = useState('ALL');
  const [filterMode, setFilterMode] = useState('ALL');

  const allPaceGroups = Array.from(
    new Set(
      events.flatMap((e) => (e.paceGroupsList ? e.paceGroupsList : []))
    )
  );

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.club?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPace =
      selectedPace === 'ALL' || (ev.paceGroupsList && ev.paceGroupsList.includes(selectedPace));

    const matchesClub =
      filterMode === 'ALL' || (currentUser?.clubId && ev.clubId === currentUser.clubId);

    return matchesSearch && matchesPace && matchesClub;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bib-card p-6 md:p-8 rounded-lg bg-gradient-to-r from-[#276F6E] to-[#1E5756] text-white border-2 border-[#2C3333] shadow-[6px_6px_0px_#2C3333] relative overflow-hidden">
        <div className="bib-pinhole-tl bg-[#FBF9F5]" />
        <div className="bib-pinhole-tr bg-[#FBF9F5]" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <RaceBibBadge text="COMMUNITY FEED" variant="orange" size="md" />
            <span className="font-mono text-xs opacity-90">LIVE RUN CLUB EVENTS</span>
          </div>

          <h1 className="font-black text-2xl md:text-4xl tracking-tight leading-tight">
            RUN TOGETHER. <br />
            COMMUNITY & EVENTS.
          </h1>

          <p className="text-sm opacity-90 font-medium">
            Browse upcoming community runs, select your pace group, register (pay now or pay at door), and check in live on race day.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FBF9F5] p-4 rounded-md border-2 border-[#2C3333] shadow-[4px_4px_0px_#2C3333] space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#5C6565]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by run name, city, or club..."
              className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#2C3333] rounded font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#276F6E]"
            />
          </div>

          {currentUser?.clubId && (
            <div className="flex bg-[#EDEAE2] p-1 rounded border-2 border-[#2C3333] w-full sm:w-auto">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-3 py-1 font-mono font-bold text-xs rounded transition-colors ${
                  filterMode === 'ALL' ? 'bg-[#276F6E] text-white' : 'text-[#2C3333]'
                }`}
              >
                All Public Runs
              </button>
              <button
                onClick={() => setFilterMode('MY_CLUB')}
                className={`px-3 py-1 font-mono font-bold text-xs rounded transition-colors ${
                  filterMode === 'MY_CLUB' ? 'bg-[#276F6E] text-white' : 'text-[#2C3333]'
                }`}
              >
                My Club Runs
              </button>
            </div>
          )}
        </div>

        {allPaceGroups.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            <span className="text-[11px] font-mono font-bold uppercase text-[#5C6565] flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Pace:
            </span>
            <button
              onClick={() => setSelectedPace('ALL')}
              className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold border transition-all ${
                selectedPace === 'ALL'
                  ? 'bg-[#2C3333] text-white border-[#2C3333]'
                  : 'bg-[#EDEAE2] text-[#2C3333] border-[#2C3333] hover:bg-[#E4E0D5]'
              }`}
            >
              All Paces
            </button>
            {allPaceGroups.map((pace) => (
              <button
                key={pace}
                onClick={() => setSelectedPace(pace)}
                className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold border transition-all shrink-0 ${
                  selectedPace === pace
                    ? 'bg-[#E85D2C] text-white border-[#2C3333]'
                    : 'bg-[#EDEAE2] text-[#2C3333] border-[#2C3333] hover:bg-[#E4E0D5]'
                }`}
              >
                {pace}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bib-card p-12 text-center rounded-lg space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-[#E85D2C]" />
          <h3 className="font-extrabold text-xl text-[#2C3333]">NO UPCOMING RUNS FOUND</h3>
          <p className="text-sm text-[#5C6565]">
            No events match your selected filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const registeredCount = ev.registrations ? ev.registrations.length : 0;
            const spotsRemaining = Math.max(0, ev.capacity - registeredCount);
            const isFull = registeredCount >= ev.capacity;
            const isRegistered = currentUser && ev.registrations?.some((r) => r.userId === currentUser.id);
            const priceTag = ev.price > 0 ? `₹${ev.price}` : 'FREE';

            return (
              <RaceBibCard key={ev.id} className="flex flex-col justify-between h-full group">
                <div>
                  {/* Cover Image & Tags */}
                  <div className="relative h-44 rounded border-2 border-[#2C3333] overflow-hidden mb-4 bg-stone-200">
                    <img
                      src={ev.coverImageUrl || 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80'}
                      alt={ev.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <RaceBibBadge text={ev.club?.name || 'RUN CLUB'} variant="teal" size="sm" />
                      <RaceBibBadge
                        text={priceTag}
                        variant={ev.price > 0 ? 'orange' : 'stone'}
                        size="sm"
                      />
                    </div>

                    <div className="absolute bottom-2 right-2">
                      {isRegistered ? (
                        <RaceBibBadge text="REGISTERED" variant="success" size="sm" />
                      ) : isFull ? (
                        <RaceBibBadge text="FULL (WAITLIST)" variant="orange" size="sm" />
                      ) : (
                        <RaceBibBadge text={`${spotsRemaining} SPOTS LEFT`} variant="stone" size="sm" />
                      )}
                    </div>
                  </div>

                  <h3 className="font-extrabold text-lg text-[#2C3333] leading-snug group-hover:text-[#276F6E] transition-colors mb-2">
                    {ev.name}
                  </h3>

                  <div className="space-y-1.5 text-xs text-[#5C6565] font-medium mb-3">
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

                  <div className="flex flex-wrap gap-1 mb-4">
                    {ev.paceGroupsList?.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 bg-[#EDEAE2] border border-[#2C3333] rounded font-mono text-[10px] font-bold text-[#2C3333]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-dashed border-[#2C3333] flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1 text-xs font-mono text-[#5C6565]">
                    <Users className="w-3.5 h-3.5 text-[#276F6E]" />
                    <span>{registeredCount} runners</span>
                  </div>

                  <button
                    onClick={() => onSelectEvent(ev)}
                    className="px-3.5 py-1.5 bg-[#E85D2C] hover:bg-[#CF4E20] text-white font-bold font-mono text-xs rounded border-2 border-[#2C3333] shadow-[2px_2px_0px_#2C3333] flex items-center gap-1 transition-all"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </RaceBibCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
