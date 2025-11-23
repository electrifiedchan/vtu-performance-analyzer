import React, { useState } from 'react';
import UploadView from './components/UploadView';
import ResultsView from './components/ResultsView';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  const [resultsData, setResultsData] = useState(null);

  const handleUploadSuccess = (data) => {
    setResultsData(data);
  };

  const handleReset = () => {
    setResultsData(null);
  };

  return (
    <div className="min-h-screen bg-void bg-grid-white/10 relative selection:bg-electric-blue selection:text-black overflow-x-hidden">
      {/* Animated Background Elements */}
      <AnimatedBackground />

      {/* Background Gradient Blob */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-electric-blue/20 blur-[120px] rounded-full pointer-events-none opacity-20" />

      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center">
        <header className="mb-12 text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
            SGPA <span className="text-electric-blue">CALC</span>
          </h1>
          <p className="text-white/40 font-mono text-sm tracking-[0.2em] uppercase">
            Advanced Grade Point System // V2.0
          </p>
        </header>

        <main className="w-full">
          {resultsData ? (
            <ResultsView data={resultsData} onReset={handleReset} />
          ) : (
            <UploadView onUploadSuccess={handleUploadSuccess} />
          )}
        </main>

        <footer className="mt-20 text-white/20 text-xs font-mono text-center">
          DESIGNED BY CHAN AND TEAM // 2025
        </footer>
      </div>
    </div>
  );
}

export default App;
