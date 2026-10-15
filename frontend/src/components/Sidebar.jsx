import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  FileText, 
  Receipt, 
  Bot, 
  Calendar, 
  Send, 
  BarChart3, 
  LogOut,
  User as UserIcon,
  Shield,
  Globe
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients (CRM)', icon: Users },
    { id: 'analyzer', label: 'AI Requirement Analyzer', icon: Sparkles },
    { id: 'proposals', label: 'Proposals & Quotes', icon: FileText },
    { id: 'invoices', label: 'Invoices & Billing', icon: Receipt },
    { id: 'tasks', label: 'Multi-Agent Orchestrator', icon: Bot },
    { id: 'scheduler', label: 'Smart Scheduler', icon: Calendar },
    { id: 'outreach', label: 'Outreach Automation', icon: Send },
    { id: 'analytics', label: 'Business Analytics', icon: BarChart3 },
    { id: 'admin', label: 'Admin & Settings', icon: Shield },
    { id: 'landing', label: 'Landing Page', icon: Globe },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">TM</div>
        <div>
          <div className="brand-title">TaskMate AI</div>
          <div className="brand-subtitle">Assistant for Freelancers</div>
        </div>
      </div>

      <nav className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-mini-card">
          <div className="user-avatar">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, truncate: 'true' }}>
              {user?.full_name || 'Freelancer'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ${user?.hourly_rate || 45}/hr
            </div>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            title="Log Out" 
            onClick={onLogout}
            style={{ padding: '0.35rem' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
