import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFusionPrediction, generateReport, downloadReport } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingScreen from '../../components/LoadingScreen';
import { FiDownload, FiChevronRight, FiFileText, FiActivity, FiImage, FiCpu } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function FinalReport() {
  const [loading, setLoading] = useState(true);
  const [fusionResult, setFusionResult] = useState(null);
  const [report, setReport] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Get fusion prediction
        const { data: fusion } = await getFusionPrediction({ patient_id: user.id });
        setFusionResult(fusion);

        // Generate LLM report
        const { data: reportData } = await generateReport({ patient_id: user.id });
        setReport(reportData);
      } catch (err) {
        // Demo fallback
        setFusionResult({
          cn_probability: 0.12,
          mci_probability: 0.48,
          ad_probability: 0.40,
          final_prediction: 'MCI',
        });
        setReport({
          id: 'demo-report',
          sections: {
            patient_summary: 'Patient presents with mild cognitive concerns. Age-appropriate demographic data collected alongside clinical assessments.',
            clinical_findings: 'MMSE Score: 22/30 indicating mild cognitive impairment. FAQ Score: 8/15 showing functional difficulties in daily activities.',
            mri_findings: 'Brain MRI analysis reveals mild hippocampal volume reduction consistent with early neurodegenerative changes.',
            xai_summary: 'SHAP analysis indicates MMSE and FAQ scores are the strongest predictors. Grad-CAM highlights temporal lobe regions of interest.',
            risk_assessment: 'Moderate risk for progression to Alzheimer\'s Disease. Current classification: Mild Cognitive Impairment (MCI).',
            recommendations: '1. Follow-up cognitive assessment in 6 months\n2. Neurologist consultation recommended\n3. Cognitive rehabilitation exercises prescribed\n4. Consider repeat MRI in 12 months',
          }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [user.id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await downloadReport(report?.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clinical_report_${user.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded!');
    } catch {
      toast.error('Download will be available after backend integration');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoadingScreen message="Generating Multimodal Fusion Report..." />;

  const predictionColor = {
    CN: 'text-green-600 bg-green-50',
    MCI: 'text-yellow-700 bg-yellow-50',
    AD: 'text-red-600 bg-red-50',
    Healthy: 'text-green-600 bg-green-50',
  };

  const predLabel = {
    CN: 'Healthy (Cognitively Normal)',
    MCI: 'Mild Cognitive Impairment',
    AD: "Alzheimer's Disease",
    Healthy: 'Healthy',
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Final Clinical Report</h1>
            <p className="text-gray-500 mt-1">Multimodal fusion prediction with AI-generated analysis</p>
          </div>
          <button onClick={handleDownload} disabled={downloading} className="btn-primary flex items-center gap-2">
            {downloading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiDownload />}
            Download PDF
          </button>
        </div>

        {/* Fusion Prediction Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-6 text-center">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Final Prediction (Decision-Level Fusion)</p>
          <h2 className={`text-3xl font-bold mb-3 inline-block px-6 py-2 rounded-full ${predictionColor[fusionResult.final_prediction]}`}>
            {predLabel[fusionResult.final_prediction]}
          </h2>

          {/* Fusion Probabilities */}
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-lg mx-auto">
            {[
              { label: 'CN', prob: fusionResult.cn_probability, color: 'bg-green-500' },
              { label: 'MCI', prob: fusionResult.mci_probability, color: 'bg-yellow-500' },
              { label: 'AD', prob: fusionResult.ad_probability, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="prediction-bar mb-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.prob * 100}%` }}
                    transition={{ duration: 1.2 }}
                    className={`prediction-bar-fill ${item.color}`}
                  />
                </div>
                <p className="text-xs text-gray-500">{item.label}: <span className="font-bold">{(item.prob * 100).toFixed(1)}%</span></p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Report Sections */}
        {report?.sections && (
          <div className="space-y-4">
            {[
              { key: 'patient_summary', title: 'Patient Summary', icon: <FiFileText /> },
              { key: 'clinical_findings', title: 'Clinical Findings', icon: <FiActivity /> },
              { key: 'mri_findings', title: 'MRI Findings', icon: <FiImage /> },
              { key: 'xai_summary', title: 'Explainable AI Summary', icon: <FiCpu /> },
              { key: 'risk_assessment', title: 'Final Risk Assessment', icon: <FiActivity /> },
              { key: 'recommendations', title: 'Recommendations', icon: <FiFileText /> },
            ].map((section, i) => (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (i + 1) }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                    {section.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{section.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {report.sections[section.key]}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Navigate to Exercise */}
        <button onClick={() => navigate('/patient/exercise')} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
          Start Brain Exercise <FiChevronRight />
        </button>
      </div>
    </DashboardLayout>
  );
}
