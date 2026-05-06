export default function Button({
  variant = "primary",
  onClick,
  children,
  disabled = false,
  type = "button",
  className = "",
}) {
  const variants = {
    primary:   "bg-rv-accent text-white hover:bg-rv-accent/90",
    secondary: "bg-rv-surface2 text-rv-text border border-rv-border2 hover:bg-rv-border",
    danger:    "bg-rv-danger text-white hover:bg-rv-danger/90",
    ghost:     "text-rv-muted hover:bg-rv-surface2 hover:text-rv-text",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
        variants[variant] ?? variants.primary
      } ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
