// FORK (APPLANO): PLANW brand mark — official logo with its own background,
// visible on any theme.
export default function AppLogo({ className }: { className?: string }) {
  return (
    <img
      src="/brand/logo-planw-retangle-whitemode.svg"
      alt=""
      aria-hidden="true"
      className={className}
      draggable={false}
    />
  );
}
