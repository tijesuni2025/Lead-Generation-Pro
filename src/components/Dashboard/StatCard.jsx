import { tokens } from '../../styles/theme';

export const StatCard = ({ label, value, icon: Icon, currentVal, previousVal }) => {

  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return '+0.0%';
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };
  const trend = calculateTrend(currentVal || 0, previousVal || 0);
  const isPositive = !trend.startsWith('-');

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(46, 51, 90, 0) 0%, rgba(28, 27, 51, 0.2) 100%)',
      borderRadius: 32,
      padding: '24px',
      border: '1.5px solid rgba(172, 186, 253, 0.12)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      minWidth: 0,
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      minHeight: 140,
      boxShadow: 'inset 0 0 43px rgba(204, 215, 255, 0.06)',
      backdropFilter: 'blur(1.35px)',
    }}>
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

      {/* Icon and stats */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative', zIndex: 1 }}>
        {/* Glassmorphic Icon container */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 14,
          background: 'linear-gradient(180deg, rgba(46, 51, 90, 0.5) 0%, rgba(28, 27, 51, 0.3) 100%)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid rgba(172, 186, 253, 0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Inner glow */}
          <div style={{
            position: 'absolute',
            bottom: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            height: 40,
            background: 'radial-gradient(ellipse at center, rgba(49, 72, 185, 0.5) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <Icon size={28} style={{ color: '#94a3b8', position: 'relative', zIndex: 1 }} />
        </div>

        {/* Label and value */}
        <div style={{ paddingTop: 4 }}>
          <p style={{
            fontSize: 14,
            color: '#94a3b8',
            marginBottom: 8,
            fontFamily: tokens.font.sans,
            fontWeight: 400,
          }}>{label}</p>
          <p style={{
            fontSize: 40,
            fontWeight: 600,
            color: '#ffffff',
            fontFamily: tokens.font.heading,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>{value}</p>
        </div>
      </div>

      {/* Trend indicator */}
      <div style={{
        textAlign: 'right',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 4,
        }}>
          {isPositive ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 12.5L10 7.5M10 7.5H6.25M10 7.5V11.25" stroke="#63D2A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 7.5L10 12.5M10 12.5H6.25M10 12.5V8.75" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span style={{
            fontSize: 15,
            fontWeight: 600,
            color: isPositive ? '#63D2A1' : '#ef4444',
          }}>{trend}</span>
        </div>
        <p style={{
          fontSize: 12,
          color: '#64748b',
          lineHeight: 1.3,
        }}>From Last<br/>Month</p>
      </div>
    </div>
  );
};

export default StatCard;
