import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ClientsView from './components/ClientsView';
import AnalyzerView from './components/AnalyzerView';
import ProposalsView from './components/ProposalsView';
import InvoicesView from './components/InvoicesView';
import TasksView from './components/TasksView';
import SchedulerView from './components/SchedulerView';
import OutreachView from './components/OutreachView';
import AnalyticsView from './components/AnalyticsView';
import AdminView from './components/AdminView';
import LoginView from './components/LoginView';
import LandingPage from './components/LandingPage';
import { api } from './api';
import { Globe } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [loadingUser, setLoadingUser] = useState(true);
  const [authMode, setAuthMode] = useState('landing'); // 'landing' | 'login' | 'register'
  const [pendingTargetTab, setPendingTargetTab] = useState('dashboard');

  // Cross-component state bridges
  const [proposalPrefill, setProposalPrefill] = useState(null);
  const [outreachTargetClient, setOutreachTargetClient] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem('taskmate_token');
    if (!token) {
      setLoadingUser(false);
      return;
    }
    try {
      const user = await api.getMe();
      setCurrentUser(user);
    } catch (err) {
      console.warn('Session expired or invalid', err);
      api.logout();
      setCurrentUser(null);
    } finally {
      setLoadingUser(false);
    }
  }

  function handleLogout() {
    api.logout();
    setCurrentUser(null);
    setAuthMode('landing');
    setCurrentTab('dashboard');
  }

  function handleConvertToProposal(data) {
    setProposalPrefill(data);
    setCurrentTab('proposals');
  }

  function handleOpenOutreach(clientId) {
    setOutreachTargetClient(clientId);
    setCurrentTab('outreach');
  }

  if (loadingUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading workspace session...
      </div>
    );
  }

  // Unauthenticated routing: Landing page by default, with toggle to Login/Register
  if (!currentUser) {
    if (authMode === 'landing') {
      return (
        <LandingPage
          currentUser={null}
          onNavigate={(dest) => {
            if (dest === 'login') {
              setAuthMode('login');
            } else if (dest === 'register') {
              setAuthMode('register');
            } else {
              // Clicked an active workspace feature card
              setPendingTargetTab(dest);
              setAuthMode('login');
            }
          }}
        />
      );
    }

    return (
      <LoginView
        initialRegister={authMode === 'register'}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setCurrentTab(pendingTargetTab || 'dashboard');
        }}
        onBackToHome={() => setAuthMode('landing')}
      />
    );
  }

  // Authenticated: If the user navigated to the landing page preview
  if (currentTab === 'landing') {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'linear-gradient(90deg, #090B10, #141925)',
          color: '#F5F7FB',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            <span>Public Landing Page Preview &bull; Signed in as <strong>{currentUser.full_name}</strong></span>
          </div>
          <button
            onClick={() => setCurrentTab('dashboard')}
            style={{
              background: 'linear-gradient(135deg, #8B7CFF, #66A6FF)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Back to Workspace Dashboard &rarr;
          </button>
        </div>
        <LandingPage
          currentUser={currentUser}
          onNavigate={(dest) => {
            if (dest === 'login' || dest === 'register') {
              handleLogout();
            } else {
              setCurrentTab(dest);
            }
          }}
        />
      </div>
    );
  }

  const tabTitles = {
    dashboard: { title: 'Freelance Dashboard', subtitle: 'Overview of clients, finances, and active agent pipelines' },
    clients: { title: 'AI Client CRM', subtitle: 'Manage client relationship pipeline and automated follow-up suggestions' },
    analyzer: { title: 'AI Requirement Analyzer', subtitle: 'Extract structured scope, deliverables, budget & timeline from client briefs' },
    proposals: { title: 'Proposals & Quotations', subtitle: 'Draft, customize, and export client agreements as clean PDFs' },
    invoices: { title: 'Invoices & Billing', subtitle: 'Issue milestone invoices and track pending vs collected payments' },
    tasks: { title: 'Multi-Agent Task Orchestrator', subtitle: 'Autonomous execution with Developer Agent, Design Agent & Client quality loops' },
    scheduler: { title: 'Smart Scheduler & Calendar', subtitle: 'Organize client meetings, deadline conflict warnings, and calendar sync' },
    outreach: { title: 'Outreach & Messaging Automation', subtitle: 'Generate tailored follow-up messages for Email and WhatsApp' },
    analytics: { title: 'Business Performance Analytics', subtitle: 'Monitor income vs expenses, conversion rates, and revenue trends' },
    admin: { title: 'Admin & Platform Controls', subtitle: 'AI configuration, registered users, system health, and audit compliance' },
  };

  const currentInfo = tabTitles[currentTab] || { title: 'TaskMate AI', subtitle: 'Workspace' };

  return (
    <div className="app-container">
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        user={currentUser} 
        onLogout={handleLogout} 
      />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1 className="page-title">{currentInfo.title}</h1>
            <p className="page-subtitle">{currentInfo.subtitle}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentTab('landing')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              title="View Public Landing Page"
            >
              <Globe size={14} />
              <span>Landing Page</span>
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              color: 'var(--success)',
              backgroundColor: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block' }} />
              TaskMate AI Online
            </div>
          </div>
        </header>

        <div className="content-pane">
          {currentTab === 'dashboard' && <DashboardView setCurrentTab={setCurrentTab} />}
          {currentTab === 'clients' && <ClientsView onOpenOutreach={handleOpenOutreach} />}
          {currentTab === 'analyzer' && <AnalyzerView onConvertToProposal={handleConvertToProposal} />}
          {currentTab === 'proposals' && (
            <ProposalsView 
              initialData={proposalPrefill} 
              onClearInitialData={() => setProposalPrefill(null)} 
            />
          )}
          {currentTab === 'invoices' && <InvoicesView />}
          {currentTab === 'tasks' && <TasksView />}
          {currentTab === 'scheduler' && <SchedulerView />}
          {currentTab === 'outreach' && <OutreachView targetClientId={outreachTargetClient} />}
          {currentTab === 'analytics' && <AnalyticsView />}
          {currentTab === 'admin' && <AdminView />}
        </div>
      </main>
    </div>
  );
}
