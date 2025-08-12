
import React from 'react';

interface IconProps {
  icon: 'dashboard' | 'users' | 'report' | 'calendar' | 'clock' | 'check' | 'x' | 'edit' | 'download' | 'trash' | 'arrow-left' | 'arrow-right' | 'logo' | 'bell' | 'plus' | 'file' | 'sun' | 'moon' | 'cog' | 'user' | 'filter' | 'copy';
  className?: string;
}

const ICONS: Record<IconProps['icon'], React.ReactNode> = {
  // New Icons from mockups
  logo: <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" />,
  bell: <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z" />,
  'arrow-left': <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />,
  'arrow-right': <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />,
  plus: <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />,
  file: <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31L188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />,
  sun: <path d="M128,56a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H136A8,8,0,0,1,128,56Zm80,64a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V128A8,8,0,0,0,208,120Zm-80,96a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V200A8,8,0,0,0,128,192Zm-80-72a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H40A8,8,0,0,0,48,120ZM184.49,83.51a8,8,0,0,0,5.65-2.34l11.32-11.31a8,8,0,0,0-11.32-11.32L178.82,70.18a8,8,0,0,0,5.67,13.33ZM71.51,196.49a8,8,0,0,0-5.65,2.34l-11.32,11.31a8,8,0,1,0,11.32,11.32l11.31-11.32a8,8,0,0,0-5.66-13.33ZM201.18,178.82a8,8,0,0,0-11.32,11.32l11.31,11.31a8,8,0,0,0,11.32-11.32ZM70.18,70.18A8,8,0,0,0,58.86,58.86L69.82,47.54a8,8,0,0,0,11.32,11.32ZM128,88a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152Z"/>,
  moon: <path d="M216,136a8,8,0,0,1-8,8H187.33A72.1,72.1,0,0,1,120,40.19V24a8,8,0,0,1,16,0V40.69A88.1,88.1,0,0,0,216,128Z"/>,
  cog: <path d="M216.49,113.13l-29.33-10.31a8,8,0,0,1-5.35-5.35L171.5,68.16a8,8,0,0,0-7.64-7.64L134.87,50.2a8,8,0,0,1-5.74,0l-29-10.32a8,8,0,0,0-7.64,7.64L82.16,76.84a8,8,0,0,1-5.35,5.35L47.51,92.5a8,8,0,0,0,0,15l29.33,10.31a8,8,0,0,1,5.35,5.35l10.31,29.31a8,8,0,0,0,7.64,7.64l29,10.32a8,8,0,0,1,5.74,0l29-10.32a8,8,0,0,0,7.64-7.64l10.31-29.31a8,8,0,0,1,5.35-5.35L216.49,128.13A8,8,0,0,0,216.49,113.13ZM128,160a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z" />,
  user: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  filter: <path d="M128,40a8,8,0,0,0-8,8V69.35L57.65,132A16,16,0,0,0,70.05,160H185.95a16,16,0,0,0,12.4-28l-62.3-62.69V48A8,8,0,0,0,128,40Z" />,
  copy: <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"/>,

  // Old Icons
  dashboard: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  users: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" />,
  report: <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />,
  calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  clock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  check: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
  x: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
  edit: <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />,
  download: <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
  trash: <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
};

const Icon: React.FC<IconProps> = ({ icon, className = 'w-6 h-6' }) => {
  const isPhosphorIcon = ['bell', 'arrow-left', 'arrow-right', 'plus', 'file', 'sun', 'moon', 'cog', 'filter', 'copy'].includes(icon);
  
  if (icon === 'logo') {
     return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 48 48">
            {ICONS[icon]}
        </svg>
     )
  }
  
  if (isPhosphorIcon) {
    return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
        {ICONS[icon]}
      </svg>
    )
  }

  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {ICONS[icon]}
    </svg>
  );
};

export default Icon;
