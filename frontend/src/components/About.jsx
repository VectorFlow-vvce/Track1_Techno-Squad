import React from 'react';
import { Link } from 'react-router-dom';
import { FaBullseye, FaGlobe, FaSeedling, FaCogs } from 'react-icons/fa';
import './About.css';
import aboutImage from '../assets/about-us-image.jpg'; // Make sure this image is in /src

const About = () => {
  return (
    <div className="about-page">
      {/* ===== Header Section Wrapper (for gradient) ===== */}
      <div className="about-header-wrapper">
        <div className="about-header">
          <h1>About PlantGuard AI</h1>
          <p className="section-subtitle">
            Revolutionizing plant disease detection through artificial intelligence and deep learning technology.
          </p>
        </div>
      </div>

      {/* ===== Mission Section (White Card) ===== */}
      <section className="about-card mission-section">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            Our mission is to empower farmers, gardeners, and agricultural professionals with cutting-edge technology to protect crops and ensure a sustainable future. We believe that by providing accessible, accurate, and instant plant disease diagnoses, we can help reduce crop loss, minimize chemical usage, and promote healthier ecosystems.
          </p>
        </div>
        <div className="mission-image">
          <img src={aboutImage} alt="Agricultural Technology" />
        </div>
      </section>

      {/* ===== Core Values Section (Gray Background) ===== */}
      <section className="values-section">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon-wrapper" style={{ backgroundColor: '#ecfdf5' }}>
              <FaBullseye color="#10b981" size={24} />
            </div>
            <h3>Accuracy</h3>
            <p>We are committed to providing the most precise and reliable diagnoses, leveraging rigorously tested AI models.</p>
          </div>
          <div className="value-card">
            <div className="value-icon-wrapper" style={{ backgroundColor: '#eff6ff' }}>
              <FaGlobe color="#3b82f6" size={24} />
            </div>
            <h3>Accessibility</h3>
            <p>Our goal is to make advanced agricultural technology easy to use and available to everyone, everywhere.</p>
          </div>
          <div className="value-card">
            <div className="value-icon-wrapper" style={{ backgroundColor: '#f0f9ff' }}>
              <FaSeedling color="#0ea5e9" size={24} />
            </div>
            <h3>Sustainability</h3>
            <p>We support environmentally-friendly farming practices by enabling targeted treatments and reducing waste.</p>
          </div>
        </div>
      </section>

      {/* ===== Technology Section (Gradient Background) ===== */}
      <section className="technology-section">
        <div className="technology-content">
          <FaCogs className="technology-icon" />
          <h2>The Technology Behind the Tool</h2>
          <p>
            PlantGuard AI is built upon a sophisticated deep learning model, specifically a Convolutional Neural Network (CNN). Our model has been trained on the extensive PlantVillage dataset, containing tens of thousands of images. Through <strong>Transfer Learning</strong>, we have fine-tuned a state-of-the-art architecture to achieve high accuracy in identifying plant diseases from simple leaf images.
          </p>
        </div>
      </section>

      {/* ===== Call to Action Section ===== */}
      <section className="about-cta-section">
        <h2>See Our Technology in Action</h2>
        <p>Ready to try it for yourself? Use our free tool to get an instant diagnosis.</p>
        <Link to="/detect" className="cta-button">
          Start Detection Now
        </Link>
      </section>
    </div>
  );
};

export default About;