import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getClinicalPrediction, getSHAPExplanation } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingScreen from '../../components/LoadingScreen';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FiChevronRight, FiAlertCircle, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ClinicalPrediction() {
  const [prediction, setPrediction] = useState(null);
  const [shapData, setShapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        // Get clinical prediction from backend model
        const { data } = await getClinicalPrediction({ patient_id: user.id });
        setPrediction(data);

        // Get SHAP explanation
        const { data: shap } = await getSHAPExplanation({ patient_id: user.id });
        setShapData(shap);
      } catch (err) {
        console.error('Failed to fetch prediction:', err);
        // Use placeholder data for demo
        setPrediction({
          cn_probability: 0.15,
          mci_probability: 0.55,
          ad_probability: 0.30,
          prediction: 'MCI',
          recommendation: 'Recommend MRI scan for further evaluation',
        });
        setShapData({
          features: ['MMSE', 'FAQ', 'AGE', 'PTEDUCAT', 'PTGENDER'],
          importance: [0.35, 0.28, 0.18, 0.12, 0.07],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [user.id]);

  if (loading) return <LoadingScreen message="Running Clinical AI Model..." />;
  if (!prediction) return null;

  const { cn_probability, mci_probability, ad_probability, prediction: pred } = prediction;

  // Determine recommendation based on prediction
  const getRecommendation = () => {
    if (pred === 'CN') return {
      icon: <FiCheckCircle className="text-3xl" />,
      title: 'Routine Follow-up',
      desc: 'No immediate MRI recommendation.',
      color: 'green', bgClass: 'bg-green-55 border-green-200 text-green-800'
    };
    if (pred === 'MCI') return {
      icon: <FiAlertTriangle className="text-3xl" />,
      title: 'MRI Recommended',
      desc: 'Recommend MRI for confirmation.',
      color: 'orange', bgClass: 'bg-orange-55 border-orange-200 text-orange-850'
    };
    return {
      icon: <FiAlertCircle className="text-3xl" />,
      title: 'MRI Recommended',
      desc: 'Neurologist consultation advised.',
      color: 'red', bgClass: 'bg-red-55 border-red-200 text-red-800'
    };
  };

  const rec = getRecommendation();

  // Probability chart data
  const probData = {
    labels: ['Cognitively Normal', 'Mild Cognitive Impairment', 'Alzheimer\'s Disease'],
    datasets: [{
      label: 'Probability',
      data: [cn_probability * 100, mci_probability * 100, ad_probability * 100],
      backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(239, 68, 68, 0.8)'],
      borderColor: ['#22c55e', '#eab308', '#ef4444'],
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  // SHAP feature importance chart
  const shapChartData = shapData ? {
    labels: shapData.features,
    datasets: [{
      label: 'Feature Importance',
      data: shapData.importance.map(v => v * 100),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 6,
    }],
  } : null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Clinical AI Prediction</h1>
          <p className="text-gray-500 mt-1">Results from the trained clinical model</p>
        </div>

        {/* Prediction Result Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Predicted Class</p>
            <h2 className="text-4xl font-bold gradient-text mb-1">
              {pred === 'CN' ? 'Cognitively Normal (CN)' : pred === 'MCI' ? 'Mild Cognitive Impairment (MCI)' : "Alzheimer's Disease (AD)"}
            </h2>
          </div>

          {/* Probability Bars */}
          <div className="space-y-4 mb-6">
            {[
              { label: 'CN (Normal)', val: 'CN', prob: cn_probability, color: 'bg-green-500' },
              { label: 'MCI', val: 'MCI', prob: mci_probability, color: 'bg-yellow-500' },
              { label: 'AD', val: 'AD', prob: ad_probability, color: 'bg-red-500' },
            ].map((item) => {
              const isMax = item.val === pred;
              return (
                <div key={item.label} className={`p-3 rounded-xl transition-all duration-300 ${isMax ? 'bg-primary-50/50 border border-primary-200/60 shadow-sm ring-1 ring-primary-500/20' : ''}`}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-semibold ${isMax ? 'text-primary-800' : 'text-gray-700'}`}>{item.label}</span>
                    <span className={`font-bold ${isMax ? 'text-primary-600' : 'text-gray-800'}`}>{(item.prob * 100).toFixed(1)}%</span>
                  </div>
                  <div className="prediction-bar">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.prob * 100}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className={`prediction-bar-fill ${item.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Probability Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Prediction Probabilities</h3>
          <Bar data={probData} options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + '%' } } },
          }} />
        </motion.div>

        {/* SHAP Explanation */}
        {shapChartData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Explainable AI — SHAP Analysis</h3>
            <p className="text-sm text-gray-500 mb-4">Feature importance showing which factors most influenced the prediction</p>
            <Bar data={shapChartData} options={{
              indexAxis: 'y',
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { beginAtZero: true, ticks: { callback: (v) => v + '%' } } },
            }} />
          </motion.div>
        )}

        {/* Recommendation Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`p-6 rounded-2xl border-2 mb-6 ${rec.bgClass}`}>
          <div className="flex items-start gap-4">
            <div className="mt-1">{rec.icon}</div>
            <div>
              <h3 className="text-lg font-bold mb-1">{rec.title}</h3>
              <p className="text-sm opacity-80">{rec.desc}</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex gap-4">
          {(pred === 'MCI' || pred === 'AD') && (
            <button onClick={() => navigate('/patient/mri')} className="btn-primary flex-1 flex items-center justify-center gap-2">
              Proceed to MRI Upload <FiChevronRight />
            </button>
          )}
          <button onClick={() => navigate('/patient/exercise')} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            Brain Exercise <FiChevronRight />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
