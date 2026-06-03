import type { IconProps } from "./types";

export function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M7.5 18.5H7a4 4 0 0 1-4-4V8.8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v5.7a4 4 0 0 1-4 4h-4.2L8.4 21a.6.6 0 0 1-.9-.52v-1.98Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8 10h8M8 13.5h5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17.8 3.4 18.4 2l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ImageIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="15"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 16.5 10.2 13a1.3 1.3 0 0 1 1.9 0l1.4 1.5 1.1-1.2a1.3 1.3 0 0 1 1.9 0l2.5 2.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.6" cy="9.1" r="1.3" fill="currentColor" />
      <path
        d="M16.7 3.2 17.3 2l.6 1.2 1.2.6-1.2.6-.6 1.2-.6-1.2-1.2-.6 1.2-.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.2 13.1a7.4 7.4 0 0 0 .05-2.2l2-1.45-2-3.45-2.35.95a8.1 8.1 0 0 0-1.9-1.1L14.7 3h-4l-.3 2.85a8.1 8.1 0 0 0-1.9 1.1L6.15 6l-2 3.45 2 1.45a7.4 7.4 0 0 0 .05 2.2l-2.05 1.5 2 3.45 2.45-1a7.8 7.8 0 0 0 1.8 1.05l.3 2.9h4l.3-2.9a7.8 7.8 0 0 0 1.8-1.05l2.45 1 2-3.45-2.05-1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AccountIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4.8 20.2c.8-3.7 3.4-5.7 7.2-5.7s6.4 2 7.2 5.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18.8 4.2 19.4 3l.6 1.2 1.2.6-1.2.6-.6 1.2-.6-1.2-1.2-.6 1.2-.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M5 7h14M5 12h14M5 17h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M7 7l10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StudentIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 7.5L12 3l8 4.5-8 4.5L4 7.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7 10.5v4.2c0 1.5 2.2 3.3 5 3.3s5-1.8 5-3.3v-4.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M20 8v5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

