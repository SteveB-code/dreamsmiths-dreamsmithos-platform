export function Logo({ className = "", size = "default" }: { className?: string; size?: "small" | "default" | "large" }) {
  const sizes = {
    small: { height: 16, letterSpacing: "0.25em", fontSize: "11px" },
    default: { height: 20, letterSpacing: "0.3em", fontSize: "13px" },
    large: { height: 32, letterSpacing: "0.35em", fontSize: "22px" },
  };

  const s = sizes[size];

  return (
    <span
      className={`inline-flex items-center font-semibold text-foreground select-none ${className}`}
      style={{
        letterSpacing: s.letterSpacing,
        fontSize: s.fontSize,
        lineHeight: 1,
      }}
      aria-label="Dreamsmiths"
    >
      DREAMSM
      <span className="relative inline-flex flex-col items-center" style={{ letterSpacing: 0 }}>
        I
        <span
          className="absolute rounded-[1px]"
          style={{
            width: Math.max(3, s.height * 0.2),
            height: Math.max(3, s.height * 0.2),
            backgroundColor: "#5BBE6B",
            bottom: -Math.max(3, s.height * 0.15),
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      </span>
      THS
    </span>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#2D3436" />
        <text
          x="16"
          y="21"
          textAnchor="middle"
          fill="white"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="600"
          fontSize="18"
          letterSpacing="0.02em"
        >
          D
        </text>
        <rect x="14" y="24" width="4" height="4" rx="0.5" fill="#5BBE6B" />
      </svg>
    </div>
  );
}
