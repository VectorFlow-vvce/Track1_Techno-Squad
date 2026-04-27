import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFlask, FaBookOpen, FaClock, FaShieldAlt, FaBolt, FaUsers, 
  FaUpload, FaMicroscope, FaClipboardList, FaLeaf 
} from 'react-icons/fa';
import './Home.css';
import heroImage from '../assets/hero-plant-image.jpg'; // Ensure this image is in /src

const Home = () => {
  return (
    <div className="home-page">
      {/* ===== Hero Section ===== */}
      <div className="hero-section-wrapper">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-tag">
              <FaLeaf /> Powered by Advanced Deep Learning
            </div>
            <h1>AI-Powered Plant Disease Detection</h1>
            <p>
              Protect your crops with cutting-edge artificial intelligence. Detect diseases early, 
              get accurate diagnoses, and receive expert treatment recommendations instantly.
            </p>
            <div className="hero-buttons">
              <Link to="/detect" className="cta-button">Start Free Detection</Link>
              <Link to="/about" className="cta-button-secondary">Learn More</Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item"><strong>98%</strong><span>Accuracy Rate</span></div>
              <div className="stat-item"><strong>50+</strong><span>Disease Types</span></div>
              <div className="stat-item"><strong>10k+</strong><span>Scans Daily</span></div>
            </div>
          </div>
          <div className="hero-image">
            <img src={heroImage} alt="Healthy green plant" />
          </div>
        </section>
      </div>

      {/* ===== Features Section (FULL DESCRIPTIONS RESTORED) ===== */}
      <section className="features-section">
        <h2>Why Choose PlantGuard AI?</h2>
        <p className="section-subtitle">Comprehensive plant disease management powered by state-of-the-art technology.</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: '#ecfdf5' }}><FaFlask color="#10b981" size={24} /></div>
            <h3>AI-Powered Detection</h3>
            <p>Our system utilizes advanced Convolutional Neural Networks (CNNs) trained on thousands of images to provide highly accurate disease identification from a single leaf photo.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: '#eff6ff' }}><FaBookOpen color="#3b82f6" size={24} /></div>
            <h3>Comprehensive Database</h3>
            <p>Gain access to a rich encyclopedia of plant diseases. Understand symptoms, prevention methods, and a variety of chemical and organic treatment options.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: '#fffbeb' }}><FaClock color="#f59e0b" size={24} /></div>
            <h3>Real-Time Analysis</h3>
            <p>Receive immediate, actionable results within seconds. Our platform provides confidence scores and severity indicators to help you make informed decisions quickly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: '#ecfdf5' }}><FaShieldAlt color="#10b981" size={24} /></div>
            <h3>Preventive Care</h3>
            <p>Don't just react to diseases; prevent them. We provide personalized recommendations for disease prevention and best practices for ongoing crop protection.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: '#fef2f2' }}><FaBolt color="#ef4444" size={24} /></div>
            <h3>Fast & Accurate</h3>
            <p>Our optimized AI models leverage state-of-the-art architectures to deliver diagnoses that are not only rapid but also consistently precise and reliable.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: '#f0f9ff' }}><FaUsers color="#0ea5e9" size={24} /></div>
            <h3>Expert Support</h3>
            <p>Connect with a community of agricultural experts and access a library of verified treatment protocols, ensuring you're following best practices.</p>
          </div>
        </div>
      </section>

      {/* ===== How It Works Section ===== */}
      <section className="how-it-works-section">
        <h2>How It Works</h2>
        <p className="section-subtitle">Three simple steps to protect your crops.</p>
        <div className="steps-grid">
          <div className="step-card"><div className="step-number">01</div><div className="step-content"><FaUpload className="step-icon" /><h3>Upload Image</h3><p>Take a clear photo of the affected plant leaf and upload it to our platform.</p></div></div>
          <div className="step-card"><div className="step-number">02</div><div className="step-content"><FaMicroscope className="step-icon" /><h3>AI Analysis</h3><p>Our deep learning models analyze the image and identify potential diseases.</p></div></div>
          <div className="step-card"><div className="step-number">03</div><div className="step-content"><FaClipboardList className="step-icon" /><h3>Get Results</h3><p>Receive a detailed diagnosis, severity assessment, and treatment recommendations.</p></div></div>
        </div>
      </section>
      
      {/* ===== Encyclopedia Section ===== */}
      <section className="encyclopedia-section">
        <div className="encyclopedia-content">
          <h2>Explore the Disease Encyclopedia</h2>
          <p>A comprehensive, searchable database of common plant diseases, symptoms, and treatments. Empower yourself with knowledge to better protect your crops.</p>
          <Link to="/encyclopedia" className="cta-button">Browse Encyclopedia</Link>
        </div>
      </section>

      {/* ===== Call to Action Section ===== */}
      <section className="cta-section">
        <h2>Ready to Protect Your Crops?</h2>
        <p>Join thousands of farmers and agriculture professionals using PlantGuard AI to ensure healthier crops and sustainable farming practices.</p>
        <Link to="/detect" className="cta-button-secondary">Start Free Detection Now</Link>
      </section>
    </div>
  );
};

export default Home;