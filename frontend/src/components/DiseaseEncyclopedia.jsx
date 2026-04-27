import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
// --- UPDATED ICON IMPORT ---
import { FaSearch, FaFilter, FaExclamationTriangle, FaCheckCircle, FaDotCircle, FaFlask, FaLeaf } from 'react-icons/fa';
// Removed FaTimesCircle, Added FaDotCircle
import './DiseaseEncyclopedia.css';

const DiseaseEncyclopedia = () => {
  const [diseases, setDiseases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allCategories, setAllCategories] = useState(['All Categories']);

  useEffect(() => {
    const fetchDiseases = async () => {
      setLoading(true); 
      setError(null); 
      try {
        const response = await axios.get('http://localhost:5000/diseases'); 
        if (Array.isArray(response.data)) {
          setDiseases(response.data);
          const uniqueCategories = [...new Set(response.data.map(d => d.category || 'Unknown'))];
          setAllCategories(['All Categories', ...uniqueCategories].sort()); 
        } else {
          console.error("Received unexpected data format:", response.data);
          setError('Received invalid data format from the server.');
        }
      } catch (e) {
        setError('Could not fetch disease data. Please ensure the backend server is running and accessible.');
        console.error("Error fetching diseases:", e);
      } finally {
        setLoading(false); 
      }
    };

    fetchDiseases();
  }, []); 

  const filteredDiseases = diseases.filter(disease => {
    const nameLower = disease.name?.toLowerCase() || '';
    const sciNameLower = disease.scientific_name?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = nameLower.includes(searchLower) || sciNameLower.includes(searchLower);
    const matchesCategory = selectedCategory === 'All Categories' || disease.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSeverityClass = (severity = '') => { 
    switch (severity.toLowerCase()) {
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="encyclopedia-page loading-state">
        <FaLeaf className="loading-icon" />
        <p>Loading disease data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="encyclopedia-page error-state">
        <div className="error-box">
          <FaExclamationTriangle size={30} color="#ef4444" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="encyclopedia-page">
      <div className="encyclopedia-header">
        <h1>Disease Encyclopedia</h1>
        <p className="section-subtitle">
          A comprehensive database of common plant diseases, symptoms, and treatments.
        </p>
      </div>

      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search diseases (e.g., Powdery Mildew...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown-wrapper">
          <FaFilter className="filter-icon" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {allCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="results-count">Showing {filteredDiseases.length} of {diseases.length} diseases</p>

      <div className="disease-grid">
        {filteredDiseases.length > 0 ? (
          filteredDiseases.map(disease => (
            <div key={disease.id || disease.name} className="disease-card">
              <div className="card-header">
                <h2>{disease.name || 'Unnamed Disease'}</h2>
                {disease.severity && (
                  <span className={`severity-tag ${getSeverityClass(disease.severity)}`}>
                    {disease.severity}
                  </span>
                )}
              </div>
              <p className="scientific-name">{disease.scientific_name || ''}</p>
              <p className="category-name">{disease.category || 'Unknown Category'}</p>

              {disease.symptoms && disease.symptoms.length > 0 && (
                <div className="details-section">
                  <h3>Symptoms</h3>
                  <ul>
                    {disease.symptoms.map((s, index) => (
                      // --- UPDATED ICON USAGE ---
                      <li key={index}><FaDotCircle className="detail-icon symptom-icon" /> {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {disease.prevention && disease.prevention.length > 0 && (
                <div className="details-section">
                  <h3>Prevention</h3>
                  <ul>
                    {disease.prevention.map((p, index) => (
                      <li key={index}><FaCheckCircle className="detail-icon prevention-icon" /> {p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {disease.treatment && disease.treatment.length > 0 && (
                 <div className="details-section">
                   <h3>Treatment</h3>
                   <ul>
                     {disease.treatment.map((t, index) => (
                       <li key={index}><FaFlask className="detail-icon treatment-icon" /> {t}</li>
                     ))}
                   </ul>
                 </div>
              )}
            </div>
          ))
        ) : (
          <p className="no-results">No diseases found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default DiseaseEncyclopedia;