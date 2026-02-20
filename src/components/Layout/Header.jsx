import {Menu, Search, Bell, TrendingUp as TrendUp,} from 'lucide-react';
import React, { useState, useEffect } from 'react';
//import { Bell } from 'lucide-react';
import { Avatar } from '../UserProfile/Avatar';
import  StatusBadge from '../UI/StatusBadge';
import { MOCK_LEADS_BY_CLIENT } from '../../Data/Mocks';
import { c, r, tokens } from '../../styles/theme';

export const Header = ({ title, user, onMenuClick, onNavigate, onSelectLead }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [results, setResults] = useState([]);
  const leads = MOCK_LEADS_BY_CLIENT[user.id] || [];
  
  useEffect(() => {
    if (searchQuery.length > 1) {
      const q = searchQuery.toLowerCase();
      setResults(leads.filter(l => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)).slice(0, 5));
    } else setResults([]);
  }, [searchQuery, leads]);
  
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
      
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{ position: 'relative', padding: 9, background: c.gray[900], border: `1px solid ${c.gray[800]}`, borderRadius: r.lg, cursor: 'pointer', color: c.gray[400], transition: tokens.transition.fast }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = c.gray[700]}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = c.gray[800]}>
          <Bell size={18} />
          <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, background: c.accent.DEFAULT, borderRadius: '50%', boxShadow: `0 0 6px ${c.accent.DEFAULT}` }} />
        </button>
        
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