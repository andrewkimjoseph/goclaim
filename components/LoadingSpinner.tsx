type LoadingSpinnerProps = {
  label?: string;
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "h-5 w-5 border-2",
  md: "h-6 w-6 border-2",
};

export function LoadingSpinner({ label, size = "md" }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-white/30 border-t-white`}
        role="status"
        aria-label={label ?? "Loading"}
      />
      {label && (
        <p className="text-white/80 text-sm text-center font-display">
          {label}
        </p>
      )}
    </div>
  );
}
