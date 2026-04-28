import { Calendar, Clock, CheckCircle2, Users, Sparkles, Globe } from 'lucide-react';
import { TimeSlot, Participant } from '../App';

interface CalendarAvailabilityViewProps {
  slots: TimeSlot[];
  participants: Participant[];
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
}

export function CalendarAvailabilityView({
  slots,
  participants,
  selectedSlot,
  onSelectSlot,
}: CalendarAvailabilityViewProps) {
  const getParticipantById = (id: string) => participants.find(p => p.id === id);

  const hasTimezoneConflict = participants.some(
    p => p.timezone && p.timezone !== participants[0]?.timezone
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-white/60 text-xs font-medium uppercase tracking-wider">
          {slots.length} options found
        </span>
        {hasTimezoneConflict && (
          <div className="ml-auto flex items-center gap-1 text-[11px] text-amber-400">
            <Globe className="w-3 h-3" />
            Cross-timezone
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {slots.map((slot) => {
          const date = new Date(slot.dateTime);
          const availableCount = slot.availableParticipants.length;
          const totalCount = participants.length;
          const isAllAvailable = availableCount === totalCount;
          const isSelected = selectedSlot === slot.id;

          return (
            <button
              key={slot.id}
              onClick={() => onSelectSlot(slot.id)}
              className={`w-full text-left rounded-xl p-3.5 transition-all border ${
                isSelected
                  ? 'border-[#2D8CFF] bg-[#2D8CFF]/15'
                  : isAllAvailable
                  ? 'border-[#4ADE80]/30 bg-[#4ADE80]/5 hover:bg-[#4ADE80]/10'
                  : 'border-white/8 bg-white/3 hover:bg-white/6'
              }`}
            >
              <div className="flex items-start justify-between mb-2.5">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-white text-sm font-semibold">
                      {date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Clock className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-sm">
                      {date.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        timeZoneName: 'short',
                      })}
                    </span>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${
                    isAllAvailable
                      ? 'bg-[#4ADE80]/15 text-[#4ADE80]'
                      : 'bg-amber-400/15 text-amber-400'
                  }`}
                >
                  {isAllAvailable ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <Users className="w-3 h-3" />
                  )}
                  {availableCount}/{totalCount} free
                </div>
              </div>

              {/* Participant Faces */}
              <div className="flex gap-3">
                {slot.availableParticipants.length > 0 && (
                  <div>
                    <div className="text-[10px] text-white/30 mb-1">Free</div>
                    <div className="flex -space-x-1.5">
                      {slot.availableParticipants.map((participantId) => {
                        const participant = getParticipantById(participantId);
                        if (!participant) return null;
                        return (
                          <img
                            key={participantId}
                            src={participant.avatar}
                            alt={participant.name}
                            title={participant.name}
                            className="w-7 h-7 rounded-full border-2 border-[#23272f] object-cover ring-1 ring-[#4ADE80]/40"
                            loading="eager"
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {slot.unavailableParticipants.length > 0 && (
                  <div>
                    <div className="text-[10px] text-white/30 mb-1">Busy</div>
                    <div className="flex -space-x-1.5">
                      {slot.unavailableParticipants.map((participantId) => {
                        const participant = getParticipantById(participantId);
                        if (!participant) return null;
                        return (
                          <img
                            key={participantId}
                            src={participant.avatar}
                            alt={participant.name}
                            title={`${participant.name} (Busy)`}
                            className="w-7 h-7 rounded-full border-2 border-[#23272f] object-cover opacity-35 grayscale"
                            loading="eager"
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* AI Analysis Summary */}
      <div className="mt-3 bg-[#2D8CFF]/10 border border-[#2D8CFF]/20 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#2D8CFF] mt-0.5 flex-shrink-0" />
          <div className="text-[11px] text-[#93C5FD] leading-relaxed">
            <strong className="text-[#2D8CFF]">AI Analysis:</strong>{' '}
            Found {slots.filter(s => s.score === 100).length} time
            {slots.filter(s => s.score === 100).length !== 1 ? 's' : ''} when everyone is free.
            Prioritized golden hours for cross-timezone participants.
          </div>
        </div>
      </div>
    </div>
  );
}
