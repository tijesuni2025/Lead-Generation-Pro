/**
 * LeadModelPage - Custom AI Lead Model Dashboard
 *
 * Allows clients to configure and view industry-specific leads with dynamic
 * columns, proprietary scoring, and AI-powered analytics per use case.
 *
 * @module components/LeadModelPage/LeadModelPage
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { c, r, tokens } from '../../styles/theme';
import {
  Heart, DollarSign, Building, Zap, Search, Filter, Download, ChevronDown,
  ChevronRight, TrendingUp, Target, Users, Activity, Star, AlertTriangle,
  CheckCircle2, XCircle, BarChart3, Eye, Phone, Mail, ArrowUpRight,
  ArrowDownRight, Info, X, RefreshCw, ChevronLeft, Layers, Sparkles,
  FileText, Calendar, ClipboardList
} from 'lucide-react';
import { INDUSTRIES, getColumnsForSubVertical } from '../../services/industryConfig';
import { scoreIndustryLead, getScoreAnalytics } from '../../services/leadScoringEngine';
import { generateLeadsForSubVertical } from '../../services/leadDataGenerator';

// =============================================================================
// ICON MAP
// =============================================================================

const ICON_MAP = { Heart, DollarSign, Building, Zap, Phone, Mail, FileText, Calendar, ClipboardList, Target, TrendingUp, Search };
const getIcon = (name) => ICON_MAP[name] || Target;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const LeadModelPage = ({ user }) => {
  // ---- State ----
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedSubVertical, setSelectedSubVertical] = useState(null);
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  // ---- Derived Data ----
  const industries = useMemo(() => Object.values(INDUSTRIES), []);

  const subVerticals = useMemo(() => {
    if (!selectedIndustry) return [];
    return Object.values(selectedIndustry.subVerticals);
  }, [selectedIndustry]);

  const allColumns = useMemo(() => {
    if (!selectedIndustry || !selectedSubVertical) return [];
    return getColumnsForSubVertical(selectedIndustry.id, selectedSubVertical.id);
  }, [selectedIndustry, selectedSubVertical]);

  // Initialize visible columns when sub-vertical changes
  useEffect(() => {
    if (allColumns.length > 0) {
      // Default: show system columns + first 6 custom columns
      const defaults = allColumns.filter(col => col.system).map(col => col.key);
      const custom = allColumns.filter(col => !col.system).slice(0, 6).map(col => col.key);
      setVisibleColumns([...defaults, ...custom]);
    }
  }, [allColumns]);

  // Score analytics
  const analytics = useMemo(() => getScoreAnalytics(leads), [leads]);

  // Filtered + sorted leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(l => l.recommendedStatus === statusFilter || l.status === statusFilter);
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l => {
        return Object.values(l).some(v => {
          if (typeof v === 'string') return v.toLowerCase().includes(q);
          if (typeof v === 'number') return v.toString().includes(q);
          return false;
        });
      });
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, search, statusFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, sortBy]);

  // ---- Handlers ----
  const handleSelectIndustry = (industry) => {
    setSelectedIndustry(industry);
    setSelectedSubVertical(null);
    setLeads([]);
    setSearch('');
    setStatusFilter('all');
  };

  const handleSelectSubVertical = useCallback((sv) => {
    setSelectedSubVertical(sv);
    setSearch('');
    setStatusFilter('all');
    setCurrentPage(1);
    setIsGenerating(true);

    // Generate leads asynchronously
    setTimeout(() => {
      const generated = generateLeadsForSubVertical(selectedIndustry.id, sv.id, 30, true);
      setLeads(generated);
      setIsGenerating(false);
    }, 300);
  }, [selectedIndustry]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('desc');
    }
  };

  const toggleColumn = (key) => {
    setVisibleColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    const cols = allColumns.filter(col => visibleColumns.includes(col.key));
    const header = cols.map(c => c.label).join(',');
    const rows = filteredLeads.map(lead =>
      cols.map(col => {
        const val = lead[col.key];
        if (val === null || val === undefined) return '';
        if (Array.isArray(val)) return `"${val.join('; ')}"`;
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
        return val;
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedIndustry?.id}_${selectedSubVertical?.id}_leads.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Render ----
  if (!selectedIndustry) {
    return <IndustrySelector industries={industries} onSelect={handleSelectIndustry} />;
  }

  if (!selectedSubVertical) {
    return (
      <SubVerticalSelector
        industry={selectedIndustry}
        subVerticals={subVerticals}
        onSelect={handleSelectSubVertical}
        onBack={() => setSelectedIndustry(null)}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setSelectedSubVertical(null)} style={styles.backBtn}>
          <ChevronLeft size={18} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ ...styles.industryBadge, background: selectedIndustry.color + '22', borderColor: selectedIndustry.color + '44' }}>
            {React.createElement(getIcon(selectedIndustry.icon), { size: 16, color: selectedIndustry.color })}
            <span style={{ color: selectedIndustry.color, fontWeight: 600, fontSize: 12 }}>{selectedIndustry.name}</span>
          </div>
          <ChevronRight size={14} style={{ color: c.gray[500] }} />
          <span style={{ color: c.gray[100], fontWeight: 600, fontSize: 16, fontFamily: tokens.font.heading }}>{selectedSubVertical.name}</span>
        </div>
        <button onClick={handleExportCSV} style={styles.actionBtn}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Analytics Cards */}
      <AnalyticsBar analytics={analytics} industryColor={selectedIndustry.color} />

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, maxWidth: 300, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: c.gray[500] }} />
          <input
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={styles.selectInput}>
          <option value="all">All Status</option>
          <option value="Hot">Hot</option>
          <option value="Warm">Warm</option>
          <option value="New">New</option>
          <option value="Cold">Cold</option>
        </select>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowColumnPicker(!showColumnPicker)} style={styles.actionBtn}>
            <Layers size={15} /> Columns
          </button>
          {showColumnPicker && (
            <ColumnPicker
              allColumns={allColumns}
              visibleColumns={visibleColumns}
              onToggle={toggleColumn}
              onClose={() => setShowColumnPicker(false)}
            />
          )}
        </div>

        <button onClick={() => handleSelectSubVertical(selectedSubVertical)} style={styles.actionBtn}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Lead Table */}
      {isGenerating ? (
        <div style={styles.loadingContainer}>
          <Sparkles size={24} style={{ color: c.accent.DEFAULT, animation: 'spin 1s linear infinite' }} />
          <span style={{ color: c.gray[300], fontSize: 14 }}>Generating and scoring leads...</span>
        </div>
      ) : (
        <>
          <LeadTable
            leads={paginatedLeads}
            columns={allColumns.filter(col => visibleColumns.includes(col.key))}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            onSelectLead={setSelectedLead}
            industryColor={selectedIndustry.color}
          />
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} filteredCount={filteredLeads.length} />
          )}
        </>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          industry={selectedIndustry}
          subVertical={selectedSubVertical}
          columns={allColumns}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
};

