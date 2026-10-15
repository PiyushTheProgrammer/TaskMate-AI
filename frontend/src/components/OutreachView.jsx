import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  Trash2, 
  CheckCircle,
  Calendar,
  X
} from 'lucide-react';
import { api } from '../api';

export default function OutreachView({ targetClientId }) {
  const [clients, setClients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form State
  const [clientId, setClientId] = useState('');
  const [channel, setChannel] = useState('Email');
  const [purpose, setPurpose] = useState('follow_up');
  const [tone, setTone] = useState('Professional');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (targetClientId && clients.length > 0) {
      setClientId(targetClientId);
    }
  }, [targetClientId, clients]);

  async function loadData() {
    setLoading(true);
    try {
      const [cls, msgs] = await Promise.all([
        api.listClients(),
        api.getOutreachHistory()
      ]);
      setClients(cls);
      setMessages(msgs);
      if (cls.length > 0 && !clientId) {
        setClientId(cls[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAi() {
    if (!clientId) {
      alert('Please select a client.');
      return;
    }
    setGenerating(true);
    try {
      const res = await api.generateOutreachMessage({
        client_id: parseInt(clientId),
        purpose: purpose,
        tone: tone,
        channel: channel
      });
      setSubject(res.subject || '');
      setBody(res.body || '');
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!clientId || !body.trim()) {
      alert('Please select a client and ensure message body is filled.');
      return;
    }

    try {
      await api.sendOutreachMessage({
        client_id: parseInt(clientId),
        channel: channel,
        subject: subject,
        message_body: body,
        status: isScheduled ? 'Scheduled' : 'Sent',
        scheduled_time: isScheduled && scheduledTime ? new Date(scheduledTime).toISOString() : null
      });
      alert(isScheduled ? 'Message successfully scheduled!' : 'Message sent successfully!');
      setBody('');
      setSubject('');
      setIsScheduled(false);
      loadData();
    } catch (err) {
      alert(`Sending failed: ${err.message}`);
    }
  }

  async function handleDeleteMessage(id) {
    try {
      await api.cancelOutreachMessage(id);
      loadData();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Send size={20} style={{ color: 'var(--primary)' }} />
          Outreach Automation & Follow-Ups
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Compose personalized email and WhatsApp communications with AI assistance
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1.1fr) minmax(350px, 1fr)', gap: '1.5rem' }}>
        {/* Compose Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Compose Client Message</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                className={`btn btn-sm ${channel === 'Email' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setChannel('Email')}
              >
                <Mail size={14} /> Email
              </button>
              <button 
                type="button" 
                className={`btn btn-sm ${channel === 'WhatsApp' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setChannel('WhatsApp')}
              >
                <MessageSquare size={14} /> WhatsApp
              </button>
            </div>
          </div>

          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">Client *</label>
              <select
                className="form-select"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              >
                <option value="">-- Choose Client --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Outreach Purpose</label>
                <select
                  className="form-select"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                >
                  <option value="follow_up">General Follow-Up</option>
                  <option value="proposal_submission">Proposal Submission</option>
                  <option value="milestone_check">Milestone Review Ready</option>
                  <option value="payment_reminder">Payment Reminder</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tone</label>
                <select
                  className="form-select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="Professional">Professional</option>
                  <option value="Friendly">Friendly & Approachable</option>
                  <option value="Direct">Direct & Concise</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleGenerateAi}
                disabled={generating}
                style={{ width: '100%', padding: '0.6rem' }}
              >
                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                {generating ? 'Drafting with AI...' : 'Draft Message with AI'}
              </button>
            </div>

            {channel === 'Email' && (
              <div className="form-group">
                <label className="form-label">Subject Line</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Project Update & Next Milestones"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Message Content *</label>
              <textarea
                required
                className="form-textarea"
                rows={6}
                placeholder="Personalized message body..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            {/* Schedule Option */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', marginBottom: isScheduled ? '0.75rem' : 0 }}>
                <input 
                  type="checkbox" 
                  checked={isScheduled} 
                  onChange={(e) => setIsScheduled(e.target.checked)} 
                />
                <span>Schedule delivery for later date/time</span>
              </label>

              {isScheduled && (
                <input
                  type="datetime-local"
                  className="form-input"
                  required={isScheduled}
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              <Send size={16} />
              {isScheduled ? 'Schedule Message' : `Send via ${channel}`}
            </button>
          </form>
        </div>

        {/* Communication History Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Communication Log</div>
              <div className="card-subtitle">Sent and scheduled client messages</div>
            </div>
          </div>

          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              {loading ? 'Loading log...' : 'No communications sent yet.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '550px', overflowY: 'auto' }}>
              {messages.map((msg) => {
                const client = clients.find(c => c.id === msg.client_id);
                return (
                  <div
                    key={msg.id}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: '#FAFAFA'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${msg.channel === 'Email' ? 'badge-active' : 'badge-completed'}`}>
                          {msg.channel === 'Email' ? <Mail size={12} /> : <MessageSquare size={12} />}
                          {msg.channel}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {client ? client.name : `Client #${msg.client_id}`}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className={`badge ${msg.status === 'Sent' ? 'badge-completed' : 'badge-lead'}`}>
                          {msg.status}
                        </span>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                          onClick={() => handleDeleteMessage(msg.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {msg.subject && (
                      <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                        {msg.subject}
                      </div>
                    )}

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', whiteSpace: 'pre-wrap' }}>
                      {msg.message_body.slice(0, 150)}{msg.message_body.length > 150 ? '...' : ''}
                    </div>

                    <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', marginTop: '0.5rem' }}>
                      {msg.status === 'Sent' && msg.sent_time
                        ? `Sent ${new Date(msg.sent_time).toLocaleString()}`
                        : msg.scheduled_time
                        ? `Scheduled for ${new Date(msg.scheduled_time).toLocaleString()}`
                        : `Draft created ${new Date(msg.created_at).toLocaleDateString()}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
