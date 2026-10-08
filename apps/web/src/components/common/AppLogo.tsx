// FORK (APPLANO): PLANW brand mark — official logo files.
// Renders the light or dark variant based on the active theme.
export default function AppLogo({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true" style={{ display: "inline-block" }}>
      <img
        src="/brand/icon-planw-blackmode.svg"
        alt=""
        className="block size-full dark:hidden"
        draggable={false}
      />
      <img
        src="/brand/icon-planw-whitemode.svg"
        alt=""
        className="hidden size-full dark:block"
        draggable={false}
      />
    </span>
  );
}
