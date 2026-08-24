import React from 'react';
import { X, QrCode, Monitor, Share2, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { RaceBibBadge } from './RaceBibBadge';

export function VenueQRModal({ event, isOpen, onClose }) {
  if (!isOpen || !event) return null;

  const qrValue = `PACEMATE:EVENT:${event.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] bg-[#FBF9F5] border-4 border-[#2C3333] shadow-[12px_12px_0px_#2C3333] rounded-xl overflow-hidden relative flex flex-col text-center">
        <div className="bib-pinhole-tl bg-[#EDEAE2]" />
        <div className="bib-pinhole-tr bg-[#EDEAE2]" />

        {/* Venue Mode Top Bar */}
        <div className="p-4 bg-[#276F6E] text-white border-b-4 border-[#2C3333] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-left">
            <Monitor className="w-5 h-5 text-[#E85D2C]" />
            <div>
              <h3 className="font-extrabold text-sm font-mono tracking-tight">VENUE CHECK-IN DISPLAY</h3>
              <p className="text-[10px] opacity-80 font-mono">Display at run meeting point</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#FBF9F5] text-[#2C3333] hover:bg-[#EDEAE2] border-2 border-[#2C3333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Main Display Body */}
        <div className="p-6 space-y-5 bg-[#FBF9F5] overflow-y-auto flex-1">
          <div className="space-y-1">
            <RaceBibBadge text={event.club?.name || 'RUN CLUB'} variant="orange" size="md" />
            <h2 className="font-black text-2xl text-[#2C3333] tracking-tight">{event.name}</h2>
            <p className="text-xs font-mono text-[#5C6565]">
              {event.date} at {event.time} • {event.location}
            </p>
          </div>

          {/* Large High-Res QR Code */}
          <div className="bg-white p-6 rounded-lg border-4 border-[#2C3333] shadow-[4px_4px_0px_#2C3333] inline-block mx-auto">
            <QRCodeSVG
              value={qrValue}
              size={220}
              level="H"
              includeMargin={true}
            />
          </div>

          <p className="text-xs font-mono font-bold text-[#276F6E] uppercase">
            📱 Point your camera or Pacemate App scanner at this QR code
          </p>

          {/* Huge 6-Digit Backup PIN Code Box */}
          <div className="p-4 bg-[#EDEAE2] border-2 border-[#2C3333] rounded-md space-y-1">
            <div className="text-[11px] font-mono font-bold text-[#5C6565] uppercase">
              Manual 6-Digit Backup Check-In Code
            </div>
            <div className="font-mono text-3xl font-black tracking-widest text-[#E85D2C]">
              {event.checkInCode || '582914'}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 text-xs font-mono">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white hover:bg-[#EDEAE2] text-[#2C3333] border-2 border-[#2C3333] rounded flex items-center gap-1.5 font-bold"
            >
              <Printer className="w-4 h-4" /> Print Check-In Poster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
