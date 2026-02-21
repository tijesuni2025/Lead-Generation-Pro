import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { c, r, tokens } from '../../styles/theme';
import { MOCK_USERS, CONFIG } from '../../components';

// Splash animation stages matching Figma frames:
// 0 = Frame 1597883180: Blue aurora background only
// 1 = Frame 1597883182: star icon + LEADGEN Pro (horizontal) + Powered by BLUESTARAI
// 2 = Frame 1597883183: Same + "AI-Powered Lead Management & Analytics" tagline
// 3 = Frame 1597883184: Same + "© 2026 BLUESTARAI. All Rights Reserved."
// 4 = Frame 1597883185: Login form

// Aurora background: dark at top, bright blue glow at bottom horizon
const AuroraBackground = () => (
  <>
    {/* Base dark */}
    <div style={{ position: 'fixed', inset: 0, background: '#020409', pointerEvents: 'none' }} />
    {/* Top-to-bottom gradient: dark blue at top fading to darkest at bottom */}
    <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(180deg, #0B1828 0%, #020409 60%)', pointerEvents: 'none' }} />
    {/* Bottom horizon glow — bright blue concentrated at bottom center */}
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, height: '55%', pointerEvents: 'none',
      background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(49, 72, 185, 0.45) 0%, rgba(49, 72, 185, 0.15) 40%, transparent 70%)',
    }} />
    {/* Wider subtle blue spread */}
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, height: '70%', pointerEvents: 'none',
      background: 'radial-gradient(ellipse 120% 50% at 50% 100%, rgba(49, 72, 185, 0.12) 0%, transparent 60%)',
    }} />
    {/* Bright white-blue core at very bottom */}
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: -20, height: '20%', pointerEvents: 'none',
      background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(100, 140, 255, 0.2) 0%, transparent 60%)',
    }} />
  </>
);

