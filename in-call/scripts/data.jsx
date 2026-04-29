/* Zoom Sync — mock data. Local face crops from the team photo. */

const ZS_PEOPLE = [
  { id: "me",     name: "Ofir Even-Zur", initials: "OE", color: "#3A8DFF", photo: "../assets/avatars/ofir.png",   tile: "../assets/tiles/ofir.png" },
  { id: "eitan",  name: "Eitan Dror",    initials: "ED", color: "#F06A6A", photo: "../assets/avatars/eitan.png",  tile: "../assets/tiles/eitan.png" },
  { id: "idan",   name: "Idan Grof",     initials: "IG", color: "#17B26A", photo: "../assets/avatars/idan.png",   tile: "../assets/tiles/idan.png" },
  { id: "neriya", name: "Neriya Amar",   initials: "NA", color: "#8B5CF6", photo: "../assets/avatars/neriya.png", tile: "../assets/tiles/neriya.png" },
  { id: "tal",    name: "Tal Shulman",   initials: "TS", color: "#F5A524", photo: "../assets/avatars/tal.png",    tile: "../assets/tiles/tal.png" },
];

const ZS_DESTINATIONS = [
  { id: "jira",   name: "Jira",    project: "PGO-5 / ROI & Pricing", color: "var(--zs-jira)" },
  { id: "asana",  name: "Asana",   project: "PGO-5 / Booth & Deck",  color: "var(--zs-asana)" },
  { id: "monday", name: "monday",  project: "PGO-5 / Logistics",     color: "var(--zs-monday)" },
  { id: "linear", name: "Linear",  project: "PGO-5 / PRDs",          color: "var(--zs-linear)" },
];

/* Seed + streaming script. PM team weekly sync — discovery, KPIs, PRD, roadmap.
   trigger types:
     - 'name_spoken'  : someone called out by name        (speaker ≠ owner)
     - 'volunteered'  : speaker volunteered themselves    (speaker = owner)
     - 'role_specific': spoke to a role/team, AI inferred (speaker ≠ owner)
     - 'unattributed' : no person mentioned               (owner = null) */
const ZS_TASK_SEED = [
  {
    id: "t-01",
    speaker: "eitan",
    owner: "me",
    trigger: "name_spoken",
    title: "Finalize the Q3 roadmap draft and share with leadership",
    quote: "Ofir, can you finalize the Q3 roadmap draft and share it with leadership by Thursday?",
    due: "Thu, May 1",
    destination: "asana",
    confidence: 0.94,
    createdAtOffset: -380,
  },
  {
    id: "t-02",
    speaker: "neriya",
    owner: "neriya",
    trigger: "volunteered",
    title: "Run discovery interviews with five enterprise customers",
    quote: "I'll run discovery interviews with five enterprise customers this week.",
    due: "Fri, May 2",
    destination: "jira",
    confidence: 0.88,
    createdAtOffset: -260,
  },
  {
    id: "t-03",
    speaker: "idan",
    owner: null,
    trigger: "unattributed",
    title: "Investigate the drop in activation funnel conversion",
    quote: "Someone needs to dig into why activation conversion dropped 8% last week.",
    due: "Wed, Apr 30",
    destination: "linear",
    confidence: 0.72,
    createdAtOffset: -120,
    lowConfidence: true,
  },
  {
    id: "t-04",
    speaker: "eitan",
    owner: "tal",
    trigger: "role_specific",
    title: "Draft KPI definitions for the new analytics module",
    quote: "Whoever owns analytics, let's get KPI definitions written up for the new module.",
    due: "Tomorrow",
    destination: "asana",
    confidence: 0.91,
    createdAtOffset: -40,
  },
];

/* Tasks that will stream in over the meeting.
   Project context: PGO-5 (graduation final). Two reviewers we present to:
     • Max  — pushes on ROI math, Cost per Brief, Business Tiers / pricing.
     • Uri  — pushes on storytelling, UX consistency across the 3 screens,
              and the "Why" behind every product decision.
   The team (Eitan, Idan, Neriya, Tal + Ofir as host) is preparing the
   demo, the deck, the booth, and the per-feature PRDs. */
