import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { c, r, tokens } from '../../styles/theme';
import { MOCK_USERS, CONFIG } from '../../components';

// Splash animation stages matching Figma frames:
// 0 = Frame 1597883180: Blue aurora background only
// 1 = Frame 1597883182: LEADGEN Pro + Powered by BLUESTARAI centered
// 2 = Frame 1597883183: Star logo + LEADGEN Pro + Powered by + tagline (small)
// 3 = Frame 1597883184: Same but larger/more visible
// 4 = Frame 1597883185: Login form appears

const AuroraBackground = () => (
  <>
    <div style={{ position: 'fixed', inset: 0, background: '#020409', pointerEvents: 'none' }} />
    <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(180deg, #0B1828 0%, #020409 100%)', pointerEvents: 'none' }} />
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 40%, rgba(49, 72, 185, 0.25) 0%, transparent 60%)',
    }} />
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 30% 60%, rgba(49, 72, 185, 0.1) 0%, transparent 50%)',
    }} />
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 70% 30%, rgba(242, 76, 3, 0.06) 0%, transparent 50%)',
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

  // Splash animation timeline
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 800),   // Show LEADGEN Pro text
      setTimeout(() => setStage(2), 2000),   // Show star logo + tagline (small)
      setTimeout(() => setStage(3), 3200),   // Grow larger
      setTimeout(() => setStage(4), 4500),   // Transition to login form
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
      }}>
        <AuroraBackground />

        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}>
          {/* 3D Star logo - appears at stage 2, grows at stage 3 */}
          <div style={{
            opacity: stage >= 2 ? 1 : 0,
            transform: stage >= 3 ? 'scale(1.15)' : stage >= 2 ? 'scale(0.9)' : 'scale(0.7)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            marginBottom: stage >= 2 ? 24 : 0,
          }}>
            <img
              src="/Bluestar_Logo_3D_-_Copy_3-1536x695.svg"
              alt="BluestarAI"
              style={{ width: stage >= 3 ? 140 : 100, height: 'auto', objectFit: 'contain', transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </div>

          {/* LEADGEN Pro text - appears at stage 1 */}
          <div style={{
            opacity: stage >= 1 ? 1 : 0,
            transform: stage >= 1 ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            marginBottom: 20,
          }}>
            <img
              src="/LEADGEN_Pro.svg"
              alt="LeadGen Pro"
              style={{ height: stage >= 3 ? 28 : 22, objectFit: 'contain', transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </div>

          {/* Tagline - appears at stage 2 */}
          <p style={{
            fontSize: stage >= 3 ? 15 : 13,
            color: '#5a7194',
            fontFamily: tokens.font.sans,
            fontWeight: 400,
            letterSpacing: '0.04em',
            opacity: stage >= 2 ? 1 : 0,
            transform: stage >= 2 ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            marginBottom: 40,
          }}>
            AI-Powered Lead Management & Analytics
          </p>

          {/* Powered by BLUESTARAI - appears at stage 1 */}
          <div style={{
            opacity: stage >= 1 ? 0.4 : 0,
            transform: stage >= 1 ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
          }}>
            <img
              src="/Powered_by_BLUESTARAI.svg"
              alt="Powered by BluestarAI"
              style={{ height: 11, objectFit: 'contain' }}
            />
          </div>
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
      animation: 'fadeIn 0.6s ease-out',
    }}>
      <AuroraBackground />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: 400,
        position: 'relative',
        zIndex: 1,
        animation: 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img src="/Bluestar_Logo_3D_-_Copy_3-1536x695.svg" alt="BluestarAI" style={{ width: 80, height: 'auto', margin: '0 auto 12px', objectFit: 'contain' }} />
          <img src="/LEADGEN_Pro.svg" alt="LeadGen Pro" style={{ height: 20, margin: '0 auto 16px', objectFit: 'contain', display: 'block' }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#dce8f5', marginBottom: 6, fontFamily: tokens.font.heading }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: '#5a7194', fontFamily: tokens.font.sans }}>Sign in to your workspace</p>
        </div>

        <Card padding={28} gradient style={{ border: `1px solid ${c.gray[700]}` }}>
          {/* Toggle */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, background: c.gray[850], borderRadius: r.lg, border: `1px solid ${c.gray[800]}` }}>
            {['client', 'admin'].map(type => (
              <button key={type} onClick={() => setLoginType(type)}
                style={{
                  flex: 1, padding: '9px 0', fontSize: 14, fontWeight: 500, textTransform: 'capitalize',
                  fontFamily: tokens.font.sans,
                  color: loginType === type ? '#dce8f5' : '#5a7194',
                  background: loginType === type ? `linear-gradient(135deg, ${c.primary[100]} 0%, rgba(242, 76, 3, 0.05) 100%)` : 'transparent',
                  border: loginType === type ? `1px solid ${c.primary.DEFAULT}40` : '1px solid transparent',
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

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: c.error.muted, borderRadius: r.md, color: c.error.DEFAULT, fontSize: 13, fontFamily: tokens.font.sans }}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <Button type="submit" fullWidth loading={loading} variant="gradient" style={{ marginTop: 8 }}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>

          {/* Demo */}
          <div style={{ marginTop: 20, padding: 14, background: c.gray[850], borderRadius: r.lg, border: `1px solid ${c.gray[800]}` }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#5a7194', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, fontFamily: tokens.font.sans }}>Demo Credentials</p>
            <p style={{ fontSize: 13, color: '#5a7194', fontFamily: tokens.font.mono }}>
              {loginType === 'admin' ? 'admin@bluestarai.world / admin123' : 'chris@azimont.com / client123'}
            </p>
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <img src="/Powered_by_BLUESTARAI.svg" alt="Powered by BluestarAI" style={{ height: 11, opacity: 0.35, objectFit: 'contain' }} />
        </div>
      </div>
    </div>
  );
};
