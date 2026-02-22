import React, { useState } from 'react';
import { LayoutDashboard, Users, Upload, BarChart3, Shield, Settings, Zap, CalendarDays, Brain, RefreshCw, CheckCircle2, Lightbulb, LogOut } from 'lucide-react';
import { UserOrgAvatar } from '../UserProfile/Avatar';
import { CONFIG } from '../../utils/CONFIG';
import { c, r, tokens } from '../../styles/theme';


export const Sidebar = ({ user, currentPage, setCurrentPage, onLogout, isOpen, onClose }) => {
  const isAdmin = user.role === 'admin';
  
  const navItems = isAdmin ? [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'upload', label: 'Import', icon: Upload },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'sequences', label: 'Sequences', icon: Zap },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'ai-insights', label: 'AI Assistant', icon: Brain },
    { id: 'integrations', label: 'Integrations', icon: RefreshCw },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle2 },
  ];

  const NavItem = ({ item }) => {
    const active = currentPage === item.id;
    const [hovered, setHovered] = useState(false);
    const Icon = item.icon;
    
    return (
      <button
        onClick={() => { setCurrentPage(item.id); onClose?.(); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', fontSize: 14, fontWeight: active ? 500 : 400,
          fontFamily: tokens.font.sans,
          color: active ? c.gray[100] : hovered ? c.gray[200] : c.gray[400],
          background: active ? `linear-gradient(135deg, ${c.primary[100]} 0%, rgba(242, 76, 3, 0.05) 100%)` : hovered ? c.gray[850] : 'transparent',
          border: 'none', 
          borderLeft: active ? `2px solid ${c.accent.DEFAULT}` : '2px solid transparent',
          borderRadius: `0 ${r.lg}px ${r.lg}px 0`, 
          cursor: 'pointer',
          transition: tokens.transition.fast, textAlign: 'left',
          marginLeft: -2,
        }}
      >
        <Icon size={20} style={{ color: active ? c.accent.DEFAULT : hovered ? c.gray[300] : c.gray[500], flexShrink: 0, transition: tokens.transition.fast }} />
        <span style={{ flex: 1 }}>{item.label}</span>
        {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.accent.DEFAULT, boxShadow: `0 0 8px ${c.accent.DEFAULT}` }} />}
      </button>
    );
  };

  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(2, 4, 9, 0.8)', backdropFilter: 'blur(4px)', zIndex: 40 }} className="lg-hidden" />}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 256,
        background: tokens.gradients.blueDark,
        borderRight: `1px solid ${c.gray[800]}`,
        display: 'flex', flexDirection: 'column', zIndex: 50,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: tokens.transition.base,
      }} className="sidebar">
        {/* Decorative gradient overlay */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: 200, background: tokens.gradients.blueRadial, pointerEvents: 'none' }} />
        
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${c.gray[800]}`, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/bluestar-icon.svg" alt="BluestarAI" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <img src="/LEADGEN_Pro.svg" alt="LeadGen Pro" style={{ height: 18, objectFit: 'contain' }} />
          </div>
        </div>
        
        {/* Nav */}
        <nav style={{ flex: 1, padding: 12, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
          <p style={{ padding: '8px 14px', fontSize: 11, fontWeight: 600, color: c.gray[600], textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: tokens.font.sans }}>
            {isAdmin ? 'Admin' : 'Workspace'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map(item => <NavItem key={item.id} item={item} />)}
          </div>
        </nav>
        
        {/* Powered by */}
        <div style={{ padding: '8px 16px 0', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <img src="/Powered_by_BLUESTARAI.svg" alt="Powered by BluestarAI" style={{ height: 10, opacity: 0.4, objectFit: 'contain' }} />
        </div>

        {/* Stacked avatar with org */}
        <div style={{ padding: 12, borderTop: `1px solid ${c.gray[800]}`, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: c.gray[850], borderRadius: r.lg, border: `1px solid ${c.gray[800]}` }}>
            <UserOrgAvatar userName={user.name} orgName={user.company} userSize={34} />
            <div style={{ flex: 1, minWidth: 0, marginLeft: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[200], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: tokens.font.sans }}>{user.name}</p>
              <p style={{ fontSize: 11, color: c.gray[500], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: tokens.font.sans }}>{user.company || 'Administrator'}</p>
            </div>
            <button onClick={onLogout} style={{ padding: 6, background: 'transparent', border: 'none', borderRadius: r.md, cursor: 'pointer', color: c.gray[500], transition: tokens.transition.fast }}
              onMouseEnter={(e) => { e.target.style.color = c.error.DEFAULT; e.target.style.background = c.error.muted; }}
              onMouseLeave={(e) => { e.target.style.color = c.gray[500]; e.target.style.background = 'transparent'; }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};