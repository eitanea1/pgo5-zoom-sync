/* Zoom Sync — mock data. Stock CC headshot URLs from Unsplash. */

const ZS_PEOPLE = [
  { id: "me",    name: "Alex Rivera",    initials: "AR", color: "#3A8DFF", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&h=320&fit=crop&crop=faces&auto=format" },
  { id: "maya",  name: "Maya Chen",      initials: "MC", color: "#F06A6A", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=320&h=320&fit=crop&crop=faces&auto=format" },
  { id: "jord",  name: "Jordan Park",    initials: "JP", color: "#17B26A", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&h=320&fit=crop&crop=faces&auto=format" },
  { id: "priya", name: "Priya Shah",     initials: "PS", color: "#8B5CF6", photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=320&h=320&fit=crop&crop=faces&auto=format" },
  { id: "sam",   name: "Sam Okafor",     initials: "SO", color: "#F5A524", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=320&h=320&fit=crop&crop=faces&auto=format" },
  { id: "lin",   name: "Lin Tanaka",     initials: "LT", color: "#FF3D57", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&h=320&fit=crop&crop=faces&auto=format" },
];

const ZS_DESTINATIONS = [
  { id: "jira",   name: "Jira",    project: "Platform / SYNC", color: "var(--zs-jira)" },
  { id: "asana",  name: "Asana",   project: "Q2 Roadmap",        color: "var(--zs-asana)" },
  { id: "monday", name: "monday",  project: "Growth",            color: "var(--zs-monday)" },
  { id: "linear", name: "Linear",  project: "ENG",               color: "var(--zs-linear)" },
];

/* Seed + streaming script. Each item: which speaker said it, who the AI extracted it for, what trigger.
   trigger types (per PRD §4):
     - 'name_spoken'  : someone called out by name        (speaker ≠ owner)
     - 'volunteered'  : speaker volunteered themselves    (speaker = owner)
     - 'role_specific': spoke to a role/team, AI inferred (speaker ≠ owner)
     - 'unattributed' : no person mentioned               (owner = null) */
const ZS_TASK_SEED = [
  {
    id: "t-01",
    speaker: "maya",
    owner: "me",
    trigger: "name_spoken",
    title: "Review the Q2 launch plan and sign off by Thursday",
    quote: "Alex, can you review the Q2 launch plan and sign off by Thursday?",
    due: "Thu, May 1",
    destination: "asana",
    confidence: 0.94,
    createdAtOffset: -380,
  },
  {
    id: "t-02",
    speaker: "priya",
    owner: "priya",
    trigger: "volunteered",
    title: "Loop in Legal on the partner DPA language",
    quote: "I'll loop in Legal on the partner DPA language this week.",
    due: "Fri, May 2",
    destination: "asana",
    confidence: 0.88,
    createdAtOffset: -260,
  },
  {
    id: "t-03",
    speaker: "lin",
    owner: null,
    trigger: "unattributed",
    title: "Investigate the latency spike on the EU cluster",
    quote: "Someone needs to dig into the EU latency spike we saw yesterday.",
    due: "Wed, Apr 30",
    destination: "asana",
    confidence: 0.72,
    createdAtOffset: -120,
    lowConfidence: true,
  },
  {
    id: "t-04",
    speaker: "jord",
    owner: "sam",
    trigger: "role_specific",
    title: "Share the pricing model draft with the team",
    quote: "Whoever's on pricing, can we drop the model in the channel when it's ready?",
    due: "Tomorrow",
    destination: "asana",
    confidence: 0.91,
    createdAtOffset: -40,
  },
];

/* Tasks that will stream in, one per minute (or accelerated via tweaks). */
const ZS_TASK_STREAM = [
  {
    speaker: "maya",
    owner: "priya",
    trigger: "name_spoken",
    title: "Write the onboarding copy variants for A/B test",
    quote: "Priya, can you draft three onboarding copy variants for us to test?",
    due: "Mon, May 5",
    destination: "asana",
    confidence: 0.89,
  },
  {
    speaker: "lin",
    owner: "lin",
    trigger: "volunteered",
    title: "Pull together the churn cohort analysis",
    quote: "I'll pull together the churn cohort analysis by end of week.",
    due: "Fri, May 2",
    destination: "asana",
    confidence: 0.84,
  },
  {
    speaker: "maya",
    owner: "jord",
    trigger: "name_spoken",
    title: "Book user research sessions for mobile prototype",
    quote: "Jordan, let's line up six user research calls for the mobile prototype.",
    due: "Thu, May 8",
    destination: "asana",
    confidence: 0.77,
  },
  {
    speaker: "priya",
    owner: null,
    trigger: "unattributed",
    title: "Decide on a name for the new analytics feature",
    quote: "We still need to land on a name for the analytics thing.",
    due: "No due date",
    destination: "asana",
    confidence: 0.61,
    lowConfidence: true,
  },
  {
    speaker: "priya",
    owner: "maya",
    trigger: "role_specific",
    title: "Draft the exec update for Friday's review",
    quote: "Anyone on comms want to put a quick exec update together for Friday?",
    due: "Fri, May 2",
    destination: "asana",
    confidence: 0.83,
  },
  {
    speaker: "maya",
    owner: "sam",
    trigger: "name_spoken",
    title: "Follow up with Legal on the partner DPA",
    quote: "Sam, can you follow up with Legal about the partner DPA?",
    due: "Wed, Apr 30",
    destination: "asana",
    confidence: 0.86,
  },
  {
    speaker: "priya",
    owner: "priya",
    trigger: "volunteered",
    title: "Audit the empty states in the dashboard",
    quote: "I'll take the dashboard empty-state audit this sprint.",
    due: "Thu, May 8",
    destination: "asana",
    confidence: 0.81,
  },
  {
    speaker: "maya",
    owner: "lin",
    trigger: "name_spoken",
    title: "Prepare the integration demo for Tuesday's QBR",
    quote: "Lin, we'll need the integration demo ready for the QBR.",
    due: "Tue, May 6",
    destination: "asana",
    confidence: 0.88,
  },
];

/* Org directory — people who are NOT in the meeting but show up as
   "Suggested" assignees in the post-meeting summary (Flow G). */
const ZS_ORG_DIRECTORY = [
  {
    id: "sarah",
    name: "Sarah Patel",
    role: "Asana admin",
    destination: "asana",
    inMeeting: false,
    color: "#8B5CF6",
    initials: "SP",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=320&h=320&fit=crop&crop=faces&auto=format",
  },
];

Object.assign(window, { ZS_PEOPLE, ZS_DESTINATIONS, ZS_TASK_SEED, ZS_TASK_STREAM, ZS_ORG_DIRECTORY });
