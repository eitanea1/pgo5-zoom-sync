// Mock content for Mia Cohen's Sprint Sync
const MEETING = {
  title: "Sprint Sync — Discovery Track",
  subtitle: "Recurring · Tue 10:00–10:45 · Zoom",
  series: "Sprint 24 · Week 2 of 2",
  ai: "AI brief composed 4 min ago from 12 sources",
};

const SUMMARY = {
  recap: "Last week the team aligned on cutting the onboarding survey from 6 to 3 questions and moving the paywall after the first 'aha' moment. Mia raised concerns about Android parity; engineering committed to a spike.",
  bullets: [
    "Decision: ship onboarding v3 to 10% on Tue.",
    "Concern (Mia): Android parity blocked by SDK upgrade.",
    "Open: pricing copy still TBD — Sam owns.",
  ],
  signals: [
    { k: "Sentiment", v: "Constructive", tone: "good" },
    { k: "Decisions", v: "2 made · 1 deferred", tone: "muted" },
    { k: "Risks flagged", v: "1 (Android)", tone: "warn" },
  ],
};

const DOCS = [
  { id: "d1", name: "Discovery Q2 — North Star metric", kind: "doc", source: "Notion", touched: "edited 2h ago by Sam", color: "doc" },
  { id: "d2", name: "Onboarding v3 — funnel report.pdf", kind: "pdf", source: "Drive", touched: "uploaded yesterday", color: "pdf" },
  { id: "d3", name: "Pricing copy — variants A/B/C", kind: "doc", source: "Notion", touched: "Sam · 5 comments", color: "doc" },
  { id: "d4", name: "Activation cohorts wk 21-24", kind: "sheet", source: "Sheets", touched: "auto-refreshed", color: "sheet" },
  { id: "d5", name: "Paywall placement — exploration", kind: "fig", source: "Figma", touched: "Lena · 3 frames new", color: "fig" },
];

const TASKS = [
  { id: "t1", who: "Mia", initials: "MC", what: "Confirm Android SDK spike scope w/ eng lead", due: "today", from: "Sprint Sync · Apr 22", priority: "high" },
  { id: "t2", who: "Sam", initials: "SK", what: "Land pricing copy variant for review", due: "Tue 9am", from: "Sprint Sync · Apr 22", priority: "high" },
  { id: "t3", who: "Lena", initials: "LR", what: "Share paywall exploration — 3 frames", due: "Mon", from: "Sprint Sync · Apr 22", priority: "med", done: true },
  { id: "t4", who: "You", initials: "MC", what: "Draft kill-criteria for onboarding v3 10% rollout", due: "Wed", from: "Discovery review · Apr 18", priority: "med" },
  { id: "t5", who: "Diego", initials: "DM", what: "Pull cohort data for week 21-24", due: "Mon", from: "Sprint Sync · Apr 22", priority: "low", done: true },
  { id: "t6", who: "Sam", initials: "SK", what: "Update north-star metric doc with new defs", due: "Thu", from: "Discovery review · Apr 18", priority: "med" },
  { id: "t7", who: "You", initials: "MC", what: "Schedule research debrief with UXR", due: "this wk", from: "Discovery review · Apr 18", priority: "low" },
];

const ATTENDEES = [
  { name: "Mia Cohen",    role: "Sr. PM",       initials: "MC", tag: "You",    avatarTone: "#eaf1ff" },
  { name: "Sam Kapoor",   role: "PM, Pricing",  initials: "SK", tag: "Host",   avatarTone: "#fff1d9" },
  { name: "Lena Rivers",  role: "Design Lead",  initials: "LR", tag: "",       avatarTone: "#f3eaff" },
  { name: "Diego Marín",  role: "Data",         initials: "DM", tag: "",       avatarTone: "#eaf7ee" },
  { name: "Priya Shah",   role: "Eng Lead",     initials: "PS", tag: "",       avatarTone: "#ffe9e3" },
  { name: "Noah Brandt",  role: "UX Researcher",initials: "NB", tag: "New",    avatarTone: "#f0efe3" },
];

const HISTORY = [
  { date: "Apr 22", title: "Sprint Sync — last week", body: "Aligned on onboarding v3 cut to 3 Qs. Android parity flagged.", key: true },
  { date: "Apr 18", title: "Discovery Review",        body: "North-star metric draft circulated; 2 open threads in Notion." },
  { date: "Apr 15", title: "Sprint Sync",             body: "Activation flat wk-over-wk. Decision to A/B paywall placement." },
  { date: "Apr 11", title: "Pricing Working Group",   body: "Three copy variants generated — Sam owns landing one." },
  { date: "Apr 08", title: "Sprint Sync (kickoff)",   body: "Sprint 24 goals set. Theme: reduce time-to-aha.", key: true },
];

const DECISIONS = [
  { what: "Move paywall to post-aha moment.", why: "Activation lift in two prior tests; reversible.", when: "Apr 22" },
  { what: "Cut onboarding survey 6 → 3 questions.", why: "Reduce drop-off; survey can be re-introduced contextually.", when: "Apr 22" },
  { what: "Pause Android parity work for 1 sprint.", why: "Blocked on SDK upgrade; revisit Apr 29.", when: "Apr 22" },
];

window.MOCK = { MEETING, SUMMARY, DOCS, TASKS, ATTENDEES, HISTORY, DECISIONS };
