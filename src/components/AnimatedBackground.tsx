export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-blob bg-blob-a -left-32 -top-32 h-96 w-96 bg-indigo-300/40 dark:bg-indigo-600/15" />
      <div className="bg-blob bg-blob-b -right-24 top-1/4 h-80 w-80 bg-fuchsia-300/30 dark:bg-fuchsia-600/15" />
      <div className="bg-blob bg-blob-c -bottom-24 left-1/4 h-[28rem] w-[28rem] bg-sky-300/30 dark:bg-sky-600/15" />
      <div className="bg-blob bg-blob-d bottom-10 right-10 h-64 w-64 bg-amber-200/30 dark:bg-amber-500/10" />
    </div>
  );
}
