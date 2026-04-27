import React from 'react';
import { IoLeafSharp } from 'react-icons/io5'; 
import './Footer.css'; 

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4><IoLeafSharp className="footer-logo-icon" /> PlantGuard AI</h4> 
          <p>AI-powered plant disease detection for sustainable agriculture.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/detect">Detection Tool</a></li>
            <li><a href="/encyclopedia">Disease Encyclopedia</a></li>
            <li><a href="/about">About Us</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms-of-service">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear} PlantGuard AI. All rights reserved.</p>
        <p className="footer-disclaimer">
          {/* === REPLACE THIS TEXT with your new disclaimer === */}
          Disclaimer: PlantGuard AI provides predictions for informational purposes only and is not a substitute for professional agricultural advice. Always consult a qualified expert for definitive diagnosis and treatment.
          {/* =================================================== */}
        </p>
      </div>
    </footer>
  );
};

export default Footer;