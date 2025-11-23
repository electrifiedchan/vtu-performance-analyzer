import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import SGPAInput from '../components/SGPAInput';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_TIMEOUT = 180000; // 90 seconds

function UploadPage({ onUploadSuccess, onUploadStart, onUploadError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastSGPAs, setPastSGPAs] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isFormValid = useMemo(() => {
    if (!selectedFile) return false;
    const hasErrors = Object.values(fieldErrors).some(err => err);
    return !hasErrors;
  }, [selectedFile, fieldErrors]);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      setError("❌ Invalid file type. Please upload a PDF.");
      event.target.value = null;
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("❌ File too large. Maximum size is 10MB.");
      event.target.value = null;
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
  }, []);

  const handleSGPAChange = useCallback((e) => {
    const { name, value } = e.target;
    setPastSGPAs(prev => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [fieldErrors]);

  const handleSGPABlur = useCallback((e) => {
    const { name, value } = e.target;

    if (value && (parseFloat(value) < 0 || parseFloat(value) > 10)) {
      setFieldErrors(prev => ({ 
        ...prev, 
        [name]: 'SGPA must be between 0 and 10' 
      }));
    }
  }, []);

  const handleUpload = async () => {
    if (!isFormValid) {
      setError("❌ Please fix all errors before uploading");
      return;
    }

    setLoading(true);
    setError(null);

    if (onUploadStart) onUploadStart(); 

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const sgpaList = Object.values(pastSGPAs).filter(Boolean);
      if (sgpaList.length > 0) {
        formData.append('past_sgpas', sgpaList.join(','));
      }

      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(UPLOAD_TIMEOUT),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        onUploadSuccess(data);
      } else {
        throw new Error(data.message || "Failed to process PDF");
      }
    } catch (err) {
      const errorMessage = err.name === 'AbortError' 
        ? "⏱️ Request timed out (90s). Your PDF is large or server is slow. Please try again."
        : err.message.includes('Failed to fetch')
        ? "🔌 Cannot connect to server. Ensure backend is running on port 5000."
        : `❌ ${err.message}`;

      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <header className="page-header">
        <h1>Smart SGPA/CGPA Calculator</h1>
        <p className="subtitle">Upload your VTU PDF marks card for instant calculations</p>
      </header>

      <div className="upload-container">
        <section className="form-section" aria-labelledby="past-sgpa-heading">
          <h2 id="past-sgpa-heading" className="section-title">
            Previous Semesters (Optional)
            <span className="helper-text">For trend analysis and prediction</span>
          </h2>

          <div className="sgpa-inputs-container">
            {[1, 2, 3].map((sem, index) => (
              <SGPAInput
                key={`sem${sem}`}
                name={`sem${sem}`}
                placeholder={`Semester ${sem} SGPA`}
                value={pastSGPAs[`sem${sem}`]}
                onChange={handleSGPAChange}
                onBlur={handleSGPABlur}
                error={fieldErrors[`sem${sem}`]}
                disabled={loading}
                autoFocus={index === 0}
                testId={`sgpa-input-sem${sem}`}
              />
            ))}
          </div>
        </section>

        <section className="form-section" aria-labelledby="upload-heading">
          <h2 id="upload-heading" className="section-title">
            Current Semester Marks Card
            <span className="helper-text required">* Required</span>
          </h2>

          <div className="form-group">
            <input 
              type="file"
              id="file_upload"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={loading}
              aria-label="Upload PDF marks card"
            />
            {selectedFile && (
              <p className="file-selected">
                ✅ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        </section>

        <div className="action-section">
          {loading && (
            <p className="loading-text">⏳ Processing your PDF (up to 90 seconds)...</p>
          )}
          <button 
            className="upload-button"
            onClick={handleUpload} 
            disabled={loading || !isFormValid}
            aria-busy={loading}
          >
            {loading ? "Processing..." : '📄 Calculate & Predict'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <span className="error-text">{error}</span>
          <button 
            className="dismiss-error"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

UploadPage.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
  onUploadStart: PropTypes.func,
  onUploadError: PropTypes.func,
};

export default UploadPage;
