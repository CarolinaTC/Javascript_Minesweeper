export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      className={`button button--${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
