import React, { useState } from 'react';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { c, r, tokens } from '../../styles/theme';
import { MOCK_USERS, CONFIG } from '../../components';

export const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('client');

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: c.gray[950] }}>
      {/* Brand background gradients */}
      <div style={{ position: 'fixed', inset: 0, background: tokens.gradients.blueDark, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, background: `radial-gradient(ellipse at 30% 20%, rgba(49, 72, 185, 0.15) 0%, transparent 50%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, background: `radial-gradient(ellipse at 80% 80%, rgba(242, 76, 3, 0.08) 0%, transparent 50%)`, pointerEvents: 'none' }} />
      
      {/* Decorative 3D logo watermark */}
      <div style={{ position: 'fixed', top: '5%', right: '8%', width: 400, height: 400, opacity: 0.03, pointerEvents: 'none' }}>
        <img src="/Bluestar_Logo_3D_-_Copy_3-1536x695.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      
      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img src="/BluestarAI_Logo_Vertical_4x_2.svg" alt="BluestarAI" style={{ width: 80, height: 'auto', margin: '0 auto 12px', objectFit: 'contain' }} />
          <img src="/LEADGEN_Pro.svg" alt="LeadGen Pro" style={{ height: 20, margin: '0 auto 16px', objectFit: 'contain' }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, color: c.gray[100], marginBottom: 6, fontFamily: tokens.font.heading }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: c.gray[400], fontFamily: tokens.font.sans }}>Sign in to your workspace</p>
        </div>
        
        <Card padding={28} gradient style={{ border: `1px solid ${c.gray[700]}` }}>
          {/* Toggle */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, background: c.gray[850], borderRadius: r.lg, border: `1px solid ${c.gray[800]}` }}>
            {['client', 'admin'].map(type => (
              <button key={type} onClick={() => setLoginType(type)}
                style={{
                  flex: 1, padding: '9px 0', fontSize: 14, fontWeight: 500, textTransform: 'capitalize',
                  fontFamily: tokens.font.sans,
                  color: loginType === type ? c.gray[100] : c.gray[500],
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
            <p style={{ fontSize: 11, fontWeight: 600, color: c.gray[500], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, fontFamily: tokens.font.sans }}>Demo Credentials</p>
            <p style={{ fontSize: 13, color: c.gray[400], fontFamily: tokens.font.mono }}>
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