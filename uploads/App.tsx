import { useState, useEffect } from 'react';
import { VideoCallInterface } from './components/VideoCallInterface';
import { IntentDetectionPrompt } from './components/IntentDetectionPrompt';
import { HostConfigurationWindow } from './components/HostConfigurationWindow';
import { ParticipantRSVPPopup } from './components/ParticipantRSVPPopup';
import { MeetingToolbar } from './components/MeetingToolbar';
import { RSVPStatusTracker } from './components/RSVPStatusTracker';
import { ZoomHeader } from './components/ZoomHeader';

export interface Participant {
  id: string;
  name: string;
  email: string;
  isInternal: boolean;
  isOriginalInvitee?: boolean;
  isCurrentAttendee?: boolean;
  rsvpStatus?: 'pending' | 'confirmed' | 'declined';
  timezone?: string;
  avatar?: string;
}

export interface TimeSlot {
  id: string;
  dateTime: string;
  availableParticipants: string[];
  unavailableParticipants: string[];
  score: number;
}

export interface SchedulingIntent {
  detected: boolean;
  subject: string;
  suggestedTime: string;
  detectedPhrase: string;
  participants: Participant[];
  suggestedSlots?: TimeSlot[];
}

const PARTICIPANT_AVATARS = {
  alex: 'https://images.unsplash.com/photo-1738566061505-556830f8b8f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=90&w=400',
  maya: 'https://images.unsplash.com/photo-1712744626457-3ffa4ba32c8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=90&w=400',
  jordan: 'https://images.unsplash.com/photo-1765776830139-72b2184dae5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=90&w=400',
  priya: 'https://images.unsplash.com/photo-1674660418347-b40d4ca37830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=90&w=400',
  sam: 'https://images.unsplash.com/photo-1633944931899-5e2144bd9482?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=90&w=400',
  lin: 'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=90&w=400',
};

