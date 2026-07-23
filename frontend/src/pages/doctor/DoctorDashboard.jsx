import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { searchPatients, getPatientDetail, getAllPatients, getDoctorStats } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import StatsCard from '../../components/StatsCard';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import {
  FiSearch, FiUsers, FiClipboard, FiActivity, FiImage, FiDownload,
  FiChevronRight, FiArrowLeft, FiChevronLeft, FiAlertCircle, FiRefreshCw
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total_patients: 0, assessments_today: 0, new_patients_week: 0 });

  // Pagination & sorting state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch stats on mount
  useEffect(() => {
    getDoctorStats()
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, []);

  // Search patients
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await searchPatients(searchQuery);
      setPatients(data.patients || []);
      if ((data.patients || []).length === 0) {
        setError('No patients found matching your search.');
      }
    } catch (err) {
      setError('Failed to search patients. Please try again.');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all patients (paginated)
  const fetchAllPatients = async (p = page, sb = sortBy, so = sortOrder) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAllPatients(p, 10, sb, so);
      setPatients(data.patients || []);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
      setPage(data.current_page || 1);
    } catch (err) {
      setError('Failed to load patients. Please try again.');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // When tab changes, fetch accordingly
  useEffect(() => {
    if (activeTab === 'all') {
      fetchAllPatients(1, sortBy, sortOrder);
    } else {
      setPatients([]);
      setError(null);
    }
  }, [activeTab]);

  // Handle sort change
  const handleSort = (column) => {
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newOrder);
    fetchAllPatients(1, column, newOrder);
  };

  // View patient detail
  const viewPatient = async (patient) => {
    setSelectedPatient(patient);
    setLoading(true);
    setError(null);
    try {
      const { data } = await getPatientDetail(patient.id);
      setPatientDetail(data);
    } catch (err) {
      setError('Failed to load patient details.');
      toast.error('Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  // Download report
  const handleDownload = async () => {
    toast.success('Report download will be available after backend integration');
  };

  // ===== PATIENT DETAIL VIEW =====
  if (selectedPatient && patientDetail) {
    const d = patientDetail;
    const probChartData = (probs, title) => {
      const cn = (probs?.cn_prob || 0) * 100;
      const mci = (probs?.mci_prob || 0) * 100;
      const ad = (probs?.ad_prob || 0) * 100;
      return {
        labels: ['CN', 'MCI', 'AD'],
        datasets: [{
          label: title,
          data: [cn, mci, ad],
          backgroundColor: ['rgba(34, 197, 94, 0.7)', 'rgba(234, 179, 8, 0.7)', 'rgba(239, 68, 68, 0.7)'],
          borderColor: ['#22c55e', '#eab308', '#ef4444'],
          borderWidth: 2,
          borderRadius: 6,
        }],
      };
    };

    return (
      <DashboardLayout>
        <div className="dashboard-content-wrapper">
          {/* Back Button */}
          <button onClick={() => { setSelectedPatient(null); setPatientDetail(null); setError(null); }}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-6 transition-colors cursor-pointer">
            <FiArrowLeft /> Back to {activeTab === 'all' ? 'All Patients' : 'Search'}
          </button>

          {/* Patient Header */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} 
            className="glass-card p-6 mb-6 bg-gradient-to-r from-blue-50/60 via-indigo-50/20 to-white/60 border border-white/80 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {selectedPatient.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold uppercase">{selectedPatient.gender}</span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-semibold">ID: {selectedPatient.id}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">{selectedPatient.name}</h2>
                  <p className="text-sm text-gray-500">{selectedPatient.email} • DOB: {selectedPatient.dob || 'N/A'}</p>
                </div>
              </div>
              <button onClick={handleDownload} className="btn-primary flex items-center gap-2 cursor-pointer">
                <FiDownload className="w-4 h-4" /> Download Clinical Report
              </button>
            </div>
          </motion.div>

          {/* MMSE Results */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
            className="glass-card p-6 mb-6 shadow-md border border-gray-100/50">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 text-sm">📋</span>
              MMSE Cognitive Score Details
            </h3>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100/30 p-5 rounded-2xl w-32 shadow-inner">
                <p className="text-5xl font-extrabold gradient-text">{d.mmse?.total || 0}</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Total Score</p>
                <p className="text-xs text-gray-400">/ 30 points</p>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
                {['Orientation', 'Registration', 'Attention', 'Recall', 'Language', 'Visuospatial'].map((s) => {
                  const key = s.toLowerCase();
                  const maxScores = { orientation: 5, registration: 3, attention: 5, recall: 3, language: 8, visuospatial: 1 };
                  return (
                    <div key={key} className="text-center p-3.5 rounded-2xl bg-white border border-gray-100 hover-lift shadow-sm">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{s}</p>
                      <p className="text-base font-extrabold text-gray-800">{(d.mmse?.[key] || 0)} <span className="text-gray-300 font-normal">/</span> {maxScores[key]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Clinical + MRI Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 shadow-md border border-gray-100/50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 text-sm">🧠</span>
                XGBoost Clinical Prediction
              </h3>
              <div className="text-center mb-5">
                <span className={`inline-block px-5 py-2 rounded-full font-extrabold text-sm shadow-sm ${
                  d.clinical?.prediction === 'CN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  d.clinical?.prediction === 'MCI' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>{d.clinical?.prediction === 'CN' ? 'Cognitively Normal (CN)' : d.clinical?.prediction === 'MCI' ? 'Mild Cognitive Impairment (MCI)' : d.clinical?.prediction === 'AD' ? "Alzheimer's Disease (AD)" : 'N/A'}</span>
              </div>
              <Bar data={probChartData(d.clinical, 'Clinical')} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 shadow-md border border-gray-100/50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 text-sm">📸</span>
                Deep Learning MRI Prediction
              </h3>
              <div className="text-center mb-5">
                <span className={`inline-block px-5 py-2 rounded-full font-extrabold text-sm shadow-sm ${
                  d.mri?.prediction === 'CN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  d.mri?.prediction === 'MCI' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>{d.mri?.prediction === 'CN' ? 'Cognitively Normal (CN)' : d.mri?.prediction === 'MCI' ? 'Mild Cognitive Impairment (MCI)' : d.mri?.prediction === 'AD' ? "Alzheimer's Disease (AD)" : 'N/A'}</span>
              </div>
              <Bar data={probChartData(d.mri, 'MRI')} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }} />
            </motion.div>
          </div>

          {/* SHAP Explanation */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 mb-6 shadow-md border border-gray-100/50">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 text-sm">📊</span>
              SHAP Feature Importance Analysis
            </h3>
            <p className="text-sm text-gray-400 mb-5">Which healthcare descriptors had the most influence on the clinical predictor output</p>
            <Bar data={{
              labels: d.shap?.features || [],
              datasets: [{
                label: 'Importance',
                data: (d.shap?.importance || []).map(v => v * 100),
                backgroundColor: 'rgba(59, 130, 246, 0.75)',
                borderColor: '#3b82f6',
                borderWidth: 2,
                borderRadius: 8,
              }],
            }} options={{
              indexAxis: 'y',
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { beginAtZero: true, ticks: { callback: (v) => v + '%' } } },
            }} />
          </motion.div>

          {/* Grad-CAM */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6 mb-6 shadow-md border border-gray-100/50">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600 text-sm">🔍</span>
              Grad-CAM Saliency Maps
            </h3>
            <p className="text-sm text-gray-400 mb-5">MRI structural regions highlighted by the deep convolutional networks</p>
            <div className="bg-slate-950 rounded-2xl p-8 flex items-center justify-center min-h-[220px] shadow-inner border border-slate-900">
              {d.mri?.gradcam_url ? (
                <img src={d.mri.gradcam_url} alt="Grad-CAM" className="max-h-64 rounded-lg shadow-2xl border border-white/10" />
              ) : (
                <div className="text-center text-slate-500">
                  <FiImage className="text-5xl mx-auto mb-3 text-slate-600 animate-pulse" />
                  <p className="text-sm font-semibold">No Grad-CAM Heatmap Available</p>
                  <p className="text-xs text-slate-600 mt-1">Run MRI test modules to compile heatmaps</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Final Prediction */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} 
            className="glass-card p-8 text-center bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 border border-white shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wider">Final Multimodal Fusion Decision</h3>
            <span className={`inline-block px-8 py-3.5 rounded-full text-xl font-extrabold shadow ${
              d.fusion?.prediction === 'CN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
              d.fusion?.prediction === 'MCI' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {d.fusion?.prediction === 'CN' ? 'Cognitively Normal' : d.fusion?.prediction === 'MCI' ? 'Mild Cognitive Impairment' : d.fusion?.prediction === 'AD' ? "Alzheimer's Disease" : 'N/A'}
            </span>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // ===== LOADING STATE =====
  if (loading && !patients.length && !error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div className="brain-loader" />
        </div>
      </DashboardLayout>
    );
  }

  // Sort indicator
  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-blue-500 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  // ===== MAIN VIEW =====
  return (
    <DashboardLayout>
      <div className="dashboard-content-wrapper relative z-10">
        {/* Welcome Header */}
        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden relative p-8 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white/70 border border-white/60 shadow-lg rounded-3xl"
          >
            <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs border border-blue-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                Clinician Platform Active
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              Welcome, <span className="gradient-text">Dr. {user?.name || 'Doctor'}</span>
            </h1>
            <p className="text-gray-500 mt-2.5 text-base max-w-2xl leading-relaxed">
              Access raw metrics, run SHAP feature importance analysis, view deep learning MRI segmentation Grad-CAM saliency heatmaps, and review patient MMSE details.
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <StatsCard icon={<FiUsers className="w-5 h-5" />} label="Total Patients" value={stats.total_patients} color="blue" delay={0} />
          <StatsCard icon={<FiClipboard className="w-5 h-5" />} label="Assessments Today" value={stats.assessments_today} color="green" delay={0.1} />
          <StatsCard icon={<FiActivity className="w-5 h-5" />} label="New This Week" value={stats.new_patients_week} color="orange" delay={0.2} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}>
            <FiSearch className="inline mr-2" />Search Patients
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}>
            <FiUsers className="inline mr-2" />All Patients {totalCount > 0 && activeTab === 'all' ? `(${totalCount})` : ''}
          </button>
        </div>

        {/* Search Bar (only in search tab) */}
        {activeTab === 'search' && (
          <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-6 mb-8 border border-white shadow-md rounded-3xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-11 rounded-2xl border border-gray-200 focus:border-blue-500 shadow-sm transition-all" placeholder="Search by name, email, or patient ID..." />
              </div>
              <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 rounded-2xl cursor-pointer">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSearch />}
                Search
              </button>
            </div>
          </motion.form>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card p-8 text-center mb-6 border border-orange-100">
            <FiAlertCircle className="text-4xl text-orange-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">{error}</p>
            <button onClick={() => activeTab === 'all' ? fetchAllPatients(page, sortBy, sortOrder) : handleSearch()}
              className="mt-4 btn-secondary flex items-center gap-2 mx-auto cursor-pointer">
              <FiRefreshCw /> Retry
            </button>
          </motion.div>
        )}

        {/* Patient Results */}
        <AnimatePresence>
          {patients.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {activeTab === 'all' && (
                <div className="glass-card overflow-hidden rounded-2xl border border-gray-100 shadow-md">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('id')}>
                      ID <SortIcon column="id" />
                    </div>
                    <div className="col-span-3 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('name')}>
                      Patient Name <SortIcon column="name" />
                    </div>
                    <div className="col-span-3 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('email')}>
                      Email <SortIcon column="email" />
                    </div>
                    <div className="col-span-2">Gender</div>
                    <div className="col-span-2 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('created_at')}>
                      Registered <SortIcon column="created_at" />
                    </div>
                    <div className="col-span-1 text-right">Action</div>
                  </div>
                  {/* Table Rows */}
                  {patients.map((patient, i) => (
                    <motion.div key={patient.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="grid grid-cols-12 gap-4 p-4 items-center border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                      onClick={() => viewPatient(patient)}>
                      <div className="col-span-1 text-sm text-gray-500 font-mono">#{patient.id}</div>
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                          {patient.name[0]}
                        </div>
                        <span className="font-semibold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{patient.name}</span>
                      </div>
                      <div className="col-span-3 text-sm text-gray-500 truncate">{patient.email}</div>
                      <div className="col-span-2">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-semibold">{patient.gender || '—'}</span>
                      </div>
                      <div className="col-span-2 text-xs text-gray-400">{patient.created_at ? new Date(patient.created_at).toLocaleDateString() : '—'}</div>
                      <div className="col-span-1 text-right">
                        <FiChevronRight className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all inline" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'search' && (
                <>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    Search Results ({patients.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {patients.map((patient, i) => (
                      <motion.div key={patient.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card p-5 group flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg hover:border-blue-200 border border-gray-100 rounded-2xl transition-all"
                        onClick={() => viewPatient(patient)}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform">
                            {patient.name[0]}
                          </div>
                          <div>
                            <p className="font-extrabold text-gray-800 group-hover:text-blue-600 transition-colors">{patient.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{patient.email} • {patient.gender} • ID: {patient.id}</p>
                          </div>
                        </div>
                        <FiChevronRight className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1.5 transition-all text-lg" />
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {/* Pagination (only for 'all' tab) */}
              {activeTab === 'all' && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-500">
                    Page {page} of {totalPages} ({totalCount} patients)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchAllPatients(page - 1, sortBy, sortOrder)}
                      disabled={page <= 1}
                      className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1">
                      <FiChevronLeft /> Prev
                    </button>
                    <button
                      onClick={() => fetchAllPatients(page + 1, sortBy, sortOrder)}
                      disabled={page >= totalPages}
                      className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1">
                      Next <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state for 'all' tab with no patients */}
        {activeTab === 'all' && patients.length === 0 && !loading && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card p-12 text-center border border-gray-100">
            <FiUsers className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-600 mb-2">No Patients Found</h3>
            <p className="text-gray-400 text-sm">No patients have registered yet.</p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
