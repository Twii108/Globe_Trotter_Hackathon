import React from 'react';

/**
 * Reusable Button Component
 * @param {'primary'|'secondary'|'outline'|'text'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} fullWidth
 * @param {boolean} loading
 * @param {React.ReactNode} icon
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon = null,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const classNames = [
    'btn',
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
    fullWidth ? 'btn-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
