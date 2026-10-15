import React, { useState } from 'react';
import { api } from '../api';
import { Sparkles, ArrowRight, Lock, Mail, User, ShieldCheck } from 'lucide-react';

export default function LoginView({ onLoginSuccess, initialRegister = false, onBackToHome }) {
  const [isRegister, setIsRegister] = useState(initialRegister);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    email: 'yashodhan@taskmate.ai',
    password: 'freelance123',
    full_name: 'Yashodhan Suryawanshi',
    hourly_rate: 65.0,
    skills: 'Python, FastAPI, React, AI/ML'
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const res = await api.register({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          hourly_rate: parseFloat(formData.hourly_rate) || 45.0,
          skills: formData.skills
        });
        onLoginSuccess(res.user);
      } else {
        const res = await api.login(formData.email, formData.password);
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login('yashodhan@taskmate.ai', 'freelance123');
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-page)',
      padding: '1.5rem'
    }}>
      <div style={{
        maxWidth: 440,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-md)',
        padding: '2rem'
      }}>
        {onBackToHome && (
          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={onBackToHome}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              &larr; Back to Landing Page
            </button>
          </div>
        )}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            fontWeight: 800,
            fontSize: '1.4rem',
            marginBottom: '0.75rem'
          }}>
            TM
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            TaskMate AI
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Personal Business Assistant for Freelancers
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        {/* Demo Account Shortcut */}
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
            <ShieldCheck size={16} /> Pre-configured Demo Profile
          </div>
          <div style={{ fontSize: '0.775rem', color: '#1E40AF' }}>
            Contains ready-to-explore clients, proposals, invoices, and multi-agent workflows.
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{ width: '100%', marginTop: '0.2rem' }}
          >
            One-Click Demo Sign In &rarr;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Yashodhan Suryawanshi"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="you@freelancer.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {isRegister && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Hourly Rate ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Key Skills</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Python, React..."
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Freelancer Account' : 'Sign In to Workspace'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
          >
            {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register as Freelancer'}
          </button>
        </div>
      </div>
    </div>
  );
}
