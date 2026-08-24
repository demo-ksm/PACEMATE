import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, Calendar, Award, ShieldCheck, ArrowUpDown } from 'lucide-react';
import { RaceBibBadge, RaceBibCard } from './RaceBibBadge';

export function MemberDirectory({ currentUser }) {
  const [roster, setRoster] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const club = currentUser?.ownedClub || currentUser?.club;

  useEffect(() => {
    if (club?.id) {
      fetchRoster();
    }
  }, [club?.id]);

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clubs/${club.id}/roster`);
      if (res.ok) {
        const data = await res.json();
        setRoster(data);
      }
    } catch (err) {
      console.error('Error fetching roster:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoster = roster.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm) ||
    (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bib-card p-6 rounded-lg bg-[#276F6E] text-white border-2 border-[#2C3333] shadow-[6px_6px_0px_#2C3333] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RaceBibBadge text="CLUB DIRECTORY" variant="orange" size="sm" />
            <span className="font-mono text-xs opacity-90">{club?.name || 'My Run Club'}</span>
          </div>
          <h2 className="font-black text-2xl tracking-tight">RUNNER ROSTER & STATS</h2>
          <p className="text-xs opacity-90 font-mono mt-0.5">
            Lifetime member directory tracking total runs registered, attendances, and loyalty rates.
          </p>
        </div>

        <div className="bg-[#1E5756] p-3 rounded border border-white/20 font-mono text-xs text-center">
          <div className="text-2xl font-black text-[#E85D2C]">{roster.length}</div>
          <div className="text-[10px] opacity-80 uppercase">Total Members</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-[#FBF9F5] p-4 rounded-md border-2 border-[#2C3333] shadow-[4px_4px_0px_#2C3333]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#5C6565]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search member by name, phone, or email..."
            className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#2C3333] rounded font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#276F6E]"
          />
        </div>
      </div>

      {/* Roster Grid / Table */}
      {loading ? (
        <div className="text-center py-12 font-mono text-xs font-bold text-[#5C6565]">
          Loading club roster...
        </div>
      ) : filteredRoster.length === 0 ? (
        <div className="bib-card p-12 text-center rounded-lg space-y-2">
          <Users className="w-10 h-10 mx-auto text-[#5C6565]" />
          <h3 className="font-extrabold text-base text-[#2C3333]">NO MEMBERS FOUND</h3>
          <p className="text-xs text-[#5C6565]">No runners match your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoster.map((runner) => (
            <RaceBibCard key={runner.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-[#2C3333]">{runner.name}</h4>
                  <div className="text-xs font-mono text-[#5C6565] flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-[#276F6E]" /> {runner.phone}
                  </div>
                  {runner.email && (
                    <div className="text-xs font-mono text-[#5C6565] flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                      <Mail className="w-3 h-3 text-[#276F6E]" /> {runner.email}
                    </div>
                  )}
                </div>

                <RaceBibBadge
                  text={`${runner.attendanceRate}% ATTENDANCE`}
                  variant={runner.attendanceRate >= 75 ? 'success' : runner.attendanceRate >= 50 ? 'teal' : 'stone'}
                  size="sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[#EDEAE2] p-2 rounded border border-[#2C3333] text-center font-mono text-xs">
                <div>
                  <div className="text-[9px] text-[#5C6565] uppercase">Joined</div>
                  <div className="font-bold text-[10px]">
                    {new Date(runner.firstJoined).toLocaleDateString([], { month: 'short', year: '2-digit' })}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] text-[#5C6565] uppercase">Registered</div>
                  <div className="font-bold">{runner.totalRegistered}</div>
                </div>

                <div>
                  <div className="text-[9px] text-[#5C6565] uppercase">Attended</div>
                  <div className="font-bold text-green-700">{runner.totalAttended}</div>
                </div>
              </div>
            </RaceBibCard>
          ))}
        </div>
      )}
    </div>
  );
}
