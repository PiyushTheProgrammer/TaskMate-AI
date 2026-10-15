import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  X
} from 'lucide-react';
import { api } from '../api';

export default function SchedulerView() {
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    event_type: 'Meeting',
    start_time: '',
    end_time: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [evs, cls] = await Promise.all([
        api.listEvents(),
        api.listClients()
      ]);
      setEvents(evs);
      setClients(cls);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    if (!formData.start_time || !formData.end_time) {
      alert('Please specify both start and end times.');
      return;
    }

    try {
      await api.createEvent({
        title: formData.title,
        client_id: formData.client_id ? parseInt(formData.client_id) : null,
        event_type: formData.event_type,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        description: formData.description
      });
      setShowModal(false);
      setFormData({
        title: '',
        client_id: '',
        event_type: 'Meeting',
        start_time: '',
        end_time: '',
        description: ''
      });
      loadData();
    } catch (err) {
      alert(`Event creation warning: ${err.message}`);
    }
  }

  async function handleDeleteEvent(id) {
    try {
      await api.deleteEvent(id);
      loadData();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  }

  async function handleGoogleSync() {
    setSyncing(true);
    try {
      const res = await api.syncGoogle();
      setSyncMessage(res.message);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err) {
      alert(`Sync error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Smart Schedule & Milestones</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage client discovery calls, demo reviews, and delivery deadlines
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={handleGoogleSync}
            disabled={syncing}
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Google Calendar'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Schedule Event
          </button>
        </div>
      </div>

      {syncMessage && (
        <div style={{ 
          backgroundColor: '#ECFDF5', 
          border: '1px solid #A7F3D0', 
          color: '#065F46', 
          padding: '0.75rem 1rem', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <CheckCircle size={16} />
          {syncMessage}
        </div>
      )}

      {/* Events Timeline Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Calendar Schedule</div>
            <div className="card-subtitle">{events.length} upcoming events scheduled</div>
          </div>
        </div>

        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            {loading ? 'Loading calendar...' : 'No upcoming events. Click "Schedule Event" to add a meeting or deadline.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {events.map((ev) => {
              const client = clients.find(c => c.id === ev.client_id);
              const isMeeting = ev.event_type === 'Meeting';

              return (
                <div
                  key={ev.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: '#FAFAFA'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isMeeting ? '#EFF6FF' : '#FFFBEB',
                      color: isMeeting ? 'var(--primary)' : '#B45309',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <CalendarIcon size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ev.title}</div>
                        <span className={`badge ${isMeeting ? 'badge-active' : 'badge-lead'}`}>
                          {ev.event_type}
                        </span>
                        {client && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            with {client.name}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={13} />
                        <span>
                          {new Date(ev.start_time).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {' '}&ndash;{' '}
                          {new Date(ev.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {ev.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          {ev.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDeleteEvent(ev.id)}
                    style={{ color: 'var(--danger)', padding: '0.4rem' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Schedule New Event or Deadline</div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Discovery Call with Sarah"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Event Type</label>
                    <select
                      className="form-select"
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    >
                      <option value="Meeting">Client Meeting / Call</option>
                      <option value="Deadline">Milestone Delivery Deadline</option>
                      <option value="Task">Focused Task Block</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Associated Client</label>
                    <select
                      className="form-select"
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    >
                      <option value="">-- None / Internal --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Time *</label>
                    <input
                      type="datetime-local"
                      required
                      className="form-input"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time *</label>
                    <input
                      type="datetime-local"
                      required
                      className="form-input"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Meeting Notes or Agenda</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Key topics to discuss or preparation notes..."
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
                  Save to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
