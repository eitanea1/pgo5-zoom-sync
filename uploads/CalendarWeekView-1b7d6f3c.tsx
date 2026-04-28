import { Participant } from '../App';

interface CalendarWeekViewProps {
  participants: Participant[];
  selectedDate?: string;
}

export function CalendarWeekView({ participants, selectedDate }: CalendarWeekViewProps) {
  const today = new Date(selectedDate || '2026-04-30');
  const weekDays = [];

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    weekDays.push(date);
  }

  const timeSlots = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const mockBusyTimes: Record<string, { day: number; hour: number; duration: number }[]> = {
    [participants[0]?.id]: [
      { day: 0, hour: 9, duration: 1 },
      { day: 0, hour: 13, duration: 2 },
      { day: 1, hour: 10, duration: 1.5 },
    ],
    [participants[1]?.id]: [
      { day: 0, hour: 10, duration: 2 },
      { day: 1, hour: 14, duration: 1 },
      { day: 2, hour: 9, duration: 1 },
    ],
    [participants[2]?.id]: [
      { day: 0, hour: 14, duration: 1 },
      { day: 1, hour: 11, duration: 2 },
      { day: 2, hour: 15, duration: 1.5 },
    ],
    [participants[3]?.id]: [
      { day: 0, hour: 11, duration: 1 },
      { day: 1, hour: 9, duration: 2 },
      { day: 2, hour: 13, duration: 1 },
    ],
    [participants[4]?.id]: [
      { day: 0, hour: 15, duration: 1 },
      { day: 1, hour: 13, duration: 1 },
    ],
    [participants[5]?.id]: [
      { day: 0, hour: 10, duration: 1 },
      { day: 2, hour: 14, duration: 2 },
    ],
  };

  const isBusy = (participantId: string, dayIndex: number, hour: number) => {
    const busyTimes = mockBusyTimes[participantId] || [];
    return busyTimes.some(b => b.day === dayIndex && hour >= b.hour && hour < b.hour + b.duration);
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        {/* Header */}
        <div className="grid grid-cols-6 gap-1 mb-2">
          <div />
          {weekDays.map((date, i) => (
            <div key={i} className="text-center">
              <div className="text-[11px] font-medium text-white/70">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-[10px] text-white/30">
                {date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>

        {/* Participant rows */}
        <div className="space-y-1.5">
          {participants.slice(0, 6).map((participant) => (
            <div key={participant.id} className="grid grid-cols-6 gap-1 items-center">
              <div className="flex items-center gap-1.5">
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-6 h-6 rounded-full object-cover border border-white/10"
                  loading="eager"
                />
                <span className="text-[11px] text-white/60 truncate">
                  {participant.name.split(' ')[0]}
                </span>
              </div>
              {weekDays.map((_, dayIndex) => (
                <div key={dayIndex} className="h-7 bg-white/5 rounded overflow-hidden">
                  <div className="flex h-full">
                    {timeSlots.map((time, hourIndex) => {
                      const hour = 9 + hourIndex;
                      const busy = isBusy(participant.id, dayIndex, hour);
                      return (
                        <div
                          key={hourIndex}
                          className={`flex-1 border-r border-white/5 ${
                            busy ? 'bg-red-400/40' : 'bg-[#4ADE80]/20'
                          }`}
                          title={`${time} - ${busy ? 'Busy' : 'Free'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-4 text-[11px] text-white/40">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#4ADE80]/30 rounded" />
            <span>Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-400/40 rounded" />
            <span>Busy</span>
          </div>
          <div className="ml-auto">9 AM – 5 PM</div>
        </div>
      </div>
    </div>
  );
}
