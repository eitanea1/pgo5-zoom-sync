import { Calendar, X, Sparkles, Clock } from 'lucide-react';
import { SchedulingIntent } from '../App';
import { motion } from 'motion/react';

interface IntentDetectionPromptProps {
  intent: SchedulingIntent;
  onConfigure: () => void;
  onDismiss: () => void;
}

export function IntentDetectionPrompt({ intent, onConfigure, onDismiss }: IntentDetectionPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="absolute bottom-20 left-1/2 -translate-x-[calc(50%+150px)] z-40"
    >
      <div className="bg-[#1E2330] border border-[#2D8CFF]/30 rounded-2xl shadow-2xl w-[420px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2D8CFF]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#2D8CFF]" />
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Schedule a follow-up?</div>
              <div className="text-white/40 text-[11px]">AI detected scheduling intent</div>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Detected phrase */}
        <div className="px-4 py-3">
          <div className="bg-[#2D8CFF]/10 border border-[#2D8CFF]/20 rounded-lg px-3 py-2 mb-3">
            <div className="text-[10px] text-[#2D8CFF]/70 uppercase tracking-wider mb-0.5">Detected phrase</div>
            <p className="text-white/80 text-xs italic">"{intent.detectedPhrase}"</p>
          </div>

          {/* Meeting preview */}
          <div className="bg-[#23272f] rounded-xl p-3 mb-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white text-xs font-medium">{intent.subject}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white/70 text-xs">
                {new Date(intent.suggestedTime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex -space-x-1.5">
                {intent.participants.slice(0, 5).map((p) => (
                  <img
                    key={p.id}
                    src={p.avatar}
                    alt={p.name}
                    className="w-7 h-7 rounded-full border-2 border-[#23272f] object-cover"
                    title={p.name}
                  />
                ))}
                {intent.participants.length > 5 && (
                  <div className="w-7 h-7 rounded-full bg-[#2D8CFF]/30 border-2 border-[#23272f] flex items-center justify-center">
                    <span className="text-[#2D8CFF] text-[9px] font-bold">+{intent.participants.length - 5}</span>
                  </div>
                )}
              </div>
              <span className="text-white/40 text-[11px]">{intent.participants.length} participants</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onConfigure}
              className="flex-1 bg-[#2D8CFF] hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Configure &amp; Send Invite
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2.5 bg-white/8 hover:bg-white/12 text-white/70 rounded-xl text-sm transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
