import type { ReactNode } from 'react';

const icons = {
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8 2 2-2 2 1 1-2 2-1-1-4 4" /></>,
  'arrow-right': <><path d="M4 12h15m-6-6 6 6-6 6" /></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
  'eye-off': <><path d="m3 3 18 18M10.5 6.1c.5-.1 1-.1 1.5-.1 6.5 0 10 6 10 6a16.8 16.8 0 0 1-2.8 3.2M6.3 7.6A17 17 0 0 0 2 12s3.5 6 10 6a11 11 0 0 0 4.4-.9" /><path d="M10.2 10.2a2.5 2.5 0 0 0 3.6 3.6" /></>,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  shield: <><path d="M12 22c4.2-2 8-5.7 8-10V6l-8-4-8 4v6c0 4.3 3.8 8 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
} satisfies Record<string, ReactNode>;

type IconProps = {
  name: keyof typeof icons;
  size?: number;
  className?: string;
};

export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} width={size} height={size}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}
