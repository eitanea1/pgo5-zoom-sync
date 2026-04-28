import { CheckCircle2, XCircle, Clock, X, Mail } from 'lucide-react';
import { Participant } from '../App';
import { motion } from 'motion/react';

interface RSVPStatusTrackerProps {
  participants: Participant[];
  onClose: () => void;
}

export function RSVPStatusTracker({ participants, onClose }: RSVPStatusTrackerProps) {
  const confirmed = participants.filter(p => p.rsvpStatus === 'confirmed').length;
  const declined = participants.filter(p => p.rsvpStatus === 'declined').length;
  const pending = participants.filter(p => p.rsvpStatus === 'pending').length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-16 right-[308px] z-40"
    >
      <div className="bg-[#1E2330] border border-white/10 rounded-2xl shadow-2xl w-80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
          <div>
            <h3 className="text-white text-sm font-semibold">RSVP Status</h3>
            <p className="text-white/40 text-[11px]">Invite sent · tracking responses</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-[#16a34a]/15 border border-[#16a34a]/25 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-[#4ADE80]">{confirmed}</div>
              <div className="text-[11px] text-[#4ADE80]/70">Confirmed</div>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-white/70">{pending}</div>
              <div className="text-[11px] text-white/40">Pending</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-red-400">{declined}</div>
              <div className="text-[11px] text-red-400/70">Declined</div>
            </div>
          </div>

          {/* Participant List */}
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/4 hover:bg-white/6 transition-colors"
              >
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="relative">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-9 h-9 rounded-full object-cover border border-white/10"
                      loading="eager"
                    />
                    {!participant.isInternal && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-[#1E2330]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-xs font-medium">{participant.name}</div>
                    <div className="text-white/40 text-[10px] flex items-center gap-1">
                      {!participant.isInternal && <Mail className="w-2.5 h-2.5" />}
                      {participant.isInternal ? 'Internal' : 'External'}
                    </div>
                  </div>
                </div>
                <div>
                  {participant.rsvpStatus === 'confirmed' && (
                    <CheckCircle2 className="w-5 h-5 text-[#4ADE80]" />
                  )}
                  {participant.rsvpStatus === 'declined' && (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  {(participant.rsvpStatus === 'pending' || !participant.rsvpStatus) && (
                    <Clock className="w-5 h-5 text-white/30 animate-spin" style={{ animationDuration: '3s' }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}