/* Zoom Sync — Brand logo marks for task destinations.
   Simplified SVG recreations of the public brand marks. */

function JiraLogo({ size = 14 }) {
  // Atlassian Jira — blue stacked chevron mark
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="Jira"
         style={{ display: "block", flex: "none" }}>
      <defs>
        <linearGradient id="zs-jira-a" x1="22.03" y1="10.38" x2="16.55" y2="16.09" gradientUnits="userSpaceOnUse">
          <stop offset="0.18" stopColor="#0052CC"/><stop offset="1" stopColor="#2684FF"/>
        </linearGradient>
        <linearGradient id="zs-jira-b" x1="9.97" y1="21.58" x2="15.42" y2="15.87" gradientUnits="userSpaceOnUse">
          <stop offset="0.18" stopColor="#0052CC"/><stop offset="1" stopColor="#2684FF"/>
        </linearGradient>
      </defs>
      <path fill="#2684FF" d="M30.3 15.3 17.2 2.2 15.9.9 6.1 10.8l-4.5 4.5a1 1 0 0 0 0 1.4l9 9 5.3 5.3 9.8-9.8.2-.1 4.4-4.4a1 1 0 0 0 0-1.4M16 19.8 11.5 15.3l4.5-4.5 4.5 4.5z"/>
      <path fill="url(#zs-jira-a)" d="M16 10.8a7.5 7.5 0 0 1 0-10.6L6.1 10l4.4 4.4z" transform="translate(-0.02 0.02)"/>
      <path fill="url(#zs-jira-b)" d="m20.5 15.3-4.5 4.5a7.5 7.5 0 0 1 0 10.6l9.9-9.9z"/>
    </svg>
  );
}

function AsanaLogo({ size = 14 }) {
  // Three dots — tri-color
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="Asana"
         style={{ display: "block", flex: "none" }}>
      <defs>
        <radialGradient id="zs-asana-g" cx="16" cy="20" r="16" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFB900"/>
          <stop offset="0.6" stopColor="#F95D8F"/>
          <stop offset="1" stopColor="#F95353"/>
        </radialGradient>
      </defs>
      <circle fill="url(#zs-asana-g)" cx="16" cy="22.5" r="6"/>
      <circle fill="url(#zs-asana-g)" cx="8"  cy="10.5" r="6"/>
      <circle fill="url(#zs-asana-g)" cx="24" cy="10.5" r="6"/>
    </svg>
  );
}

function MondayLogo({ size = 14 }) {
  // Three rounded capsules in monday.com's red / yellow / blue-green
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="monday.com"
         style={{ display: "block", flex: "none" }}>
      <rect x="3"  y="6.5" width="26" height="5" rx="2.5" fill="#FF3D57"/>
      <rect x="3"  y="13.5" width="26" height="5" rx="2.5" fill="#FFCB00"/>
      <rect x="3"  y="20.5" width="22" height="5" rx="2.5" fill="#00D647"/>
      <circle cx="27" cy="23" r="2.6" fill="#00D647"/>
    </svg>
  );
}

function LinearLogo({ size = 14 }) {
  // Stylized Linear arc mark
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="Linear"
         style={{ display: "block", flex: "none" }}>
      <defs>
        <linearGradient id="zs-linear-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8A8FFF"/>
          <stop offset="1" stopColor="#5E6AD2"/>
        </linearGradient>
      </defs>
      <path fill="url(#zs-linear-g)" d="M2.2 19.3 12.7 29.8a14 14 0 0 1-10.5-10.5m-.2-4.6 14.8 14.8a14 14 0 0 0 3.3-.5L2.3 11.4a14 14 0 0 0-.3 3.3m1.4-7L22.7 26.6c1-.6 2-1.3 2.8-2.1L5.5 4.7a14 14 0 0 0-2.1 2.8M7 3.8l21.2 21.2A14 14 0 0 0 7 3.8"/>
    </svg>
  );
}

function DestinationLogo({ id, size = 14 }) {
  if (id === "jira")   return <JiraLogo   size={size} />;
  if (id === "asana")  return <AsanaLogo  size={size} />;
  if (id === "monday") return <MondayLogo size={size} />;
  if (id === "linear") return <LinearLogo size={size} />;
  return null;
}

Object.assign(window, { JiraLogo, AsanaLogo, MondayLogo, LinearLogo, DestinationLogo });
