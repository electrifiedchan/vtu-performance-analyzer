import React, { useState } from 'react';
import './App.css';

// Import our page components
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';

function App() {
  // Single source of truth for results
  // null = show upload page, data = show results page
  const [resultsData, setResultsData] = useState(null);

  // Callback function passed to UploadPage
  // Called when PDF is successfully processed
  const handleUploadSuccess = (data) => {
    setResultsData(data);
  };

  // Callback function passed to ResultsPage
  // Resets app to initial state for new calculation
  const handleReset = () => {
    setResultsData(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        {resultsData ? (
          <ResultsPage 
            resultsData={resultsData} 
            onReset={handleReset} 
          />
        ) : (
          <UploadPage 
            onUploadSuccess={handleUploadSuccess} 
          />
        )}
      </header>
    </div>
  );
}

export default App;
