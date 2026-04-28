import { Mic, Video, Shield, Users, MessageSquare, MonitorUp, Circle, SmilePlus, LayoutGrid, MoreHorizontal, CalendarClock } from 'lucide-react';

interface MeetingToolbarProps {
  hasSchedulingIntent: boolean;
  onRecallScheduling: () => void;
}

function ToolbarButton({
  icon,
  label,
  active,
  badge,
  onClick,
  danger,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all select-none
        ${active ? 'bg-[#2D8CFF]/20 text-[#2D8CFF]' : 'text-white/80 hover:bg-white/8 hover:text-white'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#2D8CFF] rounded-full flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">{badge}</span>
          </div>
        )}
      </div>
      <span className="text-[10px] font-medium leading-none whitespace-nowrap">{label}</span>
    </button>
  );
}

export function MeetingToolbar({ hasSchedulingIntent, onRecallScheduling }: MeetingToolbarProps) {
  return (
    <div className="bg-[#14171D] border-t border-white/8 px-4 py-1.5 flex items-center justify-between">
      {/* Left controls */}
      <div className="flex items-center">
        <ToolbarButton icon={<Mic className="w-5 h-5" />} label="Mute" />
        <ToolbarButton icon={<Video className="w-5 h-5" />} label="Stop Video" />
      </div>

      {/* Center controls */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={<Shield className="w-5 h-5" />} label="Security" />
        <ToolbarButton icon={<Users className="w-5 h-5" />} label="Participants" />
        <ToolbarButton icon={<MessageSquare className="w-5 h-5" />} label="Chat" />
        <ToolbarButton icon={<MonitorUp className="w-5 h-5" />} label="Share" />
        <ToolbarButton icon={<Circle className="w-5 h-5" />} label="Record" />
        <ToolbarButton icon={<SmilePlus className="w-5 h-5" />} label="Reactions" />

        {/* AI Scheduling / Sync Tasks */}
        <button
          onClick={onRecallScheduling}
          className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all select-none
            ${hasSchedulingIntent
              ? 'bg-[#2D8CFF]/20 text-[#2D8CFF] hover:bg-[#2D8CFF]/30'
              : 'text-white/80 hover:bg-white/8 hover:text-white'
            }
          `}
        >
          <div className="relative">
            <CalendarClock className="w-5 h-5" />
            {hasSchedulingIntent && (
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#2D8CFF] rounded-full flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">6</span>
              </div>
            )}
          </div>
          <span className="text-[10px] font-medium leading-none whitespace-nowrap">Sync tasks</span>
        </button>

        <ToolbarButton icon={<LayoutGrid className="w-5 h-5" />} label="Attendee view" />
        <ToolbarButton icon={<MoreHorizontal className="w-5 h-5" />} label="More" />
      </div>

      {/* Right – End button */}
      <div className="flex items-center">
        <button className="bg-[#E53E3E] hover:bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
          End
        </button>
      </div>
    </div>
  );
}
