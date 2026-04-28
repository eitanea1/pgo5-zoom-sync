import { Mic, MicOff, X, Calendar, Sparkles, CheckCircle } from 'lucide-react';

interface VideoCallInterfaceProps {
  transcript: string;
  schedulingDetected: boolean;
  onShowScheduling?: () => void;
}

const PARTICIPANTS = [
  {
    id: 'alex',
    name: 'Alex Rivera',
    isSelf: false,
    isHost: true,
    isSpeaking: false,
    isMuted: false,
    avatar: 'https://images.unsplash.com/photo-1738566061505-556830f8b8f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=90&w=800',
  },
  {
    id: 'maya',
    name: 'Maya Chen (you)',
    isSelf: true,
    isHost: false,
    isSpeaking: true,
    isMuted: false,
    avatar: 'https://images.unsplash.com/photo-1712744626457-3ffa4ba32c8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=90&w=800',
  },
  {
    id: 'jordan',
    name: 'Jordan Park',
    isSelf: false,
    isHost: false,
    isSpeaking: false,
    isMuted: false,
    avatar: 'https://images.unsplash.com/photo-1765776830139-72b2184dae5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=90&w=800',
  },
  {
    id: 'priya',
    name: 'Priya Shah',
    isSelf: false,
    isHost: false,
    isSpeaking: false,
    isMuted: true,
    avatar: 'https://images.unsplash.com/photo-1674660418347-b40d4ca37830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=90&w=800',
  },
  {
    id: 'sam',
    name: 'Sam Okafor',
    isSelf: false,
    isHost: false,
    isSpeaking: false,
    isMuted: false,
    avatar: 'https://images.unsplash.com/photo-1633944931899-5e2144bd9482?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=90&w=800',
  },
  {
    id: 'lin',
    name: 'Lin Tanaka',
    isSelf: false,
    isHost: false,
    isSpeaking: false,
    isMuted: false,
    avatar: 'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=90&w=800',
  },
];

const TRANSCRIPT_MESSAGES = [
  { speaker: 'Alex Rivera', avatar: PARTICIPANTS[0].avatar, text: "Alright everyone, let's get started on the Q2 review.", time: '14:22' },
  { speaker: 'Maya Chen', avatar: PARTICIPANTS[1].avatar, text: "Sure, I've prepared the roadmap slides.", time: '14:23', isSelf: true },
  { speaker: 'Jordan Park', avatar: PARTICIPANTS[2].avatar, text: "The metrics from last sprint look promising.", time: '14:24' },
  { speaker: 'Priya Shah', avatar: PARTICIPANTS[3].avatar, text: "Agreed. Should we schedule a follow-up to dive deeper?", time: '14:25' },
  { speaker: 'Alex Rivera', avatar: PARTICIPANTS[0].avatar, text: "Let's schedule a follow-up meeting next week to discuss the Q2 roadmap in more detail.", time: '14:26' },
  { speaker: 'Sam Okafor', avatar: PARTICIPANTS[4].avatar, text: "Works for me. I'm free most of next week.", time: '14:27' },
];

