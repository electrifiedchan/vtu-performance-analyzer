import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SGPAInput from '../components/SGPAInput';

function UploadPage({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [sgpaValues, setSGPAValues] = useState({
    sem1: '',
    sem2: '',
    sem3: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateSGPA = (value) => {
    if (!value) return true;
    
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (num < 0 || num > 10) return false;
    
    return true;
  };

  const handleSGPAChange = (e) => {
    const { name, value } = e.target;
    
    const sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    const cleaned = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('') 
      : sanitized;
    
    const finalValue = cleaned.includes('.') 
      ? cleaned.split('.')[0] + '.' + cleaned.split('.')[1].slice(0, 2)
      : cleaned;
    
    setSGPAValues(prev => ({
      ...prev,
      [name]: finalValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSGPABlur = (e) => {
    const { name, value } = e.target;
    
    if (value && !validateSGPA(value)) {
      setErrors(prev => ({
        ...prev,
        [name]: 'Enter a valid SGPA between 0 and 10'
      }));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (file && file.type !== 'application/pdf') {
      alert("Please select a PDF file only");
      event.target.value = null;
      return;
    }
    
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a PDF file first.");
      return;
    }

    const newErrors = {};
    Object.keys(sgpaValues).forEach(key => {
      if (sgpaValues[key] && !validateSGPA(sgpaValues[key])) {
        newErrors[key] = 'Invalid SGPA';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError("Please correct SGPA values before submitting");
      return;
    }

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    const pastSGPAs = [sgpaValues.sem1, sgpaValues.sem2, sgpaValues.sem3]
      .filter(val => val)
      .join(', ');
    
    formData.append('past_sgpas', pastSGPAs);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        onUploadSuccess(data);
      } else {
        setError(data.message || "Failed to process PDF");
      }
    } catch (err) {
      setError("Cannot connect to server. Is Flask running?");
    } finally {
      setLoading(false);
    }
  };

  const hasAnyErrors = Object.values(errors).some(err => err);

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="page-header">
          <h1>Smart SGPA/CGPA Calculator</h1>
          <p className="subtitle">Upload your official VTU PDF marks card to begin.</p>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <span>Previous Semesters</span>
            <span className="helper-text">(Optional) • For trend analysis and prediction</span>
          </h3>
          
          <div className="sgpa-inputs-container">
            <SGPAInput
              name="sem1"
              placeholder="Sem 1 SGPA"
              value={sgpaValues.sem1}
              onChange={handleSGPAChange}
              onBlur={handleSGPABlur}
              error={errors.sem1}
              disabled={loading}
              maxLength="5"
            />
            
            <SGPAInput
              name="sem2"
              placeholder="Sem 2 SGPA"
              value={sgpaValues.sem2}
              onChange={handleSGPAChange}
              onBlur={handleSGPABlur}
              error={errors.sem2}
              disabled={loading}
              maxLength="5"
            />
            
            <SGPAInput
              name="sem3"
              placeholder="Sem 3 SGPA"
              value={sgpaValues.sem3}
              onChange={handleSGPAChange}
              onBlur={handleSGPABlur}
              error={errors.sem3}
              disabled={loading}
              maxLength="5"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <span>Current Semester Marks Card</span>
            <span className="helper-text required">* Required</span>
          </h3>
          
          <div className="form-group">
            <label htmlFor="file_upload" className="sr-only">
              Upload PDF Marks Card
            </label>
            <input 
              type="file"
              id="file_upload"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={loading}
              aria-required="true"
            />
            {selectedFile && (
              <p className="file-selected">
                ✓ {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        <div className="action-section">
          <button 
            className="upload-button"
            onClick={handleUpload} 
            disabled={loading || !selectedFile || hasAnyErrors}
          >
            {loading ? "⏳ Processing..." : "📊 Calculate & Predict"}
          </button>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            <div className="error-banner-content">
              ❌ {error}
            </div>
            <button 
              className="dismiss-error"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {loading && (
          <p className="loading-text">
            ⏳ Analyzing your marks card and calculating results...
          </p>
        )}
      </div>
    </div>
  );
}

UploadPage.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
};

export default UploadPage;
