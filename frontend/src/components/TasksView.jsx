import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Code, 
  Palette, 
  Play, 
  CheckCircle, 
  RotateCcw, 
  XCircle, 
  Plus, 
  Eye, 
  Clock, 
  AlertCircle,
  FileCode,
  Layers,
  X
} from 'lucide-react';
import { api } from '../api';

export default function TasksView() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [processingTaskId, setProcessingTaskId] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    task_type: 'Developer Task',
    description: '',
    input_payload: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [ts, cs] = await Promise.all([
        api.listTasks(),
        api.listClients()
      ]);
      setTasks(ts);
      setClients(cs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    try {
      const created = await api.createTask({
        client_id: formData.client_id ? parseInt(formData.client_id) : null,
        title: formData.title,
        task_type: formData.task_type,
        description: formData.description,
        input_payload: formData.input_payload
      });
      setShowCreateModal(false);
      setFormData({
        client_id: '',
        title: '',
        task_type: 'Developer Task',
        description: '',
        input_payload: ''
      });
      loadData();
      // Auto-trigger agent execution
      triggerAgentExecution(created.id);
    } catch (err) {
      alert(`Failed to create task: ${err.message}`);
    }
  }

  async function triggerAgentExecution(taskId) {
    setProcessingTaskId(taskId);
    try {
      const updated = await api.processTask(taskId);
      loadData();
      setActiveTask(updated);
    } catch (err) {
      alert(`Agent execution failed: ${err.message}`);
    } finally {
      setProcessingTaskId(null);
    }
  }

  async function handleReviewAction(action) {
    if (!activeTask) return;
    try {
      const updated = await api.reviewTask(activeTask.id, {
        action: action,
        feedback: reviewFeedback
      });
      setShowReviewModal(false);
      setReviewFeedback('');
      loadData();
      setActiveTask(updated);
    } catch (err) {
      alert(`Review action failed: ${err.message}`);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={20} style={{ color: 'var(--primary)' }} />
            Multi-Agent Task Orchestrator
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Autonomous specialized execution by <b>Developer Agent</b> and <b>Design Agent</b> with client feedback loop
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> New Agent Task
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeTask ? 'minmax(320px, 1fr) minmax(460px, 1.4fr)' : '1fr', gap: '1.5rem' }}>
        {/* Task Cards Pipeline */}
        <div className="card" style={{ padding: '1rem' }}>
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <div className="card-title">Orchestrated Tasks</div>
            <div className="card-subtitle">{tasks.length} total active tasks</div>
          </div>

          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              {loading ? 'Loading agent pipeline...' : 'No active tasks. Click "New Agent Task" to dispatch.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tasks.map((task) => {
                const isDev = task.task_type.includes('Dev');
                const isProcessing = processingTaskId === task.id;

                let statusBadge = 'badge-lead';
                if (task.status === 'Completed') statusBadge = 'badge-completed';
                if (task.status === 'Reviewing') statusBadge = 'badge-active';
                if (task.status === 'Reworking') statusBadge = 'badge-lead';

                return (
                  <div
                    key={task.id}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      backgroundColor: activeTask?.id === task.id ? '#F1F5F9' : '#FFFFFF',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${isDev ? 'badge-agent-dev' : 'badge-agent-design'}`}>
                          {isDev ? <Code size={13} /> : <Palette size={13} />}
                          {task.assigned_agent}
                        </span>
                        <span className={`badge ${statusBadge}`}>
                          {task.status}
                        </span>
                        {task.revision_count > 0 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            (Rev #{task.revision_count})
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      {task.description.slice(0, 90)}{task.description.length > 90 ? '...' : ''}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Updated: {new Date(task.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {task.status === 'Queued' || task.status === 'Reworking' ? (
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={isProcessing}
                            onClick={() => triggerAgentExecution(task.id)}
                          >
                            <Play size={13} /> {isProcessing ? 'Executing...' : 'Run Agent'}
                          </button>
                        ) : null}

                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setActiveTask(task)}
                        >
                          <Eye size={13} /> Inspect
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Task Inspection & Review Workspace */}
        {activeTask && (
          <div className="card">
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="card-title">{activeTask.title}</div>
                  <span className={`badge ${activeTask.status === 'Completed' ? 'badge-completed' : 'badge-active'}`}>
                    {activeTask.status}
                  </span>
                </div>
                <div className="card-subtitle">
                  Assigned: <b>{activeTask.assigned_agent}</b> | Revisions: {activeTask.revision_count}
                </div>
              </div>

              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setActiveTask(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Task Details */}
            <div style={{ marginBottom: '1rem', backgroundColor: '#FAFAFA', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Specification Brief:</div>
              <div>{activeTask.description}</div>
              {activeTask.client_feedback && (
                <div style={{ marginTop: '0.5rem', color: '#B45309', backgroundColor: '#FFFBEB', padding: '0.5rem', borderRadius: 4 }}>
                  <b>Latest Review Feedback:</b> {activeTask.client_feedback}
                </div>
              )}
            </div>

            {/* Agent Deliverable Output */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileCode size={16} /> Generated Deliverable
                </div>
                {processingTaskId === activeTask.id && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Agent is computing...</span>
                )}
              </div>

              <div className="markdown-preview" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {activeTask.generated_output || 'No output generated yet. Click "Run Agent" to initiate task execution.'}
              </div>
            </div>

            {/* State Machine Action Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
              <div>
                {activeTask.status === 'Reviewing' && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Pending Quality Check review
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {activeTask.status === 'Reviewing' && (
                  <>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowReviewModal(true)}
                    >
                      <RotateCcw size={14} /> Request Revisions
                    </button>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleReviewAction('accept')}
                    >
                      <CheckCircle size={14} /> Approve & Complete
                    </button>
                  </>
                )}

                {activeTask.status !== 'Completed' && activeTask.status !== 'Cancelled' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => handleReviewAction('cancel')}
                  >
                    <XCircle size={14} /> Cancel Task
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Task Dispatch Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={18} style={{ color: 'var(--primary)' }} />
                Dispatch New Autonomous Task
              </div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setShowCreateModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Client (Optional)</label>
                  <select
                    className="form-select"
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  >
                    <option value="">-- Internal / No Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Agent Specialization *</label>
                  <select
                    className="form-select"
                    value={formData.task_type}
                    onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                  >
                    <option value="Developer Task">Developer Agent (Code, APIs, Testing, GitHub PRs)</option>
                    <option value="Design Task">Design Agent (Layouts, Design System, Tokens, Figma Specs)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Build Stripe Webhook Ingestion or Design Navigation Header"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Task Instructions & Acceptance Criteria *</label>
                  <textarea
                    required
                    className="form-textarea"
                    rows={4}
                    placeholder="Provide explicit requirements, edge cases, and expected deliverable structure..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Queue & Dispatch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revision Feedback Modal (State Diagram Loop) */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RotateCcw size={16} style={{ color: 'var(--warning)' }} />
                Request Agent Revisions
              </div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setShowReviewModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Enter the specific modifications needed. The agent will reprocess the task with your feedback.
              </div>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="e.g. Please add error handling for timeout errors, and format responses as JSON..."
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleReviewAction('rework')}
                disabled={!reviewFeedback.trim()}
              >
                Submit Feedback to Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
