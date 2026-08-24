import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, MapPin, Users, Image as ImageIcon, Plus, Trash2, IndianRupee, Upload } from 'lucide-react';
import { RaceBibBadge } from './RaceBibBadge';

const SAMPLE_COVERS = [
  'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80',
];

export function CreateEventModal({ isOpen, onClose, currentUser, onEventCreated, initialEvent = null }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('20');
  const [price, setPrice] = useState('0');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState(SAMPLE_COVERS[0]);
  const [isCustomUploaded, setIsCustomUploaded] = useState(false);

  // Pace Groups Builder
  const [paceGroups, setPaceGroups] = useState(['5:00 min/km', '5:30 min/km', '6:00 min/km', 'Party Pace (6:30+)']);
  const [newPaceInput, setNewPaceInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialEvent) {
      setName(initialEvent.name || '');
      setDate(initialEvent.date || '');
      setTime(initialEvent.time || '');
      setLocation(initialEvent.location || '');
      setCapacity(initialEvent.capacity?.toString() || '20');
      setPrice(initialEvent.price?.toString() || '0');
      setDescription(initialEvent.description || '');
      setCoverImageUrl(initialEvent.coverImageUrl || SAMPLE_COVERS[0]);
      setIsCustomUploaded(initialEvent.coverImageUrl && !SAMPLE_COVERS.includes(initialEvent.coverImageUrl));
      if (initialEvent.paceGroupsList) setPaceGroups(initialEvent.paceGroupsList);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);
      setDate(tomorrow.toISOString().split('T')[0]);
      setTime('07:00 AM');
      setPrice('0');
      setIsCustomUploaded(false);
    }
  }, [initialEvent, isOpen]);

  if (!isOpen) return null;

  const club = currentUser?.ownedClub || currentUser?.club;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Convert file to base64 DataURL for zero-config persistence & thumbnail preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCoverImageUrl(event.target.result.toString());
        setIsCustomUploaded(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPaceGroup = () => {
    if (newPaceInput.trim() && !paceGroups.includes(newPaceInput.trim())) {
      setPaceGroups([...paceGroups, newPaceInput.trim()]);
      setNewPaceInput('');
    }
  };

  const handleRemovePaceGroup = (paceToRemove) => {
    setPaceGroups(paceGroups.filter((p) => p !== paceToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!club?.id) {
      setError('No club associated with this organizer account');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        clubId: club.id,
        name,
        date,
        time,
        location,
        capacity: parseInt(capacity, 10),
        price: parseFloat(price) || 0,
        paceGroups: paceGroups.join(', '),
        description,
        coverImageUrl,
        createdBy: currentUser.id,
      };

      const url = initialEvent ? `/api/events/${initialEvent.id}` : '/api/events';
      const method = initialEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save event');

      onEventCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl max-h-[90vh] bg-[#FBF9F5] border-2 border-[#2C3333] shadow-[8px_8px_0px_#2C3333] rounded-lg overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-150">
        <div className="bib-pinhole-tl bg-[#EDEAE2]" />
        <div className="bib-pinhole-tr bg-[#EDEAE2]" />

        {/* Fixed Modal Header */}
        <div className="p-4 bg-[#EDEAE2] border-b-2 border-[#2C3333] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-black text-xl text-[#2C3333] tracking-tight">
              {initialEvent ? 'EDIT RUN EVENT' : 'CREATE NEW RUN EVENT'}
            </h3>
            <p className="text-xs font-mono font-medium text-[#5C6565]">
              Club: {club?.name || 'My Club'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#E4E0D5] text-[#2C3333] border border-[#2C3333]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-500 text-red-800 text-xs font-bold rounded">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Central Park 5K Sunrise & Coffee"
              className="w-full px-3 py-2 bg-white border-2 border-[#2C3333] rounded text-sm font-medium focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#2C3333] rounded font-mono text-sm font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-1">
                Start Time *
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 07:30 AM"
                className="w-full px-3 py-2 bg-white border-2 border-[#2C3333] rounded text-sm font-medium focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-1">
              Meeting Location / Address *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-[#5C6565]" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Engineers Gate (90th St & 5th Ave), NYC"
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#2C3333] rounded text-sm font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-1">
                Max Capacity (Runner Limit) *
              </label>
              <input
                type="number"
                min="1"
                max="500"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#2C3333] rounded font-mono text-sm font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-1">
                Entry Fee (₹ - 0 for Free)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-mono text-sm font-bold text-[#5C6565]">₹</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 bg-white border-2 border-[#2C3333] rounded font-mono text-sm font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Pace Groups Builder */}
          <div className="p-3 bg-[#EDEAE2] border-2 border-[#2C3333] rounded space-y-2">
            <label className="block text-xs font-mono font-bold uppercase text-[#2C3333]">
              Pace Groups (Chips)
            </label>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {paceGroups.map((p) => (
                <span
                  key={p}
                  className="px-2 py-1 bg-white border-2 border-[#2C3333] rounded font-mono text-xs font-bold text-[#2C3333] flex items-center gap-1"
                >
                  {p}
                  <button
                    type="button"
                    onClick={() => handleRemovePaceGroup(p)}
                    className="text-[#E85D2C] hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newPaceInput}
                onChange={(e) => setNewPaceInput(e.target.value)}
                placeholder="Add custom pace (e.g. 4:30 min/km)"
                className="flex-1 px-3 py-1.5 bg-white border-2 border-[#2C3333] rounded text-xs font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddPaceGroup}
                className="px-3 py-1.5 bg-[#276F6E] text-white font-mono text-xs font-bold rounded border-2 border-[#2C3333]"
              >
                + Add Pace
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#2C3333] mb-1">
              Description / Route Info
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details on distance, cover charges, regroup points, coffee stop..."
              className="w-full p-2.5 bg-white border-2 border-[#2C3333] rounded text-xs font-medium focus:outline-none"
            />
          </div>

          {/* Event Cover Photo: Upload from Device + Presets */}
          <div className="p-3 bg-[#EDEAE2] border-2 border-[#2C3333] rounded space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold uppercase text-[#2C3333]">
                Event Cover Image
              </label>
              {isCustomUploaded && (
                <RaceBibBadge text="CUSTOM UPLOAD" variant="orange" size="sm" />
              )}
            </div>

            {/* Live Thumbnail Preview */}
            <div className="relative h-32 rounded border-2 border-[#2C3333] overflow-hidden bg-stone-200">
              <img src={coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-[#276F6E] hover:bg-[#1E5756] text-white font-mono text-xs font-bold rounded border border-[#2C3333] flex items-center gap-1.5 shadow-[2px_2px_0px_#2C3333]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Custom Photo
                </button>
              </div>
            </div>

            {/* Hidden Real Device File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-[#5C6565] mb-1">
                Or Pick From Presets:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_COVERS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCoverImageUrl(url);
                      setIsCustomUploaded(false);
                    }}
                    className={`h-14 rounded border-2 overflow-hidden transition-all ${
                      coverImageUrl === url && !isCustomUploaded
                        ? 'border-[#E85D2C] ring-2 ring-[#E85D2C]'
                        : 'border-[#2C3333] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#E85D2C] hover:bg-[#CF4E20] text-white font-black font-mono text-sm uppercase rounded border-2 border-[#2C3333] shadow-[3px_3px_0px_#2C3333] transition-all transform active:translate-y-0.5 mt-2"
          >
            {loading ? 'Saving...' : initialEvent ? 'Update Event Details' : 'Publish Run Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
