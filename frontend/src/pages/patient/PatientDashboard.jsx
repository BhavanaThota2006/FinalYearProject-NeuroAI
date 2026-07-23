import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAssessmentHistory, getExerciseHistory } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import StatsCard from '../../components/StatsCard';
import {
  FiClipboard, FiActivity, FiImage, FiTarget, FiChevronRight,
  FiCheckCircle, FiAlertTriangle
} from 'react-icons/fi';
import { motion } from 'framer-motion';

/* ============================================
   PATIENT DASHBOARD
   ============================================ */
export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch patient data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assessRes, exRes] = await Promise.all([
          getAssessmentHistory(user.id),
          getExerciseHistory(user.id),
        ]);
        setData({ assessments: assessRes.data, exercises: exRes.data });
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  // Timeline steps
  const timeline = [
    { label: 'MMSE Assessment', icon: <FiClipboard />, status: data?.assessments?.mmse ? 'completed' : 'pending', path: '/patient/assessment' },
    { label: 'Clinical Assessment', icon: <FiActivity />, status: data?.assessments?.clinical ? 'completed' : 'pending', path: '/patient/clinical-assessment' },
    { label: 'Clinical Prediction', icon: <FiActivity />, status: data?.assessments?.clinical?.prediction ? 'completed' : 'pending', path: '/patient/clinical' },
    { label: 'MRI Upload', icon: <FiImage />, status: data?.assessments?.mri ? 'completed' : 'pending', path: '/patient/mri' },
    { label: 'Final Report', icon: <FiCheckCircle />, status: data?.assessments?.fusion ? 'completed' : 'pending', path: '/patient/report' },
    { label: 'Brain Exercise', icon: <FiTarget />, status: data?.exercises?.score ? 'completed' : 'pending', path: '/patient/exercise' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div className="brain-loader" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="deco-blob w-96 h-96 bg-blue-400/20 top-[10%] right-[5%] animate-float" />
        <div className="deco-blob w-80 h-80 bg-indigo-400/15 bottom-[15%] left-[10%] animate-float" style={{ animationDelay: '2s' }} />
        <div className="deco-blob w-64 h-64 bg-cyan-300/20 top-[60%] right-[30%] animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        {/* Welcome Header */}
        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden relative p-8 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white/70 border border-white/60 shadow-lg rounded-3xl"
          >
            <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                Active Health Portal
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, <span className="gradient-text">{user?.name || 'Patient'}</span>
            </h1>
            <p className="text-gray-500 mt-3 text-base max-w-2xl leading-relaxed">
              Your cognitive health timeline and AI prediction panel. Navigate through your assessments, upload MRI scans, and view personalized reports.
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard icon={<FiClipboard className="w-5 h-5" />} label="MMSE Score" value={data?.assessments?.mmse?.score ?? '—'} subtitle="/ 30" color="blue" delay={0} />
          <StatsCard icon={<FiActivity className="w-5 h-5" />} label="FAQ Score" value={data?.assessments?.clinical?.faq_score ?? '—'} subtitle="/ 15" color="purple" delay={0.1} />
          <StatsCard icon={<FiAlertTriangle className="w-5 h-5" />} label="Clinical Prediction" value={data?.assessments?.clinical?.prediction ?? '—'} color="orange" delay={0.2} />
          <StatsCard icon={<FiTarget className="w-5 h-5" />} label="Exercise Score" value={data?.exercises?.score ? `${data.exercises.score}%` : '—'} color="green" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm shadow">⚡</span>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Start Assessment', desc: 'MMSE Cognitive Test', icon: <FiClipboard />, path: '/patient/assessment', gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50' },
                  { label: 'Upload MRI', desc: 'Brain Scan Analysis', icon: <FiImage />, path: '/patient/mri', gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50/50 hover:bg-purple-50 border border-purple-100/50' },
                  { label: 'View Report', desc: 'Clinical Findings', icon: <FiCheckCircle />, path: '/patient/report', gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/50' },
                  { label: 'Brain Exercise', desc: 'Cognitive Rehab', icon: <FiTarget />, path: '/patient/exercise', gradient: 'from-orange-500 to-orange-600', bg: 'bg-orange-50/50 hover:bg-orange-50 border border-orange-100/50' },
                ].map((action) => (
                  <button key={action.path} onClick={() => navigate(action.path)}
                    className={`flex items-center gap-4 p-4 rounded-2xl ${action.bg} hover:shadow-md transition-all text-left group hover-lift cursor-pointer`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-gray-800 text-sm block group-hover:text-blue-600 transition-colors">{action.label}</span>
                      <span className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors">{action.desc}</span>
                    </div>
                    <FiChevronRight className="text-gray-300 group-hover:translate-x-1 group-hover:text-blue-500 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Prediction Summary */}
            {data?.assessments?.fusion && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 shadow-md border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm shadow">📊</span>
                  Prediction Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { title: 'Clinical', pred: data.assessments.clinical.prediction },
                    { title: 'MRI', pred: data.assessments.mri?.prediction },
                    { title: 'Fusion', pred: data.assessments.fusion.prediction },
                  ].map((item) => {
                    const chipClass = item.pred === 'CN' ? 'chip-green' : item.pred === 'MCI' ? 'chip-yellow' : 'chip-red';
                    return (
                      <div key={item.title} className="text-center p-5 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 hover-lift">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">{item.title}</p>
                        <div className={`chip ${chipClass} text-base font-extrabold px-5 py-1.5 shadow-sm`}>
                          {item.pred || '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Probability bars */}
                <div className="mt-6 space-y-4">
                  {[
                    { label: 'Normal (CN)', value: data.assessments.fusion.cn_prob, color: 'bg-emerald-500' },
                    { label: 'MCI', value: data.assessments.fusion.mci_prob, color: 'bg-amber-500' },
                    { label: 'AD', value: data.assessments.fusion.ad_prob, color: 'bg-red-500' },
                  ].map((bar) => (
                    <div key={bar.label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-semibold text-gray-600">{bar.label}</span>
                        <span className="text-xs font-bold text-gray-900">{(bar.value * 100).toFixed(1)}%</span>
                      </div>
                      <div className="prediction-bar">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${bar.value * 100}%` }}
                          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                          className={`prediction-bar-fill ${bar.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6 shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-sm shadow">📋</span>
              Assessment Timeline
            </h3>
            <div className="relative pl-1">
              <div className="timeline-line" />
              <div className="space-y-6">
                {timeline.map((step, i) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="flex items-start gap-4 cursor-pointer group"
                    onClick={() => navigate(step.path)}
                  >
                    <div className={`timeline-dot transition-all group-hover:scale-110 ${
                      step.status === 'completed'
                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-100'
                        : 'bg-white text-gray-400 border-2 border-gray-200 group-hover:border-blue-500 group-hover:text-blue-500'
                    }`}>
                      {step.status === 'completed' ? <FiCheckCircle className="w-4 h-4" /> : step.icon}
                    </div>
                    <div className="flex-1 pt-1.5">
                      <p className={`font-bold text-sm transition-colors ${step.status === 'completed' ? 'text-gray-800 group-hover:text-emerald-700' : 'text-gray-500 group-hover:text-blue-600'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {step.status === 'completed' ? (
                          <span className="text-emerald-600 font-semibold">✓ Completed</span>
                        ) : (
                          'Scheduled / Pending'
                        )}
                      </p>
                    </div>
                    <FiChevronRight className="mt-3 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
