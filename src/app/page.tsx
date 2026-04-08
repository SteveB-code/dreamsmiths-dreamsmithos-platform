export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            DreamsmithsOS
          </h1>
        </div>
        <p className="max-w-md text-muted-foreground">
          The operating system for how DreamSmiths works at its best.
        </p>
        <a
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