export default function App() {
  const [isHost, setIsHost] = useState(true);
  const [showIntentPrompt, setShowIntentPrompt] = useState(false);
  const [showConfigWindow, setShowConfigWindow] = useState(false);
  const [showRSVPPopup, setShowRSVPPopup] = useState(false);
  const [showRSVPTracker, setShowRSVPTracker] = useState(false);
  const [schedulingIntent, setSchedulingIntent] = useState<SchedulingIntent | null>(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [meetingTime, setMeetingTime] = useState('14:28');

  // Tick meeting clock
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setMeetingTime(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Simulate AI intent detection
  useEffect(() => {
    const simulateTranscript = () => {
      const phrases = [
        "Alright everyone, let's get started...",
        "Let's schedule a follow-up meeting next week",
        "to discuss the Q2 roadmap in more detail.",
      ];

      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < phrases.length) {
          setTranscriptText(prev => prev + (prev ? ' ' : '') + phrases[currentIndex]);
          currentIndex++;

          if (currentIndex === 2) {
            setTimeout(() => {
              setSchedulingIntent({
                detected: true,
                subject: 'Q2 Roadmap Follow-up',
                suggestedTime: '2026-04-30T14:00:00',
                detectedPhrase: "Let's schedule a follow-up meeting next week",
                participants: [
                  {
                    id: '1',
                    name: 'Alex Rivera',
                    email: 'alex@company.com',
                    isInternal: true,
                    isOriginalInvitee: true,
                    isCurrentAttendee: true,
                    timezone: 'America/Los_Angeles',
                    avatar: PARTICIPANT_AVATARS.alex,
                  },
                  {
                    id: '2',
                    name: 'Maya Chen',
                    email: 'maya@company.com',
                    isInternal: true,
                    isOriginalInvitee: true,
                    isCurrentAttendee: true,
                    timezone: 'America/Los_Angeles',
                    avatar: PARTICIPANT_AVATARS.maya,
                  },
                  {
                    id: '3',
                    name: 'Jordan Park',
                    email: 'jordan@company.com',
                    isInternal: true,
                    isOriginalInvitee: true,
                    isCurrentAttendee: true,
                    timezone: 'America/New_York',
                    avatar: PARTICIPANT_AVATARS.jordan,
                  },
                  {
                    id: '4',
                    name: 'Priya Shah',
                    email: 'priya@client.com',
                    isInternal: false,
                    isOriginalInvitee: false,
                    isCurrentAttendee: true,
                    timezone: 'America/Chicago',
                    avatar: PARTICIPANT_AVATARS.priya,
                  },
                  {
                    id: '5',
                    name: 'Sam Okafor',
                    email: 'sam@company.com',
                    isInternal: true,
                    isOriginalInvitee: true,
                    isCurrentAttendee: true,
                    timezone: 'Europe/London',
                    avatar: PARTICIPANT_AVATARS.sam,
                  },
                  {
                    id: '6',
                    name: 'Lin Tanaka',
                    email: 'lin@client.com',
                    isInternal: false,
                    isOriginalInvitee: false,
                    isCurrentAttendee: true,
                    timezone: 'Asia/Tokyo',
                    avatar: PARTICIPANT_AVATARS.lin,
                  },
                ],
                suggestedSlots: [
                  {
                    id: 'slot1',
                    dateTime: '2026-04-30T14:00:00',
                    availableParticipants: ['1', '2', '3', '4', '5', '6'],
                    unavailableParticipants: [],
                    score: 100,
                  },
                  {
                    id: 'slot2',
                    dateTime: '2026-04-30T15:30:00',
                    availableParticipants: ['1', '2', '3', '5'],
                    unavailableParticipants: ['4', '6'],
                    score: 67,
                  },
                  {
                    id: 'slot3',
                    dateTime: '2026-05-01T10:00:00',
                    availableParticipants: ['1', '2', '3', '4', '5', '6'],
                    unavailableParticipants: [],
                    score: 100,
                  },
                  {
                    id: 'slot4',
                    dateTime: '2026-05-01T16:00:00',
                    availableParticipants: ['1', '2', '4', '5', '6'],
                    unavailableParticipants: ['3'],
                    score: 83,
                  },
                ],
              });
              setShowIntentPrompt(true);
            }, 1000);
          }
        } else {
          clearInterval(interval);
        }
      }, 2000);

      return () => clearInterval(interval);
    };

    const timeout = setTimeout(simulateTranscript, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const handleConfigureScheduling = () => {
    setShowIntentPrompt(false);
    setShowConfigWindow(true);
  };

  const handleDismissPrompt = () => {
    setShowIntentPrompt(false);
  };

  const handleRecallFromToolbar = () => {
    if (schedulingIntent && !showConfigWindow) {
      setShowIntentPrompt(true);
    }
  };

  const handleCreateInvite = (updatedIntent: SchedulingIntent) => {
    setSchedulingIntent(updatedIntent);
    setShowConfigWindow(false);

    if (isHost) {
      setShowRSVPTracker(true);
      setTimeout(() => {
        setSchedulingIntent(prev => {
          if (!prev) return prev;
          const updated = { ...prev, participants: [...prev.participants] };
          updated.participants[0] = { ...updated.participants[0], rsvpStatus: 'confirmed' };
          return updated;
        });
      }, 2000);
      setTimeout(() => {
        setSchedulingIntent(prev => {
          if (!prev) return prev;
          const updated = { ...prev, participants: [...prev.participants] };
          updated.participants[2] = { ...updated.participants[2], rsvpStatus: 'confirmed' };
          return updated;
        });
      }, 4000);
    } else {
      setShowRSVPPopup(true);
    }
  };

  const handleRSVP = (_status: 'confirmed' | 'declined') => {
    setShowRSVPPopup(false);
  };

  const handleUpdateParticipants = (participants: Participant[]) => {
    if (schedulingIntent) {
      setSchedulingIntent({ ...schedulingIntent, participants });
    }
  };

  return (
    <div className="w-screen h-screen bg-[#1a1d24] flex flex-col overflow-hidden relative">
      {/* Zoom Header */}
      <ZoomHeader aiAnalyzing={schedulingIntent?.detected || false} meetingTime={meetingTime} />

      {/* Main Content: Video + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <VideoCallInterface
          transcript={transcriptText}
          schedulingDetected={schedulingIntent?.detected || false}
          onShowScheduling={handleConfigureScheduling}
        />
      </div>

      {/* Meeting Toolbar */}
      <MeetingToolbar
        hasSchedulingIntent={!!schedulingIntent}
        onRecallScheduling={handleRecallFromToolbar}
      />

      {/* Intent Detection Prompt (Bottom-Center, above toolbar) */}
      {showIntentPrompt && schedulingIntent && (
        <IntentDetectionPrompt
          intent={schedulingIntent}
          onConfigure={handleConfigureScheduling}
          onDismiss={handleDismissPrompt}
        />
      )}

      {/* Host Configuration Window */}
      {showConfigWindow && schedulingIntent && isHost && (
        <HostConfigurationWindow
          intent={schedulingIntent}
          onCreateInvite={handleCreateInvite}
          onClose={() => setShowConfigWindow(false)}
          onUpdateParticipants={handleUpdateParticipants}
        />
      )}

      {/* Participant RSVP Popup */}
      {showRSVPPopup && schedulingIntent && !isHost && (
        <ParticipantRSVPPopup
          intent={schedulingIntent}
          onRSVP={handleRSVP}
          onClose={() => setShowRSVPPopup(false)}
        />
      )}

      {/* RSVP Status Tracker (Host View) */}
      {showRSVPTracker && schedulingIntent && isHost && (
        <RSVPStatusTracker
          participants={schedulingIntent.participants}
          onClose={() => setShowRSVPTracker(false)}
        />
      )}

      {/* Demo Controls */}
      <div className="absolute top-16 left-4 bg-black/75 backdrop-blur-md p-3.5 rounded-xl text-white z-50 border border-white/10 shadow-2xl">
        <div className="text-[9px] mb-2 text-white/50 uppercase tracking-widest font-semibold">Demo</div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isHost}
            onChange={(e) => setIsHost(e.target.checked)}
            className="w-3.5 h-3.5 accent-[#2D8CFF]"
          />
          <span className="text-xs font-medium">View as Host</span>
        </label>
      </div>
    </div>
  );
}
