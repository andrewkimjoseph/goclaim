type LoadingSpinnerProps = {
  label?: string;
  size?: "sm" | "md";
  variant?: "onShell" | "onCard";
};

const blockSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
};

const blockStyles = {
  onShell: "bg-white border-black",
  onCard: "bg-primary border-black",
};

export function LoadingSpinner({
  label,
  size = "md",
  variant = "onShell",
}: LoadingSpinnerProps) {
  const blockClass = `${blockSizes[size]} border-2 rounded-brutal shadow-brutal-sm ${blockStyles[variant]}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="flex items-end gap-1.5"
        role="status"
        aria-label={label ?? "Loading"}
      >
        {[0, 150, 300].map((delayMs) => (
          <div
            key={delayMs}
            className={`${blockClass} animate-bounce`}
            style={{ animationDelay: `${delayMs}ms` }}
          />
        ))}
      </div>
      {label && (
        <p className="text-white/80 text-sm text-center font-display font-semibold">
          {label}
        </p>
      )}
    </div>
  );
}
