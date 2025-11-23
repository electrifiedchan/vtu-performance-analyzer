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
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
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
        family: 'monospace',
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        family: 'monospace',
        size: 13,
      },
      callbacks: {
        label: function (context) {
          return ` SGPA: ${context.parsed.y.toFixed(2)}`;
        }
      }
    },
  },
  scales: {
    x: {
      ticks: {
        color: 'rgba(255, 255, 255, 0.6)',
        font: {
          family: 'monospace',
          size: 11
        },
        padding: 8
      },
      grid: {
        color: 'rgba(0, 243, 255, 0.08)',
        lineWidth: 1
      },
      border: {
        color: 'rgba(255, 255, 255, 0.2)'
      }
    },
    y: {
      ticks: {
        color: 'rgba(255, 255, 255, 0.6)',
        font: {
          family: 'monospace',
          size: 11
        },
        padding: 8,
        stepSize: 1
      },
      grid: {
        color: 'rgba(0, 243, 255, 0.08)',
        lineWidth: 1
      },
      border: {
        color: 'rgba(255, 255, 255, 0.2)'
      },
      min: 0,
      max: 10,
    }
  }
};

const processDataForChart = (predictionData) => {
  const pastSGPAs = predictionData.past_trend || [];
  const predictedSGPA = predictionData.predicted_sgpa;

  const labels = pastSGPAs.map((_, index) => `Sem ${index + 1}`);

  // Past data - all actual SGPAs
  const pastData = [...pastSGPAs];

  // Prediction data - starts from last actual SGPA and connects to predicted
  const predictionDataPoints = new Array(pastSGPAs.length - 1).fill(null);
  predictionDataPoints.push(pastSGPAs[pastSGPAs.length - 1]);
  predictionDataPoints.push(predictedSGPA);

  labels.push(`Sem ${pastSGPAs.length + 1}`);

  return {
    labels: labels,
    datasets: [
      {
        label: 'Past SGPA',
        data: pastData,
        borderColor: '#00f3ff', // Electric Blue
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(0, 243, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(0, 243, 255, 0.0)');
          return gradient;
        },
        pointBackgroundColor: '#000',
        pointBorderColor: '#00f3ff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBorderWidth: 4,
        borderWidth: 3,
        tension: 0.4, // Smooth curves
        fill: true
      },
      {
        label: 'Predicted',
        data: predictionDataPoints,
        borderColor: '#bd00ff', // Neon Purple
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(189, 0, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(189, 0, 255, 0.0)');
          return gradient;
        },
        pointBackgroundColor: '#000',
        pointBorderColor: '#bd00ff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBorderWidth: 4,
        borderWidth: 3,
        borderDash: [8, 4], // Dashed line for prediction
        tension: 0.4,
        fill: true
      }
    ],
  };
};

function TrendLineChart({ predictionData }) {
  const chartData = useMemo(() => processDataForChart(predictionData), [predictionData]);

  return (
    <div className="relative w-full h-full">
      <Line options={chartOptions} data={chartData} />
    </div>
  );
}

TrendLineChart.propTypes = {
  predictionData: PropTypes.shape({
    past_trend: PropTypes.arrayOf(PropTypes.number).isRequired,
    predicted_sgpa: PropTypes.number.isRequired,
  }).isRequired,
};

export default React.memo(TrendLineChart);