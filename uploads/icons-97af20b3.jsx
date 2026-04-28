/* Zoom Sync — inline SVG icon set.
   Stroke 1.75. 24x24. Designed to match Zoom's outline style.
   Swap these out when real Zoom icon SVGs land. */

const makeIcon = (paths, { viewBox = "0 0 24 24", fill = "none" } = {}) =>
  function Icon({ size = 22, stroke = "currentColor", strokeWidth = 1.75, style, ...rest }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
        {...rest}
      >
        {paths}
      </svg>
    );
  };

const MicOn = makeIcon(
  <>
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
    <path d="M8 21h8" />
  </>
);

const MicOff = makeIcon(
  <>
    <path d="M3 3l18 18" />
    <path d="M9 9v2a3 3 0 0 0 5.12 2.12" />
    <path d="M15 11V6a3 3 0 0 0-5.66-1.41" />
    <path d="M19 11a7 7 0 0 1-.55 2.73" />
    <path d="M12 18v3" />
    <path d="M8 21h8" />
  </>
);

const VideoOn = makeIcon(
  <>
    <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
    <path d="M15.5 10.5l5-2.5v8l-5-2.5z" />
  </>
);

const VideoOff = makeIcon(
  <>
    <path d="M3 3l18 18" />
    <path d="M10.5 6H13a2.5 2.5 0 0 1 2.5 2.5v2" />
    <path d="M15.5 13.5l5 2.5v-8l-5 2.5" />
    <path d="M2.5 8.5v7A2.5 2.5 0 0 0 5 18h8" />
  </>
);

const ScreenShare = makeIcon(
  <>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8" />
    <path d="M12 16v4" />
    <path d="M12 12V7" />
    <path d="M9 10l3-3 3 3" />
  </>
);

const Chat = makeIcon(
  <>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H12l-5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z" />
  </>
);

const Participants = makeIcon(
  <>
    <circle cx="9" cy="9" r="3.25" />
    <path d="M3 19a6 6 0 0 1 12 0" />
    <path d="M16 4.5a3.25 3.25 0 0 1 0 6" />
    <path d="M18 14a6 6 0 0 1 3 5" />
  </>
);

const Tasks = makeIcon(
  <>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M8 8.5h8" />
    <path d="M8 12h8" />
    <path d="M8 15.5h5" />
    <circle cx="6" cy="8.5" r="0.6" fill="currentColor" />
    <circle cx="6" cy="12"  r="0.6" fill="currentColor" />
    <circle cx="6" cy="15.5" r="0.6" fill="currentColor" />
  </>
);

const Record = makeIcon(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
  </>
);

const Reactions = makeIcon(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 14.5a4 4 0 0 0 7 0" />
    <circle cx="9" cy="10" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="0.8" fill="currentColor" stroke="none" />
  </>
);

const More = makeIcon(
  <>
    <circle cx="6"  cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none" />
  </>
);

const EndCall = makeIcon(
  <>
    <path d="M3 14.5c3-4 6-6 9-6s6 2 9 6l-2.5 2.5a1.5 1.5 0 0 1-2 .1l-1.8-1.4a1.5 1.5 0 0 1-.55-1.3l.2-1.4a12 12 0 0 0-4.7 0l.2 1.4a1.5 1.5 0 0 1-.55 1.3l-1.8 1.4a1.5 1.5 0 0 1-2-.1z" />
  </>
);

const Sparkle = makeIcon(
  <>
    <path d="M12 3l1.8 4.5L18 9.2l-4.2 1.8L12 15.5l-1.8-4.5L6 9.2l4.2-1.7z" />
    <path d="M19 15l.8 1.8L21.5 17.5l-1.7.8L19 20l-.8-1.7-1.7-.8 1.7-.8z" />
  </>
);

const ArrowRight = makeIcon(
  <>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </>
);

const ChevronDown = makeIcon(<path d="M6 9l6 6 6-6" />);
const ChevronUp   = makeIcon(<path d="M18 15l-6-6-6 6" />);
const X           = makeIcon(<><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>);
const Check       = makeIcon(<path d="M5 12.5l4.5 4.5L19 7" />);
const Plus        = makeIcon(<><path d="M12 5v14" /><path d="M5 12h14" /></>);
const Search      = makeIcon(<><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.5-3.5" /></>);
const Filter      = makeIcon(<><path d="M4 5h16" /><path d="M7 12h10" /><path d="M10 19h4" /></>);
const Pencil      = makeIcon(<><path d="M4 20l4-1 11-11-3-3L5 16z" /><path d="M13 6l3 3" /></>);
const Trash       = makeIcon(<><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /><path d="M10 11v6" /><path d="M14 11v6" /></>);
const Shield      = makeIcon(<><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></>);
const Zap         = makeIcon(<path d="M13 2L4 14h7l-1 8 9-12h-7z" />);
const Warning     = makeIcon(<><path d="M12 3l10 18H2z" /><path d="M12 10v5" /><circle cx="12" cy="18" r="0.8" fill="currentColor" stroke="none" /></>);
const Clock       = makeIcon(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>);
const Lock        = makeIcon(<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>);
const User        = makeIcon(<><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>);
const Grid        = makeIcon(<><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><rect x="13.5" y="13.5" width="7" height="7" rx="1" /></>);
const Layout      = makeIcon(<><rect x="3.5" y="3.5" width="17" height="17" rx="2" /><path d="M3.5 9h17" /><path d="M9 9v11.5" /></>);
const Mic         = MicOn;
const Send        = makeIcon(<><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4z" /></>);
const CheckCircle = makeIcon(<><circle cx="12" cy="12" r="8.5" /><path d="M8 12.5l3 3 5-6" /></>);
const Flag        = makeIcon(<><path d="M5 22V3" /><path d="M5 4h12l-2 4 2 4H5" /></>);

const ZoomSyncIcons = {
  MicOn, MicOff, Mic, VideoOn, VideoOff, ScreenShare, Chat, Participants,
  Tasks, Record, Reactions, More, EndCall, Sparkle, ArrowRight,
  ChevronDown, ChevronUp, X, Check, Plus, Search, Filter, Pencil, Trash,
  Shield, Zap, Warning, Clock, Lock, User, Grid, Layout, Send, CheckCircle, Flag,
};

Object.assign(window, { ZoomSyncIcons });