export const LoginPage = ({ onLogin }) => {
  const [stage, setStage] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('client');
  const [rememberMe, setRememberMe] = useState(false);

  // Splash animation timeline
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 800),
      setTimeout(() => setStage(2), 2000),
      setTimeout(() => setStage(3), 3200),
      setTimeout(() => setStage(4), 4500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    if (loginType === 'admin' && email === MOCK_USERS.admin.email && password === MOCK_USERS.admin.password) {
      onLogin(MOCK_USERS.admin);
    } else if (loginType === 'client') {
      const client = MOCK_USERS.clients.find(c => c.email === email && c.password === password);
      if (client) onLogin(client);
      else setError('Invalid email or password');
    } else setError('Invalid credentials');
    setLoading(false);
  };

  const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

  // Stage 0-3: Splash animation
  if (stage < 4) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: '#020409',
        position: 'relative',
      }}>
        <AuroraBackground />

        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Row: star icon + LEADGEN Pro text — appears at stage 1 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: stage >= 3 ? 14 : 12,
            opacity: stage >= 1 ? 1 : 0,
            transform: stage >= 1 ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.9)',
            transition: `all 0.7s ${ease}`,
            marginBottom: 12,
          }}>
            <img
              src="/bluestar-icon.svg"
              alt=""
              style={{
                width: stage >= 3 ? 38 : 30,
                height: stage >= 3 ? 38 : 30,
                objectFit: 'contain',
                transition: `all 0.7s ${ease}`,
                filter: 'brightness(2)',
              }}
            />
            <img
              src="/LEADGEN_Pro.svg"
              alt="LeadGen Pro"
              style={{
                height: stage >= 3 ? 28 : 22,
                objectFit: 'contain',
                transition: `height 0.7s ${ease}`,
              }}
            />
          </div>

          {/* Powered by BLUESTARAI — appears at stage 1 */}
          <div style={{
            opacity: stage >= 1 ? 0.5 : 0,
            transform: stage >= 1 ? 'translateY(0)' : 'translateY(10px)',
            transition: `all 0.6s ${ease} 0.15s`,
            marginBottom: stage >= 2 ? 48 : 24,
          }}>
            <img
              src="/Powered_by_BLUESTARAI.svg"
              alt="Powered by BluestarAI"
              style={{ height: 11, objectFit: 'contain' }}
            />
          </div>

          {/* Tagline — appears at stage 2 */}
          <p style={{
            fontSize: 13,
            color: '#5a7194',
            fontFamily: tokens.font.sans,
            fontWeight: 400,
            letterSpacing: '0.03em',
            opacity: stage >= 2 ? 1 : 0,
            transform: stage >= 2 ? 'translateY(0)' : 'translateY(8px)',
            transition: `all 0.6s ${ease}`,
            marginBottom: 16,
          }}>
            AI-Powered Lead Management & Analytics
          </p>

          {/* Copyright — appears at stage 3 */}
          <p style={{
            fontSize: 11,
            color: '#3d5478',
            fontFamily: tokens.font.sans,
            fontWeight: 400,
            opacity: stage >= 3 ? 1 : 0,
            transform: stage >= 3 ? 'translateY(0)' : 'translateY(6px)',
            transition: `all 0.5s ${ease}`,
          }}>
            &copy; 2026 BLUESTARAI. All Rights Reserved.
          </p>
        </div>
      </div>
    );
  }

  // Stage 4: Login form (Frame 1597883185)
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: '#020409',
      position: 'relative',
    }}>
      <AuroraBackground />

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Decorative geometric star — bottom right */}
      <div style={{
        position: 'fixed',
        bottom: -40,
        right: -40,
        width: 320,
        height: 320,
        opacity: 0.04,
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        <img src="/Group_1597880443.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      <div style={{
        width: '100%',
        maxWidth: 420,
        position: 'relative',
        zIndex: 2,
        animation: 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Header text */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: 8,
            fontFamily: tokens.font.heading,
          }}>Welcome back!</h1>
          <p style={{
            fontSize: 15,
            color: '#5a7194',
            fontFamily: tokens.font.sans,
          }}>Sign into <span style={{ color: '#F24C03', fontWeight: 500 }}>LEADGEN Pro</span></p>
        </div>

        {/* Glass card */}
        <div style={{
          padding: 28,
          background: 'rgba(11, 24, 40, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 16,
          border: '1px solid rgba(49, 72, 185, 0.2)',
        }}>
          {/* Toggle */}
          <div style={{
            display: 'flex',
            gap: 4,
            marginBottom: 24,
            padding: 4,
            background: 'rgba(2, 4, 9, 0.5)',
            borderRadius: r.lg,
            border: '1px solid rgba(49, 72, 185, 0.15)',
          }}>
            {['client', 'admin'].map(type => (
              <button key={type} onClick={() => setLoginType(type)}
                style={{
                  flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 500, textTransform: 'capitalize',
                  fontFamily: tokens.font.sans,
                  color: loginType === type
                    ? (type === 'client' ? '#ffffff' : '#F24C03')
                    : '#5a7194',
                  background: loginType === type
                    ? (type === 'client' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(242, 76, 3, 0.1)')
                    : 'transparent',
                  border: loginType === type
                    ? `1px solid ${type === 'client' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(242, 76, 3, 0.2)'}`
                    : '1px solid transparent',
                  borderRadius: r.md, cursor: 'pointer', transition: tokens.transition.fast,
                }}>
                {type}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" icon={Lock} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

              {/* Remember me */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 13,
                color: '#5a7194',
                fontFamily: tokens.font.sans,
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: '#3148B9',
                    cursor: 'pointer',
                  }}
                />
                Remember me
              </label>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: c.error.muted, borderRadius: r.md, color: c.error.DEFAULT, fontSize: 13, fontFamily: tokens.font.sans }}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <Button type="submit" fullWidth loading={loading} variant="gradient" style={{ marginTop: 4 }}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>

          {/* Demo */}
          <div style={{
            marginTop: 20,
            padding: 14,
            background: 'rgba(2, 4, 9, 0.4)',
            borderRadius: r.lg,
            border: '1px solid rgba(49, 72, 185, 0.1)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#3d5478', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, fontFamily: tokens.font.sans }}>Demo Credentials</p>
            <p style={{ fontSize: 13, color: '#5a7194', fontFamily: tokens.font.mono }}>
              {loginType === 'admin' ? 'admin@bluestarai.world / admin123' : 'chris@azimont.com / client123'}
            </p>
          </div>
        </div>

        {/* Bottom footer bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 24,
          padding: '0 4px',
        }}>
          <img src="/Powered_by_BLUESTARAI.svg" alt="Powered by BluestarAI" style={{ height: 10, opacity: 0.35, objectFit: 'contain' }} />
          <p style={{ fontSize: 11, color: '#3d5478', fontFamily: tokens.font.sans }}>
            &copy; 2026 BLUESTARAI. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
