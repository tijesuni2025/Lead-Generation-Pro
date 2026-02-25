import React, { useMemo } from 'react';
import Card from '../UI/Card';
import { Avatar } from '../UserProfile/Avatar';
import StatusBadge from '../UI/StatusBadge';
import { fmt } from '../../utils/formatters';
import { tokens, r, c } from '../../styles/theme';
import { Users, Target, Activity, BarChart3, DollarSign, TrendingUp, Flame } from 'lucide-react';
import { MOCK_USERS, MOCK_LEADS_BY_CLIENT } from '../../Data/Mocks';
import StatCard from './StatCard';

// Reactive greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
};

const getFirstName = (fullName) => (fullName || '').split(' ')[0];

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

  const greeting = getGreeting();
  const firstName = getFirstName(user.name);

  if (isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Greeting Banner */}
        <Card>
          <div style={{ padding: '12px 8px' }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: c.gray[50], fontFamily: tokens.font.heading, margin: 0 }}>
              {greeting}, {firstName}.
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6, fontFamily: tokens.font.sans }}>
              You have <span style={{ color: c.accent.DEFAULT, fontWeight: 600 }}>{stats.leads}</span> total leads across <span style={{ color: c.accent.DEFAULT, fontWeight: 600 }}>{stats.clients}</span> clients.
            </p>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <StatCard label="Total Clients" value={stats.clients} icon={Users} currentVal={stats.clients} previousVal={Math.round(stats.clients * 0.85)} />
          <StatCard label="Total Leads" value={fmt.number(stats.leads)} icon={Target} currentVal={stats.leads} previousVal={Math.round(stats.leads * 0.88)} />
          <StatCard label="Active Leads" value={fmt.number(stats.active)} icon={Activity} currentVal={stats.active} previousVal={Math.round(stats.active * 0.9)} />
          <StatCard label="Pipeline Value" value={fmt.currency(stats.value)} icon={DollarSign} currentVal={stats.value} previousVal={Math.round(stats.value * 0.82)} />
        </div>

        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: c.gray[100], marginBottom: 16, fontFamily: tokens.font.heading }}>Active Clients</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOCK_USERS.clients.map(client => {
              const clientLeads = MOCK_LEADS_BY_CLIENT[client.id] || [];
              const hot = clientLeads.filter(l => l.status === 'Hot').length;
              return (
                <div key={client.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: 'rgba(46, 51, 90, 0.15)', borderRadius: r.lg, border: '1px solid rgba(172, 186, 253, 0.08)' }}>
                  <Avatar name={client.name} size={38} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100], fontFamily: tokens.font.sans }}>{client.name}</p>
                    <p style={{ fontSize: 13, color: c.gray[500], fontFamily: tokens.font.sans }}>{client.company}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: c.gray[200], fontFamily: tokens.font.sans }}>{clientLeads.length} leads</p>
                    <p style={{ fontSize: 12, color: c.hot.text, fontFamily: tokens.font.sans }}>{hot} hot</p>
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Greeting Banner */}
      <Card>
        <div style={{ padding: '12px 8px' }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: c.gray[50], fontFamily: tokens.font.heading, margin: 0 }}>
            {greeting}, {firstName}.
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6, fontFamily: tokens.font.sans }}>
            You have <span style={{ color: c.accent.DEFAULT, fontWeight: 600 }}>{stats.hot}</span> hot leads and <span style={{ color: c.accent.DEFAULT, fontWeight: 600 }}>{fmt.currency(stats.value)}</span> in your pipeline.
          </p>
        </div>
      </Card>

      {/* Data-driven Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <StatCard label="Total Leads" value={stats.total} icon={Target} currentVal={stats.total} previousVal={Math.round(stats.total * 0.91)} />
        <StatCard label="Hot Leads" value={stats.hot} icon={Flame} currentVal={stats.hot} previousVal={Math.round(stats.hot * 0.8)} />
        <StatCard label="Pipeline Value" value={fmt.currency(stats.value)} icon={DollarSign} currentVal={stats.value} previousVal={Math.round(stats.value * 0.87)} />
        <StatCard label="Avg Score" value={stats.avgScore} icon={TrendingUp} currentVal={stats.avgScore} previousVal={Math.round(stats.avgScore * 0.93)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Top Leads</h3>
            <span style={{ fontSize: 13, color: c.gray[500], fontFamily: tokens.font.sans }}>By score</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topLeads.map((lead, i) => (
              <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(46, 51, 90, 0.15)', borderRadius: r.lg }}>
                <span style={{
                  width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, borderRadius: 6, fontFamily: tokens.font.sans,
                  color: i < 3 ? c.primary.DEFAULT : c.gray[500],
                  background: i < 3 ? c.primary[100] : 'transparent',
                }}>{i + 1}</span>
                <Avatar name={lead.name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: tokens.font.sans }}>{lead.name}</p>
                  <p style={{ fontSize: 12, color: c.gray[500], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: tokens.font.sans }}>{lead.company}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 70, height: 6, background: 'rgba(172, 186, 253, 0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${lead.score}%`,
                      height: '100%',
                      background: lead.score >= 80 ? '#63D2A1' : lead.score >= 60 ? '#eab308' : '#ef4444',
                      borderRadius: 3,
                    }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: lead.score >= 80 ? '#63D2A1' : lead.score >= 60 ? '#eab308' : '#ef4444', minWidth: 30, fontFamily: tokens.font.heading }}>{lead.score}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>Recent Leads</h3>
            <span style={{ fontSize: 13, color: c.gray[500], fontFamily: tokens.font.sans }}>Last 7 days</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentLeads.map(lead => (
              <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(46, 51, 90, 0.15)', borderRadius: r.lg }}>
                <Avatar name={lead.name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: tokens.font.sans }}>{lead.name}</p>
                  <p style={{ fontSize: 12, color: c.gray[500], fontFamily: tokens.font.sans }}>{lead.source} · {fmt.date(lead.createdAt)}</p>
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
