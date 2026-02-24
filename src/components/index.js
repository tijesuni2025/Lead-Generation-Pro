// src/components/index.js

// 1. DEFAULT EXPORTS (Use 'default as Name')
// These files end with "export default ComponentName"
export { default as Button } from './UI/Button'; 
export { default as Card } from './UI/Card';
export { default as StatusBadge } from './UI/StatusBadge';
export { default as StatCard } from './Dashboard/StatCard';
export { default as Input } from './UI/Input';
export { Metric } from './UI/Metric';
export {Score} from './UI/Score';
// 2. NAMED EXPORTS (Use direct export)
// These files use "export const ComponentName"
export { Avatar, UserOrgAvatar } from './UserProfile/Avatar';
export { Dashboard } from './Dashboard/Dashboard';
export { SettingsPage } from './SettingsPage';
export { CompliancePage } from './CompliancePage';
export { SequencesPage } from './SequencesPage';
export { SecurityCenterPage } from './SecurityCenterPage';
export { HelpPage } from './HelpPage/HelpPage';
export { ErrorBoundary } from './ErrorBoundary';
export { CalendarPage } from './Calendar/CalendarPage';
export { LeadsPage } from './LeadsPage/LeadsPage';
export { AIAssistant } from './AI/AI';
export { IntegrationsPage } from './IntegrationsPage';
export { renderMarkdown } from './AI/renderMarkdown';
//Layout
export { SequenceBuilder } from './Layout/SequenceBuilder';
export { StepEditor } from './Layout/StepEditor';
export { EnrollLeadsModal } from './Layout/EnrollLeadsModal';
export { ModalOverlay } from './Layout/ModalOverlay';
export { Sidebar } from './Layout/Sidebar';
export { Header } from './Layout/Header';
export { LoginPage } from './Login/LoginPage';
// 3. UTILS/DATA (Pass-through)
export { MOCK_USERS, MOCK_LEADS_BY_CLIENT } from '../Data/Mocks';
export { CONFIG } from '../utils/CONFIG';
export { fuzzySearch } from '../utils/fuzzySearch';
export { fmt } from '../utils/formatters';
export { FileUploadModal } from '../utils/FileUploadModal';
export { default as leadAI } from '../services/leadAI';
export { AdminClients } from './Admin/AdminClients';
export { AdminUpload } from './Admin/adminUpload';
// Lead Model
export { LeadModelPage } from './LeadModelPage/LeadModelPage';