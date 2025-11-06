import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register all the modules a Line Chart needs
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Options object is outside the component for performance
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#c9d1d9', // Theme text color
        padding: 15,
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      bodyFont: {
        size: 14,
      },
      callbacks: {
        label: function(context) {
          return `SGPA: ${context.parsed.y}`;
        }
      }
    },
  },
  scales: { // Specific options for Line Charts
    x: { // The X-axis (Semesters)
      ticks: {
        color: '#8b949e', // Theme secondary text color
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)' // Theme border color
      }
    },
    y: { // The Y-axis (SGPA)
      ticks: {
        color: '#8b949e',
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      min: 0, // Set minimum SGPA to 0
      max: 10, // Set maximum SGPA to 10
    }
  }
};

// Data processing function is outside the component
const processDataForChart = (predictionData) => {
  // e.g., past_trend = [8.1, 7.5, 8.3, 7.0]
  const pastSGPAs = predictionData.past_trend || [];
  const predictedSGPA = predictionData.predicted_sgpa;

  // Create labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"]
  const labels = pastSGPAs.map((_, index) => `Sem ${index + 1}`);
  
  // This is the data for our solid line
  const pastData = [...pastSGPAs];
  
  // This is the data for our dashed line
  // [null, null, 7.0, 8.11]
  const predictionDataPoints = new Array(pastSGPAs.length - 1).fill(null);
  predictionDataPoints.push(pastSGPAs[pastSGPAs.length - 1]); // Connect to the last real SGPA
  predictionDataPoints.push(predictedSGPA); // Add the new predicted point

  // Add the new label for the predicted semester
  labels.push(`Sem ${pastSGPAs.length + 1} (Pred)`);

  return {
    labels: labels,
    datasets: [
      {
        label: 'Past SGPA',
        data: pastData,
        borderColor: 'rgb(54, 162, 235)', // Blue
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1 // Makes the line slightly curved
      },
      {
        label: 'Predicted SGPA',
        data: predictionDataPoints,
        borderColor: 'rgb(255, 159, 64)', // Orange
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderDash: [5, 5], // This makes the line dashed
        tension: 0.1
      }
    ],
  };
};

// --- The React Component ---
function TrendLineChart({ predictionData }) {
  
  // Memoize the data processing
  const chartData = useMemo(() => processDataForChart(predictionData), [predictionData]);

  return <Line options={chartOptions} data={chartData} />;
}

TrendLineChart.propTypes = {
  predictionData: PropTypes.shape({
    past_trend: PropTypes.arrayOf(PropTypes.number).isRequired,
    predicted_sgpa: PropTypes.number.isRequired,
  }).isRequired,
};

export default React.memo(TrendLineChart);