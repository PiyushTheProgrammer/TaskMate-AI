import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Clock, 
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../api';

export default function AnalyticsView() {
  const [finances, setFinances] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    type: 'Expense',
    category: 'Software',
    amount: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [sum, fins] = await Promise.all([
        api.getDashboardSummary(),
        api.getFinances()
      ]);
      setSummary(sum);
      setFinances(fins);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogFinance(e) {
    e.preventDefault();
    try {
      await api.logFinance({
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description
      });
      setShowModal(false);
      setFormData({
        type: 'Expense',
        category: 'Software',
        amount: '',
        description: ''
      });
      loadData();
    } catch (err) {
      alert(`Logging failed: ${err.message}`);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Business Financials & Analytics</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time income, expense logs, conversion metrics, and productivity insights
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Log Income / Expense
        </button>
      </div>

      {/* Financial Health Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ECFDF5', color: 'var(--success)' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-value">${summary?.finances?.total_income?.toLocaleString() || 0}</div>
            <div className="stat-label">Total Gross Earnings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEF2F2', color: 'var(--danger)' }}>
            <ArrowDownRight size={22} />
          </div>
          <div>
            <div className="stat-value">${summary?.finances?.total_expenses?.toLocaleString() || 0}</div>
            <div className="stat-label">Operating Expenses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#EFF6FF', color: 'var(--primary)' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div className="stat-value">${summary?.finances?.net_profit?.toLocaleString() || 0}</div>
            <div className="stat-label">Net Take-Home Profit</div>
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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1.2fr)', gap: '1.5rem' }}>
        {/* Productivity & Conversion Overview */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Productivity & Efficiency</div>
            <div className="card-subtitle">Key freelance business benchmarks</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600 }}>Proposal Acceptance Ratio</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{summary?.proposals?.conversion_rate || 0}%</span>
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
                {summary?.proposals?.accepted || 0} accepted of {summary?.proposals?.total || 0} total proposals submitted.
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600 }}>Multi-Agent Task Resolution</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>{summary?.tasks?.completion_rate || 0}%</span>
              </div>
              <div style={{ height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${Math.min(summary?.tasks?.completion_rate || 0, 100)}%`, 
                    height: '100%', 
                    backgroundColor: 'var(--success)' 
                  }} 
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {summary?.tasks?.completed || 0} completed of {summary?.tasks?.total || 0} total tasks.
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Client Pipeline Distribution
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: summary?.clients?.leads || 1, background: '#FEF3C7', padding: '0.5rem', borderRadius: 4, textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#B45309' }}>{summary?.clients?.leads || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#92400E' }}>Leads</div>
                </div>
                <div style={{ flex: summary?.clients?.active || 1, background: '#EFF6FF', padding: '0.5rem', borderRadius: 4, textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{summary?.clients?.active || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#1D4ED8' }}>Active</div>
                </div>
                <div style={{ flex: summary?.clients?.completed || 1, background: '#ECFDF5', padding: '0.5rem', borderRadius: 4, textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)' }}>{summary?.clients?.completed || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#065F46' }}>Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)', fontWeight: 600 }}>
            Recent Ledger Entries
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {finances.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No ledger entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  finances.slice(0, 8).map((f) => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 500 }}>
                        <div>{f.description || f.category}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {new Date(f.record_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.category}</span>
                      </td>
                      <td>
                        <span className={`badge ${f.type === 'Income' ? 'badge-completed' : 'badge-lead'}`}>
                          {f.type}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: f.type === 'Income' ? 'var(--success)' : 'var(--danger)' }}>
                        {f.type === 'Income' ? '+' : '-'}${f.amount?.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Finance Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Log Financial Entry</div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLogFinance}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Expense">Expense</option>
                      <option value="Income">Income</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount ($ USD) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      className="form-input"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Development">Development Retainer / Project</option>
                    <option value="Design">Design Services</option>
                    <option value="Software">Software & Cloud Subscriptions</option>
                    <option value="Hosting">Hosting & Domain Services</option>
                    <option value="Hardware">Hardware / Equipment</option>
                    <option value="Taxes">Taxes & Accounting</option>
                    <option value="Other">Other Miscellaneous</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Reference</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. OpenAI API monthly usage or Vercel Pro"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
