import { useState } from 'react';
import { Calendar, Clock, X, Plus, Mail, Users, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';
import { SchedulingIntent, Participant } from '../App';
import { motion } from 'motion/react';
import { CalendarAvailabilityView } from './CalendarAvailabilityView';
import { CalendarWeekView } from './CalendarWeekView';

interface HostConfigurationWindowProps {
  intent: SchedulingIntent;
  onCreateInvite: (updatedIntent: SchedulingIntent) => void;
  onClose: () => void;
  onUpdateParticipants: (participants: Participant[]) => void;
}

export function HostConfigurationWindow({
  intent,
  onCreateInvite,
  onClose,
  onUpdateParticipants,
}: HostConfigurationWindowProps) {
  const [subject, setSubject] = useState(intent.subject);
  const [dateTime, setDateTime] = useState(intent.suggestedTime);
  const [participants, setParticipants] = useState<Participant[]>(intent.participants);
  const [newEmail, setNewEmail] = useState('');
  const [showAddEmail, setShowAddEmail] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    intent.suggestedSlots?.[0]?.id || null
  );
  const [showCalendarView, setShowCalendarView] = useState(false);

  const handleRemoveParticipant = (id: string) => {
    const updated = participants.filter(p => p.id !== id);
    setParticipants(updated);
    onUpdateParticipants(updated);
  };

  const handleAddParticipant = () => {
    if (newEmail && newEmail.includes('@')) {
      const newParticipant: Participant = {
        id: Date.now().toString(),
        name: newEmail.split('@')[0],
        email: newEmail,
        isInternal: newEmail.includes('@company.com'),
        isOriginalInvitee: false,
        isCurrentAttendee: false,
        rsvpStatus: 'pending',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newEmail.split('@')[0])}&background=2D8CFF&color=fff&size=200`,
      };
      const updated = [...participants, newParticipant];
      setParticipants(updated);
      onUpdateParticipants(updated);
      setNewEmail('');
      setShowAddEmail(false);
    }
  };

  const handleSelectSlot = (slotId: string) => {
    setSelectedSlot(slotId);
    const slot = intent.suggestedSlots?.find(s => s.id === slotId);
    if (slot) setDateTime(slot.dateTime);
  };

  const handleCreateInvite = () => {
    setInviteSent(true);
    setTimeout(() => {
      onCreateInvite({
        ...intent,
        subject,
        suggestedTime: dateTime,
        participants: participants.map(p => ({ ...p, rsvpStatus: 'pending' })),
      });
    }, 1500);
  };

  const internalCount = participants.filter(p => p.isInternal).length;
  const externalCount = participants.filter(p => !p.isInternal).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-[#1E2330] border border-white/10 rounded-2xl shadow-2xl w-[780px] max-h-[88vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2D8CFF]/20 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-[#2D8CFF]" />
            </div>
            <div>
              <h2 className="text-white text-base font-semibold">Configure Follow-up Meeting</h2>
              <p className="text-white/40 text-[11px]">AI-powered scheduling · {participants.length} participants</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Subject */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Meeting Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#23272f] border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2D8CFF]/60 text-sm placeholder-white/30"
            />
          </div>

          {/* AI Calendar Availability */}
          {intent.suggestedSlots && intent.suggestedSlots.length > 0 && (
            <div className="bg-[#23272f] border border-white/8 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#2D8CFF]" />
                <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">AI Suggested Slots</span>
              </div>
              <CalendarAvailabilityView
                slots={intent.suggestedSlots}
                participants={participants}
                selectedSlot={selectedSlot}
                onSelectSlot={handleSelectSlot}
              />

              <button
                onClick={() => setShowCalendarView(!showCalendarView)}
                className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-[#2D8CFF] hover:text-blue-400 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>{showCalendarView ? 'Hide' : 'View'} calendar analysis</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showCalendarView ? 'rotate-180' : ''}`} />
              </button>

              {showCalendarView && (
                <div className="mt-3 pt-3 border-t border-white/8">
                  <CalendarWeekView participants={participants} selectedDate={dateTime} />
                </div>
              )}
            </div>
          )}

          {/* Manual Override */}
          <details className="group">
            <summary className="cursor-pointer text-white/50 text-sm hover:text-white/80 flex items-center gap-2 transition-colors">
              <span>Manually adjust date/time</span>
              <span className="text-white/30 text-xs">(optional)</span>
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="date"
                    value={dateTime.split('T')[0]}
                    onChange={(e) => setDateTime(`${e.target.value}T${dateTime.split('T')[1]}`)}
                    className="w-full bg-[#23272f] border border-white/10 text-white pl-10 pr-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2D8CFF]/60 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="time"
                    value={dateTime.split('T')[1]?.substring(0, 5) || '14:00'}
                    onChange={(e) => setDateTime(`${dateTime.split('T')[0]}T${e.target.value}:00`)}
                    className="w-full bg-[#23272f] border border-white/10 text-white pl-10 pr-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2D8CFF]/60 text-sm"
                  />
                </div>
              </div>
            </div>
          </details>

          {/* Participants – Golden List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Participants
              </label>
              <div className="flex items-center gap-3 text-[11px] text-white/40">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {internalCount} internal
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {externalCount} external
                </span>
              </div>
            </div>

            <div className="bg-[#23272f] border border-white/8 rounded-xl divide-y divide-white/5 max-h-52 overflow-y-auto">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="px-3.5 py-2.5 flex items-center justify-between hover:bg-white/4 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-shrink-0">
                      <img
                        src={participant.avatar}
                        alt={participant.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                        loading="eager"
                      />
                      {!participant.isInternal && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-[#23272f]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{participant.name}</div>
                      <div className="text-white/40 text-[11px] flex items-center gap-2">
                        {participant.email}
                        {!participant.isInternal && (
                          <span className="bg-orange-500/15 text-orange-400 px-1.5 py-0.5 rounded text-[10px]">
                            External
                          </span>
                        )}
                        {participant.isCurrentAttendee && (
                          <span className="text-[#4ADE80] text-[10px]">• In call</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveParticipant(participant.id)}
                    className="text-white/30 hover:text-red-400 transition-colors p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Participant */}
            {showAddEmail ? (
              <div className="mt-2 flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="flex-1 bg-[#23272f] border border-white/10 text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8CFF]/60 placeholder-white/30"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddParticipant()}
                />
                <button
                  onClick={handleAddParticipant}
                  className="px-3 py-2 bg-[#2D8CFF] text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowAddEmail(false); setNewEmail(''); }}
                  className="px-3 py-2 bg-white/8 text-white/60 rounded-xl text-sm hover:bg-white/12 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddEmail(true)}
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-dashed border-white/15 rounded-xl text-sm text-white/40 hover:border-[#2D8CFF]/50 hover:text-[#2D8CFF] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add participant
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#23272f] border-t border-white/8 px-6 py-4 flex items-center justify-between">
          <div className="text-white/40 text-xs">
            {participants.length} participant{participants.length !== 1 ? 's' : ''} will be notified
          </div>
          <button
            onClick={handleCreateInvite}
            disabled={inviteSent}
            className="bg-[#2D8CFF] hover:bg-blue-500 disabled:bg-[#2D8CFF]/50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {inviteSent ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Sending...
              </>
            ) : (
              'Create Invite'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
