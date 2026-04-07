function Button({
  variant = "primary",
  onClick,
  children,
  disabled = false,
  type = "button",
}) {
  const variantStyles = {
    primary: "bg-brand-primary text-white hover:bg-brand-accent",
    secondary:
      "bg-white text-brand-primary border border-brand-primary hover:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-4 py-2 text-sm font-semibold transition ${variantStyles[variant] || variantStyles.primary} ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      {children}
    </button>
  );
}

export default Button;