// =============================================================================
// INDUSTRY SELECTOR
// =============================================================================

const IndustrySelector = ({ industries, onSelect }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div>
      <h2 style={{ color: c.gray[100], fontFamily: tokens.font.heading, fontSize: 22, fontWeight: 700, margin: 0 }}>
        AI Lead Model
      </h2>
      <p style={{ color: c.gray[400], fontSize: 14, marginTop: 6 }}>
        Select an industry to generate targeted leads with proprietary scoring
      </p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {industries.map(industry => {
        const IconComp = getIcon(industry.icon);
        const svCount = Object.keys(industry.subVerticals).length;
        return (
          <button key={industry.id} onClick={() => onSelect(industry)} style={styles.industryCard}>
            <div style={{ ...styles.industryIconWrap, background: industry.color + '18', border: `1px solid ${industry.color}33` }}>
              <IconComp size={28} style={{ color: industry.color }} />
            </div>
            <h3 style={{ color: c.gray[100], fontSize: 17, fontWeight: 700, fontFamily: tokens.font.heading, margin: 0 }}>
              {industry.name}
            </h3>
            <p style={{ color: c.gray[400], fontSize: 13, margin: 0, lineHeight: 1.5 }}>
              {industry.description}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Layers size={14} style={{ color: industry.color }} />
              <span style={{ color: industry.color, fontSize: 12, fontWeight: 600 }}>{svCount} verticals</span>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

// =============================================================================
// SUB-VERTICAL SELECTOR
// =============================================================================

const SubVerticalSelector = ({ industry, subVerticals, onSelect, onBack }) => {
  const IconComp = getIcon(industry.icon);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={styles.backBtn}><ChevronLeft size={18} /> Industries</button>
        <IconComp size={22} style={{ color: industry.color }} />
        <h2 style={{ color: c.gray[100], fontFamily: tokens.font.heading, fontSize: 20, fontWeight: 700, margin: 0 }}>
          {industry.name}
        </h2>
      </div>
      <p style={{ color: c.gray[400], fontSize: 14, margin: 0 }}>Select a use case to generate targeted leads</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {subVerticals.map(sv => (
          <button key={sv.id} onClick={() => onSelect(sv)} style={styles.svCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ color: c.gray[100], fontSize: 15, fontWeight: 600, margin: 0, fontFamily: tokens.font.heading }}>
                {sv.name}
              </h3>
              <ArrowUpRight size={16} style={{ color: industry.color, flexShrink: 0 }} />
            </div>
            <p style={{ color: c.gray[400], fontSize: 12, margin: '6px 0 0', lineHeight: 1.5 }}>
              {sv.description}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {sv.leadTypes.slice(0, 4).map(lt => (
                <span key={lt} style={{ ...styles.chip, borderColor: industry.color + '33', color: industry.color }}>
                  {lt}
                </span>
              ))}
              {sv.leadTypes.length > 4 && (
                <span style={{ ...styles.chip, borderColor: c.gray[700], color: c.gray[400] }}>+{sv.leadTypes.length - 4}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <span style={{ fontSize: 11, color: c.gray[500] }}>{sv.columns.length} data fields</span>
              <span style={{ fontSize: 11, color: c.gray[500] }}>{Object.keys(sv.scoringWeights).length} scoring dimensions</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// ANALYTICS BAR
// =============================================================================

const AnalyticsBar = ({ analytics, industryColor }) => {
  if (!analytics || analytics.total === 0) return null;
  const { total, avgScore, distribution, statusBreakdown, avgConversion } = analytics;

  const cards = [
    { label: 'Total Leads', value: total, icon: Users, color: c.gray[100] },
    { label: 'Avg Score', value: `${avgScore}/100`, icon: Target, color: industryColor },
    { label: 'Avg Conversion', value: `${avgConversion}%`, icon: TrendingUp, color: c.success.DEFAULT },
    { label: 'Hot Leads', value: statusBreakdown.Hot || 0, icon: Activity, color: c.hot.text },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div key={card.label} style={styles.analyticsCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: c.gray[400], fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{card.label}</span>
              <Icon size={16} style={{ color: card.color, opacity: 0.7 }} />
            </div>
            <span style={{ color: card.color, fontSize: 22, fontWeight: 700, fontFamily: tokens.font.heading }}>{card.value}</span>
          </div>
        );
      })}
    </div>
  );
};

// =============================================================================
// LEAD TABLE
// =============================================================================

const LeadTable = ({ leads, columns, sortBy, sortDir, onSort, onSelectLead, industryColor }) => {
  // Show a limited set of columns in the table
  const tableColumns = columns.filter(col => !['id', 'notes', 'assignedTo'].includes(col.key));

  const formatCellValue = (value, type) => {
    if (value === null || value === undefined || value === '') return <span style={{ color: c.gray[600] }}>--</span>;
    if (type === 'currency') {
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (isNaN(num)) return value;
      if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
      return `$${num.toLocaleString()}`;
    }
    if (type === 'boolean') return value ? <CheckCircle2 size={14} style={{ color: c.success.DEFAULT }} /> : <XCircle size={14} style={{ color: c.gray[600] }} />;
    if (type === 'date') {
      if (!value) return '--';
      const d = new Date(value);
      if (isNaN(d)) return value;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    }
    if (type === 'multiselect' && Array.isArray(value)) return value.join(', ');
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  if (leads.length === 0) {
    return (
      <div style={styles.emptyState}>
        <Search size={32} style={{ color: c.gray[600] }} />
        <p style={{ color: c.gray[400], fontSize: 14 }}>No leads match your filters</p>
      </div>
    );
  }

  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            {tableColumns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && onSort(col.key)}
                style={{
                  ...styles.th,
                  cursor: col.sortable !== false ? 'pointer' : 'default',
                  minWidth: col.key === 'score' ? 80 : col.type === 'currency' ? 110 : col.type === 'boolean' ? 50 : 100,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{col.label}</span>
                  {sortBy === col.key && (
                    <span style={{ color: industryColor, fontSize: 10 }}>{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
                  )}
                </div>
              </th>
            ))}
            <th style={{ ...styles.th, width: 50 }}>View</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id} style={styles.tr} onClick={() => onSelectLead(lead)}>
              {tableColumns.map(col => (
                <td key={col.key} style={styles.td}>
                  {col.key === 'status' ? (
                    <StatusPill status={lead.recommendedStatus || lead.status} />
                  ) : col.key === 'score' ? (
                    <ScoreBadge score={lead.score} grade={lead.grade} />
                  ) : (
                    <span style={{ fontSize: 13, color: c.gray[200] }}>{formatCellValue(lead[col.key], col.type)}</span>
                  )}
                </td>
              ))}
              <td style={styles.td}>
                <button onClick={(e) => { e.stopPropagation(); onSelectLead(lead); }} style={styles.viewBtn}>
                  <Eye size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// =============================================================================
// LEAD DETAIL MODAL
// =============================================================================

const LeadDetailModal = ({ lead, industry, subVertical, columns, onClose }) => {
  const scoreResult = useMemo(() =>
    scoreIndustryLead(lead, industry.id, subVertical.id),
    [lead, industry.id, subVertical.id]
  );

  const [activeTab, setActiveTab] = useState('overview');
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'scoring', label: 'Score Breakdown' },
    { id: 'data', label: 'All Fields' },
    { id: 'actions', label: 'Next Actions' },
  ];

  const formatValue = (val, type) => {
    if (val === null || val === undefined || val === '') return '--';
    if (type === 'currency') {
      const num = typeof val === 'number' ? val : parseFloat(val);
      return isNaN(num) ? val : `$${num.toLocaleString()}`;
    }
    if (type === 'boolean') return val ? 'Yes' : 'No';
    if (type === 'date') {
      const d = new Date(val);
      return isNaN(d) ? val : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (Array.isArray(val)) return val.join(', ');
    return String(val);
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <ScoreBadge score={scoreResult.score} grade={scoreResult.grade} large />
            <div>
              <h3 style={{ color: c.gray[100], fontSize: 18, fontWeight: 700, margin: 0, fontFamily: tokens.font.heading }}>
                {lead.name || lead.buyerName || lead.businessName || lead.agentName || lead.consumerName || lead.contactName || lead.companyName || 'Lead'}
              </h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                <StatusPill status={scoreResult.recommendedStatus} />
                <span style={{ color: c.gray[400], fontSize: 12 }}>
                  {scoreResult.conversionProbability}% conversion probability
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div style={styles.tabBar}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                color: activeTab === tab.id ? industry.color : c.gray[400],
                borderBottomColor: activeTab === tab.id ? industry.color : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={styles.modalBody}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Key Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <MetricCard label="Score" value={`${scoreResult.score}/100`} sub={scoreResult.grade.label} color={scoreResult.grade.color} />
                <MetricCard label="Conversion" value={`${scoreResult.conversionProbability}%`} sub="probability" color={c.success.DEFAULT} />
                <MetricCard label="Status" value={scoreResult.recommendedStatus} sub="recommended" color={c.hot.text} />
              </div>

              {/* Qualification Flags */}
              {scoreResult.qualificationFlags.length > 0 && (
                <div style={styles.flagsContainer}>
                  <span style={{ color: c.gray[300], fontSize: 12, fontWeight: 600 }}>Qualification Flags</span>
                  {scoreResult.qualificationFlags.map((flag, i) => (
                    <div key={i} style={{ ...styles.flag, borderColor: flag.type === 'disqualifier' ? c.error.DEFAULT + '44' : c.warning.DEFAULT + '44' }}>
                      <AlertTriangle size={13} style={{ color: flag.type === 'disqualifier' ? c.error.DEFAULT : c.warning.DEFAULT }} />
                      <span style={{ color: c.gray[300], fontSize: 12 }}>{flag.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Contextual Boost */}
              {scoreResult.boost.reasons.length > 0 && (
                <div style={{ ...styles.flagsContainer, borderColor: c.success.DEFAULT + '33' }}>
                  <span style={{ color: c.success.DEFAULT, fontSize: 12, fontWeight: 600 }}>Contextual Boosts</span>
                  {scoreResult.boost.reasons.map((reason, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <TrendingUp size={13} style={{ color: c.success.DEFAULT }} />
                      <span style={{ color: c.gray[300], fontSize: 12 }}>{reason} (+{Math.round(scoreResult.boost.multiplier * 100)}%)</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Key Fields */}
              <div>
                <span style={{ color: c.gray[300], fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Key Information</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {columns.filter(col => !col.system).slice(0, 10).map(col => (
                    <div key={col.key} style={styles.fieldRow}>
                      <span style={{ color: c.gray[500], fontSize: 11, minWidth: 100 }}>{col.label}</span>
                      <span style={{ color: c.gray[200], fontSize: 12, fontWeight: 500 }}>{formatValue(lead[col.key], col.type)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scoring' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ color: c.gray[400], fontSize: 12, margin: 0 }}>
                Each dimension is scored 0-100 and weighted according to the {subVertical.name} model.
              </p>
              {Object.entries(scoreResult.dimensions).map(([key, dim]) => {
                const weight = subVertical.scoringWeights[key] || dim.defaultWeight;
                return (
                  <div key={key} style={styles.scoreDimension}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: c.gray[200], fontSize: 13, fontWeight: 500 }}>{dim.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: c.gray[500], fontSize: 11 }}>{Math.round(weight * 100)}% weight</span>
                        <span style={{ color: getScoreColor(dim.score), fontSize: 14, fontWeight: 700 }}>{dim.score}</span>
                      </div>
                    </div>
                    <div style={styles.scoreBarBg}>
                      <div style={{ ...styles.scoreBarFill, width: `${dim.score}%`, background: getScoreColor(dim.score) }} />
                    </div>
                  </div>
                );
              })}
              <div style={{ borderTop: `1px solid ${c.gray[800]}`, paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: c.gray[200], fontSize: 14, fontWeight: 700 }}>Final Score</span>
                <span style={{ color: scoreResult.grade.color, fontSize: 20, fontWeight: 700, fontFamily: tokens.font.heading }}>{scoreResult.score}/100</span>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {columns.filter(col => !col.system).map(col => (
                <div key={col.key} style={styles.dataRow}>
                  <span style={{ color: c.gray[500], fontSize: 12, minWidth: 160, flexShrink: 0 }}>{col.label}</span>
                  <span style={{ color: c.gray[200], fontSize: 12 }}>{formatValue(lead[col.key], col.type)}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Primary Action */}
              <div style={{ ...styles.actionCard, borderColor: industry.color + '44' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {React.createElement(getIcon(scoreResult.nextBestAction.icon), { size: 20, color: industry.color })}
                  <div>
                    <span style={{ color: c.gray[100], fontSize: 14, fontWeight: 600, display: 'block' }}>{scoreResult.nextBestAction.action}</span>
                    <span style={{ color: c.gray[400], fontSize: 11 }}>Priority: {scoreResult.nextBestAction.priority}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <span style={{ color: c.gray[400], fontSize: 12, fontWeight: 600 }}>Quick Actions</span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {lead.email && (
                  <button style={styles.quickAction}>
                    <Mail size={14} /> Send Email
                  </button>
                )}
                {lead.phone && (
                  <button style={styles.quickAction}>
                    <Phone size={14} /> Call
                  </button>
                )}
                <button style={styles.quickAction}>
                  <Zap size={14} /> Add to Sequence
                </button>
                <button style={styles.quickAction}>
                  <FileText size={14} /> Add Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// COLUMN PICKER
// =============================================================================

const ColumnPicker = ({ allColumns, visibleColumns, onToggle, onClose }) => (
  <div style={styles.columnPicker}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <span style={{ color: c.gray[200], fontSize: 13, fontWeight: 600 }}>Visible Columns</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.gray[400], padding: 2 }}>
        <X size={14} />
      </button>
    </div>
    <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {allColumns.filter(col => !col.system || col.key === 'score' || col.key === 'status').map(col => (
        <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer', fontSize: 12, color: c.gray[300] }}>
          <input
            type="checkbox"
            checked={visibleColumns.includes(col.key)}
            onChange={() => onToggle(col.key)}
            style={{ accentColor: c.accent.DEFAULT }}
          />
          {col.label}
          {col.system && <span style={{ color: c.gray[600], fontSize: 10 }}>(system)</span>}
        </label>
      ))}
    </div>
  </div>
);

// =============================================================================
// SMALL COMPONENTS
// =============================================================================

const StatusPill = ({ status }) => {
  const colorMap = { Hot: c.hot, Warm: c.warm, Cold: c.cold, New: c.new, Qualified: c.success, Disqualified: c.error };
  const colors = colorMap[status] || c.new;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px', fontSize: 11, fontWeight: 600,
      borderRadius: r.full, background: colors.bg || colors.muted, color: colors.text || colors.DEFAULT,
      border: `1px solid ${colors.border || colors.DEFAULT + '33'}`,
    }}>
      {status}
    </span>
  );
};

const ScoreBadge = ({ score, grade, large }) => {
  const size = large ? 48 : 32;
  const fontSize = large ? 16 : 12;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `conic-gradient(${grade?.color || c.gray[500]} ${score * 3.6}deg, ${c.gray[800]} 0deg)`,
      position: 'relative',
    }}>
      <div style={{
        width: size - 6, height: size - 6, borderRadius: '50%', background: c.gray[900],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: grade?.color || c.gray[300], fontSize, fontWeight: 700, fontFamily: tokens.font.heading }}>
          {score}
        </span>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, sub, color }) => (
  <div style={{ padding: 14, background: GLASS.bg, borderRadius: 20, border: GLASS.border, boxShadow: GLASS.shadow, backdropFilter: GLASS.blur, position: 'relative', overflow: 'hidden' }}>
    <GlowBottom />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <span style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', fontFamily: tokens.font.sans }}>{label}</span>
      <span style={{ color: color || c.gray[100], fontSize: 20, fontWeight: 700, fontFamily: tokens.font.heading, display: 'block', marginTop: 2 }}>{value}</span>
      {sub && <span style={{ color: '#94a3b8', fontSize: 10, fontFamily: tokens.font.sans }}>{sub}</span>}
    </div>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange, filteredCount }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
    <span style={{ color: c.gray[500], fontSize: 12 }}>{filteredCount} leads</span>
    <div style={{ display: 'flex', gap: 4 }}>
      <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.4 : 1 }}>Prev</button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        let page;
        if (totalPages <= 7) page = i + 1;
        else if (currentPage <= 4) page = i + 1;
        else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
        else page = currentPage - 3 + i;
        return (
          <button key={page} onClick={() => onPageChange(page)} style={{ ...styles.pageBtn, background: currentPage === page ? c.primary.DEFAULT : 'transparent', color: currentPage === page ? c.gray[50] : c.gray[400] }}>
            {page}
          </button>
        );
      })}
      <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} style={{ ...styles.pageBtn, opacity: currentPage === totalPages ? 0.4 : 1 }}>Next</button>
    </div>
  </div>
);

// =============================================================================
// HELPERS
// =============================================================================

function getScoreColor(score) {
  if (score >= 80) return c.success.DEFAULT;
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#fbbf24';
  return c.error.DEFAULT;
}

// =============================================================================
// GLASSMORPHIC CONSTANTS (matches Card.jsx / StatCard.jsx / Metric.jsx)
// =============================================================================

const GLASS = {
  bg: 'linear-gradient(180deg, rgba(46, 51, 90, 0) 0%, rgba(28, 27, 51, 0.2) 100%)',
  border: '1.5px solid rgba(172, 186, 253, 0.12)',
  borderHover: '1.5px solid rgba(172, 186, 253, 0.25)',
  shadow: 'inset 0 0 43px rgba(204, 215, 255, 0.06)',
  blur: 'blur(1.35px)',
  innerBg: 'rgba(46, 51, 90, 0.15)',
  innerBorder: '1px solid rgba(172, 186, 253, 0.08)',
};

const GlowBottom = () => (
  <>
    <div style={{ position: 'absolute', bottom: -50, left: '50%', transform: 'translateX(-50%)', width: '90%', height: 120, background: 'radial-gradient(ellipse at center, rgba(49, 72, 185, 0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '70%', height: 18, background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
  </>
);

// =============================================================================
// STYLES
// =============================================================================

const styles = {
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', fontSize: 13, fontWeight: 500,
    color: '#94a3b8', background: GLASS.bg, border: GLASS.border, borderRadius: 16,
    cursor: 'pointer', fontFamily: tokens.font.sans, transition: tokens.transition.fast,
    backdropFilter: GLASS.blur,
  },
  industryBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: r.full,
    border: '1px solid', fontSize: 12, fontFamily: tokens.font.sans,
  },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 13, fontWeight: 500,
    color: '#94a3b8', background: GLASS.bg, border: GLASS.border, borderRadius: 16,
    cursor: 'pointer', fontFamily: tokens.font.sans, transition: tokens.transition.fast,
    backdropFilter: GLASS.blur,
  },
  searchInput: {
    width: '100%', padding: '8px 12px 8px 34px', fontSize: 13, color: c.gray[100],
    background: 'rgba(46, 51, 90, 0.2)', border: GLASS.border, borderRadius: 16, outline: 'none',
    fontFamily: tokens.font.sans,
  },
  selectInput: {
    padding: '8px 12px', fontSize: 13, color: '#94a3b8', background: 'rgba(46, 51, 90, 0.2)',
    border: GLASS.border, borderRadius: 16, outline: 'none', cursor: 'pointer',
    fontFamily: tokens.font.sans,
  },
  loadingContainer: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 60,
    background: GLASS.bg, borderRadius: 32, border: GLASS.border,
    boxShadow: GLASS.shadow, backdropFilter: GLASS.blur, position: 'relative', overflow: 'hidden',
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 60,
    background: GLASS.bg, borderRadius: 32, border: GLASS.border,
    boxShadow: GLASS.shadow, backdropFilter: GLASS.blur,
  },
  industryCard: {
    display: 'flex', flexDirection: 'column', gap: 12, padding: 24, background: GLASS.bg,
    border: GLASS.border, borderRadius: 32, cursor: 'pointer', textAlign: 'left',
    transition: tokens.transition.base, fontFamily: tokens.font.sans,
    boxShadow: GLASS.shadow, backdropFilter: GLASS.blur, position: 'relative', overflow: 'hidden',
  },
  industryIconWrap: {
    width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(180deg, rgba(46, 51, 90, 0.5) 0%, rgba(28, 27, 51, 0.3) 100%)',
    backdropFilter: 'blur(6px)', border: '1px solid rgba(172, 186, 253, 0.15)',
  },
  svCard: {
    display: 'flex', flexDirection: 'column', gap: 4, padding: 20, background: GLASS.bg,
    border: GLASS.border, borderRadius: 32, cursor: 'pointer', textAlign: 'left',
    transition: tokens.transition.base, fontFamily: tokens.font.sans,
    boxShadow: GLASS.shadow, backdropFilter: GLASS.blur, position: 'relative', overflow: 'hidden',
  },
  chip: {
    display: 'inline-flex', padding: '2px 8px', fontSize: 10, fontWeight: 500, borderRadius: r.full,
    border: '1px solid', background: 'transparent', fontFamily: tokens.font.sans,
  },
  analyticsCard: {
    display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 16px', background: GLASS.bg,
    border: GLASS.border, borderRadius: 24, boxShadow: GLASS.shadow, backdropFilter: GLASS.blur,
    position: 'relative', overflow: 'hidden',
  },
  tableContainer: {
    overflowX: 'auto', borderRadius: 32, border: GLASS.border, background: GLASS.bg,
    boxShadow: GLASS.shadow, backdropFilter: GLASS.blur,
  },
  table: {
    width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: tokens.font.sans,
  },
  th: {
    padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8',
    borderBottom: '1px solid rgba(172, 186, 253, 0.08)', whiteSpace: 'nowrap', textTransform: 'uppercase',
    letterSpacing: '0.04em', userSelect: 'none', fontFamily: tokens.font.sans,
  },
  tr: {
    cursor: 'pointer', transition: tokens.transition.fast,
  },
  td: {
    padding: '10px 14px', borderBottom: '1px solid rgba(172, 186, 253, 0.05)', whiteSpace: 'nowrap',
    maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: tokens.font.sans,
  },
  viewBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28,
    borderRadius: 8, background: 'rgba(46, 51, 90, 0.3)', border: '1px solid rgba(172, 186, 253, 0.12)',
    color: '#94a3b8', cursor: 'pointer', transition: tokens.transition.fast,
  },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(2, 4, 9, 0.85)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20,
  },
  modalContent: {
    width: '100%', maxWidth: 680, maxHeight: '90vh', background: 'linear-gradient(180deg, rgba(11, 24, 40, 0.98) 0%, rgba(2, 4, 9, 0.98) 100%)',
    border: GLASS.border, borderRadius: 32, display: 'flex', flexDirection: 'column',
    overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 43px rgba(204, 215, 255, 0.04)',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(172, 186, 253, 0.08)',
  },
  closeBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32,
    borderRadius: 8, background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer',
  },
  tabBar: {
    display: 'flex', borderBottom: '1px solid rgba(172, 186, 253, 0.08)', padding: '0 24px',
  },
  tab: {
    padding: '10px 16px', fontSize: 12, fontWeight: 500, background: 'none', border: 'none',
    borderBottom: '2px solid transparent', cursor: 'pointer', fontFamily: tokens.font.sans,
    transition: tokens.transition.fast,
  },
  modalBody: {
    padding: 24, overflowY: 'auto', flex: 1,
  },
  flagsContainer: {
    display: 'flex', flexDirection: 'column', gap: 6, padding: 14, background: GLASS.innerBg,
    border: GLASS.innerBorder, borderRadius: 16,
  },
  flag: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', borderLeft: '2px solid',
    paddingLeft: 8,
  },
  fieldRow: {
    display: 'flex', justifyContent: 'space-between', padding: '6px 0',
    borderBottom: '1px solid rgba(172, 186, 253, 0.05)',
  },
  scoreDimension: {
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  scoreBarBg: {
    width: '100%', height: 6, background: 'rgba(172, 186, 253, 0.1)', borderRadius: r.full, overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%', borderRadius: r.full, transition: 'width 0.5s ease',
  },
  dataRow: {
    display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid rgba(172, 186, 253, 0.05)',
  },
  actionCard: {
    padding: 16, background: GLASS.innerBg, border: GLASS.innerBorder, borderRadius: 16,
    borderLeftWidth: 3, borderLeftStyle: 'solid',
  },
  quickAction: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 12, fontWeight: 500,
    color: '#94a3b8', background: GLASS.innerBg, border: GLASS.innerBorder, borderRadius: 14,
    cursor: 'pointer', fontFamily: tokens.font.sans, transition: tokens.transition.fast,
  },
  pageBtn: {
    padding: '5px 10px', fontSize: 12, color: '#94a3b8', background: 'transparent',
    border: GLASS.border, borderRadius: 8, cursor: 'pointer',
    fontFamily: tokens.font.sans,
  },
  columnPicker: {
    position: 'absolute', top: '100%', right: 0, marginTop: 4, width: 240, padding: 14,
    background: 'linear-gradient(180deg, rgba(11, 24, 40, 0.98) 0%, rgba(2, 4, 9, 0.98) 100%)',
    border: GLASS.border, borderRadius: 20,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', zIndex: 50,
  },
};

export default LeadModelPage;
