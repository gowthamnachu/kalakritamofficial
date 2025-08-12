import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import VideoLogo from '../VideoLogo';
import { config } from '../../config/environment';
import './TicketVerification.css';

const TicketVerification = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ticketId) {
      fetchTicket(ticketId);
    }
  }, [ticketId]);

  const fetchTicket = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiBaseUrl}/tickets/verify/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setTicket(data.data);
        setError('');
      } else {
        setError(data.message || 'Ticket not found');
        setTicket(null);
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      setError('Error verifying ticket');
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid':
        return '#28a745';
      case 'used':
        return '#ffc107';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid':
        return '✅';
      case 'used':
        return '✔️';
      case 'cancelled':
        return '❌';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="ticket-verification-container">
        <VideoLogo />
        <Header />
        <main className="ticket-verification-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Verifying ticket...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="ticket-verification-container">
      <VideoLogo />
      <Header />
      
      <main className="ticket-verification-content">
        <div className="verification-header">
          <h1>🎫 Ticket Verification</h1>
          <p>Kalakritam Event Ticket Verification System</p>
        </div>

        {error ? (
          <div className="verification-error">
            <div className="error-icon">❌</div>
            <h2>Ticket Not Found</h2>
            <p>{error}</p>
            <div className="error-details">
              <p>This ticket may have been:</p>
              <ul>
                <li>Already used or verified</li>
                <li>Cancelled or invalid</li>
                <li>Entered incorrectly</li>
              </ul>
              <p>Please contact the event organizers if you believe this is an error.</p>
            </div>
          </div>
        ) : ticket ? (
          <div className="ticket-verification-success">
            <div className="ticket-status">
              <div className="status-icon" style={{ color: getStatusColor(ticket.status) }}>
                {getStatusIcon(ticket.status)}
              </div>
              <h2 style={{ color: getStatusColor(ticket.status) }}>
                Ticket {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </h2>
            </div>

            <div className="ticket-details-card">
              <div className="ticket-header">
                <h3>Ticket Details</h3>
                <div className="ticket-number">#{ticket.ticketNumber}</div>
              </div>

              <div className="ticket-info-grid">
                <div className="info-item">
                  <div className="info-label">Customer Name</div>
                  <div className="info-value">{ticket.customerName}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Event</div>
                  <div className="info-value">{ticket.eventName}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Venue</div>
                  <div className="info-value">{ticket.venue}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Event Timings</div>
                  <div className="info-value">{ticket.eventTimings}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Number of Tickets</div>
                  <div className="info-value">{ticket.numberOfTickets}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Ticket Issued</div>
                  <div className="info-value">
                    {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {ticket.isVerified && ticket.verifiedAt && (
                <div className="verification-info">
                  <h4>Verification Details</h4>
                  <p>
                    <strong>Verified on:</strong>{' '}
                    {new Date(ticket.verifiedAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              <div className="ticket-status-info">
                {ticket.status === 'valid' && (
                  <div className="status-message valid">
                    <p>✅ This ticket is valid and can be used for entry.</p>
                  </div>
                )}
                {ticket.status === 'used' && (
                  <div className="status-message used">
                    <p>✔️ This ticket has been used for entry.</p>
                  </div>
                )}
                {ticket.status === 'cancelled' && (
                  <div className="status-message cancelled">
                    <p>❌ This ticket has been cancelled and is no longer valid.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="verification-footer">
              <div className="kalakritam-logo">
                <h4>Kalakritam</h4>
                <p>Art Gallery & Cultural Center</p>
              </div>
              <div className="verification-note">
                <p><strong>Note:</strong> Present this verification along with a valid ID at the venue.</p>
                <p>For support, contact: info@kalakritam.com</p>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      
      <Footer />
    </div>
  );
};

export default TicketVerification;
