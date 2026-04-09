import { Logo, LogoMark } from "@/components/logo";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-8 text-center">
        <LogoMark />
        <Logo size="large" />
        <p className="max-w-md text-muted-foreground text-[15px] leading-relaxed">
          The operating system for how Dreamsmiths works at its best.
        </p>
        <a
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
