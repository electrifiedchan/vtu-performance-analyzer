import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import GradeDonutChart from '../components/GradeDonutChart';
import TrendLineChart from '../components/TrendLineChart';

// --- Helper Functions ---
const getPointsFromTotal = (total) => {
  const marks = parseInt(total, 10);
  if (isNaN(marks)) return 0;
  if (marks >= 90) return 10;
  if (marks >= 80) return 9;
  if (marks >= 70) return 8;
  if (marks >= 60) return 7;
  if (marks >= 55) return 6;
  if (marks >= 50) return 5;
  if (marks >= 40) return 4;
  return 0;
};

const getResultFromTotal = (total) => (parseInt(total, 10) >= 40 ? 'P' : 'F');

function ResultsPage({ resultsData, onReset }) {
  
  // --- AI Tip State ---
  const [aiTip, setAiTip] = useState("");
  const [tipLoading, setTipLoading] = useState(false);
  const [tipError, setTipError] = useState("");
  
  // --- What-If Mode State ---
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [whatIfSubjects, setWhatIfSubjects] = useState(resultsData.subjects || []);

  useEffect(() => {
    setWhatIfSubjects(resultsData.subjects || []);
  }, [resultsData.subjects]);
  
  // --- What-If Stats Calculation ---
  const whatIfStats = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;

    whatIfSubjects.forEach(subject => {
      totalCredits += subject.credits;
      totalPoints += (subject.points * subject.credits);
    });

    const sgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
    
    return { sgpa, totalCredits, totalPoints };
  }, [whatIfSubjects]);

  // --- What-If Change Handler ---
  const handleWhatIfChange = (index, newTotal) => {
    const newPoints = getPointsFromTotal(newTotal);
    const newResult = getResultFromTotal(newTotal);

    setWhatIfSubjects(prevSubjects => 
      prevSubjects.map((subject, i) => {
        if (i === index) {
          return {
            ...subject,
            total: newTotal ? parseInt(newTotal, 10) : 0,
            points: newPoints,
            result: newResult
          };
        }
        return subject;
      })
    );
  };
  
  // --- AI Tip Fetcher ---
  const fetchAiTip = async () => {
    setTipLoading(true);
    setAiTip("");
    setTipError("");
    try {
      const response = await fetch('http://localhost:5000/get-ai-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: resultsData.subjects,
          sgpa: resultsData.sgpa,
        }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setAiTip(data.tip);
      } else {
        setTipError(data.message || "Failed to get tip");
      }
    } catch (err) {
      setTipError("Cannot connect to AI server. Please try again.");
    } finally {
      setTipLoading(false);
    }
  };
  
  // --- Stats Calculation ---
  const stats = useMemo(() => {
    const subjects = resultsData.subjects || [];
    const passedSubjects = subjects.filter(s => s.result === 'P').length;
    const failedSubjects = subjects.filter(s => s.result === 'F').length;
    const totalSubjects = subjects.length;
    const passPercentage = totalSubjects > 0 
      ? ((passedSubjects / totalSubjects) * 100).toFixed(1) 
      : 0;
    return { passedSubjects, failedSubjects, totalSubjects, passPercentage };
  }, [resultsData.subjects]);

  // --- Prediction Renderer ---
  const renderPrediction = () => {
    if (resultsData.prediction && resultsData.prediction.predicted_sgpa) {
      return (
        <>
          <h4>📈 Performance Trend & Prediction</h4>
          <div className="chart-wrapper"> 
            <TrendLineChart predictionData={resultsData.prediction} />
          </div>
          <div className="prediction-summary">
            <p className="prediction-label">Predicted Next Sem SGPA:</p>
            <p className="prediction-value">{resultsData.prediction.predicted_sgpa.toFixed(2)}</p>
            {resultsData.prediction.predicted_cgpa && (
              <>
                <p className="prediction-label" style={{marginTop: '10px'}}>Predicted Overall CGPA:</p>
                <p className="prediction-value-small">{resultsData.prediction.predicted_cgpa.toFixed(2)}</p>
              </>
            )}
          </div>
        </>
      );
    }
    return (
      <>
        <h4>📈 Performance Trend</h4>
        <div className="prediction-placeholder">
          <p>💡 Enter your past SGPAs to see predictions.</p>
        </div>
      </>
    );
  };
  
  // --- Export CSV Handler (Always EXPORTS ACTUAL DATA) ---
  const handleExportCSV = () => {
    const subjects = resultsData.subjects || [];
    
    // Headers: USN, Name, subject codes, SGPA
    const headers = ["USN", "Name"];
    subjects.forEach(subject => {
      headers.push(subject.code);
    });
    headers.push("SGPA");
    
    // Data: USN, Name, actual marks, actual sgpa
    const data = [
      (resultsData.usn || "N/A"),
      resultsData.name || "N/A"
    ];
    
    subjects.forEach(subject => {
      data.push(subject.total ?? "—");
    });
    
    data.push(resultsData.sgpa ? resultsData.sgpa.toFixed(2) : "N/A");
    
    // Build CSV
    let csvContent = headers.join(",") + "\n" + data.join(",") + "\n";
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `SGPA_Report_${resultsData.usn || 'Student'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // --- Print Handler ---
  const handlePrint = () => {
    window.print();
  };

  const displaySubjects = whatIfMode ? whatIfSubjects : (resultsData.subjects || []);

  return (
    <div className="results-container">
      
      <div className="results-header">
        <h2>✅ Calculation Results</h2>
        <div className="header-buttons">
          <button 
            onClick={handleExportCSV} 
            className="export-button csv"
            aria-label="Export results to CSV file"
          >
            📊 Download Report
          </button>
          <button 
            onClick={handlePrint} 
            className="export-button pdf"
            aria-label="Print or save as PDF"
          >
            🖨️ Print / PDF
          </button>
          <button 
            onClick={onReset} 
            className="reset-button"
            aria-label="Calculate again with new PDF"
          >
            🔄 Calculate Again
          </button>
        </div>
      </div>

      {(resultsData.usn || resultsData.name) && (
        <div className="student-info">
          {resultsData.usn && <p><strong>USN:</strong> {resultsData.usn}</p>}
          {resultsData.name && <p><strong>Name:</strong> {resultsData.name}</p>}
        </div>
      )}

      <div className="sgpa-highlight">
        <p className="sgpa-label">Your Semester Grade Point Average (SGPA)</p>
        
        {whatIfMode ? (
          <h3 className="sgpa-formula what-if-formula">
            {whatIfStats.totalPoints.toFixed(2)} ÷ {whatIfStats.totalCredits} = <span className="sgpa-value what-if-value">{whatIfStats.sgpa.toFixed(2)}</span>
          </h3>
        ) : (
          <h3 className="sgpa-formula">
            {resultsData.total_grade_points_earned.toFixed(2)} ÷ {resultsData.total_credits_attempted} = <span className="sgpa-value">{resultsData.sgpa.toFixed(2)}</span>
          </h3>
        )}
        
        {resultsData.cgpa && !whatIfMode && (
          <div className="cgpa-section">
            <div className="stat-item">
              <span className="stat-label">Overall CGPA</span>
              <span className="stat-value">{resultsData.cgpa.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Percentage</span>
              <span className="stat-value">{resultsData.percentage?.toFixed(2)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Classification</span>
              <span className="stat-value classification-badge">{resultsData.classification}</span>
            </div>
          </div>
        )}
        
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">Total Subjects</span>
            <span className="stat-value">{stats.totalSubjects}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Passed</span>
            <span className="stat-value stat-success">{stats.passedSubjects}</span>
          </div>
          {stats.failedSubjects > 0 && (
            <div className="stat-item">
              <span className="stat-label">Failed</span>
              <span className="stat-value stat-danger">{stats.failedSubjects}</span>
            </div>
          )}
          <div className="stat-item">
            <span className="stat-label">Pass Rate</span>
            <span className="stat-value">{stats.passPercentage}%</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-box">
          <h4>📊 Grade Distribution</h4>
          {displaySubjects.length > 0 ? (
            <div className="chart-wrapper">
              <GradeDonutChart subjectData={displaySubjects} />
            </div>
          ) : (
            <p className="no-data">No subject data available</p>
          )}
        </div>
        
        <div className="chart-box">
          {renderPrediction()}
        </div>
      </div>
      
      <div className="ai-tip-box">
        <h4>🤖 Gemini AI Study Tip</h4>
        {!aiTip && !tipLoading && !tipError && (
          <button 
            onClick={fetchAiTip} 
            className="ai-button" 
            disabled={tipLoading}
            aria-label="Get AI analysis from Gemini"
          >
            ✨ Get AI Analysis
          </button>
        )}
        {tipLoading && (
          <p className="loading-text">🧠 Gemini is analyzing your results...</p>
        )}
        {tipError && (
          <p className="error-message">❌ {tipError}</p>
        )}
        {aiTip && (
          <div className="ai-tip-text">
            <p>{aiTip}</p>
            <button 
              onClick={() => setAiTip("")}
              className="ai-refresh"
              aria-label="Get another AI tip"
            >
              🔄 Get Another Tip
            </button>
          </div>
        )}
      </div>

      <div className="subjects-table-box">
        <div className="table-header">
          <h4>📚 Subject Breakdown</h4>
          <div className="what-if-toggle">
            <label htmlFor="what-if-check">
              🔮 "What If?" Mode:
            </label>
            <input 
              type="checkbox" 
              id="what-if-check"
              checked={whatIfMode}
              onChange={(e) => setWhatIfMode(e.target.checked)}
            />
          </div>
        </div>
        
        {displaySubjects.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <caption className="sr-only">
                Subject breakdown with credits, grades, and results
              </caption>
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Subject Title</th>
                  <th scope="col">Credits (Ci)</th>
                  {whatIfMode ? (
                    <th scope="col">📝 New Marks</th>
                  ) : (
                    <th scope="col">Total Marks</th>
                  )}
                  <th scope="col">Grade (Gi)</th>
                  <th scope="col">Points (Ci × Gi)</th>
                  <th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                {displaySubjects.map((subject, index) => (
                  <tr 
                    key={`${subject.code}-${index}`}
                    className={subject.result === 'F' ? 'failed-row' : ''}
                  >
                    <td data-label="Code">{subject.code}</td>
                    <td data-label="Subject" className="subject-title">{subject.title}</td>
                    <td data-label="Credits">{subject.credits}</td>
                    
                    <td data-label="Marks">
                      {whatIfMode && subject.credits > 0 ? (
                        <input 
                          type="number" 
                          className="what-if-input"
                          min="0"
                          max="100"
                          value={subject.total ?? ''} 
                          onChange={(e) => handleWhatIfChange(index, e.target.value)}
                          placeholder="Enter marks"
                        />
                      ) : (
                        <span>{subject.total ?? '—'}</span>
                      )}
                    </td>
                    
                    <td data-label="Grade">{subject.points}</td>
                    <td data-label="Points">{(subject.credits * subject.points).toFixed(2)}</td>
                    <td data-label="Result">
                      <span className={`result-badge ${subject.result === 'F' ? 'result-fail' : 'result-pass'}`}>
                        {subject.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3"><strong>TOTAL</strong></td>
                  <td>-</td>
                  <td>-</td>
                  <td><strong>{(whatIfMode ? whatIfStats.totalPoints : resultsData.total_grade_points_earned).toFixed(2)}</strong></td>
                  <td>-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="no-data">No subjects found in the results</p>
        )}
      </div>
    </div>
  );
}

ResultsPage.propTypes = {
  resultsData: PropTypes.shape({
    sgpa: PropTypes.number.isRequired,
    cgpa: PropTypes.number,
    percentage: PropTypes.number,
    classification: PropTypes.string,
    total_credits_attempted: PropTypes.number.isRequired,
    total_grade_points_earned: PropTypes.number.isRequired,
    subjects: PropTypes.arrayOf(
      PropTypes.shape({
        code: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        internal: PropTypes.number,
        external: PropTypes.number,
        total: PropTypes.number,
        credits: PropTypes.number.isRequired,
        points: PropTypes.number.isRequired,
        result: PropTypes.oneOf(['P', 'F']).isRequired,
      })
    ).isRequired,
    usn: PropTypes.string,
    name: PropTypes.string,
    prediction: PropTypes.shape({
      past_trend: PropTypes.arrayOf(PropTypes.number),
      predicted_sgpa: PropTypes.number,
      predicted_cgpa: PropTypes.number,
    }),
  }).isRequired,
  onReset: PropTypes.func.isRequired,
};

export default ResultsPage;