const ZS_TASK_STREAM = [
  {
    speaker: "me",
    owner: "eitan",
    trigger: "name_spoken",
    title: "Finalize Figma frames for the PGO-5 booth handout",
    quote: "Eitan, can you finalize the Figma frames for the PGO-5 booth handout? Uri will scan it first thing.",
    due: "Mon, May 5",
    destination: "linear",
    confidence: 0.92,
  },
  {
    speaker: "idan",
    owner: "idan",
    trigger: "volunteered",
    title: "Cost-per-Brief math + Business Tiers slide for Max's ROI pass",
    quote: "I'll pull the Cost-per-Brief math and refresh the Business Tiers slide for Max's ROI section by EOD.",
    due: "Today",
    destination: "jira",
    confidence: 0.87,
  },
  {
    speaker: "me",
    owner: "tal",
    trigger: "name_spoken",
    title: "Order 240 GSM tees + non-smudge candy for the booth",
    quote: "Tal, lock the 240 GSM T-shirts and the non-smudge candy for the booth — vendor quote is due today.",
    due: "Thu, May 8",
    destination: "asana",
    confidence: 0.93,
  },
  {
    speaker: "neriya",
    owner: null,
    trigger: "unattributed",
    title: "Lock the naming convention for the three Sync features in the deck",
    quote: "We still need to land on a naming convention for the three Sync features before the Canva deck goes final.",
    due: "No due date",
    destination: "linear",
    confidence: 0.62,
    lowConfidence: true,
  },
  {
    speaker: "neriya",
    owner: "eitan",
    trigger: "role_specific",
    title: "'Why Zoom Sync' opening slide — Uri's first probe",
    quote: "Someone needs to prep the 'Why Zoom Sync' opening slide. Uri will hit that question first, and a weak why is going to bleed into the rest of the deck.",
    due: "Fri, May 2",
    destination: "asana",
    confidence: 0.85,
  },
  {
    speaker: "me",
    owner: "neriya",
    trigger: "name_spoken",
    title: "PRD: Meeting Score & Overtime (separate doc from the Recap PRD)",
    quote: "Neriya, can you write the PRD for Meeting Score & Overtime as its own doc? Uri said one PRD per feature — don't bundle it with the Recap PRD.",
    due: "Mon, May 5",
    destination: "linear",
    confidence: 0.91,
  },
  {
    speaker: "neriya",
    owner: "neriya",
    trigger: "volunteered",
    title: "UX consistency audit across the 3 PGO-5 screens — Uri pass",
    quote: "I'll do a UX consistency pass across Pre-Meeting, In-Call and Recap before Uri's review. He'll catch any drift between the three screens.",
    due: "Thu, May 8",
    destination: "jira",
    confidence: 0.83,
  },
  {
    speaker: "me",
    owner: "idan",
    trigger: "name_spoken",
    title: "Refresh per-seat Business Tiers pricing for Max",
    quote: "Idan, we'll need the per-seat Business Tiers refreshed before Max's pass — last numbers don't hold up against the Cost-per-Brief model.",
    due: "Tue, May 6",
    destination: "asana",
    confidence: 0.89,
  },
];

/* Org directory — people NOT in the meeting but show up as
   "Suggested" assignees in the post-meeting summary. */
const ZS_ORG_DIRECTORY = [
  {
    id: "sarah",
    name: "Sarah Patel",
    role: "Senior PM, Platform",
    destination: "jira",
    inMeeting: false,
    color: "#8B5CF6",
    initials: "SP",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=320&h=320&fit=crop&crop=faces&auto=format",
  },
];

Object.assign(window, { ZS_PEOPLE, ZS_DESTINATIONS, ZS_TASK_SEED, ZS_TASK_STREAM, ZS_ORG_DIRECTORY });

/* ---------------- Follow-up: scheduling intent demo data ----------------
   Used by FollowUpPanel + HostConfigModal + RSVPTracker. The transcript is
   played back word-by-word; the trigger phrase causes intent detection. */

const ZS_FOLLOWUP_TRANSCRIPT = [
  { speaker: "eitan",  text: "Alright, I think we covered the deck flow for Max and Uri." },
  { speaker: "neriya", text: "Yeah — but the booth logistics still has open items. Balloons aren't ordered, and Tal's quote on the 240 GSM tees hasn't come back." },
  { speaker: "me",     text: "Let's schedule a follow-up Friday to lock the PGO-5 booth setup before the dry run." },
  { speaker: "idan",   text: "Sounds good, I'll bring the Cost-per-Brief numbers we promised Max." },
];

