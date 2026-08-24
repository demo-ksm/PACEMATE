import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, Camera, CheckCircle, AlertTriangle, Key } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { RaceBibBadge } from './RaceBibBadge';

export function QRScannerModal({ isOpen, onClose, currentUser, events = [], onCheckInSuccess }) {
  const [selectedEventId, setSelectedEventId] = useState(
    events.length > 0 ? events[0].id : ''
  );
  const [pinCode, setPinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let scanner = null;
    const scannerContainer = document.getElementById('qr-reader-container');

    if (scannerContainer) {
      scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        { fps: 10, qrbox: { width: 220, height: 220 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          handleVerifyCheckIn({ qrCodeValue: decodedText });
          if (scanner) scanner.clear();
        },
        (error) => {
          // ignore scan errors until valid code found
        }
      );
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isOpen, selectedEventId]);

  if (!isOpen) return null;

  const handleVerifyCheckIn = async ({ qrCodeValue = null, manualPin = null }) => {
    if (!selectedEventId) {
      setError('Please select the event you are checking into');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to check in');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/events/${selectedEventId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          qrCodeValue,
          pinCode: manualPin || pinCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check-in failed');

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E85D2C', '#276F6E', '#FBF9F5', '#2E7D32'],
      });

      setSuccessMsg('CHECKED IN SUCCESSFULLY! 🎉');
      setTimeout(() => {
        onCheckInSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md max-h-[90vh] bg-[#FBF9F5] border-2 border-[#2C3333] shadow-[8px_8px_0px_#2C3333] rounded-lg overflow-hidden relative flex flex-col">
        <div className="bib-pinhole-tl bg-[#EDEAE2]" />
        <div className="bib-pinhole-tr bg-[#EDEAE2]" />

        {/* Modal Header */}
        <div className="p-4 bg-[#EDEAE2] border-b-2 border-[#2C3333] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#276F6E] text-white rounded border border-[#2C3333] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#2C3333] tracking-tight">EVENT CHECK-IN</h3>
              <p className="text-[10px] font-mono text-[#5C6565]">Scan venue QR code or enter 6-digit PIN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#E4E0D5] text-[#2C3333] border border-[#2C3333]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {successMsg ? (
            <div className="p-6 bg-green-50 border-2 border-green-700 text-green-900 rounded-md text-center space-y-3">
              <CheckCircle className="w-12 h-12 mx-auto text-green-700 animate-bounce" />
              <h3 className="font-black text-xl font-mono">{successMsg}</h3>
              <p className="text-xs font-mono">You are officially marked present for this run!</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-100 border-2 border-red-500 text-red-800 text-xs font-bold rounded flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Event Selector */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-1">
                  Select Event To Check Into *
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full p-2 bg-white border-2 border-[#2C3333] rounded font-mono text-xs font-bold"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Camera Scanner Container */}
              <div className="border-2 border-[#2C3333] rounded p-2 bg-stone-100 min-h-[240px]">
                <div id="qr-reader-container" className="w-full" />
              </div>

              <div className="flex items-center gap-2 my-2">
                <div className="h-0.5 bg-[#2C3333] flex-1 opacity-20" />
                <span className="text-[10px] font-mono font-bold uppercase text-[#5C6565]">
                  OR ENTER BACKUP PIN CODE
                </span>
                <div className="h-0.5 bg-[#2C3333] flex-1 opacity-20" />
              </div>

              {/* Manual 6-Digit PIN Backup */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyCheckIn({ manualPin: pinCode });
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Key className="w-4 h-4 absolute left-3 top-3 text-[#5C6565]" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="Enter 6-digit venue code (e.g. 582914)"
                    className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#2C3333] rounded font-mono font-extrabold text-sm tracking-widest text-center"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !pinCode}
                  className="px-4 py-2 bg-[#E85D2C] hover:bg-[#CF4E20] text-white font-mono font-bold text-xs uppercase rounded border-2 border-[#2C3333] shadow-[2px_2px_0px_#2C3333] disabled:opacity-50"
                >
                  Check In
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
