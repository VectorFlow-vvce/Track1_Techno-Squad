import React from 'react';
import './PolicyPages.css'; // Import the shared CSS

const PrivacyPolicy = () => {
  return (
    <div className="policy-page">
      <h1>Privacy Policy</h1>
      <em className="last-updated">Last updated: October 22, 2025</em>

      <p>Welcome to PlantGuard AI. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>

      <h2>1. Information We Collect</h2>
      <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
      <ul>
        <li><strong>Image Data:</strong> Images of plant leaves you upload for disease analysis. These images are processed by our AI model. We aim to anonymize or delete image data promptly after analysis unless needed for model improvement with your explicit consent.</li>
        <li><strong>Usage Data:</strong> We may automatically collect standard usage information (like device type, browser type, pages visited) to help us improve the service.</li>
        <li><strong>Contact Information:</strong> If you use our contact form, we collect the information you provide (name, email, message) solely to respond to your inquiry.</li>
      </ul>

      <h2>2. Use of Your Information</h2>
      <p>Having accurate information permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
      <ul>
        <li>Provide the core disease detection service.</li>
        <li>Monitor and analyze usage and trends to improve your experience.</li>
        <li>Respond to your comments, questions, and requests and provide customer service.</li>
        <li>Improve the accuracy and performance of our AI models (using anonymized or consented data).</li>
      </ul>

      <h2>3. Disclosure of Your Information</h2>
      <p>We do not share, sell, rent, or trade your personally identifiable information with third parties for their marketing purposes.</p>
      <p>We may share information if required by law, to protect rights, or in connection with any merger or sale of company assets.</p>

      <h2>4. Security of Your Information</h2>
      <p>We use administrative, technical, and physical security measures to help protect your information. While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>

      <h2>5. Policy Changes</h2>
      <p>We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last updated" date. You are encouraged to review this Privacy Policy periodically to stay informed of updates.</p>

      <h2>6. Contact Us</h2>
      <p>If you have questions or comments about this Privacy Policy, please contact us using the form on our Contact page.</p>

      <div className="disclaimer-note">
        <p><strong>IMPORTANT DISCLAIMER:</strong> This is sample placeholder text. It is NOT a legally binding Privacy Policy. You MUST consult with a qualified legal professional to draft a policy that accurately reflects your data handling practices and complies with all applicable laws and regulations (such as GDPR, CCPA, etc.) based on your users' locations and your specific service features.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;