export function VideoCallInterface({ transcript, schedulingDetected, onShowScheduling }: VideoCallInterfaceProps) {
  return (
    <div className="flex flex-1 overflow-hidden bg-[#1a1d24]">
      {/* Main Video Grid Area */}
      <div className="flex-1 flex flex-col p-3 gap-2 min-w-0">
        {/* Speaking Indicator */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex items-center gap-2">
            <img
              src={PARTICIPANTS[1].avatar}
              alt="Maya Chen"
              className="w-6 h-6 rounded-full object-cover border border-white/20"
            />
            <span className="text-white text-sm">
              <span className="font-medium">Maya Chen</span>
              <span className="text-white/60"> is speaking</span>
            </span>
          </div>
          {/* Audio bars */}
          <div className="flex items-end gap-0.5 h-4">
            {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
              <div
                key={i}
                className="w-0.5 bg-[#4CAF50] rounded-full animate-pulse"
                style={{
                  height: `${h * 2}px`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        </div>

        {/* 3×2 Video Grid */}
        <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2 min-h-0">
          {PARTICIPANTS.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-lg overflow-hidden bg-[#2a2d35] ${
                p.isSpeaking ? 'ring-2 ring-[#4CAF50]' : ''
              }`}
            >
              {/* Video feed */}
              <img
                src={p.avatar}
                alt={p.name}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

              {/* Speaking overlay border */}
              {p.isSpeaking && (
                <div className="absolute inset-0 rounded-lg ring-2 ring-inset ring-[#4CAF50]" />
              )}

              {/* Bottom bar: name + mic */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2.5 pb-2">
                <div className="flex items-center gap-1.5">
                  {p.isSelf && (
                    <div className="w-1.5 h-1.5 bg-[#4CAF50] rounded-full" />
                  )}
                  <span className="text-white text-xs font-medium drop-shadow-md">{p.name}</span>
                  {p.isHost && (
                    <span className="text-white/60 text-[10px]">(Host)</span>
                  )}
                </div>
                <div className={`p-1 rounded-full ${p.isMuted ? 'bg-red-500' : 'bg-black/50'}`}>
                  {p.isMuted ? (
                    <MicOff className="w-3 h-3 text-white" />
                  ) : (
                    <Mic className="w-3 h-3 text-white/80" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel – Transcript / AI Scheduling */}
      <div className="w-[300px] bg-[#23272f] border-l border-white/8 flex flex-col">
        {/* Panel Header */}
        <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2D8CFF]" />
              <span className="text-white text-sm font-semibold">Live Transcript</span>
            </div>
            {schedulingDetected && (
              <div className="flex items-center gap-1 bg-[#2D8CFF] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                AI
              </div>
            )}
          </div>
          <span className="text-white/40 text-[11px]">3 pending · 0 open</span>
        </div>

        {/* Transcript Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {TRANSCRIPT_MESSAGES.map((msg, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl p-3 shadow-sm ${
                i === TRANSCRIPT_MESSAGES.length - 1 && schedulingDetected
                  ? 'ring-1 ring-[#2D8CFF]/40 bg-blue-50/95'
                  : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <img
                  src={msg.avatar}
                  alt={msg.speaker}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-[12px] font-semibold text-gray-800">{msg.speaker}</span>
                <span className="ml-auto text-[10px] text-gray-400">{msg.time}</span>
              </div>
              <p className="text-[12px] text-gray-700 leading-relaxed">{msg.text}</p>

              {/* AI scheduling detected on this message */}
              {i === TRANSCRIPT_MESSAGES.length - 1 && schedulingDetected && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <div className="flex items-center gap-1 text-[11px] text-[#2D8CFF] font-medium mb-2">
                    <Sparkles className="w-3 h-3" />
                    Scheduling intent detected
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={onShowScheduling}
                      className="flex-1 flex items-center justify-center gap-1 bg-[#2D8CFF] text-white text-[11px] font-semibold py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Calendar className="w-3 h-3" />
                      Schedule
                    </button>
                    <button className="px-3 py-1.5 text-[11px] text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* AI Detection Banner */}
          {schedulingDetected && (
            <div className="bg-[#2D8CFF]/10 border border-[#2D8CFF]/25 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-[#2D8CFF] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[#2D8CFF] text-[12px] font-semibold">Zoom AI Assistant</span>
              </div>
              <p className="text-[#93C5FD] text-[11px] leading-relaxed">
                Checking calendars for all 6 participants. Found 4 available slots next week.
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#4ADE80]">
                <CheckCircle className="w-3 h-3" />
                <span>All calendars synced</span>
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer – typing area (disabled, transcript only) */}
        <div className="border-t border-white/8 px-3 py-2.5">
          <div className="bg-[#1a1d24] rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="text-white/30 text-xs flex-1">Transcript only — read-only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
