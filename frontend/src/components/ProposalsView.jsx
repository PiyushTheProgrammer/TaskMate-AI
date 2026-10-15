import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Download, 
  Send, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle, 
  Sparkles,
  X
} from 'lucide-react';
import { api } from '../api';

export default function ProposalsView({ initialData, onClearInitialData }) {
  const [proposals, setProposals] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Creator State
  const [showModal, setShowModal] = useState(false);
  const [previewProposal, setPreviewProposal] = useState(null);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    template_type: 'Standard',
    project_scope: '',
    deliverables: '',
    timeline: '3 to 4 weeks',
    total_budget: 3500,
    content: ''
  });

  useEffect(() => {
    loadData();
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        client_id: initialData.clientId || '',
        title: initialData.title || '',
        project_scope: initialData.scope || '',
        deliverables: initialData.deliverables || '',
        timeline: initialData.timeline || '3 to 4 weeks',
        total_budget: initialData.budget || 3500
      }));
      setShowModal(true);
      if (onClearInitialData) onClearInitialData();
    }
  }, [initialData]);

  async function loadData() {
    setLoading(true);
    try {
      const [props, cls] = await Promise.all([
        api.listProposals(),
        api.listClients()
      ]);
      setProposals(props);
      setClients(cls);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateProposal() {
    if (!formData.client_id) {
      alert('Please select a client first.');
      return;
    }
    if (!formData.title) {
      alert('Please provide a proposal title.');
      return;
    }

    setGenerating(true);
    try {
      const created = await api.generateProposal({
        client_id: parseInt(formData.client_id),
        title: formData.title,
        template_type: formData.template_type,
        project_scope: formData.project_scope,
        deliverables: formData.deliverables,
        timeline: formData.timeline,
        total_budget: parseFloat(formData.total_budget)
      });
      setShowModal(false);
      loadData();
      setPreviewProposal(created);
    } catch (err) {
      alert(`Failed to generate proposal: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  }

  async function handleStatusChange(proposal, newStatus) {
    try {
      await api.updateProposal(proposal.id, { status: newStatus });
      loadData();
      if (previewProposal && previewProposal.id === proposal.id) {
        setPreviewProposal({ ...previewProposal, status: newStatus });
      }
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this proposal?')) return;
    try {
      await api.deleteProposal(id);
      if (previewProposal && previewProposal.id === id) setPreviewProposal(null);
      loadData();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Client Proposals & Quotations</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Draft, edit, and export client-ready agreements in PDF
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => {
            setFormData({
              client_id: clients[0]?.id || '',
              title: '',
              template_type: 'Standard',
              project_scope: '',
              deliverables: '',
              timeline: '3 to 4 weeks',
              total_budget: 3500,
              content: ''
            });
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Create New Proposal
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: previewProposal ? 'minmax(320px, 1fr) minmax(450px, 1.4fr)' : '1fr', gap: '1.5rem' }}>
        {/* Proposals List Card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Proposal Title</th>
                  <th>Client</th>
                  <th>Budget</th>
                  <th>Template</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      {loading ? 'Loading proposals...' : 'No proposals generated yet. Click "Create New Proposal" to begin.'}
                    </td>
                  </tr>
                ) : (
                  proposals.map((prop) => {
                    const client = clients.find(c => c.id === prop.client_id);
                    let badgeClass = 'badge-lead';
                    if (prop.status === 'Accepted') badgeClass = 'badge-completed';
                    if (prop.status === 'Sent') badgeClass = 'badge-active';

                    return (
                      <tr key={prop.id} style={{ backgroundColor: previewProposal?.id === prop.id ? '#F1F5F9' : undefined }}>
                        <td style={{ fontWeight: 600 }}>
                          <div>{prop.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(prop.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td>{client ? client.name : `Client #${prop.client_id}`}</td>
                        <td style={{ fontWeight: 600 }}>${prop.total_budget?.toLocaleString()}</td>
                        <td>
                          <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)', border: '1px solid var(--border-light)', padding: '2px 6px', borderRadius: 4 }}>
                            {prop.template_type}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${badgeClass}`}>{prop.status}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Preview"
                              onClick={() => setPreviewProposal(prop)}
                              style={{ padding: '0.35rem' }}
                            >
                              <Eye size={14} />
                            </button>
                            <a
                              href={api.getProposalPdfUrl(prop.id)}
                              className="btn btn-secondary btn-sm"
                              title="Download PDF"
                              target="_blank"
                              rel="noreferrer"
                              style={{ padding: '0.35rem', color: 'var(--primary)' }}
                            >
                              <Download size={14} />
                            </a>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Delete"
                              onClick={() => handleDelete(prop.id)}
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

        {/* Live Preview Panel */}
        {previewProposal && (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{previewProposal.title}</div>
                <div className="card-subtitle">
                  Budget: ${previewProposal.total_budget?.toLocaleString()} | Template: {previewProposal.template_type}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                  value={previewProposal.status}
                  onChange={(e) => handleStatusChange(previewProposal, e.target.value)}
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Declined">Declined</option>
                </select>

                <a
                  href={api.getProposalPdfUrl(previewProposal.id)}
                  className="btn btn-primary btn-sm"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={14} /> Export PDF
                </a>

                <button 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  onClick={() => setPreviewProposal(null)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="markdown-preview" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {previewProposal.content}
            </div>
          </div>
        )}
      </div>

      {/* Proposal Creator Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                Generate AI Proposal & Quotation
              </div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Client *</label>
                <select 
                  className="form-select"
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  required
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company || 'Direct'})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Proposal Title *</label>
                  <input 
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Website Re-architecture & Modernization"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Template Style</label>
                  <select 
                    className="form-select"
                    value={formData.template_type}
                    onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                  >
                    <option value="Standard">Standard Freelance</option>
                    <option value="Modern">Modern Agile</option>
                    <option value="Formal">Formal Statement of Work</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Total Proposed Budget ($ USD)</label>
                  <input 
                    type="number"
                    className="form-input"
                    value={formData.total_budget}
                    onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Delivery Timeline</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. 4 weeks"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Scope Summary</label>
                <textarea 
                  className="form-textarea"
                  rows={3}
                  placeholder="Outline the client requirements and technical solution..."
                  value={formData.project_scope}
                  onChange={(e) => setFormData({ ...formData, project_scope: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deliverables Checklist</label>
                <textarea 
                  className="form-textarea"
                  rows={3}
                  placeholder="• Core feature A&#10;• Testing & QA&#10;• Deployment & Documentation"
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleGenerateProposal}
                disabled={generating}
              >
                <Sparkles size={16} />
                {generating ? 'Drafting Proposal...' : 'Generate Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
