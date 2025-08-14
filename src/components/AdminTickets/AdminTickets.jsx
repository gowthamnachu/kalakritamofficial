import React, { useState, useEffect } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import { toast } from '../../utils/notifications.js';
import AdminHeader from '../AdminHeader';
import Footer from '../Footer';
import VideoLogo from '../VideoLogo';
import { ticketsApi, eventsApi } from '../../lib/adminApi';
import { config } from '../../config/environment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import './AdminTickets.css';

// QR Code generation function using QRCode library
const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Fallback to API service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
  }
};

// Ticket ID generation
const generateTicketId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `TKT${timestamp.slice(-6)}${random}`;
};

const AdminTickets = () => {
  const { navigateWithLoading } = useNavigationWithLoading();
  const [activeTab, setActiveTab] = useState('generate');
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  // Removed message and messageType states - using toast notifications instead

  // Form states
  const [ticketForm, setTicketForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventName: '',
    eventId: '',
    numberOfTickets: 1,
    amountPaid: '',
    eventTimings: '',
    venue: ''
  });

  const [verifyForm, setVerifyForm] = useState({
    ticketCode: '',
    ticketNumber: ''
  });

  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [downloadingTickets, setDownloadingTickets] = useState(new Set());
  const [lastDownloadTime, setLastDownloadTime] = useState(0);

  useEffect(() => {
    fetchEvents();
    if (activeTab === 'list') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      const response = await eventsApi.getAll();
      const data = response.data || response || [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      console.log('🎫 Fetching tickets from API...');
      const data = await ticketsApi.getAll();
      console.log('🎫 Tickets API response:', data);
      
      const ticketsArray = data?.data || data || [];
      setTickets(Array.isArray(ticketsArray) ? ticketsArray : []);
      
      if (Array.isArray(ticketsArray) && ticketsArray.length > 0) {
        toast.success(`Loaded ${ticketsArray.length} tickets successfully`);
      } else {
        toast.info('No tickets found');
      }
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      toast.error(`Error fetching tickets: ${error.message}`);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // showMessage function removed - using toast notifications instead

  const handleFormChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'ticket') {
      setTicketForm(prev => ({ ...prev, [name]: value }));
      
      // Auto-fill event details when event is selected
      if (name === 'eventId') {
        const selectedEvent = events.find(event => event.id === value);
        if (selectedEvent) {
          setTicketForm(prev => ({
            ...prev,
            eventName: selectedEvent.title || selectedEvent.name,
            eventTimings: selectedEvent.startDate || selectedEvent.start_date,
            venue: selectedEvent.venue || selectedEvent.location,
            amountPaid: selectedEvent.ticketPrice || selectedEvent.price || ''
          }));
        }
      }
    } else if (formType === 'verify') {
      setVerifyForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const generateTicket = async () => {
    try {
      if (!ticketForm.customerName || !ticketForm.customerEmail || !ticketForm.eventName) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const loadingId = toast.dataSaving('Creating ticket...');
      setLoading(true);
      
      // Generate ticket data
      const ticketData = {
        id: generateTicketId(),
        ticket_number: generateTicketId(),
        customer_name: ticketForm.customerName,
        customer_email: ticketForm.customerEmail,
        customer_phone: ticketForm.customerPhone,
        event_name: ticketForm.eventName,
        event_id: ticketForm.eventId,
        number_of_tickets: parseInt(ticketForm.numberOfTickets),
        amount_paid: parseFloat(ticketForm.amountPaid) || 0,
        event_timings: ticketForm.eventTimings,
        venue: ticketForm.venue,
        status: 'valid',
        is_verified: false,
        created_at: new Date().toISOString()
      };

      // Generate QR code with verification URL
      const verificationUrl = `${window.location.origin}/verify-ticket/${ticketData.ticket_number}`;
      ticketData.qr_code_url = await generateQRCode(verificationUrl);

      // Save ticket to database
      const response = await ticketsApi.create(ticketData);
      
      if (response.success !== false) {
        setGeneratedTicket(ticketData);
        toast.dismiss(loadingId);
        toast.success('Ticket generated successfully!');
        
        // Clear form
        setTicketForm({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          eventName: '',
          eventId: '',
          numberOfTickets: 1,
          amountPaid: '',
          eventTimings: '',
          venue: ''
        });
      } else {
        throw new Error(response.message || 'Failed to create ticket');
      }
    } catch (error) {
      if (typeof loadingId !== 'undefined') toast.dismiss(loadingId);
      console.error('Error generating ticket:', error);
      toast.error(`Error generating ticket: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyTicket = async () => {
    try {
      if (!verifyForm.ticketCode && !verifyForm.ticketNumber) {
        toast.error('Please enter a ticket code or number');
        return;
      }

      setLoading(true);
      setVerificationResult(null);
      
      const ticketId = verifyForm.ticketCode || verifyForm.ticketNumber;
      console.log('🎫 Verifying ticket:', ticketId);
      
      // Use direct fetch to public verification endpoint
      const response = await fetch(`${config.apiBaseUrl}/tickets/verify/${ticketId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      console.log('🎫 Admin verification response:', data);
      
      if (response.ok && data.success) {
        setVerificationResult({
          ...data.data,
          isValid: true,
          message: 'Ticket is valid and verified!'
        });
        toast.success('Ticket verified successfully!');
      } else {
        setVerificationResult({
          isValid: false,
          message: data.message || 'Ticket not found or invalid'
        });
        toast.error(data.message || 'Ticket verification failed');
      }
    } catch (error) {
      console.error('❌ Error verifying ticket:', error);
      setVerificationResult({
        isValid: false,
        message: 'Error verifying ticket - please check your connection'
      });
      toast.error(`Error verifying ticket: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = async (ticket) => {
    // Prevent rapid multiple clicks (debounce)
    const now = Date.now();
    if (now - lastDownloadTime < 1000) { // 1 second debounce
      console.log('Download request ignored - too soon after last download');
      return;
    }
    setLastDownloadTime(now);
    
    console.log('downloadTicket function called with:', ticket);
    console.log('Ticket type check:', {
      hasId: !!ticket?.id,
      hasTicketNumber: !!ticket?.ticket_number,
      hasTicketNumberCamel: !!ticket?.ticketNumber,
      ticketKeys: ticket ? Object.keys(ticket) : 'null'
    });
    
    // More robust ticket ID extraction
    const ticketId = ticket?.id || 
                     ticket?.ticket_number || 
                     ticket?.ticketNumber || 
                     ticket?.ticketId ||
                     'generated-' + Date.now();
    console.log('Extracted ticketId:', ticketId);
    
    // Prevent multiple downloads of the same ticket
    if (downloadingTickets.has(ticketId)) {
      console.log('Download already in progress, returning early');
      toast.warning('Download already in progress for this ticket');
      return;
    }

    let tempContainer = null;
    let frontElement = null;
    let backElement = null;
    let qrImage = null;
    
    try {
      // Add ticket to downloading set
      setDownloadingTickets(prev => new Set([...prev, ticketId]));
      console.log('Starting download for ticket:', ticketId);
      
      // Trigger animation by checking the checkbox after a short delay
      setTimeout(() => {
        const downloadButton = document.querySelector(`[data-ticket-id="${ticketId}"] .input`);
        console.log('Looking for download button with selector:', `[data-ticket-id="${ticketId}"] .input`);
        console.log('Found download button:', downloadButton);
        if (downloadButton && !downloadButton.checked) {
          downloadButton.checked = true;
          console.log('Animation triggered - checkbox checked');
        } else {
          console.log('Animation not triggered - button not found or already checked');
        }
      }, 100);

      toast.info('Preparing PDF download...');
      console.log('Toast message sent: Preparing PDF download...');
      
      // Check if we're downloading from the generated ticket (has preview elements)
      frontElement = document.querySelector('.preview-ticket-front');
      backElement = document.querySelector('.preview-ticket-back');
      console.log('Existing preview elements found:', { frontElement: !!frontElement, backElement: !!backElement });
      
      // If preview elements exist, wait for them to be fully rendered and validate them
      if (frontElement && backElement) {
        console.log('Using existing preview elements - validating and preparing...');
        
        // Check if elements have valid dimensions
        const frontRect = frontElement.getBoundingClientRect();
        const backRect = backElement.getBoundingClientRect();
        
        console.log('Element dimensions check:', {
          frontWidth: frontRect.width,
          frontHeight: frontRect.height,
          backWidth: backRect.width,
          backHeight: backRect.height,
          frontVisible: getComputedStyle(frontElement).display !== 'none',
          backVisible: getComputedStyle(backElement).display !== 'none'
        });
        
        // If elements don't have valid dimensions, treat them as invalid
        if (frontRect.width === 0 || frontRect.height === 0 || backRect.width === 0 || backRect.height === 0) {
          console.log('Existing elements have invalid dimensions, will create temporary elements');
          frontElement = null;
          backElement = null;
        } else {
          // Wait for elements to be fully rendered and styled
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Force layout recalculation
          frontElement.offsetHeight;
          backElement.offsetHeight;
          
          // Wait for QR code to load if present
          qrImage = document.querySelector('.preview-back-qr-code img');
          if (qrImage && !qrImage.complete) {
            console.log('Waiting for QR code to load...');
            await new Promise(resolve => {
              qrImage.onload = resolve;
              qrImage.onerror = resolve;
              setTimeout(resolve, 3000);
            });
          }
          
          // Additional wait to ensure everything is stable
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('Existing preview elements ready for capture');
        }
      }
      
      // If preview elements don't exist or are invalid, create temporary ones
      if (!frontElement || !backElement) {
        console.log('Creating temporary preview elements...');
        // Create a properly formatted ticket object with QR code
        const verificationUrl = `${window.location.origin}/verify-ticket/${ticket.ticket_number || ticket.ticketNumber || ticket.id}`;
        console.log('Verification URL:', verificationUrl);
        let qrCodeUrl;
        
        try {
          console.log('Generating QR code...');
          qrCodeUrl = await generateQRCode(verificationUrl);
          console.log('QR Code generated successfully:', qrCodeUrl ? 'YES' : 'NO');
        } catch (error) {
          console.error('QR Code generation failed:', error);
          qrCodeUrl = null; // Fallback to no QR code
        }
        
        const formattedTicket = {
          id: ticket.id,
          ticket_number: ticket.ticket_number || ticket.ticketNumber || ticket.id,
          customer_name: ticket.customer_name || ticket.customerName || 'Guest',
          customer_email: ticket.customer_email || ticket.customerEmail || '',
          customer_phone: ticket.customer_phone || ticket.customerPhone || '',
          event_name: ticket.event_name || ticket.eventName || 'Arts Workshop Experience',
          event_id: ticket.event_id || ticket.eventId || '',
          number_of_tickets: ticket.number_of_tickets || ticket.numberOfTickets || 1,
          amount_paid: ticket.amount_paid || ticket.amountPaid || 0,
          event_timings: ticket.event_timings || ticket.eventTimings || 'TBD',
          venue: ticket.venue || 'Kalakritam Art Gallery, Main Hall',
          status: ticket.status || 'valid',
          is_verified: ticket.is_verified || false,
          created_at: ticket.created_at || ticket.createdAt || new Date().toISOString(),
          qr_code_url: qrCodeUrl
        };
        
        // Create temporary container for ticket preview - matching exact preview styling
        console.log('Creating temporary container...');
        tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.width = '500px'; // Larger to accommodate tickets
        tempContainer.style.height = '600px'; // Larger to accommodate tickets
        tempContainer.style.padding = '0px'; // No padding to match preview
        tempContainer.style.backgroundColor = 'transparent';
        
        // Add the AdminTickets CSS class to ensure proper styling
        tempContainer.className = 'admin-tickets-container';
        
        // Create a wrapper div for proper spacing - matching preview container exactly
        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'ticket-preview-container';
        wrapperDiv.style.display = 'flex';
        wrapperDiv.style.flexDirection = 'column';
        wrapperDiv.style.gap = '20px'; // Same gap as preview
        wrapperDiv.style.alignItems = 'center';
        wrapperDiv.style.padding = '0';
        wrapperDiv.style.margin = '0';
        
        tempContainer.appendChild(wrapperDiv);
        document.body.appendChild(tempContainer);
        console.log('Temporary container created and added to DOM');
        
        // Create front side element with complete inline styles for PDF generation - matching preview exactly
        console.log('Setting innerHTML for wrapper...');
        wrapperDiv.innerHTML = `
          <div class="preview-ticket-front" style="
            width: 400px;
            height: 250px;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
            border-radius: 20px;
            padding: 20px;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            font-family: 'Samarkan', 'Cinzel', serif;
            margin: 0;
            display: block;
          ">
            <div class="preview-front-content" style="position: relative; z-index: 2; height: 100%;">
              <div class="preview-branding-top-left" style="
                position: absolute;
                top: 0;
                left: 0;
                font-size: 16px;
                font-weight: bold;
                color: #d4af85;
                letter-spacing: 2px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
              ">KALAKRITAM</div>
              <div class="preview-event-header" style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                width: 100%;
              ">
                <div class="preview-event-title" style="
                  font-size: 24px;
                  font-weight: bold;
                  color: #ffffff;
                  margin-bottom: 8px;
                  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
                ">${formattedTicket.customer_name}</div>
                <div class="preview-event-subtitle" style="
                  font-size: 16px;
                  color: #d4af85;
                  letter-spacing: 1px;
                  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                ">Arts Workshop Experience</div>
              </div>
            </div>
          </div>
          
          <div class="preview-ticket-back" style="
            width: 400px;
            height: 250px;
            background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 50%, #2d2d2d 100%);
            border-radius: 20px;
            padding: 20px;
            box-sizing: border-box;
            position: relative;
            color: #ffffff;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            font-family: 'Samarkan', 'Cinzel', serif;
            margin: 0;
            display: block;
          ">
            <div class="preview-back-content" style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column;">
              <div class="preview-barcode-section" style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 15px;
                padding: 10px 0;
                border-bottom: 1px solid #d4af85;
              ">
                <div class="preview-admin-text" style="
                  font-size: 12px;
                  font-weight: bold;
                  color: #d4af85;
                  letter-spacing: 1px;
                ">ADMIN</div>
                <div class="preview-barcode-lines" style="
                  display: flex;
                  align-items: center;
                  gap: 2px;
                  flex: 1;
                  justify-content: center;
                ">
                  ${Array.from({length: 15}, (_, i) => `
                    <div class="preview-barcode-line" style="
                      width: 2px;
                      height: ${Math.random() * 20 + 10}px;
                      background-color: #d4af85;
                    "></div>
                  `).join('')}
                </div>
                <div class="preview-people-count" style="
                  font-size: 12px;
                  font-weight: bold;
                  color: #d4af85;
                  letter-spacing: 1px;
                ">${String(formattedTicket.number_of_tickets).padStart(3, '0')}</div>
              </div>
              
              <div class="preview-terms-section" style="
                flex: 1;
                font-size: 11px;
                line-height: 1.4;
                color: #cccccc;
              ">
                <div class="preview-terms-header" style="
                  font-size: 12px;
                  font-weight: bold;
                  color: #d4af85;
                  margin-bottom: 8px;
                  letter-spacing: 1px;
                ">EVENT DETAILS</div>
                <div class="preview-terms-content">
                  <p style="margin: 4px 0;"><strong>Date:</strong> ${formattedTicket.event_timings || 'Invalid Date - Invalid Date'}</p>
                  <p style="margin: 4px 0;"><strong>Venue:</strong> ${formattedTicket.venue || 'Kalakritam Art Gallery, Main Hall'}</p>
                  <p style="margin: 4px 0;"><strong>Guest:</strong> ${formattedTicket.customer_name || 'Nachu Gowtham'}</p>
                  <p style="margin: 4px 0;"><strong>Amount:</strong> ₹${formattedTicket.amount_paid || '500'}</p>
                </div>
              </div>
              
              <div class="preview-back-qr-section" style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #d4af85;
              ">
                <div class="preview-back-qr-code" style="
                  width: 50px;
                  height: 50px;
                  background-color: #ffffff;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  overflow: hidden;
                ">
                  ${formattedTicket.qr_code_url ? `<img src="${formattedTicket.qr_code_url}" alt="QR Code" style="width: 100%; height: 100%; object-fit: cover;" />` : ''}
                </div>
                <div class="preview-back-ticket-number" style="
                  font-size: 10px;
                  color: #d4af85;
                  font-weight: bold;
                  letter-spacing: 1px;
                ">${formattedTicket.ticket_number}</div>
              </div>
            </div>
          </div>
        `;
        console.log('HTML content set, waiting for rendering...');
        
        // Wait for elements to be rendered
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Initial wait completed, looking for elements...');
        
        // Get the newly created elements from the wrapper
        frontElement = wrapperDiv.querySelector('.preview-ticket-front');
        backElement = wrapperDiv.querySelector('.preview-ticket-back');
        
        if (!frontElement || !backElement) {
          throw new Error('Unable to create ticket preview for download.');
        }
        
        // Make the temporary container fully visible for proper rendering and CSS application
        tempContainer.style.visibility = 'visible';
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '50px';
        tempContainer.style.top = '50px';
        tempContainer.style.zIndex = '9999'; // Bring to front temporarily
        tempContainer.style.opacity = '1'; // Fully visible for debugging
        tempContainer.style.pointerEvents = 'none'; // Prevent interaction
        
        // Force layout recalculation and ensure CSS is applied
        frontElement.offsetHeight;
        backElement.offsetHeight;
        
        // Wait longer for CSS to be fully applied and QR code to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Wait for QR code image to load properly
        qrImage = wrapperDiv.querySelector('.preview-back-qr-code img');
        if (qrImage) {
          await new Promise(resolve => {
            if (qrImage.complete) {
              resolve();
            } else {
              qrImage.onload = resolve;
              qrImage.onerror = () => {
                console.warn('QR code failed to load');
                resolve();
              };
              setTimeout(resolve, 3000); // Longer timeout for QR code
            }
          });
        }
        
        // Additional wait to ensure CSS animations and styling are complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Temporary elements fully prepared:', {
          frontWidth: frontElement.offsetWidth,
          frontHeight: frontElement.offsetHeight,
          backWidth: backElement.offsetWidth,
          backHeight: backElement.offsetHeight
        });
      } else {
        // If using existing preview elements, still try to find QR image
        qrImage = document.querySelector('.preview-back-qr-code img');
        console.log('Using existing preview elements, QR image found:', !!qrImage);
        console.log('Preview elements details:', {
          frontElementOffsetWidth: frontElement ? frontElement.offsetWidth : 'N/A',
          frontElementOffsetHeight: frontElement ? frontElement.offsetHeight : 'N/A',
          backElementOffsetWidth: backElement ? backElement.offsetWidth : 'N/A',
          backElementOffsetHeight: backElement ? backElement.offsetHeight : 'N/A',
          frontElementVisible: frontElement ? getComputedStyle(frontElement).display !== 'none' : 'N/A',
          backElementVisible: backElement ? getComputedStyle(backElement).display !== 'none' : 'N/A'
        });
      }
      
      // Validate that we have valid elements to work with
      if (!frontElement || !backElement) {
        throw new Error('Could not find or create valid ticket preview elements');
      }
      
      // Get fresh dimensions after all waits
      const finalFrontRect = frontElement.getBoundingClientRect();
      const finalBackRect = backElement.getBoundingClientRect();
      
      console.log('Final element validation:', {
        frontWidth: finalFrontRect.width,
        frontHeight: finalFrontRect.height,
        backWidth: finalBackRect.width,
        backHeight: finalBackRect.height,
        frontOffsetWidth: frontElement.offsetWidth,
        frontOffsetHeight: frontElement.offsetHeight,
        backOffsetWidth: backElement.offsetWidth,
        backOffsetHeight: backElement.offsetHeight,
        frontVisible: getComputedStyle(frontElement).display !== 'none',
        backVisible: getComputedStyle(backElement).display !== 'none',
        frontOpacity: getComputedStyle(frontElement).opacity,
        backOpacity: getComputedStyle(backElement).opacity
      });
      
      if (frontElement.offsetWidth === 0 || frontElement.offsetHeight === 0) {
        throw new Error(`Front element has invalid dimensions (${frontElement.offsetWidth}x${frontElement.offsetHeight}). Element may be hidden or not rendered.`);
      }
      
      if (backElement.offsetWidth === 0 || backElement.offsetHeight === 0) {
        throw new Error(`Back element has invalid dimensions (${backElement.offsetWidth}x${backElement.offsetHeight}). Element may be hidden or not rendered.`);
      }
      
      // Make sure elements are visible for capture
      const frontStyle = getComputedStyle(frontElement);
      const backStyle = getComputedStyle(backElement);
      
      if (frontStyle.display === 'none' || frontStyle.visibility === 'hidden') {
        throw new Error('Front element is not visible (display: none or visibility: hidden)');
      }
      
      if (backStyle.display === 'none' || backStyle.visibility === 'hidden') {
        throw new Error('Back element is not visible (display: none or visibility: hidden)');
      }
      
      // Scroll elements into view to ensure they're fully visible
      frontElement.scrollIntoView({ behavior: 'instant', block: 'center' });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force one more layout recalculation
      frontElement.offsetHeight;
      backElement.offsetHeight;
      
      // Capture front side with high quality - using enhanced settings
      console.log('Starting canvas capture for front element...');
      console.log('Front element final check before capture:', {
        offsetWidth: frontElement.offsetWidth,
        offsetHeight: frontElement.offsetHeight,
        boundingRect: frontElement.getBoundingClientRect(),
        computedStyle: {
          display: getComputedStyle(frontElement).display,
          visibility: getComputedStyle(frontElement).visibility,
          opacity: getComputedStyle(frontElement).opacity,
          position: getComputedStyle(frontElement).position
        }
      });
      
      const frontCanvas = await html2canvas(frontElement, {
        scale: 3, // Increased scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'transparent',
        logging: false, // Disable logging to reduce console clutter
        height: frontElement.offsetHeight,
        width: frontElement.offsetWidth,
        removeContainer: false,
        foreignObjectRendering: false, // Disable for better compatibility
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        x: 0,
        y: 0,
        ignoreElements: (element) => {
          // Ignore any overlay elements that might interfere
          return element.classList.contains('loading-overlay') || 
                 element.classList.contains('modal') || 
                 element.classList.contains('toast');
        },
        onclone: (clonedDoc, element) => {
          console.log('Front element cloned for capture');
          // Ensure all styles are preserved in the clone
          const clonedElement = clonedDoc.querySelector('.preview-ticket-front');
          if (clonedElement) {
            // Force visibility in clone
            clonedElement.style.visibility = 'visible';
            clonedElement.style.opacity = '1';
            clonedElement.style.display = 'block';
            console.log('CSS applied to cloned front element');
          } else {
            console.warn('Cloned front element not found!');
          }
        }
      });
      console.log('Front canvas captured successfully, dimensions:', frontCanvas.width, 'x', frontCanvas.height);
      
      if (frontCanvas.width === 0 || frontCanvas.height === 0) {
        throw new Error(`Front canvas has invalid dimensions: ${frontCanvas.width}x${frontCanvas.height}`);
      }
      
      // Capture back side with high quality - using enhanced settings
      console.log('Starting canvas capture for back element...');
      console.log('Back element final check before capture:', {
        offsetWidth: backElement.offsetWidth,
        offsetHeight: backElement.offsetHeight,
        boundingRect: backElement.getBoundingClientRect(),
        computedStyle: {
          display: getComputedStyle(backElement).display,
          visibility: getComputedStyle(backElement).visibility,
          opacity: getComputedStyle(backElement).opacity,
          position: getComputedStyle(backElement).position
        }
      });
      
      const backCanvas = await html2canvas(backElement, {
        scale: 3, // Increased scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'transparent',
        logging: false, // Disable logging to reduce console clutter
        height: backElement.offsetHeight,
        width: backElement.offsetWidth,
        removeContainer: false,
        foreignObjectRendering: false, // Disable for better compatibility
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        x: 0,
        y: 0,
        ignoreElements: (element) => {
          // Ignore any overlay elements that might interfere
          return element.classList.contains('loading-overlay') || 
                 element.classList.contains('modal') || 
                 element.classList.contains('toast');
        },
        onclone: (clonedDoc, element) => {
          console.log('Back element cloned for capture');
          // Ensure all styles are preserved in the clone
          const clonedElement = clonedDoc.querySelector('.preview-ticket-back');
          if (clonedElement) {
            // Force visibility in clone
            clonedElement.style.visibility = 'visible';
            clonedElement.style.opacity = '1';
            clonedElement.style.display = 'block';
            console.log('CSS applied to cloned back element');
          } else {
            console.warn('Cloned back element not found!');
          }
        }
      });
      console.log('Back canvas captured successfully, dimensions:', backCanvas.width, 'x', backCanvas.height);
      
      if (backCanvas.width === 0 || backCanvas.height === 0) {
        throw new Error(`Back canvas has invalid dimensions: ${backCanvas.width}x${backCanvas.height}`);
      }
      
      // Hide the temporary container again after capture
      if (tempContainer) {
        tempContainer.style.zIndex = '-1000';
        tempContainer.style.opacity = '0';
        console.log('Temporary container hidden after capture');
      }
      
      // Calculate dimensions for PDF layout - compact without margins
      const ticketWidthPx = frontElement.offsetWidth;
      const ticketHeightPx = frontElement.offsetHeight;
      const ticketWidthMM = (ticketWidthPx * 25.4) / 96; // Convert to mm
      const ticketHeightMM = (ticketHeightPx * 25.4) / 96;
      
      // Create PDF with exact ticket dimensions - no margins or extra space
      let pdf;
      
      // Try side-by-side layout first (more compact)
      const totalWidthSideBySide = ticketWidthMM * 2;
      const totalHeightSideBySide = ticketHeightMM;
      
      if (totalWidthSideBySide <= 210) {
        // Side-by-side layout - exact size with no margins
        pdf = new jsPDF({
          orientation: totalWidthSideBySide > totalHeightSideBySide ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [totalWidthSideBySide, totalHeightSideBySide]
        });
        
        // Add front ticket (left side) - no margin
        const frontImgData = frontCanvas.toDataURL('image/png', 1.0);
        console.log('Front image data length:', frontImgData.length, 'Preview:', frontImgData.substring(0, 50) + '...');
        pdf.addImage(frontImgData, 'PNG', 0, 0, ticketWidthMM, ticketHeightMM);
        
        // Add back ticket (right side) - no spacing
        const backImgData = backCanvas.toDataURL('image/png', 1.0);
        console.log('Back image data length:', backImgData.length, 'Preview:', backImgData.substring(0, 50) + '...');
        pdf.addImage(backImgData, 'PNG', ticketWidthMM, 0, ticketWidthMM, ticketHeightMM);
        
      } else {
        // Vertical layout - exact size with no margins
        const totalHeightVertical = ticketHeightMM * 2;
        
        pdf = new jsPDF({
          orientation: ticketWidthMM > totalHeightVertical ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [ticketWidthMM, totalHeightVertical]
        });
        
        // Add front ticket (top) - no margin
        const frontImgData = frontCanvas.toDataURL('image/png', 1.0);
        console.log('Front image data length:', frontImgData.length, 'Preview:', frontImgData.substring(0, 50) + '...');
        pdf.addImage(frontImgData, 'PNG', 0, 0, ticketWidthMM, ticketHeightMM);
        
        // Add back ticket (bottom) - no spacing
        const backImgData = backCanvas.toDataURL('image/png', 1.0);
        console.log('Back image data length:', backImgData.length, 'Preview:', backImgData.substring(0, 50) + '...');
        pdf.addImage(backImgData, 'PNG', 0, ticketHeightMM, ticketWidthMM, ticketHeightMM);
      }
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const fileName = `Kalakritam_Ticket_${ticket.id}_${timestamp}.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      toast.success(`Ticket downloaded successfully!`);
      
    } catch (error) {
      console.error('Error generating PDF ticket:', error);
      console.error('Error details:', {
        ticketData: ticket,
        frontElementExists: !!frontElement,
        backElementExists: !!backElement,
        tempContainerExists: !!tempContainer,
        errorMessage: error.message,
        errorStack: error.stack
      });
      toast.error(`Error generating PDF: ${error.message}. Check console for details.`);
    } finally {
      // Clean up temporary container if it was created
      if (tempContainer && tempContainer.parentNode) {
        try {
          tempContainer.parentNode.removeChild(tempContainer);
          console.log('Temporary container cleaned up successfully');
        } catch (cleanupError) {
          console.warn('Error cleaning up temporary container:', cleanupError);
        }
      }
      
      // Remove ticket from downloading set
      setDownloadingTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(ticketId);
        return newSet;
      });
      
      console.log('Download completed for ticket:', ticketId);
      
      // Reset the animation after a delay
      setTimeout(() => {
        const downloadButton = document.querySelector(`[data-ticket-id="${ticketId}"] .input`);
        if (downloadButton) {
          downloadButton.checked = false;
        }
      }, 3200); // Reset after 3.2 seconds to match new animation timing
    }
  };

  const clearVerificationResult = () => {
    setVerificationResult(null);
    setVerifyForm({ ticketCode: '', ticketNumber: '' });
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
          {/* Generate Ticket Tab */}
          {activeTab === 'generate' && (
            <div className="generate-ticket-section">
              <div className="form-container">
                <h3>🎫 Create New Ticket</h3>
                <div className="ticket-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Customer Name *</label>
                      <input
                        type="text"
                        name="customerName"
                        value={ticketForm.customerName}
                        onChange={(e) => handleFormChange(e, 'ticket')}
                        placeholder="Enter customer name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={ticketForm.customerEmail}
                        onChange={(e) => handleFormChange(e, 'ticket')}
                        placeholder="customer@email.com"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={ticketForm.customerPhone}
                        onChange={(e) => handleFormChange(e, 'ticket')}
                        placeholder="+91 98765 43210"
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
                        max="10"
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Select Event (Optional)</label>
                      <select
                        name="eventId"
                        value={ticketForm.eventId}
                        onChange={(e) => handleFormChange(e, 'ticket')}
                      >
                        <option value="">Choose an event...</option>
                        {events.map(event => (
                          <option key={event.id} value={event.id}>
                            {event.title || event.name}
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
                        placeholder="Enter event name"
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
                        placeholder="Event venue location"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Event Date & Time *</label>
                      <input
                        type="text"
                        name="eventTimings"
                        value={ticketForm.eventTimings}
                        onChange={(e) => handleFormChange(e, 'ticket')}
                        placeholder="March 15, 2025 6:00 PM"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Amount Paid (₹) *</label>
                      <input
                        type="number"
                        name="amountPaid"
                        value={ticketForm.amountPaid}
                        onChange={(e) => handleFormChange(e, 'ticket')}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    onClick={generateTicket} 
                    disabled={loading} 
                    className="generate-btn"
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>
                        Generating...
                      </>
                    ) : (
                      <>Generate Ticket</>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Ticket Display */}
              {generatedTicket && (
                <>
                  <h3 className="ticket-success-title">Ticket Generated Successfully!</h3>
                  
                  {/* Preview of Front and Back */}
                  <div className="ticket-preview-container">
                    {/* Front Side Preview */}
                    <div className="preview-ticket-front">
                      <div className="preview-front-content">
                        <div className="preview-branding-top-left">KALAKRITAM</div>
                        <div className="preview-event-header">
                          <div className="preview-event-title">{generatedTicket.customer_name}</div>
                          <div className="preview-event-subtitle">Arts Workshop Experience</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Back Side Preview */}
                    <div className="preview-ticket-back">
                      <div className="preview-back-content">
                        <div className="preview-barcode-section">
                          <div className="preview-admin-text">ADMIN</div>
                          <div className="preview-barcode-lines">
                            {Array.from({length: 15}, (_, i) => (
                              <div key={i} className="preview-barcode-line"></div>
                            ))}
                          </div>
                          <div className="preview-people-count">{String(generatedTicket.number_of_tickets).padStart(3, '0')}</div>
                        </div>
                        
                        <div className="preview-terms-section">
                          <div className="preview-terms-header">EVENT DETAILS</div>
                          <div className="preview-terms-content">
                            <p><strong>Date:</strong> {generatedTicket.event_timings || 'Invalid Date - Invalid Date'}</p>
                            <p><strong>Venue:</strong> {generatedTicket.venue || 'Kalakritam Art Gallery, Main Hall'}</p>
                            <p><strong>Guest:</strong> {generatedTicket.customer_name || 'Nachu Gowtham'}</p>
                            <p><strong>Amount:</strong> ₹{generatedTicket.amount_paid || '500'}</p>
                          </div>
                        </div>
                        
                        <div className="preview-back-qr-section">
                          <div className="preview-back-qr-code">
                            {generatedTicket.qr_code_url && (
                              <img src={generatedTicket.qr_code_url} alt="QR Code" />
                            )}
                          </div>
                          <div className="preview-back-ticket-number">{generatedTicket.ticket_number}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="preview-note">
                    <p>This is a preview. Download for the full printable version with professional styling.</p>
                  </div>
                  
                  <div className="download-button-container" data-ticket-id={generatedTicket?.id || generatedTicket?.ticket_number || 'generated'}>
                    <label 
                      className={`download-label ${downloadingTickets.has(generatedTicket?.id || generatedTicket?.ticket_number || 'generated') ? 'downloading' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        downloadTicket(generatedTicket);
                      }}
                    >
                      <input className="input" type="checkbox" />
                      <div className="circle">
                        <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 13V4M7 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2m-1-5-4 5-4-5m9 8h.01"/>
                        </svg>
                        <div className="square"></div>
                      </div>
                      <p className="title">Download</p>
                      <p className="title">Downloaded</p>
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Verify Ticket Tab */}
          {activeTab === 'verify' && (
            <div className="verify-ticket-section">
              <div className="verify-container">
                <h3>Verify Ticket</h3>
                <div className="verify-form">
                  <div className="form-group">
                    <label>Ticket ID or Number</label>
                    <input
                      type="text"
                      name="ticketCode"
                      value={verifyForm.ticketCode}
                      onChange={(e) => handleFormChange(e, 'verify')}
                      placeholder="Enter ticket ID or number"
                    />
                  </div>
                  <button 
                    onClick={verifyTicket} 
                    disabled={loading}
                    className="verify-btn"
                  >
                    {loading ? 'Verifying...' : 'Verify Ticket'}
                  </button>
                </div>

                {verificationResult && (
                  <div className={`verification-result ${verificationResult.isValid ? 'valid' : 'invalid'}`}>
                    <div className="result-header">
                      <span className="result-icon">
                        {verificationResult.isValid ? '✓' : '×'}
                      </span>
                      <h4>{verificationResult.message}</h4>
                    </div>
                    {verificationResult.isValid && verificationResult.customer_name && (
                      <div className="ticket-info">
                        <p><strong>Customer:</strong> {verificationResult.customer_name}</p>
                        <p><strong>Event:</strong> {verificationResult.event_name}</p>
                        <p><strong>Tickets:</strong> {verificationResult.number_of_tickets}</p>
                        <p><strong>Amount:</strong> ₹{verificationResult.amount_paid}</p>
                        <p><strong>Status:</strong> {verificationResult.status}</p>
                      </div>
                    )}
                    <button onClick={clearVerificationResult} className="clear-btn">
                      Clear Result
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Tickets Tab */}
          {activeTab === 'list' && (
            <div className="tickets-list-section">
              <div className="tickets-list-header">
                <h3>📋 All Tickets</h3>
                <button onClick={fetchTickets} className="refresh-btn">
                  🔄 Refresh
                </button>
              </div>

              {loading ? (
                <div className="loading">
                  <div className="loading-spinner"></div>
                  <p>Loading tickets...</p>
                </div>
              ) : (
                <div className="tickets-content">
                  {/* Error handling now done via toast notifications */}
                  
                  {tickets.length === 0 ? (
                    <div className="empty-tickets">
                      <div className="empty-icon">🎫</div>
                      <h4>No Tickets Yet</h4>
                      <p>No tickets have been generated yet. Create your first ticket using the "Generate Ticket" tab.</p>
                      <button onClick={() => setActiveTab('generate')} className="generate-first-btn">
                        ➕ Generate First Ticket
                      </button>
                    </div>
                  ) : (
                    <div className="tickets-grid">
                      {tickets.map(ticket => (
                        <div key={ticket.id} className="ticket-card">
                          <div className="ticket-header">
                            <h4>{ticket.ticket_number || ticket.ticketNumber}</h4>
                            <span className={`status ${ticket.status || 'unknown'}`}>
                              {ticket.status || 'Unknown'}
                            </span>
                          </div>
                          <div className="ticket-info">
                            <p><strong>Customer:</strong> {ticket.customer_name || ticket.customerName || 'N/A'}</p>
                            <p><strong>Event:</strong> {ticket.event_name || ticket.eventName || 'N/A'}</p>
                            <p><strong>Tickets:</strong> {ticket.number_of_tickets || ticket.numberOfTickets || 0}</p>
                            <p><strong>Amount:</strong> ₹{ticket.amount_paid || ticket.amountPaid || 0}</p>
                            <p><strong>Created:</strong> {
                              ticket.created_at || ticket.createdAt ? 
                                new Date(ticket.created_at || ticket.createdAt).toLocaleDateString() : 
                                'N/A'
                            }</p>
                          </div>
                          <div className="ticket-actions">
                            <div className="download-button-container" data-ticket-id={ticket.id || ticket.ticket_number || ticket.ticketNumber}>
                              <label 
                                className={`download-label ${downloadingTickets.has(ticket.id || ticket.ticket_number || ticket.ticketNumber) ? 'downloading' : ''}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  downloadTicket(ticket);
                                }}
                              >
                                <input className="input" type="checkbox" />
                                <div className="circle">
                                  <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 13V4M7 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2m-1-5-4 5-4-5m9 8h.01"/>
                                  </svg>
                                  <div className="square"></div>
                                </div>
                                <p className="title">Download</p>
                                <p className="title">Downloaded</p>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
