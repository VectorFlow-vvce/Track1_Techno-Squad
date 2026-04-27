import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { FaEnvelope, FaLightbulb, FaHandshake } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const form = useRef();
  const [isSending, setIsSending] = useState(false);
  const [formStatus, setFormStatus] = useState('');

  const sendEmail = (e) => {
    e.preventDefault(); // Prevents the default form submission
    setIsSending(true);
    setFormStatus('');

    // --- We've added your keys here ---
    // Inside Contact.jsx -> sendEmail function
    // Defensive: ensure form ref is available
    if (!form.current) {
      setFormStatus('Form not available. Please refresh and try again.');
      setIsSending(false);
      return;
    }

    emailjs.sendForm(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      form.current,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    ).then((result) => {
      console.log(result.text);
      setFormStatus('Message sent successfully! We will get back to you soon.');
      setIsSending(false);
      e.target.reset(); // Clear the form after successful send
    }).catch((error) => {
      console.error('EmailJS error:', error);
      setFormStatus('Failed to send message. Please try again later.');
      setIsSending(false);
    });
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p className="section-subtitle">Have questions or feedback? We'd love to hear from you.</p>
      </div>

      <div className="contact-main">
        {/* Left Side: Contact Form */}
        <div className="contact-form-container">
          <h3>Send us a Message</h3>
          
          <form ref={form} onSubmit={sendEmail} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              {/* The 'name' attribute is 'name' */}
              <input type="text" id="name" name="name" placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              {/* The 'name' attribute is 'email' */}
              <input type="email" id="email" name="email" placeholder="john.doe@example.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              {/* The 'name' attribute is 'subject' */}
              <input type="text" id="subject" name="subject" placeholder="Question about your service" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              {/* The 'name' attribute is 'message' */}
              <textarea id="message" name="message" rows="6" placeholder="Your message here..." required></textarea>
            </div>
            <button type="submit" className="cta-button" disabled={isSending}>
              {isSending ? 'Sending...' : 'Send Message'}
            </button>
            
            {/* Display a success or error message */}
            {formStatus && <p className="form-status">{formStatus}</p>}
          </form>
        </div>

        {/* Right Side: Contact Info (No changes) */}
        <div className="contact-info-container">
          <h3>Get in Touch</h3>
          <div className="info-card"><FaEnvelope className="info-icon" /><h4>Email Support</h4><p>support@plantguard.ai</p><span>We typically respond within 24 hours.</span></div>
          <div className="info-card"><FaLightbulb className="info-icon" /><h4>Technical Inquiries</h4><p>dev@plantguard.ai</p><span>For API access and technical support.</span></div>
          <div className="info-card"><FaHandshake className="info-icon" /><h4>Partnership Opportunities</h4><p>partnerships@plantguard.ai</p><span>Collaborate with us on research and development.</span></div>
        </div>
      </div>
    </div>
  );
};

export default Contact;