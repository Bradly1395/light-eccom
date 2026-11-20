import type { SVGProps } from "react";

/* Inline icons (no icon library needed). 20×20 grid, 1.6 stroke. */
type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="9" r="5.5" />
    <path d="m13.5 13.5 3.5 3.5" />
  </Base>
);
export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 5l10 10M15 5 5 15" />
  </Base>
);
export const ArrowLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M16 10H4m5-5-5 5 5 5" />
  </Base>
);
export const ArrowUpRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 14 14 6M7 6h7v7" />
  </Base>
);
export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m4.5 10.5 3.5 3.5 7.5-8" />
  </Base>
);
export const UploadIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 13V3.5m-4 4 4-4 4 4M3.5 13v2a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-2" />
  </Base>
);
export const TrashIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5m-6.5 0 .7 10a1.5 1.5 0 0 0 1.5 1.4h4.6a1.5 1.5 0 0 0 1.5-1.4l.7-10" />
  </Base>
);
export const PencilIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12.5 4.5l3 3M4 16l.8-3.6L13.3 4a1.4 1.4 0 0 1 2 0l.7.7a1.4 1.4 0 0 1 0 2L7.6 15.2z" />
  </Base>
);
export const ImageIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3.5" width="14" height="13" rx="2" />
    <circle cx="7.5" cy="8" r="1.5" />
    <path d="m3.5 14.5 4-4 3 3 2-2 4 4" />
  </Base>
);
export const MailIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
    <path d="m3 5.5 7 5.5 7-5.5" />
  </Base>
);
export const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 4v12M4 10h12" />
  </Base>
);
export const LogoutIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 3.5H5A1.5 1.5 0 0 0 3.5 5v10A1.5 1.5 0 0 0 5 16.5h3M13 6.5l3.5 3.5-3.5 3.5M16.5 10H8" />
  </Base>
);

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`animate-spin ${className}`} width="16" height="16" aria-hidden="true">
      <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="2" />
      <path d="M17 10a7 7 0 0 0-7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
