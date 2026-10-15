import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Building2, 
  Sparkles, 
  Edit2, 
  Trash2, 
  Send,
  X,
  Check
} from 'lucide-react';
import { api } from '../api';

export default function ClientsView({ onOpenOutreach }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteConfirmClient, setDeleteConfirmClient] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'Lead',
    notes: ''
  });

  useEffect(() => {
    loadClients();
  }, [search, statusFilter]);

  async function loadClients() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const data = await api.listClients(params);
      setClients(data);
    } catch (err) {
      alert(`Error loading clients: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveClient(e) {
    e.preventDefault();
    try {
      if (editingClient) {
        await api.updateClient(editingClient.id, formData);
      } else {
        await api.createClient(formData);
      }
      setShowAddModal(false);
      setEditingClient(null);
      resetForm();
      loadClients();
    } catch (err) {
      alert(`Failed to save client: ${err.message}`);
    }
  }

  async function handleDelete(client) {
    try {
      await api.deleteClient(client.id);
      setDeleteConfirmClient(null);
      loadClients();
    } catch (err) {
      alert(`Failed to delete client: ${err.message}`);
    }
  }

  async function fetchAiSuggestion(client) {
    try {
      const res = await api.getClientSuggestions(client.id);
      setAiSuggestion(res);
    } catch (err) {
      alert(`Failed to fetch AI suggestion: ${err.message}`);
    }
  }

  function openEdit(client) {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      status: client.status,
      notes: client.notes || ''
    });
    setShowAddModal(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'Lead',
      notes: ''
    });
  }

  return (
    <div>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, maxWidth: '420px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search by name, email, or company..."
              className="form-input"
              style={{ paddingLeft: '2rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => { resetForm(); setEditingClient(null); setShowAddModal(true); }}
        >
          <Plus size={18} /> Add New Client
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        {['ALL', 'Lead', 'Active', 'Completed'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${statusFilter === tab ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab)}
          >
            {tab === 'ALL' ? 'All Clients' : tab}
          </button>
        ))}
      </div>

      {/* Clients Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Notes / Brief</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    {loading ? 'Loading client records...' : 'No clients found matching criteria.'}
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
                  let badgeClass = 'badge-lead';
                  if (client.status === 'Active') badgeClass = 'badge-active';
                  if (client.status === 'Completed') badgeClass = 'badge-completed';

                  return (
                    <tr key={client.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div>{client.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Joined {new Date(client.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                          <Building2 size={14} />
                          <span>{client.company || 'Independent'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.825rem' }}>{client.email}</div>
                        {client.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.phone}</div>}
                      </td>
                      <td>
                        <span className={`badge ${badgeClass}`}>{client.status}</span>
                      </td>
                      <td style={{ maxWidth: 220, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {client.notes ? client.notes.slice(0, 70) + (client.notes.length > 70 ? '...' : '') : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="AI Follow-Up Suggestion"
                            onClick={() => fetchAiSuggestion(client)}
                            style={{ padding: '0.35rem 0.5rem', color: 'var(--primary)' }}
                          >
                            <Sparkles size={14} /> AI Tip
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit Client"
                            onClick={() => openEdit(client)}
                            style={{ padding: '0.35rem' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Delete Client"
                            onClick={() => setDeleteConfirmClient(client)}
                            style={{ padding: '0.35rem', color: 'var(--danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {editingClient ? 'Edit Client Record' : 'Add New Client'}
              </div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveClient}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Client Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe or Sarah Jenkins"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@company.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Company / Organization</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Acme Media"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Client Pipeline Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Lead">Lead (Prospective)</option>
                      <option value="Active">Active (Ongoing Project)</option>
                      <option value="Completed">Completed (Past Client)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Requirements Overview</label>
                  <textarea
                    className="form-textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Key project goals, preferences, or discussion summary..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingClient ? 'Save Changes' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Suggestion Modal */}
      {aiSuggestion && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                AI CRM Recommendation
              </div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setAiSuggestion(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                Client: <b>{aiSuggestion.client_name}</b> ({aiSuggestion.status})
              </div>
              <div style={{ 
                backgroundColor: 'var(--bg-subtle)', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                borderLeft: '4px solid var(--primary)',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                {aiSuggestion.recommendation}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                Inactive duration: {aiSuggestion.days_inactive} days since last recorded touchpoint.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAiSuggestion(null)}>
                Close
              </button>
              {onOpenOutreach && (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const cid = aiSuggestion.client_id;
                    setAiSuggestion(null);
                    onOpenOutreach(cid);
                  }}
                >
                  <Send size={15} /> Compose Message
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (BR-6) */}
      {deleteConfirmClient && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, color: 'var(--danger)' }}>Confirm Client Removal</div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setDeleteConfirmClient(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ fontSize: '0.9rem' }}>
              Are you sure you want to permanently delete <b>{deleteConfirmClient.name}</b>? All associated requirements and records will be deleted.
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmClient(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirmClient)}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
