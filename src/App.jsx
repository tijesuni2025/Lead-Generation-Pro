import { useState, createContext, useContext } from 'react';

// 2. Core Config & Theme
import { tokens, c, r } from './styles/theme';

// 3. Components (All imported from one source)
import {
  // Features
   Dashboard, AIAssistant, Sidebar, Header, AdminClients, AdminUpload,

  // Pages & Wrappers
    HelpPage, SecurityCenterPage, CompliancePage, SettingsPage, SequencesPage, CalendarPage, LeadsPage, IntegrationsPage, LoginPage,

   ErrorBoundary
} from './components';

import { LeadModelPage } from './components/LeadModelPage/LeadModelPage';



const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);
const createCache = () => {
  const cache = new Map();
  const TTL = 5 * 60 * 1000; // 5 minutes default
  
  return {
    get: (key) => {
      const item = cache.get(key);
      if (!item) return null;
      if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
      }
      return item.value;
    },
    set: (key, value, ttl = TTL) => {
      cache.set(key, { value, expiry: Date.now() + ttl });
    },
    invalidate: (key) => cache.delete(key),
    invalidatePattern: (pattern) => {
      for (const key of cache.keys()) {
        if (key.includes(pattern)) cache.delete(key);
      }
    },
    clear: () => cache.clear(),
    size: () => cache.size,
  };
};

const appCache = createCache();

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  
  if (!user) return <ErrorBoundary><LoginPage onLogin={setUser} /></ErrorBoundary>;
  
  const titles = {
    dashboard: 'Dashboard',
    clients: 'Clients',
    upload: 'Import',
    analytics: 'Analytics',
    leads: 'Leads',
    'lead-model': 'AI Lead Model',
    sequences: 'Sequences',
    calendar: 'Calendar',
    'ai-insights': 'AI Assistant',
    integrations: 'Integrations',
    compliance: 'Compliance',
    security: 'Security Center',
    help: 'Help Center',
    settings: 'Settings'
  };
  
  const renderPage = () => {
    if (user.role === 'admin') {
      switch (page) {
        case 'clients': return <AdminClients />;
        case 'upload': return <AdminUpload />;
        case 'lead-model': return <LeadModelPage user={user} />;
        case 'security': return <SecurityCenterPage user={user} />;
        case 'settings': return <SettingsPage user={user} />;
        default: return <Dashboard user={user} />;
      }
    }
    switch (page) {
      case 'leads': return <LeadsPage user={user} highlightLead={selectedLead} />;
      case 'lead-model': return <LeadModelPage user={user} />;
      case 'sequences': return <SequencesPage user={user} />;
      case 'calendar': return <CalendarPage user={user} />;
      case 'ai-insights': return <AIAssistant user={user} />;
      case 'integrations': return <IntegrationsPage user={user} />;
      case 'compliance': return <CompliancePage user={user} />;
      case 'security': return <SecurityCenterPage user={user} />;
      case 'help': return <HelpPage user={user} />;
      case 'settings': return <SettingsPage user={user} />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, logout: () => setUser(null) }}>
        <div style={{ display: 'flex', minHeight: '100vh', background: c.gray[950], position: 'relative' }}>
          {/* Background gradient effects */}
          <div style={{ position: 'fixed', inset: 0, background: tokens.gradients.blueRadial, pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '40%', background: tokens.gradients.orangeGlow, pointerEvents: 'none', zIndex: 0 }} />
          
          <Sidebar user={user} currentPage={page} setCurrentPage={setPage} onLogout={() => setUser(null)} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative', zIndex: 1 }} className="main-content">
            <Header title={titles[page]} user={user} onMenuClick={() => setSidebarOpen(true)} onNavigate={setPage} onSelectLead={(lead) => { setSelectedLead(lead); setTimeout(() => setSelectedLead(null), 3000); }} />
            
            <main className="scroll-container" style={{ flex: 1, padding: 24, overflowY: 'auto', minHeight: 0 }}>
              <ErrorBoundary>{renderPage()}</ErrorBoundary>
            </main>
          </div>
        </div>
      </AuthContext.Provider>
      
      Styles
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700&display=swap');
        @keyframes pulse { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(242, 76, 3, 0.3); } 50% { box-shadow: 0 0 30px rgba(49, 72, 185, 0.4); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; overflow: hidden; }
        body { font-family: 'Montserrat', ${tokens.font.sans}; -webkit-font-smoothing: antialiased; background: ${c.gray[950]}; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Raleway', ${tokens.font.heading}; }
        ::selection { background: rgba(49, 72, 185, 0.4); color: #fff; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${c.gray[900]}; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, ${c.primary.DEFAULT} 0%, ${c.accent.DEFAULT} 100%); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${c.primary.hover}; }
        
        .sidebar { transform: translateX(0) !important; }
        .main-content { margin-left: 256px; }
        .lg-hidden { display: none !important; }
        .search-desktop { display: block; }
        .user-desktop { display: flex; }
        .ai-sidebar { display: flex; }
        
        /* Scroll container fix */
        .scroll-container {
          overflow-y: auto !important;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          min-height: 0;
        }
        
        /* Fix for flex children to allow scrolling */
        .scroll-container > div {
          min-height: min-content;
        }
        
        @media (max-width: 1024px) {
          .sidebar { transform: translateX(-100%) !important; }
          .main-content { margin-left: 0 !important; }
          .lg-hidden { display: block !important; }
          .search-desktop { display: none !important; }
          .user-desktop { display: none !important; }
          .ai-sidebar { display: none !important; }
        }
      `}</style>
    </ErrorBoundary>
  );
}
