import { useState } from 'react';
import { tokens } from '../../styles/theme';

export const Card = ({ children, padding = 20, hover = false, onClick, accent = false, gradient = false, style = {} }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(180deg, rgba(46, 51, 90, 0) 0%, rgba(28, 27, 51, 0.2) 100%)',
        border: `1.5px solid ${accent ? 'rgba(172, 186, 253, 0.3)' : hovered && hover ? 'rgba(172, 186, 253, 0.25)' : 'rgba(172, 186, 253, 0.12)'}`,
        borderRadius: 32,
        padding,
        cursor: onClick ? 'pointer' : 'default',
        transition: tokens.transition.base,
        transform: hovered && hover ? 'translateY(-2px)' : 'none',
        boxShadow: hovered && hover
          ? '0 8px 32px rgba(2, 4, 9, 0.5), inset 0 0 43px rgba(204, 215, 255, 0.08)'
          : 'inset 0 0 43px rgba(204, 215, 255, 0.06)',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(1.35px)',
        ...style,
      }}
    >
      {/* Bottom blue glow */}
      <div style={{
        position: 'absolute',
        bottom: -50,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        height: 120,
        background: 'radial-gradient(ellipse at center, rgba(49, 72, 185, 0.35) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Bottom edge light */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '70%',
        height: 18,
        background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default Card;
