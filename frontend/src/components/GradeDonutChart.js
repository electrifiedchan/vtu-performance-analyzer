import React, { useMemo } from 'react';
import PropTypes from 'prop-types'; // Added for PropType validation
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js modules (as before)
ChartJS.register(ArcElement, Tooltip, Legend);

// --- Options Object (Moved Outside - Improvement #4) ---
// This avoids recreating the object on every render.
// Also includes the new tooltip callback.
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // Allows chart to fit our box
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#c9d1d9', // Theme text color
        padding: 15,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      bodyFont: {
        size: 14,
      },
      callbacks: {
        // This callback adds the percentage to the tooltip
        label: function(context) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} Subjects (${percentage}%)`;
        }
      }
    },
  },
};

// --- Data Processing Function (Updated) ---
const processDataForChart = (subjects) => {
  const gradeCounts = {};
  
  // Define grade order for logical sorting (Improvement #3)
  const gradeOrder = ['O', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'P', 'F'];
  
  subjects.forEach(subject => {
    // We only want to chart *real* subjects, not non-credit ones (like BPEK459)
    if (subject.credits > 0) {
      const points = subject.points;
      let gradeLabel = 'F';
      if (points === 10) gradeLabel = 'O';
      else if (points === 9) gradeLabel = 'A+';
      else if (points === 8) gradeLabel = 'A';
      else if (points === 7) gradeLabel = 'B+';
      else if (points === 6) gradeLabel = 'B';
      else if (points === 5) gradeLabel = 'C+';
      else if (points === 4) gradeLabel = 'C';
      else if (points === 3) gradeLabel = 'P';

      // Use the cleaner logic (from Improvement #1)
      gradeCounts[gradeLabel] = (gradeCounts[gradeLabel] || 0) + 1;
    }
  });

  // Sort by grade order (Improvement #3)
  const sortedEntries = Object.entries(gradeCounts).sort((a, b) => {
    return gradeOrder.indexOf(a[0]) - gradeOrder.indexOf(b[0]);
  });
  
  const labels = sortedEntries.map(entry => entry[0]);
  const data = sortedEntries.map(entry => entry[1]);

  return {
    labels: labels,
    datasets: [
      {
        label: '# of Subjects',
        data: data,
        // New, better dark mode colors (Improvement #2)
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',   // Teal - O
          'rgba(35, 134, 54, 0.7)',    // Green - A+
          'rgba(54, 162, 235, 0.7)',   // Blue - A
          'rgba(153, 102, 255, 0.7)',  // Purple - B+
          'rgba(255, 206, 86, 0.7)',   // Yellow - B
          'rgba(255, 159, 64, 0.7)',   // Orange - C+
          'rgba(255, 99, 132, 0.7)',   // Red - C/F
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(35, 134, 54, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
};

// --- The React Component (Updated) ---
function GradeDonutChart({ subjectData }) {
  
  // Memoize chartData so it only recalculates when subjectData changes (Improvement #1)
  const chartData = useMemo(() => processDataForChart(subjectData), [subjectData]);

  // Pass the options object defined outside
  return <Doughnut data={chartData} options={chartOptions} />;
}

// Add PropTypes validation (Improvement #5)
GradeDonutChart.propTypes = {
  subjectData: PropTypes.arrayOf(
    PropTypes.shape({
      points: PropTypes.number.isRequired,
      credits: PropTypes.number.isRequired,
    })
  ).isRequired,
};

// Memoize the entire component to prevent re-renders (Improvement #1)
export default React.memo(GradeDonutChart);