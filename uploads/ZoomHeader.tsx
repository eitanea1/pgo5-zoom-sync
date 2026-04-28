import { Sparkles } from 'lucide-react';

interface ZoomHeaderProps {
  aiAnalyzing?: boolean;
  meetingTime?: string;
}

export function ZoomHeader({ aiAnalyzing = false, meetingTime = '14:28' }: ZoomHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-[#14171D] border-b border-white/5 z-50 relative">
      {/* Left – Logo + Meeting Title */}
      <div className="flex items-center gap-4">
        {/* Zoom Sync Logo */}
        <div className="flex items-center gap-1.5 select-none">
          <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '20px', fontWeight: 800, color: '#2D8CFF', letterSpacing: '-0.5px' }}>zoom</span>
          <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '15px', fontWeight: 600, color: 'white', letterSpacing: '0px' }}>Sync</span>
        </div>

        <div className="w-px h-5 bg-white/15" />

        {/* Meeting Info */}
        <div>
          <div className="text-white text-sm font-semibold leading-tight">Q2 Roadmap Review</div>
          <div className="text-white/50 text-[11px] leading-tight mt-0.5">
            Host: Alex Rivera · You're attending as Maya Chen · {meetingTime}
          </div>
        </div>
      </div>

      {/* Right – AI badge + LIVE */}
      <div className="flex items-center gap-2">
        {aiAnalyzing && (
          <div className="flex items-center gap-1.5 bg-[#2D8CFF]/20 border border-[#2D8CFF]/40 px-2.5 py-1 rounded-md">
            <Sparkles className="w-3.5 h-3.5 text-[#2D8CFF]" />
            <span className="text-[#2D8CFF] text-xs font-medium">AI Analyzing</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 bg-[#17A34A] px-3 py-1 rounded-md">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="text-white text-xs font-semibold tracking-wide">LIVE</span>
        </div>
      </div>
    </div>
  );
}