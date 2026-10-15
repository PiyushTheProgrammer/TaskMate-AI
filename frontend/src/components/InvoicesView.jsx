import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Download, 
  CheckCircle, 
  Clock, 
  Trash2, 
  X,
  DollarSign
} from 'lucide-react';
import { api } from '../api';

export default function InvoicesView() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [items, setItems] = useState([
    { description: 'Milestone 1: Project Architecture & Design', quantity: 1, unit_price: 1500, total: 1500 }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [invs, cls] = await Promise.all([
        api.listInvoices(),
        api.listClients()
      ]);
      setInvoices(invs);
      setClients(cls);
      if (cls.length > 0 && !clientId) setClientId(cls[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleItemChange(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      const q = parseFloat(updated[index].quantity) || 0;
      const p = parseFloat(updated[index].unit_price) || 0;
      updated[index].total = q * p;
    }
    setItems(updated);
  }

  function addItem() {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  }

  function removeItem(index) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  const grandTotal = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

  async function handleCreateInvoice(e) {
    e.preventDefault();
    if (!clientId) {
      alert('Please select a client.');
      return;
    }

    try {
      await api.createInvoice({
        client_id: parseInt(clientId),
        items: items,
        due_date: new Date(dueDate).toISOString(),
        status: 'Pending'
      });
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(`Failed to create invoice: ${err.message}`);
    }
  }

  async function toggleStatus(invoice) {
    const nextStatus = invoice.status === 'Paid' ? 'Pending' : 'Paid';
    try {
      await api.updateInvoiceStatus(invoice.id, nextStatus);
      loadData();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Invoices & Payment Tracking</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Issue professional billing invoices and monitor payment collection
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Create New Invoice
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    {loading ? 'Loading invoices...' : 'No invoices created yet.'}
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const client = clients.find(c => c.id === inv.client_id);
                  const isPaid = inv.status === 'Paid';
                  return (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600 }}>{inv.invoice_number}</td>
                      <td>{client ? client.name : `Client #${inv.client_id}`}</td>
                      <td style={{ fontWeight: 700 }}>${inv.total_amount?.toLocaleString()}</td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {new Date(inv.due_date).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge ${isPaid ? 'badge-completed' : 'badge-lead'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => toggleStatus(inv)}
                          >
                            {isPaid ? 'Mark Pending' : 'Mark Paid'}
                          </button>
                          <a
                            href={api.getInvoicePdfUrl(inv.id)}
                            className="btn btn-secondary btn-sm"
                            title="Download PDF"
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--primary)' }}
                          >
                            <Download size={14} /> PDF
                          </a>
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

      {/* Invoice Creator Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 650 }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Create Client Invoice</div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
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
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Due Date *</label>
                    <input 
                      type="date"
                      className="form-input"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Line Items</div>
                {items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="Service / deliverable description"
                      className="form-input"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      required
                    />
                    <input 
                      type="number" 
                      placeholder="Qty"
                      className="form-input"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      required
                    />
                    <input 
                      type="number" 
                      placeholder="Unit Price ($)"
                      className="form-input"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                      required
                    />
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>
                      ${(item.total || 0).toLocaleString()}
                    </div>
                    <button 
                      type="button"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      onClick={() => removeItem(idx)}
                      disabled={items.length <= 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={addItem}
                  style={{ marginTop: '0.5rem' }}
                >
                  <Plus size={14} /> Add Item Row
                </button>

                <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '1.25rem', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Grand Total:</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)' }}>
                    ${grandTotal.toLocaleString()} USD
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
