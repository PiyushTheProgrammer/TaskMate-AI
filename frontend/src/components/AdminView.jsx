import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Cpu, 
  Users, 
  Activity, 
  FileText, 
  CheckCircle, 
  Settings, 
  Save, 
  RefreshCw,
  Key,
  HardDrive
} from 'lucide-react';
import { api } from '../api';

export default function AdminView() {
  const [activeSubTab, setActiveSubTab] = useState('config');
  const [loading, setLoading] = useState(true);

  // States
  const [config, setConfig] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [health, setHealth] = useState(null);

  // Form
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [aiModel, setAiModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.5);
  const [savingConfig, setSavingConfig] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [cfg, us, logs, hlth] = await Promise.all([
        api.getAdminConfig(),
        api.getAdminUsers(),
        api.getAuditLogs(),
        api.getHealthMetrics()
      ]);
      setConfig(cfg);
      setAiModel(cfg.ai_model || 'gpt-4o-mini');
      setTemperature(cfg.temperature || 0.5);
      setUsers(us);
      setAuditLogs(logs);
      setHealth(hlth);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveConfig(e) {
    e.preventDefault();
    setSavingConfig(true);
    setSaveSuccess(false);
    try {
      await api.updateAdminConfig({
        openai_api_key: apiKeyInput || undefined,
        ai_model: aiModel,
        temperature: parseFloat(temperature)
      });
      setSaveSuccess(true);
      setApiKeyInput('');
      const updated = await api.getAdminConfig();
      setConfig(updated);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      alert(`Config update failed: ${err.message}`);
    } finally {
      setSavingConfig(false);
    }
  }

  async function handleToggleRole(user) {
    const newRole = user.role === 'admin' ? 'freelancer' : 'admin';
    try {
      await api.updateUserRole(user.id, newRole);
      const updatedUsers = await api.getAdminUsers();
      setUsers(updatedUsers);
    } catch (err) {
      alert(`Role update error: ${err.message}`);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} style={{ color: 'var(--primary)' }} />
            Administrator Control Center
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            System configuration, user accounts, audit trails, and server performance metrics
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={loadAll}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Sub tabs */}
      <div className="tabs">
        {[
          { id: 'config', label: 'AI & API Settings', icon: Key },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'health', label: 'System Health & Metrics', icon: Activity },
          { id: 'audit', label: 'Security Audit Trail', icon: FileText },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              className={`tab-btn ${activeSubTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveSubTab(t.id)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Icon size={15} />
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI Config */}
      {activeSubTab === 'config' && (
        <div style={{ maxWidth: 650 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">AI Engine Configuration</div>
                <div className="card-subtitle">Manage OpenAI API key and LLM generation parameters</div>
              </div>
            </div>

            {saveSuccess && (
              <div style={{ 
                backgroundColor: 'var(--success-bg)', 
                color: 'var(--success)', 
                border: '1px solid var(--success-border)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                Configuration updated successfully and applied to active session!
              </div>
            )}

            <form onSubmit={handleSaveConfig}>
              <div className="form-group">
                <label className="form-label">Current Key Status</label>
                <div style={{ 
                  padding: '0.65rem 0.85rem', 
                  backgroundColor: '#FAFAFA', 
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>Key Value: <b>{config?.openai_key_masked || 'Checking...'}</b></span>
                  <span className={`badge ${config?.openai_key_configured ? 'badge-completed' : 'badge-lead'}`}>
                    {config?.openai_key_configured ? 'OpenAI Active' : 'Intelligent Fallback Active'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Update OpenAI API Key</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="sk-... (Leave empty to keep existing key)"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  If empty, TaskMate AI operates seamlessly using its built-in heuristic NLP engine.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Default AI Model</label>
                  <select
                    className="form-select"
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                  >
                    <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cost Efficient)</option>
                    <option value="gpt-4o">GPT-4o (High Performance Reasoning)</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legacy)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Temperature: {temperature}</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    className="form-input"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    style={{ padding: '0.25rem' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>Strict (0.1)</span>
                    <span>Balanced (0.5)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={savingConfig}>
                <Save size={16} />
                {savingConfig ? 'Saving...' : 'Save AI Configuration'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Users Management */}
      {activeSubTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Hourly Rate</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>${u.hourly_rate}/hr</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-active' : 'badge-completed'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleToggleRole(u)}
                      >
                        {u.role === 'admin' ? 'Set as Freelancer' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: System Health */}
      {activeSubTab === 'health' && (
        <div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#ECFDF5', color: 'var(--success)' }}>
                <Activity size={22} />
              </div>
              <div>
                <div className="stat-value">{health?.status || 'Online'}</div>
                <div className="stat-label">System Availability (99.9% SLA)</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#EFF6FF', color: 'var(--primary)' }}>
                <HardDrive size={22} />
              </div>
              <div>
                <div className="stat-value">{health?.database_size_kb || 0} KB</div>
                <div className="stat-label">SQLite Database Footprint</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#FFFBEB', color: 'var(--warning)' }}>
                <Cpu size={22} />
              </div>
              <div>
                <div className="stat-value">{health?.cpu_usage_percent || 0}%</div>
                <div className="stat-label">CPU Compute Load</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#EEF2FF', color: 'var(--info)' }}>
                <Activity size={22} />
              </div>
              <div>
                <div className="stat-value">{health?.uptime_seconds || 0}s</div>
                <div className="stat-label">Uptime Since Boot</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Security Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)', fontWeight: 600 }}>
            Audit Trail (Compliance NFR-19)
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>User ID</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <span className="badge badge-lead">{log.action}</span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{log.entity_type || 'System'}</td>
                      <td>{log.user_id ? `#${log.user_id}` : 'System'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.details || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
