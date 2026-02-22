import { Menu, Search, Bell, Shield, Lightbulb, Settings, X } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '../UserProfile/Avatar';
import StatusBadge from '../UI/StatusBadge';
import { MOCK_LEADS_BY_CLIENT } from '../../Data/Mocks';
import { c, r, tokens } from '../../styles/theme';

export const Header = ({ title, user, onMenuClick, onNavigate, onSelectLead }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const leads = MOCK_LEADS_BY_CLIENT[user.id] || [];

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'sequence', title: 'Sequence step completed', message: 'Email sent to Sarah Chen - Enterprise Outreach Step 2', time: '2 min ago', read: false },
    { id: 2, type: 'lead', title: 'New lead reply', message: 'Michael Foster replied to your follow-up email', time: '15 min ago', read: false },
    { id: 3, type: 'meeting', title: 'Upcoming meeting', message: 'Discovery Call with Vertex Partners in 30 minutes', time: '30 min ago', read: false },
    { id: 4, type: 'system', title: 'Calendar synced', message: 'Google Calendar sync completed - 3 new events imported', time: '1 hour ago', read: true },
    { id: 5, type: 'lead', title: 'Lead status changed', message: 'Emily Davis moved to "Hot" status by AI scoring', time: '2 hours ago', read: true },
    { id: 6, type: 'compliance', title: 'DNC list updated', message: '2 new numbers added to Do Not Call list', time: '3 hours ago', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (searchQuery.length > 1) {
      const q = searchQuery.toLowerCase();
      setResults(leads.filter(l => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)).slice(0, 5));
    } else setResults([]);
  }, [searchQuery, leads]);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const notifColors = {
    sequence: c.primary.DEFAULT,
    lead: c.accent.DEFAULT,
    meeting: '#8B5CF6',
    system: c.success.DEFAULT,
    compliance: c.warning.DEFAULT,
  };

  const HeaderIconButton = ({ icon: Icon, label, onClick, active }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={label}
        style={{
          padding: 9,
          background: active ? c.primary[100] : c.gray[900],
          border: `1px solid ${active ? c.primary.DEFAULT : hovered ? c.gray[700] : c.gray[800]}`,
          borderRadius: r.lg,
          cursor: 'pointer',
          color: active ? c.primary.light : hovered ? c.gray[200] : c.gray[400],
          transition: tokens.transition.fast,
          position: 'relative',
        }}
      >
        <Icon size={18} />
      </button>
    );
  };

  return (
    <header style={{
      height: 64, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 20,
      background: `linear-gradient(90deg, ${c.gray[950]} 0%, ${c.gray[900]} 100%)`,
      borderBottom: `1px solid ${c.gray[800]}`,
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <button onClick={onMenuClick} style={{ padding: 8, background: 'transparent', border: 'none', borderRadius: r.md, cursor: 'pointer', color: c.gray[400] }} className="lg-hidden">
        <Menu size={22} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], letterSpacing: '-0.01em', fontFamily: tokens.font.heading }}>{title}</h1>
        <div style={{ width: 1, height: 20, background: c.gray[800] }} />
        <img src="/LEADGEN_Pro.svg" alt="LeadGen Pro" style={{ height: 14, opacity: 0.4, objectFit: 'contain' }} />
      </div>

      {/* Search */}
      {user.role === 'client' && (
        <div style={{ flex: 1, maxWidth: 360, position: 'relative', marginLeft: 24 }} className="search-desktop">
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: searchFocused ? c.primary.light : c.gray[500], transition: tokens.transition.fast }} />
          <input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            style={{
              width: '100%', padding: '9px 12px 9px 40px', fontSize: 14, color: c.gray[100],
              fontFamily: tokens.font.sans,
              background: c.gray[900], border: `1px solid ${searchFocused ? c.primary.DEFAULT : c.gray[800]}`,
              borderRadius: r.lg, outline: 'none', transition: tokens.transition.fast,
              boxShadow: searchFocused ? `0 0 0 3px ${c.primary[100]}` : 'none',
            }}
          />
          {searchFocused && results.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
              background: c.gray[900], border: `1px solid ${c.gray[700]}`, borderRadius: r.lg,
              boxShadow: tokens.shadow.lg, overflow: 'hidden', zIndex: 100,
            }}>
              {results.map(lead => (
                <button key={lead.id} onClick={() => { onSelectLead?.(lead); onNavigate?.('leads'); setSearchQuery(''); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: tokens.transition.fast }}
                  onMouseEnter={(e) => e.currentTarget.style.background = c.gray[850]}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Avatar name={lead.name} size={32} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[100], fontFamily: tokens.font.sans }}>{lead.name}</p>
                    <p style={{ fontSize: 12, color: c.gray[500], fontFamily: tokens.font.sans }}>{lead.company}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative', padding: 9,
              background: showNotifications ? c.primary[100] : c.gray[900],
              border: `1px solid ${showNotifications ? c.primary.DEFAULT : c.gray[800]}`,
              borderRadius: r.lg, cursor: 'pointer',
              color: showNotifications ? c.primary.light : c.gray[400],
              transition: tokens.transition.fast,
            }}
            onMouseEnter={(e) => { if (!showNotifications) e.currentTarget.style.borderColor = c.gray[700]; }}
            onMouseLeave={(e) => { if (!showNotifications) e.currentTarget.style.borderColor = c.gray[800]; }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 5, right: 5, minWidth: 16, height: 16,
                background: c.accent.DEFAULT, borderRadius: '50%',
                boxShadow: `0 0 6px ${c.accent.DEFAULT}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 600, color: '#fff',
              }}>{unreadCount}</span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 380,
              background: c.gray[900], border: `1px solid ${c.gray[700]}`, borderRadius: 20,
              boxShadow: '0 12px 40px rgba(2, 4, 9, 0.6)', overflow: 'hidden', zIndex: 100,
            }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: 12, color: c.primary.DEFAULT, background: 'none', border: 'none', cursor: 'pointer' }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center' }}>
                    <Bell size={24} style={{ color: c.gray[600], marginBottom: 8 }} />
                    <p style={{ fontSize: 13, color: c.gray[500] }}>No notifications</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      style={{
                        padding: '14px 20px', display: 'flex', gap: 12, cursor: 'pointer',
                        background: n.read ? 'transparent' : c.primary[50],
                        borderBottom: `1px solid ${c.gray[850]}`,
                        transition: tokens.transition.fast,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = c.gray[850]}
                      onMouseLeave={(e) => e.currentTarget.style.background = n.read ? 'transparent' : c.primary[50]}
                    >
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                        background: n.read ? c.gray[700] : (notifColors[n.type] || c.gray[400]),
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: n.read ? 400 : 500, color: c.gray[200], marginBottom: 2 }}>{n.title}</p>
                        <p style={{ fontSize: 12, color: c.gray[500], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.message}</p>
                        <p style={{ fontSize: 11, color: c.gray[600], marginTop: 4 }}>{n.time}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                        style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <X size={14} style={{ color: c.gray[600] }} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Security */}
        <HeaderIconButton icon={Shield} label="Security Center" onClick={() => onNavigate?.('security')} />
        {/* Help */}
        <HeaderIconButton icon={Lightbulb} label="Help Center" onClick={() => onNavigate?.('help')} />
        {/* Settings */}
        <HeaderIconButton icon={Settings} label="Settings" onClick={() => onNavigate?.('settings')} />

        <div style={{ width: 1, height: 24, background: c.gray[800], margin: '0 4px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 12px 5px 5px', background: c.gray[900], border: `1px solid ${c.gray[800]}`, borderRadius: r.lg }} className="user-desktop">
          <Avatar name={user.name} size={30} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[200], fontFamily: tokens.font.sans }}>{user.name.split(' ')[0]}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
