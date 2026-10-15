import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  UploadCloud, 
  FileText, 
  ArrowRight, 
  Save, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Cpu, 
  ListChecks,
  History
} from 'lucide-react';
import { api } from '../api';

export default function AnalyzerView({ onConvertToProposal }) {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Extracted Result
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadClients();
    loadHistory();
  }, []);

  async function loadClients() {
    try {
      const data = await api.listClients();
      setClients(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadHistory() {
    try {
      const data = await api.getRequirementHistory();
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAnalyze(e) {
    e.preventDefault();
    setAnalyzing(true);
    setResult(null);

    try {
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        if (selectedClientId) formData.append('client_id', selectedClientId);
        formData.append('title', title || uploadedFile.name);
        const res = await api.uploadDoc(formData);
        setResult(res);
      } else {
        if (!rawText.trim()) {
          alert('Please enter client requirements or select a file to upload.');
          setAnalyzing(false);
          return;
        }
        const res = await api.analyzeText({
          client_id: selectedClientId ? parseInt(selectedClientId) : null,
          title: title || 'Client Requirement Brief',
          raw_text: rawText
        });
        setResult(res);
      }
    } catch (err) {
      alert(`Requirement analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    try {
      await api.saveRequirement({
        client_id: selectedClientId ? parseInt(selectedClientId) : null,
        title: result.title || 'Requirement Brief',
        raw_input: result.raw_text || rawText,
        scope: result.scope,
        budget_min: result.budget_min,
        budget_max: result.budget_max,
        timeline: result.timeline,
        deliverables: result.deliverables,
        tech_stack: result.tech_stack
      });
      alert('Requirements saved successfully to project repository!');
      loadHistory();
    } catch (err) {
      alert(`Error saving requirements: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(400px, 1.2fr)', gap: '1.5rem' }}>
        {/* Left Column: Input Panel */}
        <div>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Input Project Details</div>
                <div className="card-subtitle">Paste emails, notes, or upload RFP documents</div>
              </div>
            </div>

            <form onSubmit={handleAnalyze}>
              <div className="form-group">
                <label className="form-label">Client (Optional)</label>
                <select 
                  className="form-select"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                >
                  <option value="">-- Associate with a client (optional) --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company || 'No Company'})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Requirement Title</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. E-Commerce Redesign & Checkout Overhaul"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Raw Requirement Text / Client Notes</label>
                <textarea 
                  className="form-textarea"
                  style={{ minHeight: 180 }}
                  placeholder="Paste unstructured client emails, slack messages, or scope discussions here..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Or Upload Document (.pdf, .docx, .txt)</label>
                <div style={{
                  border: '2px dashed var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  textAlign: 'center',
                  backgroundColor: '#FAFAFA',
                  cursor: 'pointer'
                }}>
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setUploadedFile(e.target.files[0] || null)}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <UploadCloud size={24} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {uploadedFile ? uploadedFile.name : 'Choose file to extract requirements'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Supports PDF, DOCX, and TXT briefs
                    </span>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={analyzing}
              >
                <Sparkles size={18} />
                {analyzing ? 'Analyzing with AI...' : 'Run AI Requirement Analysis'}
              </button>
            </form>
          </div>

          {/* Quick Examples */}
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              Need a quick demo sample?
            </div>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setTitle('Mobile Fitness Booking App');
                setRawText(
                  "Hi Yashodhan, we are looking to build a cross-platform fitness trainer booking app in React Native and Node.js. " +
                  "Key features: member profiles, calendar booking with trainers, and Stripe payment integration. " +
                  "Our target launch is in 6 weeks and our budget is around $4,000 - $6,000. Let us know if you can take this on!"
                );
              }}
            >
              Fill Sample Client Message
            </button>
          </div>
        </div>

        {/* Right Column: Structured AI Extraction View */}
        <div>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Structured Analysis Result</div>
                <div className="card-subtitle">AI-extracted scope, deliverables, budget & tech stack</div>
              </div>
              {result && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save size={14} /> Save
                  </button>
                  {onConvertToProposal && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onConvertToProposal({
                        clientId: selectedClientId,
                        title: title || result.title,
                        scope: result.scope,
                        deliverables: result.deliverables,
                        timeline: result.timeline,
                        budget: result.budget_max || result.budget_min || 2500
                      })}
                    >
                      Convert to Proposal <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {result ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Metric overview chips */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      <DollarSign size={14} /> Estimated Budget
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
                      ${result.budget_min?.toLocaleString()} – ${result.budget_max?.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      <Clock size={14} /> Est. Timeline
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
                      {result.timeline || '3-4 weeks'}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      <Cpu size={14} /> Recommended Stack
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {result.tech_stack || 'React, Python'}
                    </div>
                  </div>
                </div>

                {/* Scope */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={16} /> Project Scope (Editable)
                  </label>
                  <textarea 
                    className="form-textarea"
                    rows={4}
                    value={result.scope}
                    onChange={(e) => setResult({ ...result, scope: e.target.value })}
                  />
                </div>

                {/* Deliverables */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ListChecks size={16} /> Key Deliverables (Editable)
                  </label>
                  <textarea 
                    className="form-textarea"
                    rows={4}
                    value={result.deliverables}
                    onChange={(e) => setResult({ ...result, deliverables: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div style={{ 
                padding: '3rem 1rem', 
                textAlign: 'center', 
                color: 'var(--text-muted)',
                backgroundColor: '#F8FAFC',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-light)'
              }}>
                <Sparkles size={36} style={{ color: 'var(--border-focus)', marginBottom: '0.75rem' }} />
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  No Analysis Initiated Yet
                </div>
                <div style={{ fontSize: '0.85rem', maxWidth: 320, margin: '0 auto' }}>
                  Paste raw requirements on the left or select a sample brief to automatically parse deliverables and pricing.
                </div>
              </div>
            )}
          </div>

          {/* Past Analyzed Briefs */}
          {history.length > 0 && (
            <div className="card">
              <div className="card-header" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                  <History size={16} /> Saved Requirements History
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {history.slice(0, 3).map((item) => (
                  <div 
                    key={item.id} 
                    style={{ 
                      padding: '0.65rem 0.85rem', 
                      backgroundColor: '#FAFAFA', 
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Est: ${item.budget_min} - ${item.budget_max} | {item.timeline}
                      </div>
                    </div>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setResult(item)}
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
