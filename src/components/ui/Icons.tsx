import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
    focusable: false as const,
    ...props,
  };
}

const stroke = { stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.02 2.57.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z"
      />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="18" height="18" rx="5" {...stroke} />
      <circle cx="12" cy="12" r="4.2" {...stroke} />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        fill="currentColor"
        d="M13.5 21.95V13.9h2.7l.4-3.13h-3.1V8.77c0-.9.25-1.52 1.55-1.52h1.66V4.45a22 22 0 0 0-2.42-.12c-2.4 0-4.04 1.46-4.04 4.15v2.3H7.53v3.13h2.72v8.04h3.25Z"
      />
    </svg>
  );
}

export function SoundCloudIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        fill="currentColor"
        d="M11.6 7.6c.44-.2.93-.3 1.43-.3 2.05 0 3.74 1.57 3.93 3.58a2.9 2.9 0 0 1 4.04 2.66 2.9 2.9 0 0 1-2.9 2.9h-6.5a.4.4 0 0 1-.4-.4V8a.4.4 0 0 1 .4-.4Zm-1.9 1.1c.21 0 .38.17.38.38v7.46a.38.38 0 0 1-.76 0V9.08c0-.21.17-.38.38-.38Zm-1.72.9c.21 0 .38.17.38.38v6.56a.38.38 0 0 1-.76 0V9.98c0-.21.17-.38.38-.38Zm-1.72.9c.21 0 .38.17.38.38v5.66a.38.38 0 0 1-.76 0v-5.66c0-.21.17-.38.38-.38Zm-1.72 1.1c.21 0 .38.17.38.38v4.56a.38.38 0 0 1-.76 0v-4.56c0-.21.17-.38.38-.38Zm-1.72 1.1c.21 0 .38.17.38.38v3.2a.38.38 0 0 1-.76 0v-3.2c0-.21.17-.38.38-.38Z"
      />
    </svg>
  );
}

export function HeadphonesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" {...stroke} />
      <rect x="3" y="14" width="4.5" height="7" rx="1.5" {...stroke} />
      <rect x="16.5" y="14" width="4.5" height="7" rx="1.5" {...stroke} />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path fill="currentColor" d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.9-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v16m0 0-6-6m6 6 6-6" {...stroke} />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h16m0 0-6-6m6 6-6 6" {...stroke} />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6 6 18" {...stroke} />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m15 5-7 7 7 7" {...stroke} />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m9 5 7 7-7 7" {...stroke} />
    </svg>
  );
}

export function ZoomInIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6.5" {...stroke} />
      <path d="M20 20l-4.2-4.2M11 8v6M8 11h6" {...stroke} />
    </svg>
  );
}

export function ZoomOutIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6.5" {...stroke} />
      <path d="M20 20l-4.2-4.2M8 11h6" {...stroke} />
    </svg>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" {...stroke} />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" {...stroke} />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" {...stroke} />
      <circle cx="12" cy="9.5" r="2.5" {...stroke} />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h10" {...stroke} />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" {...stroke} />
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
    </svg>
  );
}

export function NextIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path fill="currentColor" d="M5 6.2v11.6a1 1 0 0 0 1.53.85l8.7-5.8a1 1 0 0 0 0-1.7l-8.7-5.8A1 1 0 0 0 5 6.2Z" />
      <rect x="17" y="5.5" width="2.6" height="13" rx="1.1" fill="currentColor" />
    </svg>
  );
}

export function VolumeOffIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" {...stroke} />
      <path d="m16 9.5 5 5m0-5-5 5" {...stroke} />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" {...stroke} />
      <path d="M3.5 10h17M8 3v4M16 3v4" {...stroke} />
      <path d="M8 14h2M12 14h2M16 14h.01M8 17h2M12 17h2" {...stroke} />
    </svg>
  );
}

/** Knob do logo (o "O" de BETO) — símbolo da marca. */
export function KnobIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" {...stroke} />
      <path d="M12 12l4.2-5" {...stroke} strokeWidth={2.4} />
    </svg>
  );
}

export const socialIcons = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  soundcloud: SoundCloudIcon,
  whatsapp: WhatsAppIcon,
} as const;
