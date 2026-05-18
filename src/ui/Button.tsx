type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  isDisabled?: boolean;
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  isDisabled = false,
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    "rounded-full px-6 py-2 font-semibold transition-all active:scale-95";

  const variants = {
    primary:
      "bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20",
    secondary:
      "bg-elevated text-primary hover:bg-border hover:shadow-lg hover:shadow-border/20",
  };

  const disabledStyles = "bg-elevated text-muted cursor-not-allowed opacity-50";

  return (
    <button
      {...rest}  
      onClick={onClick}
      disabled={isDisabled}
      className={`${base} ${isDisabled ? disabledStyles : variants[variant]} ${className}`}
      type="button"
    >
      {children}
    </button>
  );
}
