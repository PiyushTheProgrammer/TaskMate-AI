import React, { useEffect, useState } from 'react';
import { 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  ArrowUpRight, 
  Plus, 
  Sparkles, 
  Bot,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';

export default function DashboardView({ setCurrentTab }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading dashboard metrics...</div>;
  }

  return (
    <div>
      {/* Quick Freelancer Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#EFF6FF', color: 'var(--primary)' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="stat-value">{summary?.clients?.active || 0}</div>
            <div className="stat-label">Active Clients ({summary?.clients?.leads || 0} Leads)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ECFDF5', color: 'var(--success)' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div className="stat-value">${summary?.finances?.net_profit?.toLocaleString() || 0}</div>
            <div className="stat-label">Net Profit (Income - Expenses)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FFFBEB', color: 'var(--warning)' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value">${summary?.finances?.pending_payments?.toLocaleString() || 0}</div>
            <div className="stat-label">Pending Invoices Due</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#EEF2FF', color: 'var(--info)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-value">{summary?.tasks?.completion_rate || 0}%</div>
            <div className="stat-label">Task Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Quick Actions:</div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentTab('clients')}>
              <Plus size={16} /> Add Client
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setCurrentTab('analyzer')}>
              <Sparkles size={16} /> Analyze Requirements
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentTab('proposals')}>
              Draft Proposal
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentTab('tasks')}>
              <Bot size={16} /> Launch Agent Task
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Upcoming Meetings & Deadlines */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Upcoming Schedule</div>
              <div className="card-subtitle">Next meetings and project deadlines</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentTab('scheduler')}>
              View All
            </button>
          </div>

          {summary?.upcoming_events && summary.upcoming_events.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {summary.upcoming_events.map((ev) => (
                <div 
                  key={ev.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.75rem', 
                    border: '1px solid var(--border-light)', 
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FAFAFA'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: 'var(--radius-sm)', 
                      backgroundColor: ev.event_type === 'Meeting' ? '#EFF6FF' : '#FEF3C7',
                      color: ev.event_type === 'Meeting' ? 'var(--primary)' : '#B45309',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CalendarIcon size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{ev.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(ev.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${ev.event_type === 'Meeting' ? 'badge-active' : 'badge-lead'}`}>
                    {ev.event_type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
              No upcoming events scheduled. Click "View All" to create one.
            </div>
          )}
        </div>

        {/* Business Overview & Performance */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Freelance Performance</div>
              <div className="card-subtitle">Proposal conversion & client lifecycle</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentTab('analytics')}>
              Reports
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 500 }}>Proposal Win Rate</span>
                <span style={{ fontWeight: 700 }}>{summary?.proposals?.conversion_rate || 0}%</span>
              </div>
              <div style={{ height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${Math.min(summary?.proposals?.conversion_rate || 0, 100)}%`, 
                    height: '100%', 
                    backgroundColor: 'var(--primary)' 
                  }} 
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {summary?.proposals?.accepted || 0} of {summary?.proposals?.total || 0} proposals accepted
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Total Gross Revenue</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    ${summary?.finances?.total_income?.toLocaleString() || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Business Expenses</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)' }}>
                    ${summary?.finances?.total_expenses?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                AI CRM Recommendation
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                You have {summary?.clients?.leads || 0} prospective leads. Head over to <b>Outreach Automation</b> to generate tailored follow-up messages.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
