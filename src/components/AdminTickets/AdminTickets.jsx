import React, { useState, useEffect } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import AdminHeader from '../AdminHeader';
import Footer from '../Footer';
import VideoLogo from '../VideoLogo';
import { ticketsApi, eventsApi } from '../../lib/adminApi';
import { config } from '../../config/environment';
import './AdminTickets.css';

const AdminTickets = () => {
  const { navigateWithLoading } = useNavigationWithLoading();
  const [activeTab, setActiveTab] = useState('generate');
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Form states
  const [ticketForm, setTicketForm] = useState({
    customerName: '',
    customerEmail: '',
    customerMobile: '',
    eventName: '',
    eventId: '',
    numberOfTickets: 1,
    amountPaid: '',
    eventTimings: '',
    venue: ''
  });

  const [verifyForm, setVerifyForm] = useState({
    ticketId: '',
    ticketNumber: ''
  });

  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    fetchEvents();
    if (activeTab === 'list') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      const response = await eventsApi.getAll();
      // Handle API response structure  
      const data = response.data || response || [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]); // Ensure events is always an array
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketsApi.getAll();
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      showMessage('Error fetching tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleFormChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'ticket') {
      setTicketForm(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Auto-fill event details when event is selected
      if (name === 'eventId' && value) {
        const selectedEvent = events.find(event => event.id === value);
        if (selectedEvent) {
          setTicketForm(prev => ({
            ...prev,
            eventName: selectedEvent.title,
            venue: selectedEvent.venue || '',
            eventTimings: `${new Date(selectedEvent.startDate).toLocaleString()} - ${new Date(selectedEvent.endDate).toLocaleString()}`
          }));
        }
      }
    } else if (formType === 'verify') {
      setVerifyForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleGenerateTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedTicket(null);

    try {
      const result = await ticketsApi.create(ticketForm);
      setGeneratedTicket(result);
      showMessage('Ticket generated successfully!', 'success');
      
      // Reset form
      setTicketForm({
        customerName: '',
        customerEmail: '',
        customerMobile: '',
        eventName: '',
        eventId: '',
        numberOfTickets: 1,
        amountPaid: '',
        eventTimings: '',
        venue: ''
      });
    } catch (error) {
      console.error('Error generating ticket:', error);
      showMessage('Error generating ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerificationResult(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.apiBaseUrl}/tickets/verify-number/${verifyForm.ticketNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include' // Essential for CORS with credentials
      });

      const data = await response.json();
      setVerificationResult(data);
      
      if (response.ok) {
        showMessage('Ticket verified successfully!', 'success');
      } else {
        showMessage(data.message || 'Error verifying ticket', 'error');
      }
    } catch (error) {
      console.error('Error verifying ticket:', error);
      showMessage('Error verifying ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = (ticket) => {
    // Create ticket content
    const ticketContent = `
      KALAKRITAM EVENT TICKET
      =====================
      
      Ticket Number: ${ticket.ticketNumber}
      Customer: ${ticket.customerName}
      Email: ${ticket.customerEmail}
      Phone: ${ticket.customerMobile}
      
      Event: ${ticket.eventName}
      Venue: ${ticket.venue}
      Timings: ${ticket.eventTimings}
      
      Number of Tickets: ${ticket.numberOfTickets}
      Amount Paid: ₹${ticket.amountPaid}
      
      Status: ${ticket.status.toUpperCase()}
      Generated: ${new Date(ticket.createdAt).toLocaleString()}
      
      Please present this ticket at the venue.
      Scan the QR code for verification.
    `;

    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket_${ticket.ticketNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="admin-tickets-container">
      <VideoLogo />
      <AdminHeader currentPage="tickets" />
      
      <main className="admin-tickets-content">
        <div className="admin-tickets-header">
          <h1>Ticket Management</h1>
          <button 
            onClick={() => navigateWithLoading('/admin/portal')}
            className="back-btn"
          >
            ← Back to Portal
          </button>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="admin-tickets-tabs">
          <button 
            className={`tab ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            🎫 Generate Ticket
          </button>
          <button 
            className={`tab ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            ✅ Verify Ticket
          </button>
          <button 
            className={`tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            📋 All Tickets
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'generate' && (
            <div className="generate-ticket-section">
              <form onSubmit={handleGenerateTicket} className="ticket-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Customer Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={ticketForm.customerName}
                      onChange={(e) => handleFormChange(e, 'ticket')}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={ticketForm.customerEmail}
                      onChange={(e) => handleFormChange(e, 'ticket')}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      name="customerMobile"
                      value={ticketForm.customerMobile}
                      onChange={(e) => handleFormChange(e, 'ticket')}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Number of Tickets *</label>
                    <input
                      type="number"
                      name="numberOfTickets"
                      value={ticketForm.numberOfTickets}
                      onChange={(e) => handleFormChange(e, 'ticket')}
                      min="1"
                      max="50"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Select Event</label>
                    <select
                      name="eventId"
                      value={ticketForm.eventId}
                      onChange={(e) => handleFormChange(e, 'ticket')}
                    >
                      <option value="">Select an event (optional)</option>
                      {events.map(event => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Event Name *</label>
                    <input
                      type="text"
                      name="eventName"
                      value={ticketForm.eventName}
                      onChange={(e) => handleFormChange(e, 'ticket')}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Amount Paid *</label>
                    <input
                      type="number"
                      name="amountPaid"
                      value={ticketForm.amountPaid}
                      onChange={(e) => handleFormChange(e, 'ticket')}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Venue *</label>
                    <input
                      type="text"
                      name="venue"
                      value={ticketForm.venue}
                      onChange={(e) => handleFormChange(e, 'ticket')}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Event Timings *</label>
                  <input
                    type="text"
                    name="eventTimings"
                    value={ticketForm.eventTimings}
                    onChange={(e) => handleFormChange(e, 'ticket')}
                    placeholder="e.g., March 15, 2025 6:00 PM - 9:00 PM"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="generate-btn">
                  {loading ? 'Generating...' : '🎫 Generate Ticket'}
                </button>
              </form>

              {generatedTicket && (
                <div className="generated-ticket">
                  <h3>🎉 Ticket Generated Successfully!</h3>
                  <div className="ticket-details">
                    <div className="ticket-info">
                      <p><strong>Ticket Number:</strong> <span className="ticket-number">{generatedTicket.ticketNumber}</span></p>
                      <p><strong>Customer:</strong> <span>{generatedTicket.customerName}</span></p>
                      <p><strong>Email:</strong> <span>{generatedTicket.customerEmail}</span></p>
                      <p><strong>Mobile:</strong> <span>{generatedTicket.customerMobile}</span></p>
                      <p><strong>Event:</strong> <span>{generatedTicket.eventName}</span></p>
                      <p><strong>Venue:</strong> <span>{generatedTicket.venue}</span></p>
                      <p><strong>Timings:</strong> <span>{generatedTicket.eventTimings}</span></p>
                      <p><strong>Tickets:</strong> <span>{generatedTicket.numberOfTickets}</span></p>
                      <p><strong>Amount Paid:</strong> <span>₹{generatedTicket.amountPaid}</span></p>
                    </div>
                    <div className="ticket-qr">
                      <img src={generatedTicket.qrCode} alt="QR Code" />
                      <p>Scan for Verification</p>
                    </div>
                  </div>
                  <div className="ticket-actions">
                    <button onClick={() => downloadTicket(generatedTicket)} className="download-btn">
                      📥 Download Ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'verify' && (
            <div className="verify-ticket-section">
              <form onSubmit={handleVerifyTicket} className="verify-form">
                <div className="form-group">
                  <label>Ticket ID</label>
                  <input
                    type="text"
                    name="ticketId"
                    value={verifyForm.ticketId}
                    onChange={(e) => handleFormChange(e, 'verify')}
                    placeholder="Enter ticket ID"
                  />
                </div>
                <div className="form-group">
                  <label>OR Ticket Number</label>
                  <input
                    type="text"
                    name="ticketNumber"
                    value={verifyForm.ticketNumber}
                    onChange={(e) => handleFormChange(e, 'verify')}
                    placeholder="Enter ticket number (e.g., TKT-123456-ABC123)"
                  />
                </div>
                <button type="submit" disabled={loading} className="verify-btn">
                  {loading ? 'Verifying...' : '✅ Verify Ticket'}
                </button>
              </form>

              {verificationResult && (
                <div className={`verification-result ${verificationResult.success ? 'valid' : 'invalid'}`}>
                  <h3>{verificationResult.success ? '✅ Valid Ticket' : '❌ Invalid Ticket'}</h3>
                  
                  {verificationResult.success && verificationResult.ticket && (
                    <div className="ticket-verification-details">
                      <p><strong>Ticket Number:</strong> <span className="ticket-number">{verificationResult.ticket.ticketNumber}</span></p>
                      <p><strong>Customer:</strong> <span>{verificationResult.ticket.customerName}</span></p>
                      <p><strong>Email:</strong> <span>{verificationResult.ticket.customerEmail}</span></p>
                      <p><strong>Mobile:</strong> <span>{verificationResult.ticket.customerMobile}</span></p>
                      <p><strong>Event:</strong> <span>{verificationResult.ticket.eventName}</span></p>
                      <p><strong>Venue:</strong> <span>{verificationResult.ticket.venue}</span></p>
                      <p><strong>Timings:</strong> <span>{verificationResult.ticket.eventTimings}</span></p>
                      <p><strong>Tickets:</strong> <span>{verificationResult.ticket.numberOfTickets}</span></p>
                      <p><strong>Amount Paid:</strong> <span>₹{verificationResult.ticket.amountPaid}</span></p>
                      <p><strong>Status:</strong> <span style={{color: verificationResult.ticket.isVerified ? '#28a745' : '#ffc107'}}>{verificationResult.ticket.isVerified ? 'Verified' : 'Pending'}</span></p>
                      <p><strong>Created:</strong> <span>{new Date(verificationResult.ticket.createdAt).toLocaleString()}</span></p>
                      {verificationResult.ticket.verifiedAt && (
                        <p><strong>Verified At:</strong> <span>{new Date(verificationResult.ticket.verifiedAt).toLocaleString()}</span></p>
                      )}
                    </div>
                  )}
                  
                  {!verificationResult.success && (
                    <p style={{color: '#dc3545', fontSize: '1.1rem', marginTop: '1rem'}}>{verificationResult.message}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'list' && (
            <div className="tickets-list-section">
              <div className="tickets-list-header">
                <h3>All Tickets</h3>
                <button onClick={fetchTickets} className="refresh-btn">
                  🔄 Refresh
                </button>
              </div>

              {loading ? (
                <div className="loading">Loading tickets...</div>
              ) : (
                <div className="tickets-grid">
                  {tickets.length === 0 ? (
                    <p>No tickets found.</p>
                  ) : (
                    tickets.map(ticket => (
                      <div key={ticket.id} className="ticket-card">
                        <div className="ticket-header">
                          <h4>{ticket.ticketNumber}</h4>
                          <span className={`status ${ticket.status}`}>{ticket.status}</span>
                        </div>
                        <div className="ticket-info">
                          <p><strong>Customer:</strong> {ticket.customerName}</p>
                          <p><strong>Event:</strong> {ticket.eventName}</p>
                          <p><strong>Tickets:</strong> {ticket.numberOfTickets}</p>
                          <p><strong>Amount:</strong> ₹{ticket.amountPaid}</p>
                          <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="ticket-actions">
                          <button onClick={() => downloadTicket(ticket)} className="download-btn">
                            📥 Download
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminTickets;
