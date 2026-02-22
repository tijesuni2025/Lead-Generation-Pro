import { useState, useMemo } from 'react';
import { Search, User, Bell, Users, Lock, Linkedin, Mail, MessageSquare, Settings, Plus, Check } from 'lucide-react';
import { Card } from './UI/Card';
import { Button } from './UI/Button';
import { fuzzySearch } from '../utils/fuzzySearch';
import { UserOrgAvatar } from './UserProfile/Avatar';
import { Input } from './UI/Input';
import { tokens, r, c } from '../styles/theme';
import { CONFIG } from '../utils/CONFIG';
import { Avatar } from './UserProfile/Avatar';
export const SettingsPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settingsSearch, setSettingsSearch] = useState('');
  
  // Notification Settings State
  const [notifications, setNotifications] = useState({
    // Email Notifications
    email: {
      newLead: true,
      leadScoreChange: true,
      sequenceComplete: true,
      dailyDigest: true,
      weeklyReport: true,
      complianceAlerts: true,
      integrationErrors: false,
      teamActivity: false,
    },
    // SMS Notifications
    sms: {
      hotLeadAlert: true,
      sequenceReply: true,
      meetingBooked: true,
      urgentOnly: false,
    },
    // In-App Notifications
    inApp: {
      allActivity: true,
      mentionsOnly: false,
    },
  });
  
  // User Roles State
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Chris Garcia', email: 'chris@azimontgroup.com', role: 'owner', avatar: 'CG', status: 'active', lastActive: '2025-01-27' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@azimontgroup.com', role: 'admin', avatar: 'SJ', status: 'active', lastActive: '2025-01-26' },
    { id: 3, name: 'Mike Davis', email: 'mike@azimontgroup.com', role: 'member', avatar: 'MD', status: 'active', lastActive: '2025-01-25' },
    { id: 4, name: 'Lisa Chen', email: 'lisa@azimontgroup.com', role: 'viewer', avatar: 'LC', status: 'invited', lastActive: null },
  ]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  
  // Enhanced Profile State
  const [profile, setProfile] = useState({
    name: user.name || 'User',
    email: user.email || 'user@example.com',
    company: user.company || '',
    phone: '',
    timezone: 'America/New_York',
    // New fields
    jobTitle: '',
    department: '',
    location: '',
    linkedIn: '',
    bio: '',
    avatar: null,
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
  });
  
  // All searchable settings items for fuzzy search
  const allSettings = useMemo(() => [
    { id: 'profile', label: 'Profile Settings', description: 'Name, email, company, phone, timezone', tab: 'profile', keywords: ['name', 'email', 'avatar', 'photo', 'picture', 'personal'] },
    { id: 'job', label: 'Job Information', description: 'Title, department, location', tab: 'profile', keywords: ['job', 'title', 'department', 'work', 'position', 'location'] },
    { id: 'preferences', label: 'Preferences', description: 'Language, date format, currency', tab: 'profile', keywords: ['language', 'date', 'format', 'currency', 'locale'] },
    { id: 'email-notif', label: 'Email Notifications', description: 'Lead alerts, digests, reports', tab: 'notifications', keywords: ['email', 'alerts', 'digest', 'report', 'notification'] },
    { id: 'sms-notif', label: 'SMS Notifications', description: 'Hot leads, meetings, urgent alerts', tab: 'notifications', keywords: ['sms', 'text', 'phone', 'mobile', 'urgent'] },
    { id: 'team', label: 'Team Management', description: 'Invite users, manage roles', tab: 'team', keywords: ['team', 'invite', 'users', 'members', 'roles', 'permissions'] },
    { id: 'password', label: 'Password & Security', description: 'Change password, 2FA, sessions', tab: 'security', keywords: ['password', 'security', '2fa', 'authentication', 'sessions', 'login'] },
    { id: 'api', label: 'API Access', description: 'API keys, webhooks', tab: 'security', keywords: ['api', 'key', 'webhook', 'integration', 'developer'] },
  ], []);
  
  const filteredSettings = useMemo(() => {
    if (!settingsSearch.trim()) return [];
    return fuzzySearch(settingsSearch, allSettings, ['label', 'description', 'keywords']);
  }, [settingsSearch, allSettings]);
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team & Roles', icon: Users },
  ];
  
  const rolePermissions = {
    owner: { label: 'Owner', color: c.primary.DEFAULT, permissions: ['Full access', 'Billing', 'Delete account', 'Manage all users'] },
    admin: { label: 'Admin', color: c.success.DEFAULT, permissions: ['Manage users', 'All leads', 'Sequences', 'Integrations', 'Compliance'] },
    member: { label: 'Member', color: c.warning.DEFAULT, permissions: ['View leads', 'Run sequences', 'AI Assistant', 'Export data'] },
    viewer: { label: 'Viewer', color: c.gray[500], permissions: ['View leads', 'View reports', 'Read-only access'] },
  };
  
  const handleNotificationChange = (category, key) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
  };
  
  const handleInviteUser = () => {
    if (inviteEmail.trim()) {
      const newMember = {
        id: Date.now(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        avatar: inviteEmail.substring(0, 2).toUpperCase(),
        status: 'invited',
        lastActive: null,
      };
      setTeamMembers(prev => [...prev, newMember]);
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteModal(false);
    }
  };
  
  const handleRoleChange = (memberId, newRole) => {
    setTeamMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
  };
  
  const handleRemoveMember = (memberId) => {
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
  };
  
  const NotificationToggle = ({ label, description, checked, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${c.gray[850]}` }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, color: c.gray[200], marginBottom: 2 }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: c.gray[500] }}>{description}</p>}
      </div>
      <button
        onClick={onChange}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: checked ? c.primary.DEFAULT : c.gray[700],
          position: 'relative', transition: tokens.transition.fast,
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          transition: tokens.transition.fast,
        }} />
      </button>
    </div>
  );
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header with Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: c.gray[100], marginBottom: 4, fontFamily: tokens.font.heading }}>Settings</h1>
          <p style={{ fontSize: 14, color: c.gray[500] }}>Manage your account, notifications, and team</p>
        </div>
        
        {/* Settings Search */}
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: c.gray[500] }} />
          <input
            placeholder="Search settings..."
            value={settingsSearch}
            onChange={(e) => setSettingsSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 40px', fontSize: 14, color: c.gray[100],
              background: c.gray[900], border: `1px solid ${c.gray[800]}`, borderRadius: r.lg, outline: 'none',
            }}
          />
          
          {/* Search Results Dropdown */}
          {filteredSettings.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
              background: c.gray[900], border: `1px solid ${c.gray[700]}`, borderRadius: r.lg,
              boxShadow: tokens.shadow.lg, overflow: 'hidden', zIndex: 100,
            }}>
              {filteredSettings.map(setting => (
                <button
                  key={setting.id}
                  onClick={() => { setActiveTab(setting.tab); setSettingsSearch(''); }}
                  style={{
                    width: '100%', display: 'flex', flexDirection: 'column', gap: 2,
                    padding: '12px 14px', background: 'transparent', border: 'none',
                    textAlign: 'left', cursor: 'pointer', transition: tokens.transition.fast,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = c.gray[850]}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 14, color: c.gray[200], fontWeight: 500 }}>{setting.label}</span>
                  <span style={{ fontSize: 12, color: c.gray[500] }}>{setting.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* User Profile Card with Org Avatar */}
      <Card style={{ background: tokens.gradients.brandSubtle }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <UserOrgAvatar userName={profile.name} orgName={profile.company} userSize={56} />
          <div style={{ flex: 1, marginLeft: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>{profile.name}</h2>
            <p style={{ fontSize: 14, color: c.gray[400] }}>{profile.email}</p>
            {profile.company && <p style={{ fontSize: 13, color: c.gray[500], marginTop: 2 }}>{profile.company}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ padding: '4px 10px', background: c.primary[100], borderRadius: r.full, fontSize: 12, color: c.primary.light, fontWeight: 500 }}>
              {user.role === 'admin' ? 'Administrator' : 'Client'}
            </span>
          </div>
        </div>
      </Card>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: c.gray[900], borderRadius: r.lg, width: 'fit-content' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', fontSize: 14, fontWeight: 500, border: 'none', borderRadius: r.md, cursor: 'pointer',
              color: activeTab === tab.id ? c.gray[100] : c.gray[500],
              background: activeTab === tab.id ? c.gray[800] : 'transparent',
              transition: tokens.transition.fast,
            }}>
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Profile Tab - Enhanced */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 20, fontFamily: tokens.font.heading }}>Personal Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input 
                label="Full Name" 
                value={profile.name} 
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input 
                label="Email Address" 
                value={profile.email} 
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input 
                label="Phone Number" 
                value={profile.phone} 
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
              />
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[400], marginBottom: 6 }}>Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  style={{
                    width: '100%', padding: '11px 12px', fontSize: 14, color: c.gray[100],
                    background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md,
                    outline: 'none', resize: 'vertical', fontFamily: tokens.font.sans,
                  }}
                />
              </div>
            </div>
          </Card>
          
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 20, fontFamily: tokens.font.heading }}>Work Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input 
                label="Company" 
                value={profile.company} 
                onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
              />
              <Input 
                label="Job Title" 
                value={profile.jobTitle} 
                onChange={(e) => setProfile(prev => ({ ...prev, jobTitle: e.target.value }))}
                placeholder="e.g., Sales Manager"
              />
              <Input 
                label="Department" 
                value={profile.department} 
                onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                placeholder="e.g., Sales"
              />
              <Input 
                label="Location" 
                value={profile.location} 
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
              />
              <Input 
                label="LinkedIn Profile" 
                value={profile.linkedIn} 
                onChange={(e) => setProfile(prev => ({ ...prev, linkedIn: e.target.value }))}
                placeholder="https://linkedin.com/in/username"
                icon={Linkedin}
              />
            </div>
          </Card>
          
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 20, fontFamily: tokens.font.heading }}>Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[400], marginBottom: 6 }}>Timezone</label>
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                  style={{ width: '100%', padding: '11px 12px', fontSize: 14, color: c.gray[100], background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, outline: 'none' }}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[400], marginBottom: 6 }}>Language</label>
                <select
                  value={profile.language}
                  onChange={(e) => setProfile(prev => ({ ...prev, language: e.target.value }))}
                  style={{ width: '100%', padding: '11px 12px', fontSize: 14, color: c.gray[100], background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, outline: 'none' }}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[400], marginBottom: 6 }}>Date Format</label>
                <select
                  value={profile.dateFormat}
                  onChange={(e) => setProfile(prev => ({ ...prev, dateFormat: e.target.value }))}
                  style={{ width: '100%', padding: '11px 12px', fontSize: 14, color: c.gray[100], background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, outline: 'none' }}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[400], marginBottom: 6 }}>Currency</label>
                <select
                  value={profile.currency}
                  onChange={(e) => setProfile(prev => ({ ...prev, currency: e.target.value }))}
                  style={{ width: '100%', padding: '11px 12px', fontSize: 14, color: c.gray[100], background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, outline: 'none' }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
            </div>
          </Card>
          
          {/* Account Status Card */}
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 20, fontFamily: tokens.font.heading }}>Account Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${c.gray[850]}` }}>
                <span style={{ fontSize: 14, color: c.gray[400] }}>Plan</span>
                <span style={{ fontSize: 14, color: c.primary.light, fontWeight: 500 }}>Professional</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${c.gray[850]}` }}>
                <span style={{ fontSize: 14, color: c.gray[400] }}>Role</span>
                <span style={{ fontSize: 14, color: c.gray[200], fontWeight: 500 }}>{user.role === 'admin' ? 'Administrator' : 'Client'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${c.gray[850]}` }}>
                <span style={{ fontSize: 14, color: c.gray[400] }}>Member Since</span>
                <span style={{ fontSize: 14, color: c.gray[200] }}>January 2025</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ fontSize: 14, color: c.gray[400] }}>Version</span>
                <span style={{ fontSize: 14, color: c.gray[500] }}>{CONFIG.version}</span>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <Button variant="primary" fullWidth>Save Changes</Button>
            </div>
          </Card>
        </div>
      )}
      
      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Email Notifications */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Mail size={20} style={{ color: c.primary.DEFAULT }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>Email Notifications</h3>
            </div>
            <NotificationToggle 
              label="New Lead Alerts"
              description="Get notified when new leads are added"
              checked={notifications.email.newLead}
              onChange={() => handleNotificationChange('email', 'newLead')}
            />
            <NotificationToggle 
              label="Lead Score Changes"
              description="When a lead moves to Hot status"
              checked={notifications.email.leadScoreChange}
              onChange={() => handleNotificationChange('email', 'leadScoreChange')}
            />
            <NotificationToggle 
              label="Sequence Completions"
              description="When a lead finishes a sequence"
              checked={notifications.email.sequenceComplete}
              onChange={() => handleNotificationChange('email', 'sequenceComplete')}
            />
            <NotificationToggle 
              label="Daily Digest"
              description="Summary of daily activity at 9 AM"
              checked={notifications.email.dailyDigest}
              onChange={() => handleNotificationChange('email', 'dailyDigest')}
            />
            <NotificationToggle 
              label="Weekly Performance Report"
              description="Detailed analytics every Monday"
              checked={notifications.email.weeklyReport}
              onChange={() => handleNotificationChange('email', 'weeklyReport')}
            />
            <NotificationToggle 
              label="Compliance Alerts"
              description="DNC violations, consent expirations"
              checked={notifications.email.complianceAlerts}
              onChange={() => handleNotificationChange('email', 'complianceAlerts')}
            />
            <NotificationToggle 
              label="Integration Errors"
              description="CRM sync failures, API issues"
              checked={notifications.email.integrationErrors}
              onChange={() => handleNotificationChange('email', 'integrationErrors')}
            />
            <NotificationToggle 
              label="Team Activity"
              description="Actions by team members"
              checked={notifications.email.teamActivity}
              onChange={() => handleNotificationChange('email', 'teamActivity')}
            />
          </Card>
          
          {/* SMS Notifications */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <MessageSquare size={20} style={{ color: c.success.DEFAULT }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>SMS Notifications</h3>
            </div>
            <p style={{ fontSize: 12, color: c.gray[500], marginBottom: 16 }}>
              Receive critical alerts via text message. Standard rates may apply.
            </p>
            <NotificationToggle 
              label="Hot Lead Alerts"
              description="Instant SMS when a lead becomes hot"
              checked={notifications.sms.hotLeadAlert}
              onChange={() => handleNotificationChange('sms', 'hotLeadAlert')}
            />
            <NotificationToggle 
              label="Sequence Replies"
              description="When a lead responds to outreach"
              checked={notifications.sms.sequenceReply}
              onChange={() => handleNotificationChange('sms', 'sequenceReply')}
            />
            <NotificationToggle 
              label="Meeting Booked"
              description="When a lead schedules a meeting"
              checked={notifications.sms.meetingBooked}
              onChange={() => handleNotificationChange('sms', 'meetingBooked')}
            />
            <NotificationToggle 
              label="Urgent Only Mode"
              description="Only receive critical alerts"
              checked={notifications.sms.urgentOnly}
              onChange={() => handleNotificationChange('sms', 'urgentOnly')}
            />
            
            <div style={{ marginTop: 16, padding: 12, background: c.gray[850], borderRadius: r.lg }}>
              <p style={{ fontSize: 13, color: c.gray[400], marginBottom: 8 }}>SMS Phone Number</p>
              <Input placeholder="+1 (555) 000-0000" />
            </div>
          </Card>
          
          {/* Quick Settings */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Settings size={20} style={{ color: c.warning.DEFAULT }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>Quick Settings</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button 
                onClick={() => setNotifications(prev => ({
                  email: Object.fromEntries(Object.keys(prev.email).map(k => [k, true])),
                  sms: Object.fromEntries(Object.keys(prev.sms).map(k => [k, true])),
                  inApp: prev.inApp,
                }))}
                style={{ padding: '12px 16px', background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.lg, textAlign: 'left', cursor: 'pointer' }}
              >
                <p style={{ fontSize: 14, color: c.gray[200] }}>Enable All Notifications</p>
                <p style={{ fontSize: 12, color: c.gray[500] }}>Turn on all email and SMS alerts</p>
              </button>
              <button 
                onClick={() => setNotifications(prev => ({
                  email: Object.fromEntries(Object.keys(prev.email).map(k => [k, false])),
                  sms: Object.fromEntries(Object.keys(prev.sms).map(k => [k, false])),
                  inApp: prev.inApp,
                }))}
                style={{ padding: '12px 16px', background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.lg, textAlign: 'left', cursor: 'pointer' }}
              >
                <p style={{ fontSize: 14, color: c.gray[200] }}>Mute All Notifications</p>
                <p style={{ fontSize: 12, color: c.gray[500] }}>Temporarily disable all alerts</p>
              </button>
              <button 
                onClick={() => setNotifications({
                  email: { newLead: true, leadScoreChange: true, sequenceComplete: false, dailyDigest: true, weeklyReport: true, complianceAlerts: true, integrationErrors: false, teamActivity: false },
                  sms: { hotLeadAlert: true, sequenceReply: true, meetingBooked: true, urgentOnly: false },
                  inApp: { allActivity: true, mentionsOnly: false },
                })}
                style={{ padding: '12px 16px', background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.lg, textAlign: 'left', cursor: 'pointer' }}
              >
                <p style={{ fontSize: 14, color: c.gray[200] }}>Reset to Defaults</p>
                <p style={{ fontSize: 12, color: c.gray[500] }}>Restore recommended settings</p>
              </button>
            </div>
          </Card>
        </div>
      )}
      
      {activeTab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100] }}>Team Members</h3>
                <p style={{ fontSize: 13, color: c.gray[500] }}>{teamMembers.length} members in your organization</p>
              </div>
              <Button icon={Plus} onClick={() => setShowInviteModal(true)}>Invite Member</Button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Member', 'Role', 'Status', 'Last Active', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: c.gray[500], textTransform: 'uppercase', borderBottom: `1px solid ${c.gray[800]}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map(member => (
                    <tr key={member.id}>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={member.name} size={36} />
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[100] }}>{member.name}</p>
                            <p style={{ fontSize: 12, color: c.gray[500] }}>{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}` }}>
                        {member.role === 'owner' ? (
                          <span style={{ padding: '4px 10px', borderRadius: r.full, fontSize: 12, background: `${rolePermissions[member.role].color}20`, color: rolePermissions[member.role].color }}>
                            {rolePermissions[member.role].label}
                          </span>
                        ) : (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            style={{ padding: '6px 10px', fontSize: 12, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[300], outline: 'none' }}
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        )}
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}` }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: r.full, fontSize: 11,
                          background: member.status === 'active' ? c.success.muted : c.warning.muted,
                          color: member.status === 'active' ? c.success.DEFAULT : c.warning.DEFAULT,
                          textTransform: 'capitalize'
                        }}>
                          {member.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}`, fontSize: 13, color: c.gray[500] }}>
                        {member.lastActive || 'Pending'}
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${c.gray[850]}` }}>
                        {member.role !== 'owner' && (
                          <button 
                            onClick={() => handleRemoveMember(member.id)}
                            style={{ padding: '4px 10px', fontSize: 12, background: c.error.muted, border: 'none', borderRadius: r.md, color: c.error.DEFAULT, cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Role Permissions */}
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: c.gray[100], marginBottom: 16 }}>Role Permissions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {Object.entries(rolePermissions).map(([role, info]) => (
                <div key={role} style={{ padding: 16, background: c.gray[850], borderRadius: r.lg, border: `1px solid ${c.gray[800]}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: info.color }} />
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: c.gray[200] }}>{info.label}</h4>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {info.permissions.map((perm, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.gray[400] }}>
                        <Check size={12} style={{ color: info.color }} />
                        {perm}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
      
      
      {showInviteModal && (
        <div onClick={() => setShowInviteModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100 }}>
          <Card onClick={(e) => e.stopPropagation()} padding={24} style={{ width: '100%', maxWidth: 420 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: c.gray[100], marginBottom: 16 }}>Invite Team Member</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input 
                label="Email Address" 
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
              />
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Role</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none' }}
                >
                  <option value="admin">Admin - Full access except billing</option>
                  <option value="member">Member - Standard access</option>
                  <option value="viewer">Viewer - Read-only access</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowInviteModal(false)}>Cancel</Button>
                <Button style={{ flex: 1 }} onClick={handleInviteUser}>Send Invite</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;