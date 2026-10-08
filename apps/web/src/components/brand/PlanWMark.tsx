// FORK (APPLANO): PLANW brand mark — a bold "W" formed by two strokes,
// replacing the upstream ItsAPlanMark. Single color via currentColor,
// legible at small sizes. Decorative — the caller sets size/color via className.
export default function PlanWMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 7 L11 25 L16 13 L21 25 L27 7"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
