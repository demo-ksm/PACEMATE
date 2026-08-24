import React, { useState, useEffect } from 'react';
import { X, Search, CheckSquare, Square, QrCode, Phone, Mail, UserCheck, Clock, ShieldCheck, Filter, CreditCard, DollarSign } from 'lucide-react';
import { RaceBibBadge } from './RaceBibBadge';

export function EventRosterManager({ event: initialEvent, isOpen, onClose, onOpenVenueQR }) {
  const [event, setEvent] = useState(initialEvent);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPace, setSelectedPace] = useState('ALL');
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (isOpen && initialEvent?.id) {
      fetchEventDetails();
    }
  }, [isOpen, initialEvent?.id]);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`/api/events/${initialEvent.id}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      }
    } catch (e) {
      console.error('Error fetching event details:', e);
    }
  };

  if (!isOpen || !event) return null;

  const handleToggleAttendance = async (registrationId, currentAttended) => {
    setLoadingId(registrationId);
    try {
      const res = await fetch(`/api/events/${event.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, attended: !currentAttended }),
      });

      if (res.ok) {
        await fetchEventDetails();
      }
    } catch (e) {
      console.error('Attendance toggle error:', e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleTogglePaymentStatus = async (registrationId, currentStatus) => {
    setLoadingId(registrationId);
    const newStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
    try {
      const res = await fetch(`/api/events/${event.id}/payment-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, paymentStatus: newStatus }),
      });

      if (res.ok) {
        await fetchEventDetails();
      }
    } catch (e) {
      console.error('Payment toggle error:', e);
    } finally {
      setLoadingId(null);
    }
  };

  const registrations = event.registrations || [];
  const waitlists = event.waitlists || [];

  const filteredRegistrations = registrations.filter((reg) => {
    const nameMatch = reg.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.user?.phone.includes(searchTerm);
    const paceMatch = selectedPace === 'ALL' || reg.paceGroup === selectedPace;
    return nameMatch && paceMatch;
  });

  const attendedCount = registrations.filter((r) => r.attended).length;
  const attendanceRate = registrations.length > 0 ? Math.round((attendedCount / registrations.length) * 100) : 0;
  const pendingPaymentsCount = registrations.filter((r) => r.paymentStatus === 'PENDING').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#FBF9F5] border-2 border-[#2C3333] shadow-[8px_8px_0px_#2C3333] rounded-lg overflow-hidden relative flex flex-col">
        <div className="bib-pinhole-tl bg-[#EDEAE2]" />
        <div className="bib-pinhole-tr bg-[#EDEAE2]" />

        {/* Header */}
        <div className="p-5 bg-[#EDEAE2] border-b-2 border-[#2C3333] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <RaceBibBadge text="LIVE EVENT ROSTER" variant="teal" size="sm" />
              {event.price > 0 && (
                <RaceBibBadge text={`COVER FEE: ₹${event.price}`} variant="orange" size="sm" />
              )}
            </div>
            <h2 className="font-black text-xl text-[#2C3333] tracking-tight">{event.name}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenVenueQR(event)}
              className="px-3.5 py-1.5 bg-[#E85D2C] hover:bg-[#CF4E20] text-white font-mono text-xs font-bold rounded border-2 border-[#2C3333] shadow-[2px_2px_0px_#2C3333] flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              Venue QR Screen
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[#E4E0D5] text-[#2C3333] border border-[#2C3333]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-4 bg-[#E8E4DA] border-b-2 border-[#2C3333] p-3 text-center font-mono text-xs shrink-0">
          <div className="border-r border-[#2C3333]">
            <div className="text-[10px] text-[#5C6565] uppercase">Registered</div>
            <div className="font-bold text-[#2C3333] text-sm">{registrations.length} / {event.capacity}</div>
          </div>
          <div className="border-r border-[#2C3333]">
            <div className="text-[10px] text-[#5C6565] uppercase">Attended</div>
            <div className="font-bold text-green-700 text-sm">{attendedCount}</div>
          </div>
          <div className="border-r border-[#2C3333]">
            <div className="text-[10px] text-[#5C6565] uppercase">Payment Pending</div>
            <div className="font-bold text-[#E85D2C] text-sm">{pendingPaymentsCount}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#5C6565] uppercase">Attendance %</div>
            <div className="font-bold text-[#276F6E] text-sm">{attendanceRate}%</div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-[#FBF9F5] border-b-2 border-[#2C3333] flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#5C6565]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search runner by name or phone..."
              className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#2C3333] rounded font-medium text-xs focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <span className="text-[10px] font-mono font-bold uppercase text-[#5C6565] shrink-0">Pace:</span>
            <button
              onClick={() => setSelectedPace('ALL')}
              className={`px-2 py-1 font-mono text-xs font-bold rounded border ${
                selectedPace === 'ALL' ? 'bg-[#276F6E] text-white border-[#2C3333]' : 'bg-white text-[#2C3333] border-[#2C3333]'
              }`}
            >
              All
            </button>
            {event.paceGroupsList?.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPace(p)}
                className={`px-2 py-1 font-mono text-xs font-bold rounded border shrink-0 ${
                  selectedPace === p ? 'bg-[#E85D2C] text-white border-[#2C3333]' : 'bg-white text-[#2C3333] border-[#2C3333]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Roster Table */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-8 text-xs font-mono text-[#5C6565]">
              No runners match your search filter.
            </div>
          ) : (
            filteredRegistrations.map((reg) => (
              <div
                key={reg.id}
                className={`p-3 rounded border-2 border-[#2C3333] flex items-center justify-between transition-colors ${
                  reg.attended ? 'bg-green-50/80 border-green-800' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleAttendance(reg.id, reg.attended)}
                    disabled={loadingId === reg.id}
                    className="text-[#276F6E] hover:scale-110 transition-transform"
                    title="Click to toggle present/absent"
                  >
                    {reg.attended ? (
                      <CheckSquare className="w-5 h-5 text-green-700" />
                    ) : (
                      <Square className="w-5 h-5 text-[#5C6565]" />
                    )}
                  </button>

                  <div>
                    <div className="font-extrabold text-sm text-[#2C3333] flex items-center gap-2">
                      {reg.user?.name}
                      <RaceBibBadge text={reg.paceGroup} variant="stone" size="sm" />
                    </div>
                    <div className="text-[11px] font-mono text-[#5C6565] flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {reg.user?.phone}</span>
                      {reg.user?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {reg.user.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Payment Status Badge & Toggle */}
                  {event.price > 0 && (
                    <button
                      onClick={() => handleTogglePaymentStatus(reg.id, reg.paymentStatus)}
                      disabled={loadingId === reg.id}
                      className={`px-2.5 py-1 rounded font-mono text-[11px] font-bold border-2 transition-all flex items-center gap-1 ${
                        reg.paymentStatus === 'PAID'
                          ? 'bg-green-700 text-white border-[#2C3333]'
                          : 'bg-[#E85D2C] text-white border-[#2C3333] hover:bg-[#CF4E20]'
                      }`}
                      title="Click to toggle Paid / Pending"
                    >
                      {reg.paymentStatus === 'PAID' ? 'PAID ✓' : 'PAYMENT PENDING'}
                    </button>
                  )}

                  {/* Attendance Badge */}
                  <div className="text-right">
                    {reg.attended ? (
                      <RaceBibBadge text="CHECKED IN" variant="success" size="sm" />
                    ) : (
                      <RaceBibBadge text="NOT PRESENT" variant="stone" size="sm" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Waitlist Section */}
          {waitlists.length > 0 && (
            <div className="mt-6 pt-4 border-t-2 border-dashed border-[#2C3333]">
              <h4 className="font-mono font-bold text-xs uppercase text-[#E85D2C] mb-2 flex items-center gap-1.5">
                ⏳ Waitlisted Runners ({waitlists.length})
              </h4>
              <div className="space-y-1.5">
                {waitlists.map((w, idx) => (
                  <div key={w.id} className="p-2.5 bg-orange-50 rounded border border-[#2C3333] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold mr-2">#{idx + 1} {w.user?.name}</span>
                      <span className="text-[#5C6565]">({w.user?.phone})</span>
                    </div>
                    <RaceBibBadge text={w.paceGroup} variant="orange" size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
