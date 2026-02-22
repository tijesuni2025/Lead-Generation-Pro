import React, { useState, useEffect } from 'react';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { c, r, tokens } from '../../styles/theme';
import { MOCK_USERS } from '../../components';

// Splash stages matching Figma frames:
// 0 = Frame 1597883180: Blue aurora background only
// 1 = Frame 1597883182: star icon + LEADGEN Pro + Powered by
// 2 = Frame 1597883183: + tagline
// 3 = Frame 1597883184: + copyright
// 4 = Frame 1597883185: Login form

const AuroraBackground = () => (
  <>
    <div style={{ position: 'fixed', inset: 0, background: '#020409' }} />
    <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(180deg, #0B1828 0%, #020409 60%)' }} />
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, height: '55%',
      background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(49,72,185,0.45) 0%, rgba(49,72,185,0.15) 40%, transparent 70%)',
    }} />
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, height: '70%',
      background: 'radial-gradient(ellipse 120% 50% at 50% 100%, rgba(49,72,185,0.12) 0%, transparent 60%)',
    }} />
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: -20, height: '20%',
      background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(100,140,255,0.2) 0%, transparent 60%)',
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

  // Splash animation (stages 0-3)
  if (stage < 4) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#020409', position: 'relative' }}>
        <AuroraBackground />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Star icon + LEADGEN Pro — horizontal row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            opacity: stage >= 1 ? 1 : 0,
            transform: stage >= 1 ? 'translateY(0)' : 'translateY(16px)',
            transition: `all 0.7s ${ease}`,
            marginBottom: 10,
          }}>
            <img src="/logo-white.png" alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <img src="/LEADGEN_Pro.svg" alt="LeadGen Pro" style={{ height: 24, objectFit: 'contain' }} />
          </div>
          {/* Powered by */}
          <div style={{
            opacity: stage >= 1 ? 0.45 : 0,
            transform: stage >= 1 ? 'translateY(0)' : 'translateY(10px)',
            transition: `all 0.6s ${ease} 0.15s`,
            marginBottom: stage >= 2 ? 60 : 0,
          }}>
            <img src="/Powered_by_BLUESTARAI.svg" alt="Powered by BluestarAI" style={{ height: 12, objectFit: 'contain' }} />
          </div>
          {/* Tagline */}
          <p style={{
            fontSize: 14, color: '#FFFFFF', fontFamily: tokens.font.sans, fontWeight: 300,
            letterSpacing: '0.03em',
            opacity: stage >= 2 ? 0.5 : 0,
            transform: stage >= 2 ? 'translateY(0)' : 'translateY(8px)',
            transition: `all 0.6s ${ease}`,
            marginBottom: 20,
          }}>AI-Powered Lead Management &amp; Analytics</p>
          {/* Copyright */}
          <p style={{
            fontSize: 11, color: '#FFFFFF', fontFamily: tokens.font.sans, fontWeight: 300,
            opacity: stage >= 3 ? 0.3 : 0,
            transform: stage >= 3 ? 'translateY(0)' : 'translateY(6px)',
            transition: `all 0.5s ${ease}`,
          }}>&copy; 2026 BLUESTARAI. All Rights Reserved.</p>
        </div>
      </div>
    );
  }

  // Login form (stage 4 — Frame 1597883185)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#020409', position: 'relative' }}>
      <AuroraBackground />
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 2, animation: 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF', marginBottom: 8, fontFamily: tokens.font.heading }}>Welcome back!</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', fontFamily: tokens.font.sans, fontWeight: 400 }}>Sign into LEADGEN Pro</p>
        </div>

        {/* Card — solid Dark Blue bg */}
        <div style={{
          padding: 32,
          background: '#0B1828',
          borderRadius: 20,
          border: '1px solid rgba(49,72,185,0.25)',
        }}>
          {/* User Switcher — gradient border container */}
          <div style={{
            marginBottom: 28,
            padding: 1,
            borderRadius: 14,
            background: 'linear-gradient(90deg, #3148B9, #7B3FA0, #F24C03)',
          }}>
            <div style={{
              display: 'flex',
              gap: 4,
              padding: 4,
              background: '#0B1828',
              borderRadius: 13,
            }}>
              {['client', 'admin'].map(type => (
                <button key={type} onClick={() => setLoginType(type)}
                  style={{
                    flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 500, textTransform: 'capitalize',
                    fontFamily: tokens.font.sans,
                    color: loginType === type ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                    background: loginType === type ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: 'none',
                    borderRadius: 10, cursor: 'pointer', transition: tokens.transition.fast,
                  }}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" icon={Lock} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

              {/* Remember me */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: tokens.font.sans }}>
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#3148B9', cursor: 'pointer' }} />
                Remember me
              </label>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 10, color: '#ef4444', fontSize: 13, fontFamily: tokens.font.sans }}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Sign in — gradient left-to-right (90deg) */}
              <button type="submit" disabled={loading} style={{
                width: '100%',
                padding: '14px 0',
                fontSize: 15,
                fontWeight: 600,
                fontFamily: tokens.font.sans,
                color: '#FFFFFF',
                background: 'linear-gradient(90deg, #3148B9 0%, #F24C03 100%)',
                border: 'none',
                borderRadius: 12,
                cursor: loading ? 'wait' : 'pointer',
                transition: tokens.transition.fast,
                opacity: loading ? 0.7 : 1,
                marginTop: 4,
              }}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: 24, padding: 16,
            background: 'rgba(2,4,9,0.4)',
            borderRadius: 12,
            border: '1px solid rgba(49,72,185,0.1)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontFamily: tokens.font.sans }}>Demo Credentials</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: tokens.font.mono }}>
              {loginType === 'admin' ? 'admin@bluestarai.world / admin123' : 'chris@azimont.com / client123'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, padding: '0 4px' }}>
          <img src="/Powered_by_BLUESTARAI.svg" alt="Powered by BluestarAI" style={{ height: 10, opacity: 0.3, objectFit: 'contain' }} />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: tokens.font.sans, fontWeight: 300 }}>&copy; 2026 BLUESTARAI. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};
