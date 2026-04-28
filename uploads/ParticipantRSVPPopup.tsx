import { Calendar, Clock, Users, CheckCircle2, XCircle, X } from 'lucide-react';
import { SchedulingIntent } from '../App';
import { motion } from 'motion/react';
import { useState } from 'react';

interface ParticipantRSVPPopupProps {
  intent: SchedulingIntent;
  onRSVP: (status: 'confirmed' | 'declined') => void;
  onClose: () => void;
}

export function ParticipantRSVPPopup({ intent, onRSVP, onClose }: ParticipantRSVPPopupProps) {
  const [responding, setResponding] = useState(false);
  const meetingDate = new Date(intent.suggestedTime);

  const handleRSVP = (status: 'confirmed' | 'declined') => {
    setResponding(true);
    setTimeout(() => {
      onRSVP(status);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#1E2330] border border-white/10 rounded-2xl shadow-2xl w-[420px] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2D8CFF]/20 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-[#2D8CFF]" />
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold">Meeting Invitation</h3>
              <p className="text-white/40 text-[11px]">You've been invited to a follow-up</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {/* Meeting Details */}
          <div className="bg-[#23272f] border border-white/8 rounded-xl p-4 space-y-3 mb-4">
            <div className="text-white text-sm font-semibold">{intent.subject}</div>

            <div className="flex items-center gap-2.5 text-sm text-white/60">
              <Calendar className="w-4 h-4 text-white/30" />
              <span>
                {meetingDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-sm text-white/60">
              <Clock className="w-4 h-4 text-white/30" />
              <span>
                {meetingDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short',
                })}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-sm text-white/60">
              <Users className="w-4 h-4 text-white/30" />
              <span>{intent.participants.length} participants</span>
            </div>
          </div>

          {/* Attendees Preview */}
          <div className="mb-4">
            <div className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-2">Attendees</div>
            <div className="flex -space-x-2">
              {intent.participants.slice(0, 6).map((participant) => (
                <div key={participant.id} title={participant.name}>
                  <img
                    src={participant.avatar}
                    alt={participant.name}
                    className="w-9 h-9 rounded-full border-2 border-[#1E2330] object-cover"
                    loading="eager"
                  />
                </div>
              ))}
              {intent.participants.length > 6 && (
                <div className="w-9 h-9 rounded-full bg-[#2D8CFF]/30 border-2 border-[#1E2330] flex items-center justify-center">
                  <span className="text-[#2D8CFF] text-xs font-bold">+{intent.participants.length - 6}</span>
                </div>
              )}
            </div>
          </div>

          {/* RSVP Actions */}
          <div className="space-y-2">
            <button
              onClick={() => handleRSVP('confirmed')}
              disabled={responding}
              className="w-full bg-[#2D8CFF] hover:bg-blue-500 disabled:bg-[#2D8CFF]/50 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {responding ? 'Confirming...' : 'Accept & Add to Calendar'}
            </button>
            <button
              onClick={() => handleRSVP('declined')}
              disabled={responding}
              className="w-full bg-white/6 hover:bg-white/10 border border-white/10 text-white/70 px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Decline
            </button>
          </div>

          <div className="mt-3 text-[11px] text-white/30 text-center">
            You can also respond via email
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
