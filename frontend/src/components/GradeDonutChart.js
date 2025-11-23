import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '52%', // Much thicker ring
  layout: {
    padding: 0
  },
  plugins: {
    legend: {
      position: 'right',
      align: 'center',
      labels: {
        color: 'rgba(255, 255, 255, 0.85)',
        padding: 16,
        boxWidth: 14,
        font: {
          family: 'monospace',
          size: 12,
          weight: '500'
        },
        usePointStyle: true,
        pointStyle: 'circle',
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      titleColor: '#00f3ff',
      bodyColor: '#fff',
      borderColor: 'rgba(0, 243, 255, 0.4)',
      borderWidth: 2,
      padding: 16,
      displayColors: true,
      titleFont: {
        size: 14,
        family: 'monospace',
        weight: 'bold'
      },
      bodyFont: {
        family: 'monospace',
        size: 13,
      },
      callbacks: {
        label: function (context) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return ` ${label}: ${value} Points (${percentage}%)`;
        }
      }
    },
  },
  elements: {
    arc: {
      borderWidth: 4,
      borderColor: '#000000',
      hoverBorderColor: '#00f3ff',
      hoverBorderWidth: 4,
      hoverOffset: 20,
    }
  }
};

const processDataForChart = (subjects) => {
  const validSubjects = subjects.filter(s => s.credits > 0 && s.points > 0);
  validSubjects.sort((a, b) => (b.credits * b.points) - (a.credits * a.points));

  const labels = validSubjects.map(s => s.code);
  const data = validSubjects.map(s => s.credits * s.points);

  const neonColors = [
    '#00f3ff', '#bd00ff', '#00ff9d', '#ff0055', '#ffbe0b',
    '#ff5e00', '#d900ff', '#00ccff', '#ff9900', '#ccff00'
  ];

  const backgroundColors = validSubjects.map((_, i) => neonColors[i % neonColors.length]);

  return {
    labels: labels,
    datasets: [
      {
        label: 'Grade Points Contribution',
        data: data,
        backgroundColor: backgroundColors,
        borderWidth: 4,
        borderColor: '#000',
      },
    ],
  };
};

function GradeDonutChart({ subjectData }) {
  const chartData = useMemo(() => processDataForChart(subjectData), [subjectData]);

  // Calculate total points
  const totalPoints = useMemo(() => {
    return subjectData.reduce((acc, curr) => acc + (curr.credits * curr.points), 0);
  }, [subjectData]);

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <Doughnut
          data={chartData}
          options={chartOptions}
        />
      </div>
      {/* Total Points Display Below Chart */}
      <div className="text-center py-3 border-t border-white/10">
        <div className="text-white/50 text-xs font-mono uppercase tracking-widest mb-1">Total Points</div>
        <div className="text-3xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(0, 243, 255, 0.4)' }}>
          {totalPoints}
        </div>
      </div>
    </div>
  );
}

GradeDonutChart.propTypes = {
  subjectData: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      points: PropTypes.number.isRequired,
      credits: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default React.memo(GradeDonutChart);