import React from 'react';

/**
 * Reusable Card Component
 * @param {string} image
 * @param {string} badge
 * @param {string} title
 * @param {boolean} hoverable
 */
export default function Card({
  children,
  image,
  badge,
  title,
  hoverable = true,
  className = '',
  onClick,
  footer
}) {
  return (
    <div
      className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {image && (
        <div className="card-image-container">
          <img src={image} alt={title || 'Card media'} className="card-image" loading="lazy" />
          {badge && <span className="card-badge">{badge}</span>}
        </div>
      )}
      <div className="card-content">
        {title && <h3 className="card-title">{title}</h3>}
        {children}
        {footer && <div className="card-footer">{footer}</div>}
      </div>
    </div>
  );
}
