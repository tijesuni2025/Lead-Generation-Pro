import {
  X, ChevronRight, ChevronLeft,
  Plus, Edit2, Trash2, Calendar, CalendarDays, Clock,
  Zap, RefreshCw, User, CheckCircle2,
  Video, MapPin
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { c, r, tokens } from '../../styles/theme';
import { ModalOverlay } from '../Layout/ModalOverlay';
import { sequenceEngine } from '../../services/sequenceService';
import { MOCK_LEADS_BY_CLIENT } from '../../Data/Mocks';

export const CalendarPage = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [connectedCalendars, setConnectedCalendars] = useState([
    { id: 'google-1', provider: 'google', email: 'chris@azimontgroup.com', name: 'Google Calendar', connected: true, primary: true, color: '#4285F4' },
  ]);

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'meeting',
    date: '',
    time: '09:00',
    duration: 30,
    lead: '',
    location: '',
    notes: '',
  });

  // Get leads for this user
  const userLeads = MOCK_LEADS_BY_CLIENT[user.id] || [];

  // Build sequence activity events from real sequence data tied to leads
  const sequenceEvents = useMemo(() => {
    const sequences = sequenceEngine.listSequences();
    const activeSequences = sequences.filter(s => s.status === 'active');
    const evts = [];
    const now = new Date();

    activeSequences.forEach((seq, seqIdx) => {
      const steps = seq.steps || [];
      steps.forEach((step, stepIdx) => {
        if (userLeads.length === 0) return;
        const lead = userLeads[(seqIdx * steps.length + stepIdx) % userLeads.length];
        const delayDays = step.delayDays || stepIdx * 2;

        const eventDate = new Date(now);
        eventDate.setDate(now.getDate() + delayDays + seqIdx);
        const baseHour = 8 + (stepIdx % 8);
        eventDate.setHours(baseHour, stepIdx % 2 === 0 ? 0 : 30, 0, 0);

        const channelLabel = (step.channel || 'email').charAt(0).toUpperCase() + (step.channel || 'email').slice(1);
        const channelColors = {
          email: c.primary.DEFAULT,
          linkedin: '#0A66C2',
          call: c.accent.DEFAULT,
          sms: '#10B981',
          task: c.warning.DEFAULT,
        };

        evts.push({
          id: `seq-${seq.id}-step-${step.id || stepIdx}`,
          type: 'sequence',
          title: `${channelLabel}: ${lead.name} - ${seq.name}`,
          lead: lead.name,
          leadCompany: lead.company,
          leadEmail: lead.email,
          sequence: seq.name,
          step: stepIdx + 1,
          totalSteps: steps.length,
          channel: step.channel || 'email',
          subject: step.subject || '',
          date: eventDate,
          duration: step.channel === 'call' ? 30 : step.channel === 'email' ? 5 : 10,
          color: channelColors[step.channel] || c.primary.DEFAULT,
          status: 'scheduled',
        });
      });
    });

    return evts;
  }, [userLeads]);

  // Manual events (meetings, tasks)
  const [manualEvents, setManualEvents] = useState(() => {
    const now = new Date();
    return [
      { id: 'meet-1', type: 'meeting', title: 'Discovery Call - Vertex Partners', lead: userLeads[0]?.name || 'Sophia Anderson', date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0), duration: 45, color: '#8B5CF6', location: 'Zoom', meetingLink: 'https://zoom.us/j/123456789' },
      { id: 'meet-2', type: 'meeting', title: 'Demo - TechFlow Inc', lead: userLeads[1]?.name || 'David Kim', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 15, 0), duration: 60, color: '#8B5CF6', location: 'Google Meet', meetingLink: 'https://meet.google.com/abc-defg-hij' },
      { id: 'meet-3', type: 'meeting', title: 'Proposal Review - NexGen', lead: userLeads[2]?.name || 'Rachel Green', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 11, 0), duration: 30, color: '#8B5CF6', location: 'Microsoft Teams' },
      { id: 'task-1', type: 'task', title: 'Send proposal to Stellar Corp', lead: userLeads[3]?.name || 'Mia Johnson', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 16, 0), duration: 30, color: c.warning.DEFAULT, priority: 'high' },
      { id: 'task-2', type: 'task', title: 'Prepare contract for TechFlow', lead: userLeads[1]?.name || 'David Kim', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 14, 0), duration: 60, color: c.warning.DEFAULT, priority: 'medium' },
    ];
  });

  // Combine all events
  const events = useMemo(() => [...sequenceEvents, ...manualEvents], [sequenceEvents, manualEvents]);

  // Calendar navigation
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const navigateWeek = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction * 7));
      return newDate;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days = [];

    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({ date, isCurrentMonth: true });
    }
    return days;
  };

  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const connectCalendar = async (provider) => {
    await new Promise(r => setTimeout(r, 1000));
    const newCal = {
      id: `${provider}-${Date.now()}`,
      provider,
      email: provider === 'google' ? 'user@gmail.com' : 'user@outlook.com',
      name: provider === 'google' ? 'Google Calendar' : 'Outlook Calendar',
      connected: true,
      primary: connectedCalendars.length === 0,
      color: provider === 'google' ? '#4285F4' : '#0078D4',
    };
    setConnectedCalendars(prev => [...prev, newCal]);
    setShowConnectModal(false);
  };

  const disconnectCalendar = (calendarId) => {
    setConnectedCalendars(prev => prev.filter(cal => cal.id !== calendarId));
  };

  // Create new event
  const handleCreateEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;

    const [year, month, day] = newEvent.date.split('-').map(Number);
    const [hours, minutes] = newEvent.time.split(':').map(Number);
    const eventDate = new Date(year, month - 1, day, hours, minutes);

    const typeColors = { meeting: '#8B5CF6', task: c.warning.DEFAULT };

    const created = {
      id: `user-${Date.now()}`,
      type: newEvent.type,
      title: newEvent.title,
      lead: newEvent.lead || '',
      date: eventDate,
      duration: Number(newEvent.duration),
      color: typeColors[newEvent.type] || '#8B5CF6',
      location: newEvent.location || '',
      notes: newEvent.notes || '',
      priority: newEvent.type === 'task' ? 'medium' : undefined,
    };

    setManualEvents(prev => [...prev, created]);
    setNewEvent({ title: '', type: 'meeting', date: '', time: '09:00', duration: 30, lead: '', location: '', notes: '' });
    setShowEventModal(false);
  };

  const handleDeleteEvent = (eventId) => {
    setManualEvents(prev => prev.filter(e => e.id !== eventId));
    setSelectedEvent(null);
  };

  const eventTypeIcons = { sequence: Zap, meeting: Video, task: CheckCircle2 };

  const todayEvents = getEventsForDay(new Date());
  const upcomingMeetings = events.filter(e => e.type === 'meeting' && new Date(e.date) >= new Date()).length;
  const pendingSequenceSteps = events.filter(e => e.type === 'sequence' && e.status === 'scheduled').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: "Today's Events", value: todayEvents.length, icon: CalendarDays, color: c.primary.DEFAULT },
          { label: 'Upcoming Meetings', value: upcomingMeetings, icon: Video, color: '#8B5CF6' },
          { label: 'Sequence Steps', value: pendingSequenceSteps, icon: Zap, color: c.accent.DEFAULT },
          { label: 'Connected Calendars', value: connectedCalendars.length, icon: RefreshCw, color: c.success.DEFAULT },
        ].map(stat => (
          <Card key={stat.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: r.lg, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div>
                <p style={{ fontSize: 24, fontWeight: 700, color: c.gray[100] }}>{stat.value}</p>
                <p style={{ fontSize: 12, color: c.gray[500] }}>{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Calendar Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button variant="secondary" onClick={goToToday}>Today</Button>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
              style={{ padding: 8, background: c.gray[800], border: 'none', borderRadius: r.md, cursor: 'pointer' }}>
              <ChevronLeft size={18} style={{ color: c.gray[400] }} />
            </button>
            <button onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)}
              style={{ padding: 8, background: c.gray[800], border: 'none', borderRadius: r.md, cursor: 'pointer' }}>
              <ChevronRight size={18} style={{ color: c.gray[400] }} />
            </button>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.gray[100], fontFamily: tokens.font.heading }}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', background: c.gray[800], borderRadius: r.md, padding: 2 }}>
            {['week', 'month'].map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                style={{
                  padding: '6px 14px', fontSize: 13, fontWeight: 500, border: 'none', borderRadius: r.sm, cursor: 'pointer',
                  background: viewMode === mode ? c.gray[700] : 'transparent',
                  color: viewMode === mode ? c.gray[100] : c.gray[500],
                }}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <Button variant="secondary" icon={RefreshCw} onClick={() => setShowConnectModal(true)}>Connect Calendar</Button>
          <Button icon={Plus} onClick={() => setShowEventModal(true)}>New Event</Button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: 20 }}>
        {/* Calendar Grid */}
        <Card padding={0} style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${c.gray[800]}` }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: c.gray[500], textTransform: 'uppercase' }}>{day}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {(viewMode === 'month' ? getMonthDays() : getWeekDays()).map((day, idx) => {
              const dayEvents = getEventsForDay(day.date);
              const today = isToday(day.date);
              return (
                <div key={idx} style={{
                  minHeight: viewMode === 'month' ? 100 : 400, padding: 6,
                  borderRight: (idx + 1) % 7 !== 0 ? `1px solid ${c.gray[850]}` : 'none',
                  borderBottom: `1px solid ${c.gray[850]}`,
                  background: today ? c.primary[50] : !day.isCurrentMonth ? c.gray[900] : 'transparent',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: r.full, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
                    background: today ? c.primary.DEFAULT : 'transparent',
                    color: today ? '#fff' : !day.isCurrentMonth ? c.gray[600] : c.gray[300],
                    fontSize: 13, fontWeight: today ? 600 : 400,
                  }}>{day.date.getDate()}</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayEvents.slice(0, viewMode === 'month' ? 3 : 10).map(event => {
                      const Icon = eventTypeIcons[event.type] || Calendar;
                      return (
                        <div key={event.id} onClick={() => setSelectedEvent(event)}
                          style={{
                            padding: '3px 6px', borderRadius: r.sm, fontSize: 11, cursor: 'pointer',
                            background: `${event.color}20`, borderLeft: `2px solid ${event.color}`,
                            color: c.gray[200], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                          <Icon size={10} style={{ color: event.color, flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatTime(event.date)} {event.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > (viewMode === 'month' ? 3 : 10) && (
                      <div style={{ fontSize: 10, color: c.gray[500], paddingLeft: 6 }}>+{dayEvents.length - (viewMode === 'month' ? 3 : 10)} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Today's Schedule */}
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[200], marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} style={{ color: c.primary.DEFAULT }} /> Today's Schedule
            </h3>
            {todayEvents.length === 0 ? (
              <p style={{ fontSize: 13, color: c.gray[500], textAlign: 'center', padding: 20 }}>No events scheduled for today</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {todayEvents.map(event => {
                  const Icon = eventTypeIcons[event.type] || Calendar;
                  return (
                    <div key={event.id} onClick={() => setSelectedEvent(event)}
                      style={{ display: 'flex', gap: 10, padding: 10, background: c.gray[850], borderRadius: r.md, cursor: 'pointer', border: `1px solid ${c.gray[800]}` }}>
                      <div style={{ width: 36, height: 36, borderRadius: r.md, background: `${event.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={18} style={{ color: event.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[200], marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</p>
                        <p style={{ fontSize: 11, color: c.gray[500] }}>{formatTime(event.date)} • {event.duration}min</p>
                        {event.lead && <p style={{ fontSize: 11, color: c.primary.DEFAULT, marginTop: 2 }}>{event.lead}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Connected Calendars */}
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[200], marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={16} style={{ color: c.success.DEFAULT }} /> Connected Calendars
            </h3>
            {connectedCalendars.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <p style={{ fontSize: 13, color: c.gray[500], marginBottom: 12 }}>No calendars connected</p>
                <Button size="sm" onClick={() => setShowConnectModal(true)}>Connect Calendar</Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {connectedCalendars.map(cal => (
                  <div key={cal.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: c.gray[850], borderRadius: r.md }}>
                    <div style={{ width: 32, height: 32, borderRadius: r.md, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cal.provider === 'google' ? '#4285F420' : '#0078D420' }}>
                      {cal.provider === 'google' ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#0078D4"><path d="M11.5 3v8.5H3V3h8.5zm0 9.5V21H3v-8.5h8.5zm1 0H21V21h-8.5v-8.5zm0-1V3H21v8.5h-8.5z"/></svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: c.gray[200] }}>{cal.name}</p>
                      <p style={{ fontSize: 11, color: c.gray[500], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cal.email}</p>
                    </div>
                    {cal.primary && <span style={{ padding: '2px 6px', fontSize: 10, fontWeight: 500, background: c.success.muted, color: c.success.DEFAULT, borderRadius: r.sm }}>Primary</span>}
                    <button onClick={() => disconnectCalendar(cal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={14} style={{ color: c.gray[500] }} /></button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Event Legend */}
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: c.gray[200], marginBottom: 12 }}>Event Types</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { type: 'Sequence Activity', color: c.primary.DEFAULT, icon: Zap },
                { type: 'Meeting', color: '#8B5CF6', icon: Video },
                { type: 'Task/Follow-up', color: c.warning.DEFAULT, icon: CheckCircle2 },
              ].map(item => (
                <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
                  <item.icon size={14} style={{ color: c.gray[500] }} />
                  <span style={{ fontSize: 12, color: c.gray[400] }}>{item.type}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Create New Event Modal */}
      {showEventModal && (
        <ModalOverlay onClose={() => setShowEventModal(false)} maxWidth={500}>
          <Card padding={0}>
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100] }}>Create New Event</h2>
              <button onClick={() => setShowEventModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} style={{ color: c.gray[500] }} /></button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Event Title</label>
                <input placeholder="e.g., Discovery Call with Acme Corp" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Event Type</label>
                <select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[200], outline: 'none' }}>
                  <option value="meeting">Meeting</option>
                  <option value="task">Task / Follow-up</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Date</label>
                  <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Time</label>
                  <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Duration</label>
                <select value={newEvent.duration} onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[200], outline: 'none' }}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Associated Lead (optional)</label>
                <select value={newEvent.lead} onChange={(e) => setNewEvent({ ...newEvent, lead: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[200], outline: 'none' }}>
                  <option value="">-- Select Lead --</option>
                  {userLeads.map(lead => (
                    <option key={lead.id} value={lead.name}>{lead.name} - {lead.company}</option>
                  ))}
                </select>
              </div>
              {newEvent.type === 'meeting' && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Location / Meeting Link</label>
                  <input placeholder="e.g., Zoom, Google Meet, or a link" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: c.gray[300], marginBottom: 6 }}>Notes (optional)</label>
                <textarea placeholder="Add any notes or agenda items..." value={newEvent.notes} onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })} rows={3}
                  style={{ width: '100%', padding: '10px 12px', fontSize: 14, background: c.gray[850], border: `1px solid ${c.gray[700]}`, borderRadius: r.md, color: c.gray[100], outline: 'none', resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${c.gray[800]}`, display: 'flex', gap: 10 }}>
              <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowEventModal(false)}>Cancel</Button>
              <Button variant="gradient" style={{ flex: 1 }} onClick={handleCreateEvent} disabled={!newEvent.title.trim() || !newEvent.date}>
                <Plus size={16} style={{ marginRight: 8 }} /> Create Event
              </Button>
            </div>
          </Card>
        </ModalOverlay>
      )}

      {/* Connect Calendar Modal */}
      {showConnectModal && (
        <ModalOverlay onClose={() => setShowConnectModal(false)} maxWidth={480}>
          <Card padding={0}>
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100] }}>Connect Calendar</h2>
              <button onClick={() => setShowConnectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} style={{ color: c.gray[500] }} /></button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 13, color: c.gray[400], marginBottom: 8 }}>Connect your calendar to sync meetings, schedule follow-ups, and coordinate sequence activities.</p>
              <button onClick={() => connectCalendar('google')}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: c.gray[850], border: `1px solid ${c.gray[800]}`, borderRadius: r.lg, cursor: 'pointer', width: '100%', transition: tokens.transition.fast }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = c.gray[700]} onMouseLeave={(e) => e.currentTarget.style.borderColor = c.gray[800]}>
                <div style={{ width: 40, height: 40, borderRadius: r.md, background: '#4285F420', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[200] }}>Google Calendar</p>
                  <p style={{ fontSize: 12, color: c.gray[500] }}>Connect your Google account</p>
                </div>
                <ChevronRight size={18} style={{ color: c.gray[600] }} />
              </button>
              <button onClick={() => connectCalendar('outlook')}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: c.gray[850], border: `1px solid ${c.gray[800]}`, borderRadius: r.lg, cursor: 'pointer', width: '100%', transition: tokens.transition.fast }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = c.gray[700]} onMouseLeave={(e) => e.currentTarget.style.borderColor = c.gray[800]}>
                <div style={{ width: 40, height: 40, borderRadius: r.md, background: '#0078D420', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#0078D4"><path d="M11.5 3v8.5H3V3h8.5zm0 9.5V21H3v-8.5h8.5zm1 0H21V21h-8.5v-8.5zm0-1V3H21v8.5h-8.5z"/></svg>
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: c.gray[200] }}>Outlook Calendar</p>
                  <p style={{ fontSize: 12, color: c.gray[500] }}>Connect your Microsoft account</p>
                </div>
                <ChevronRight size={18} style={{ color: c.gray[600] }} />
              </button>
              <p style={{ fontSize: 11, color: c.gray[600], textAlign: 'center', marginTop: 8 }}>We only request read access to your calendar events and the ability to create new events.</p>
            </div>
          </Card>
        </ModalOverlay>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <ModalOverlay onClose={() => setSelectedEvent(null)} maxWidth={500}>
          <Card padding={0}>
            <div style={{ padding: 20, borderBottom: `1px solid ${c.gray[800]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: r.lg, background: `${selectedEvent.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.createElement(eventTypeIcons[selectedEvent.type] || Calendar, { size: 24, style: { color: selectedEvent.color } })}
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: c.gray[100], marginBottom: 4 }}>{selectedEvent.title}</h2>
                  <p style={{ fontSize: 13, color: c.gray[400] }}>
                    {selectedEvent.type === 'sequence' ? `Step ${selectedEvent.step}${selectedEvent.totalSteps ? ` of ${selectedEvent.totalSteps}` : ''} • ${selectedEvent.sequence}` :
                     selectedEvent.type === 'meeting' ? selectedEvent.location || 'Meeting' :
                     selectedEvent.priority ? `Priority: ${selectedEvent.priority}` : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} style={{ color: c.gray[500] }} /></button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Clock size={18} style={{ color: c.gray[500] }} />
                  <div>
                    <p style={{ fontSize: 14, color: c.gray[200] }}>{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <p style={{ fontSize: 13, color: c.gray[500] }}>{formatTime(selectedEvent.date)} • {selectedEvent.duration} minutes</p>
                  </div>
                </div>
                {selectedEvent.lead && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <User size={18} style={{ color: c.gray[500] }} />
                    <div>
                      <p style={{ fontSize: 14, color: c.gray[200] }}>{selectedEvent.lead}</p>
                      {selectedEvent.leadCompany && <p style={{ fontSize: 13, color: c.gray[500] }}>{selectedEvent.leadCompany}</p>}
                      {selectedEvent.leadEmail && <p style={{ fontSize: 12, color: c.primary.DEFAULT }}>{selectedEvent.leadEmail}</p>}
                    </div>
                  </div>
                )}
                {selectedEvent.type === 'sequence' && selectedEvent.channel && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Zap size={18} style={{ color: c.gray[500] }} />
                    <div>
                      <p style={{ fontSize: 14, color: c.gray[200] }}>Channel: {selectedEvent.channel.charAt(0).toUpperCase() + selectedEvent.channel.slice(1)}</p>
                      {selectedEvent.subject && <p style={{ fontSize: 13, color: c.gray[500] }}>Subject: {selectedEvent.subject}</p>}
                    </div>
                  </div>
                )}
                {selectedEvent.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MapPin size={18} style={{ color: c.gray[500] }} />
                    <div>
                      <p style={{ fontSize: 14, color: c.gray[200] }}>{selectedEvent.location}</p>
                      {selectedEvent.meetingLink && <a href={selectedEvent.meetingLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: c.primary.DEFAULT }}>Join Meeting</a>}
                    </div>
                  </div>
                )}
                {selectedEvent.notes && (
                  <div style={{ padding: 12, background: c.gray[850], borderRadius: r.md }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: c.gray[400], marginBottom: 4 }}>Notes</p>
                    <p style={{ fontSize: 13, color: c.gray[200] }}>{selectedEvent.notes}</p>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                {selectedEvent.type === 'meeting' && <Button icon={Video} style={{ flex: 1 }}>Join Meeting</Button>}
                {selectedEvent.type === 'sequence' && <Button icon={Zap} style={{ flex: 1 }}>Execute Step</Button>}
                {selectedEvent.type === 'task' && <Button icon={CheckCircle2} style={{ flex: 1 }}>Mark Complete</Button>}
                {(selectedEvent.id.startsWith('user-') || selectedEvent.id.startsWith('meet-') || selectedEvent.id.startsWith('task-')) ? (
                  <Button variant="secondary" icon={Trash2} onClick={() => handleDeleteEvent(selectedEvent.id)}>Delete</Button>
                ) : (
                  <Button variant="secondary" icon={Edit2}>Edit</Button>
                )}
              </div>
            </div>
          </Card>
        </ModalOverlay>
      )}
    </div>
  );
};
