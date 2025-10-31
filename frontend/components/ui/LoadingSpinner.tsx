"use client";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({ size = "sm", className = "" }: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "w-3 h-3"; // 12px
      case "sm":
        return "w-4 h-4"; // 16px
      case "md":
        return "w-5 h-5"; // 20px
      case "lg":
        return "w-6 h-6"; // 24px
    }
  };

  // Ultra-minimal spinner using borders for crisp tiny rendering
  return (
    <span
      className={`inline-block rounded-full border-2 border-current border-t-transparent animate-spin ${getSizeClasses()} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
