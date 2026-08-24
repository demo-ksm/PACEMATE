import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Shield, CheckCircle, AlertTriangle, QrCode, Lock, CreditCard, Clock3, Check } from 'lucide-react';
import { RaceBibBadge } from './RaceBibBadge';

export function EventDetailModal({
  event,
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onRegisterSuccess,
  onCancelSuccess,
  onOpenQRScanner,
}) {
  const [selectedPace, setSelectedPace] = useState(
    event?.paceGroupsList && event.paceGroupsList.length > 0 ? event.paceGroupsList[0] : ''
  );
  const [paymentOption, setPaymentOption] = useState('PAY_NOW');
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !event) return null;

  const isPaidEvent = event.price > 0;
  const registeredCount = event.registrations ? event.registrations.length : 0;
  const spotsRemaining = Math.max(0, event.capacity - registeredCount);
  const isFull = registeredCount >= event.capacity;

  const userReg = currentUser
    ? event.registrations?.find((r) => r.userId === currentUser.id)
    : null;
  const userWait = currentUser
    ? event.waitlists?.find((w) => w.userId === currentUser.id)
    : null;

  const isRegistered = Boolean(userReg);
  const isWaitlisted = Boolean(userWait);

  const handleRegister = async (chosenPaymentOption = paymentOption) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!selectedPace) {
      setError('Please select a pace group to register');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const endpoint = isFull ? `/api/events/${event.id}/waitlist` : `/api/events/${event.id}/register`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          paceGroup: selectedPace,
          paymentOption: chosenPaymentOption,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process registration');

      setShowPaymentGateway(false);
      onRegisterSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (newStatus) => {
    if (!userReg) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/payment-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: userReg.id, paymentStatus: newStatus }),
      });
      if (res.ok) {
        onRegisterSuccess();
      }
    } catch (e) {
      setError('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!currentUser) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/events/${event.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel');

      onCancelSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#FBF9F5] border-2 border-[#2C3333] shadow-[8px_8px_0px_#2C3333] rounded-lg overflow-hidden relative flex flex-col">
        <div className="bib-pinhole-tl bg-[#EDEAE2]" />
        <div className="bib-pinhole-tr bg-[#EDEAE2]" />

        {/* Modal Header Cover */}
        <div className="relative h-44 sm:h-52 bg-stone-300 border-b-2 border-[#2C3333] shrink-0">
          <img
            src={event.coverImageUrl || 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80'}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-[#FBF9F5] border-2 border-[#2C3333] rounded shadow-[2px_2px_0px_#2C3333] text-[#2C3333] hover:bg-[#EDEAE2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <RaceBibBadge text={event.club?.name || 'RUN CLUB'} variant="teal" size="md" />
            <RaceBibBadge
              text={isPaidEvent ? `FEE: ₹${event.price}` : 'FREE ENTRY'}
              variant={isPaidEvent ? 'orange' : 'stone'}
              size="md"
            />
            {isRegistered && <RaceBibBadge text="REGISTERED" variant="success" size="md" />}
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div>
            <h2 className="font-extrabold text-2xl text-[#2C3333] tracking-tight leading-tight">
              {event.name}
            </h2>
            <p className="text-xs font-mono font-medium text-[#5C6565] mt-1">
              Organized by {event.club?.name}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-500 text-red-800 text-xs font-bold rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date, Time, Location, Fee Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#EDEAE2] border-2 border-[#2C3333] rounded-md font-mono text-xs text-[#2C3333]">
            <div>
              <div className="text-[10px] text-[#5C6565] uppercase">Date</div>
              <div className="font-bold">{event.date}</div>
            </div>

            <div>
              <div className="text-[10px] text-[#5C6565] uppercase">Start Time</div>
              <div className="font-bold">{event.time}</div>
            </div>

            <div className="truncate">
              <div className="text-[10px] text-[#5C6565] uppercase">Location</div>
              <div className="font-bold truncate">{event.location}</div>
            </div>

            <div>
              <div className="text-[10px] text-[#5C6565] uppercase">Entry Price</div>
              <div className="font-bold text-[#E85D2C]">{isPaidEvent ? `₹${event.price}` : 'Free'}</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-mono font-bold text-xs uppercase text-[#2C3333] mb-1">
              About This Run
            </h4>
            <p className="text-sm text-[#2C3333] leading-relaxed bg-white p-3 rounded border border-[#2C3333]">
              {event.description || 'Join us for a great session! High energy, post-run socializing.'}
            </p>
          </div>

          {/* Capacity Progress Bar */}
          <div className="p-4 bg-[#EDEAE2] border-2 border-[#2C3333] rounded-md space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="flex items-center gap-1.5 text-[#2C3333]">
                <Users className="w-4 h-4 text-[#276F6E]" /> Capacity: {registeredCount} / {event.capacity}
              </span>
              {isFull ? (
                <span className="text-[#E85D2C]">FULL ({event.waitlists?.length || 0} on waitlist)</span>
              ) : (
                <span className="text-[#276F6E]">{spotsRemaining} Spots Available</span>
              )}
            </div>

            <div className="w-full bg-white h-3 rounded-full border border-[#2C3333] overflow-hidden">
              <div
                className={`h-full transition-all ${isFull ? 'bg-[#E85D2C]' : 'bg-[#276F6E]'}`}
                style={{ width: `${Math.min(100, (registeredCount / event.capacity) * 100)}%` }}
              />
            </div>
          </div>

          {/* Pace Group Selection */}
          {!isRegistered && !isWaitlisted && (
            <div>
              <label className="block font-mono font-bold text-xs uppercase text-[#2C3333] mb-2">
                Select Your Pace Group *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {event.paceGroupsList?.map((pace) => (
                  <button
                    key={pace}
                    type="button"
                    onClick={() => setSelectedPace(pace)}
                    className={`p-2.5 rounded font-mono text-xs font-bold border-2 transition-all text-center ${
                      selectedPace === pace
                        ? 'bg-[#E85D2C] text-white border-[#2C3333] shadow-[2px_2px_0px_#2C3333]'
                        : 'bg-white text-[#2C3333] border-[#2C3333] hover:bg-[#EDEAE2]'
                    }`}
                  >
                    {pace}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Choice Section */}
          {!isRegistered && !isWaitlisted && !isFull && isPaidEvent && (
            <div className="p-4 bg-orange-50 border-2 border-[#E85D2C] rounded-md space-y-3">
              <div className="flex items-center justify-between border-b border-[#2C3333]/20 pb-2">
                <span className="font-mono font-bold text-xs uppercase text-[#2C3333] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#E85D2C]" /> Event Payment Options (Cover Charge: ₹{event.price})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentOption('PAY_NOW')}
                  className={`p-3 rounded border-2 text-left transition-all ${
                    paymentOption === 'PAY_NOW'
                      ? 'bg-[#276F6E] text-white border-[#2C3333] shadow-[2px_2px_0px_#2C3333]'
                      : 'bg-white text-[#2C3333] border-[#2C3333] hover:bg-[#EDEAE2]'
                  }`}
                >
                  <div className="font-extrabold text-xs flex items-center justify-between">
                    <span>💳 PAY NOW ONLINE</span>
                    {paymentOption === 'PAY_NOW' && <Check className="w-4 h-4" />}
                  </div>
                  <div className="text-[11px] opacity-80 mt-1">Instant UPI / QR / Gateway. Mark as Paid immediately.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('PAY_LATER')}
                  className={`p-3 rounded border-2 text-left transition-all ${
                    paymentOption === 'PAY_LATER'
                      ? 'bg-[#E85D2C] text-white border-[#2C3333] shadow-[2px_2px_0px_#2C3333]'
                      : 'bg-white text-[#2C3333] border-[#2C3333] hover:bg-[#EDEAE2]'
                  }`}
                >
                  <div className="font-extrabold text-xs flex items-center justify-between">
                    <span>⏳ REGISTER NOW, PAY LATER</span>
                    {paymentOption === 'PAY_LATER' && <Check className="w-4 h-4" />}
                  </div>
                  <div className="text-[11px] opacity-80 mt-1">Marked as "Payment Pending". Pay cash/UPI at event door.</div>
                </button>
              </div>
            </div>
          )}

          {/* Payment Gateway Simulation */}
          {showPaymentGateway && (
            <div className="p-4 bg-green-50 border-2 border-green-700 rounded-md text-center space-y-3">
              <h4 className="font-mono font-black text-sm uppercase text-green-900">
                📲 SIMULATED UPI / PAYMENT GATEWAY (₹{event.price})
              </h4>
              <p className="text-xs text-green-800">
                UPI VPA: <strong>pacemate@upi</strong> • Scanning / Gateway simulation
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleRegister('PAY_NOW')}
                  disabled={loading}
                  className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-mono text-xs font-bold rounded border-2 border-[#2C3333]"
                >
                  {loading ? 'Processing...' : `Confirm Payment of ₹${event.price}`}
                </button>
                <button
                  onClick={() => setShowPaymentGateway(false)}
                  className="px-3 py-2 bg-white text-[#2C3333] font-mono text-xs font-bold rounded border border-[#2C3333]"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t-2 border-[#2C3333] space-y-3">
            {isRegistered ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border-2 border-green-700 text-green-900 rounded-md text-xs font-mono font-bold flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-green-700" />
                      Registered for Pace Group: {userReg.paceGroup}
                    </div>
                    {isPaidEvent && (
                      <div className="text-[11px] font-normal mt-0.5">
                        Payment Status:{' '}
                        {userReg.paymentStatus === 'PAID' ? (
                          <strong className="text-green-800">✅ Paid (₹{event.price})</strong>
                        ) : (
                          <strong className="text-orange-700">⏳ Payment Pending (₹{event.price})</strong>
                        )}
                      </div>
                    )}
                  </div>

                  {userReg.paymentStatus === 'PENDING' && (
                    <button
                      onClick={() => handleUpdatePaymentStatus('PAID')}
                      disabled={loading}
                      className="px-3 py-1 bg-[#E85D2C] hover:bg-[#CF4E20] text-white font-mono text-xs font-bold rounded border border-[#2C3333]"
                    >
                      Pay ₹{event.price} Now
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenQRScanner();
                    }}
                    className="py-2.5 bg-[#276F6E] hover:bg-[#1E5756] text-white font-extrabold font-mono text-xs uppercase rounded border-2 border-[#2C3333] shadow-[3px_3px_0px_#2C3333] flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    Event Day Check-In (QR)
                  </button>

                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="py-2.5 bg-[#EDEAE2] hover:bg-[#E4E0D5] text-[#2C3333] font-bold font-mono text-xs uppercase rounded border-2 border-[#2C3333]"
                  >
                    {loading ? 'Cancelling...' : 'Cancel Registration'}
                  </button>
                </div>
              </div>
            ) : isWaitlisted ? (
              <div className="space-y-3">
                <div className="p-3 bg-orange-50 border-2 border-[#E85D2C] text-[#2C3333] rounded-md text-xs font-mono font-bold">
                  ⏳ You are on the Waitlist for this run! You will be automatically notified if a spot opens up.
                </div>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full py-2 bg-[#EDEAE2] hover:bg-[#E4E0D5] text-[#2C3333] font-bold font-mono text-xs uppercase rounded border-2 border-[#2C3333]"
                >
                  {loading ? 'Cancelling...' : 'Leave Waitlist'}
                </button>
              </div>
            ) : !showPaymentGateway ? (
              <button
                onClick={() => {
                  if (isPaidEvent && paymentOption === 'PAY_NOW' && !isFull) {
                    setShowPaymentGateway(true);
                  } else {
                    handleRegister();
                  }
                }}
                disabled={loading}
                className="w-full py-3 bg-[#E85D2C] hover:bg-[#CF4E20] text-white font-black font-mono text-sm uppercase rounded border-2 border-[#2C3333] shadow-[4px_4px_0px_#2C3333] transition-all transform active:translate-y-0.5"
              >
                {loading
                  ? 'Processing...'
                  : isFull
                  ? 'Join Waitlist'
                  : isPaidEvent && paymentOption === 'PAY_NOW'
                  ? `Proceed to Pay ₹${event.price} & Register`
                  : isPaidEvent && paymentOption === 'PAY_LATER'
                  ? `Register Now (Pay ₹${event.price} Later)`
                  : `Confirm Registration (${selectedPace || 'Select Pace'})`}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
