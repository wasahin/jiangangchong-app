export function HouseIcon({ className = '' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 70L50 20L90 70V90H10V70Z" stroke="#1B3A5C" strokeWidth="2" fill="#FAF6EE"/>
      <path d="M50 20V70" stroke="#1B3A5C" strokeWidth="2"/>
      <path d="M10 70H90" stroke="#1B3A5C" strokeWidth="2"/>
      <rect x="25" y="50" width="20" height="20" rx="2" stroke="#1B3A5C" strokeWidth="2" fill="#E2BC6E"/>
      <rect x="60" y="50" width="15" height="15" rx="2" stroke="#1B3A5C" strokeWidth="2" fill="#E2BC6E"/>
      <rect x="40" y="65" width="20" height="25" rx="2" stroke="#1B3A5C" strokeWidth="2" fill="#C97B5A"/>
      <path d="M45 65V75M55 65V75M45 70H55" stroke="#1B3A5C" strokeWidth="1.5"/>
      <circle cx="52" cy="78" r="1.5" fill="#1B3A5C"/>
      <path d="M50 70H70V55H50V70" stroke="#1B3A5C" strokeWidth="2" fill="#FAF6EE"/>
      <ellipse cx="50" cy="25" rx="3" ry="5" stroke="#1B3A5C" strokeWidth="2" fill="#1B3A5C"/>
      <path d="M20 90C20 95 25 95 25 90M75 90C75 95 80 95 80 90" stroke="#1B3A5C" strokeWidth="1.5"/>
      <circle cx="20" cy="90" r="5" fill="#22C55E"/>
      <circle cx="80" cy="90" r="5" fill="#22C55E"/>
    </svg>
  );
}