// The phrase that triggers detection (must be substring of one transcript line above)
const ZS_FOLLOWUP_TRIGGER_PHRASE = "Let's schedule a follow-up Friday to lock the PGO-5 booth setup";
const ZS_FOLLOWUP_TRIGGER_INDEX = 2; // after the 3rd line is fully streamed

const ZS_FOLLOWUP_PARTICIPANTS = [
  // Mirrors ZS_PEOPLE — internal company team plus any externals added later
  // (e.g. PGO-5 reviewer Uri). External rows have no calendar access, so
  // their availability is rendered as "no access" (gray) in CalendarWeek.
  { id: "me",     name: "Ofir Even-Zur", email: "ofir@company.com",   isInternal: true,  isOriginalInvitee: true,  isCurrentAttendee: true, timezone: "Asia/Jerusalem", photo: "../assets/avatars/ofir.png" },
  { id: "eitan",  name: "Eitan Dror",    email: "eitan@company.com",  isInternal: true,  isOriginalInvitee: true,  isCurrentAttendee: true, timezone: "Asia/Jerusalem", photo: "../assets/avatars/eitan.png" },
  { id: "idan",   name: "Idan Grof",     email: "idan@company.com",   isInternal: true,  isOriginalInvitee: true,  isCurrentAttendee: true, timezone: "Asia/Jerusalem", photo: "../assets/avatars/idan.png" },
  { id: "neriya", name: "Neriya Amar",   email: "neriya@company.com", isInternal: true,  isOriginalInvitee: true,  isCurrentAttendee: true, timezone: "Asia/Jerusalem", photo: "../assets/avatars/neriya.png" },
  { id: "tal",    name: "Tal Shulman",   email: "tal@company.com",    isInternal: true,  isOriginalInvitee: true,  isCurrentAttendee: true, timezone: "Asia/Jerusalem", photo: "../assets/avatars/tal.png" },
];

const ZS_FOLLOWUP_INTENT = {
  subject: "PGO-5 Booth Logistics Lock",
  detectedPhrase: ZS_FOLLOWUP_TRIGGER_PHRASE,
  suggestedTime: "2026-05-04T14:00:00",
  participants: ZS_FOLLOWUP_PARTICIPANTS,
  suggestedSlots: [
    { id: "slot1", dateTime: "2026-05-04T14:00:00", availableParticipants: ["me","eitan","idan","neriya","tal"], unavailableParticipants: [],          score: 100 },
    { id: "slot2", dateTime: "2026-05-04T15:30:00", availableParticipants: ["me","eitan","idan","tal"],          unavailableParticipants: ["neriya"], score: 80  },
    { id: "slot3", dateTime: "2026-05-05T10:00:00", availableParticipants: ["me","eitan","idan","neriya","tal"], unavailableParticipants: [],          score: 100 },
    { id: "slot4", dateTime: "2026-05-05T16:00:00", availableParticipants: ["me","eitan","neriya","tal"],        unavailableParticipants: ["idan"],   score: 80  },
  ],
};

// Per-participant busy blocks for CalendarWeekView. Each entry is { day, hour, duration }
// where day is 0..4 (Mon..Fri starting from selectedDate). 9..17 hours shown.
const ZS_FOLLOWUP_BUSY = {
  me:     [{ day: 0, hour: 9,  duration: 1 }, { day: 0, hour: 13, duration: 2 }, { day: 1, hour: 10, duration: 1.5 }],
  eitan:  [{ day: 0, hour: 10, duration: 2 }, { day: 1, hour: 14, duration: 1 }, { day: 2, hour: 9,  duration: 1 }],
  idan:   [{ day: 0, hour: 14, duration: 1 }, { day: 1, hour: 11, duration: 2 }, { day: 2, hour: 15, duration: 1.5 }],
  neriya: [{ day: 0, hour: 11, duration: 1 }, { day: 1, hour: 9,  duration: 2 }, { day: 2, hour: 13, duration: 1 }],
  tal:    [{ day: 0, hour: 15, duration: 1 }, { day: 1, hour: 13, duration: 1 }],
};

Object.assign(window, {
  ZS_FOLLOWUP_TRANSCRIPT,
  ZS_FOLLOWUP_TRIGGER_PHRASE,
  ZS_FOLLOWUP_TRIGGER_INDEX,
  ZS_FOLLOWUP_PARTICIPANTS,
  ZS_FOLLOWUP_INTENT,
  ZS_FOLLOWUP_BUSY,
});
