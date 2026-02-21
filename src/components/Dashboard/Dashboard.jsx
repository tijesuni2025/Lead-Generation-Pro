import React, { useMemo } from 'react';
import Card from '../UI/Card';
import  { Avatar } from '../UserProfile/Avatar';
import  StatusBadge from '../UI/StatusBadge';
import { fmt } from '../../utils/formatters';
import { tokens, r, c } from '../../styles/theme';
import { Users, Target, Activity, BarChart3, Flame } from 'lucide-react';
import { MOCK_USERS, MOCK_LEADS_BY_CLIENT } from '../../Data/Mocks';
import StatCard from './StatCard';
//import { CONFIG } from '../../utils/CONFIG';
import { Metric } from '../UI/Metric';

export const Dashboard = ({ user }) => {
  const isAdmin = user.role === 'admin';
  const leads = isAdmin ? [] : (MOCK_LEADS_BY_CLIENT[user.id] || []);
  
  const stats = useMemo(() => {
    if (isAdmin) {
      const all = Object.values(MOCK_LEADS_BY_CLIENT).flat();
      return { clients: MOCK_USERS.clients.length, leads: all.length, active: all.filter(l => l.status !== 'Cold').length, value: all.reduce((s, l) => s + l.value, 0) };
    }
    return {
      total: leads.length,
      hot: leads.filter(l => l.status === 'Hot').length,
      warm: leads.filter(l => l.status === 'Warm').length,
      cold: leads.filter(l => l.status === 'Cold').length,
      value: leads.reduce((s, l) => s + l.value, 0),
      avgScore: Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) || 0,
    };
  }, [isAdmin, leads]);
  
  const topLeads = useMemo(() => [...leads].sort((a, b) => b.score - a.score).slice(0, 5), [leads]);
  const recentLeads = useMemo(() => [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5), [leads]);

  // month-over-month change
  const lastMonthStats = useMemo(() => ({
    total: Math.round(stats.total * 0.969),
    value: Math.round(stats.value * 0.969),
    avgScore: Math.round(stats.avgScore * 0.969),
    hot: Math.round(stats.hot * 0.969),
  }), [stats]);

  if (isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <Metric label="Total Clients" value={stats.clients} icon={Users} iconColor={c.primary[100]} />
          <Metric label="Total Leads" value={fmt.number(stats.leads)} icon={Target} iconColor={c.success.muted} />
          <Metric label="Active Leads" value={fmt.number(stats.active)} icon={Activity} change="+12%" trend="up" />
          <Metric label="Pipeline Value" value={fmt.currency(stats.value)} icon={BarChart3} />
        </div>
        
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: c.gray[100], marginBottom: 16 }}>Active Clients</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOCK_USERS.clients.map(client => {
              const clientLeads = MOCK_LEADS_BY_CLIENT[client.id] || [];
              const hot = clientLeads.filter(l => l.status === 'Hot').length;
              return (
                <div key={client.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: c.gray[850], borderRadius: r.lg, border: `1px solid ${c.gray[800]}` }}>
                  <Avatar name={client.name} size={38} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100] }}>{client.name}</p>
                    <p style={{ fontSize: 13, color: c.gray[500] }}>{client.company}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: c.gray[200] }}>{clientLeads.length} leads</p>
                    <p style={{ fontSize: 12, color: c.hot.text }}>{hot} hot</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // Client Dashboard
  const greeting = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero banner */}
      <div style={{
        padding: '32px 40px',
        background: 'linear-gradient(135deg, #020617 0%, #0a1628 50%, #0c1e3d 100%)',
        borderRadius: 20,
        border: '1px solid #3148B9',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 180,
      }}>
        {/* Bottom glow effects */}
        <div style={{
          position: 'absolute',
          bottom: -60,
          left: '30%',
          width: '40%',
          height: 120,
          background: 'radial-gradient(ellipse at center bottom, rgba(49, 72, 185, 0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '35%',
          width: '30%',
          height: 30,
          background: 'radial-gradient(ellipse at center bottom, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute',
          right: 30,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src="/Group_1597880443.svg"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 40px rgba(49, 72, 185, 0.4))',
            }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontSize: 22,
            color: '#94a3b8',
            marginBottom: 8,
            fontFamily: tokens.font.sans,
            fontWeight: 400,
          }}>Good {greeting},</p>
          <h2 style={{
            fontSize: 52,
            fontWeight: 700,
            color: '#ffffff',
            fontFamily: tokens.font.heading,
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}>
            {user.name.split(' ')[0]}
          </h2>
          <p style={{
            fontSize: 16,
            color: '#64748b',
            fontFamily: tokens.font.sans,
          }}>Here's what's happening today</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <StatCard 
          label="Total Leads" 
          value={stats.total} 
          icon={Users}
          currentVal={stats.total}
          previousVal={lastMonthStats.total}
        />
        <StatCard 
          label="Pipelines Value" 
          value={fmt.currency(stats.value)} 
          icon={BarChart3}
          currentVal={stats.value}
          previousVal={lastMonthStats.value}
        />
        <StatCard 
          label="Average Score" 
          value={stats.avgScore} 
          icon={Target}
          currentVal={stats.avgScore}
          previousVal={lastMonthStats.avgScore}
        />
        <StatCard 
          label="Hot Leads" 
          value={stats.hot} 
          icon={Flame}
          currentVal={stats.hot}
          previousVal={lastMonthStats.hot}
        />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: c.gray[100] }}>Top Leads</h3>
            <span style={{ fontSize: 13, color: c.gray[500] }}>By score</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topLeads.map((lead, i) => (
              <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: c.gray[850], borderRadius: r.lg }}>
                <span style={{
                  width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, borderRadius: 6,
                  color: i < 3 ? c.primary.DEFAULT : c.gray[500],
                  background: i < 3 ? c.primary[100] : 'transparent',
                }}>{i + 1}</span>
                <Avatar name={lead.name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</p>
                  <p style={{ fontSize: 12, color: c.gray[500], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.company}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 70, height: 6, background: c.gray[800], borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${lead.score}%`, 
                      height: '100%', 
                      background: lead.score >= 80 ? '#63D2A1' : lead.score >= 60 ? '#eab308' : '#ef4444',
                      borderRadius: 3,
                    }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: lead.score >= 80 ? '#63D2A1' : lead.score >= 60 ? '#eab308' : '#ef4444', minWidth: 30 }}>{lead.score}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: c.gray[100] }}>Recent Leads</h3>
            <span style={{ fontSize: 13, color: c.gray[500] }}>Last 7 days</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentLeads.map(lead => (
              <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: c.gray[850], borderRadius: r.lg }}>
                <Avatar name={lead.name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</p>
                  <p style={{ fontSize: 12, color: c.gray[500] }}>{lead.source} · {fmt.date(lead.createdAt)}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};