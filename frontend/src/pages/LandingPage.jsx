import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, FiArrowRight, FiClipboard, FiImage, FiActivity, 
  FiShield, FiTrendingUp, FiCpu, FiExternalLink, FiMenu, FiX, FiCheck,
  FiChevronRight
} from 'react-icons/fi';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const stats = [
    { label: 'Dataset Size', value: '1,200+' },
    { label: 'MRI Accuracy', value: '98.4%' },
    { label: 'MMSE Precision', value: '97.1%' },
    { label: 'Fusion Accuracy', value: '99.1%' }
  ];

  const features = [
    {
      title: 'Cognitive Evaluation (MMSE)',
      desc: 'Automated 30-point evaluation engine covering orientation, memory, attention, language, and visuospatial functions.',
      icon: <FiClipboard className="w-6 h-6 text-blue-500" />,
      color: 'blue'
    },
    {
      title: 'Clinical Assessment',
      desc: 'Synthesizes functional status indices, educational attainment, age groups, and gender indicators via FAQ scores.',
      icon: <FiActivity className="w-6 h-6 text-purple-500" />,
      color: 'purple'
    },
    {
      title: 'Deep Learning MRI Scans',
      desc: 'High-performance ResNet backbone analyzes structural Brain T1-weighted MRI sequences to classify atrophy regions.',
      icon: <FiImage className="w-6 h-6 text-cyan-500" />,
      color: 'cyan'
    },
    {
      title: 'Multimodal Fusion Model',
      desc: 'Decision-level fusion strategy aggregating clinical classifications and deep MRI probabilities via weighted soft voting.',
      icon: <FiCpu className="w-6 h-6 text-indigo-500" />,
      color: 'indigo'
    },
    {
      title: 'Explainable AI Analytics',
      desc: 'Visualizes biomarkers via SHAP force charts for clinical features and Grad-CAM saliency heatmaps for structural MRI scans.',
      icon: <FiShield className="w-6 h-6 text-emerald-500" />,
      color: 'emerald'
    },
    {
      title: 'Cognitive Rehabilitation',
      desc: 'Provides adaptive brain exercises (Sudoku, Memory games, Matching matches) mapped to the diagnosed stage.',
      icon: <FiTrendingUp className="w-6 h-6 text-orange-500" />,
      color: 'orange'
    }
  ];

  const steps = [
    {
      title: 'User Onboarding',
      desc: 'Patients register and create secure accounts linked to their cognitive health profile, while doctor authorization keys secure practitioner access.',
      badge: 'Step 1'
    },
    {
      title: 'Digital MMSE Screening',
      desc: 'Patients take a customized verbal cognitive assessment, verifying spatial and language retention directly inside the browser.',
      badge: 'Step 2'
    },
    {
      title: 'Clinical FAQ Profile',
      desc: 'Key clinical demographics, logic, and functional activities questionnaires (FAQ) are recorded to establish baseline data.',
      badge: 'Step 3'
    },
    {
      title: 'MRI Neuroimaging Upload',
      desc: 'High-resolution sagittal/axial MRI scans (T1-weighted) are safely uploaded to undergo preprocessing and convolutional classification.',
      badge: 'Step 4'
    },
    {
      title: 'Dual-Engine ML Prediction',
      desc: 'Parallel models evaluate structural patterns and clinical coefficients to form independent risk percentages.',
      badge: 'Step 5'
    },
    {
      title: 'Soft-Voting Decision Fusion',
      desc: 'Decision matrices combine outputs via an optimal Fusion Algorithm to determine final prediction risk (CN, MCI, AD).',
      badge: 'Step 6'
    },
    {
      title: 'Cognitive Rehabilitation',
      desc: 'Clinicians review SHAP + Grad-CAM heatmaps, download PDF records, and patients receive recommended cognitive game therapies.',
      badge: 'Step 7'
    }
  ];

  const technologies = [
    { name: 'React 19', category: 'Frontend', desc: 'Fast, atomic components with state management.' },
    { name: 'Tailwind CSS', category: 'Styling', desc: 'Custom glassmorphic stylesheets & utility layouts.' },
    { name: 'Flask', category: 'Backend Server', desc: 'Modular microservice pipeline supporting route APIs.' },
    { name: 'PyTorch', category: 'Deep Learning', desc: 'Powers MRI ResNet convolutional classification.' },
    { name: 'XGBoost', category: 'Machine Learning', desc: 'High-speed clinical assessment prediction.' },
    { name: 'SHAP & Grad-CAM', category: 'Explainable AI', desc: 'Generates transparent feature maps and heatmaps.' },
    { name: 'MySQL', category: 'Database', desc: 'Secure storage of user profiles and historical findings.' }
  ];

  const benefits = {
    patients: [
      'Early identification of cognitive decline anomalies.',
      'Enjoyable, adaptive cognitive rehabilitation treatments.',
      'Secure, patient-owned longitudinal progress logs.'
    ],
    doctors: [
      'Fast, automated multimodal screening pipeline.',
      'Explainable predictions to aid diagnostic confidence.',
      'Clean patient registry with advanced sort filters.'
    ]
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 overflow-x-hidden font-sans relative">
      {/* Glow overlays */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[1200px] right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[800px] left-10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FiHeart className="text-white text-lg" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block">AetherMind AI</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block -mt-1">Alzheimer's Platform</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <button onClick={() => scrollToSection('about')} className="text-slate-400 hover:text-white font-medium text-sm transition-colors cursor-pointer">About</button>
            <button onClick={() => scrollToSection('features')} className="text-slate-400 hover:text-white font-medium text-sm transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('workflow')} className="text-slate-400 hover:text-white font-medium text-sm transition-colors cursor-pointer">Workflow</button>
            <button onClick={() => scrollToSection('technologies')} className="text-slate-400 hover:text-white font-medium text-sm transition-colors cursor-pointer">Tech Stack</button>
            <button onClick={() => scrollToSection('benefits')} className="text-slate-400 hover:text-white font-medium text-sm transition-colors cursor-pointer">Benefits</button>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="px-5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all cursor-pointer">
              Sign In
            </button>
            <button onClick={() => navigate('/register')} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/20 hover:scale-102 transition-all cursor-pointer">
              Register
            </button>
          </div>

          {/* Mobile menu button */}
          <button className="lg:hidden p-2 text-slate-400 hover:text-white cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="lg:hidden border-b border-white/5 bg-slate-950/95 absolute w-full left-0 p-6 flex flex-col gap-4 shadow-xl">
            <button onClick={() => scrollToSection('about')} className="text-left py-2 text-slate-400 hover:text-white font-semibold cursor-pointer">About</button>
            <button onClick={() => scrollToSection('features')} className="text-left py-2 text-slate-400 hover:text-white font-semibold cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('workflow')} className="text-left py-2 text-slate-400 hover:text-white font-semibold cursor-pointer">Workflow</button>
            <button onClick={() => scrollToSection('technologies')} className="text-left py-2 text-slate-400 hover:text-white font-semibold cursor-pointer">Tech Stack</button>
            <button onClick={() => scrollToSection('benefits')} className="text-left py-2 text-slate-400 hover:text-white font-semibold cursor-pointer">Benefits</button>
            <hr className="border-white/5 my-2" />
            <div className="flex gap-4">
              <button onClick={() => navigate('/login')} className="flex-1 py-2.5 text-center text-slate-300 hover:text-white border border-white/10 rounded-xl font-semibold cursor-pointer">Sign In</button>
              <button onClick={() => navigate('/register')} className="flex-1 py-2.5 text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold cursor-pointer">Register</button>
            </div>
          </motion.div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs border border-blue-400/20">
              ⚡ Final Year Project Presentational Interface
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Explainable Multimodal Fusion for Early <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">Alzheimer's Prediction</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
              Consolidating Brain MRI scans, Mini-Mental State Examination scores, and Clinical Assessments through weighted fusion networks to identify early stage deterioration. Supporting explainable Grad-CAM regions and SHAP coefficients for clinical transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={() => navigate('/register')} className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-blue-500/25 hover:scale-102 flex items-center justify-center gap-2 transition-all cursor-pointer">
                Get Started <FiArrowRight />
              </button>
              <button onClick={() => scrollToSection('workflow')} className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
                Explore Workflow
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-white/5">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image/Visual Area */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="glass-card p-6 bg-slate-950/40 border border-white/10 rounded-3xl relative overflow-hidden backdrop-blur-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
              
              {/* Brain Scanner Visual Mock */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Analysis Engine</span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-mono">v1.2.0-secure</span>
                </div>
                
                {/* Structural brain outline representational box */}
                <div className="aspect-[4/3] rounded-2xl bg-slate-900 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                  <div className="absolute inset-0 flex items-center justify-center opacity-60">
                    <div className="border border-blue-500/20 w-48 h-48 rounded-full animate-ping" />
                    <div className="border border-indigo-500/20 w-32 h-32 rounded-full animate-pulse" />
                    <FiImage className="text-blue-500/40 text-7xl" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-sm border border-white/5 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">MRI Deep learning Model</p>
                      <p className="text-[10px] text-slate-400">Classifying Sagittal Atrophies</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">98.4% Prob</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs bg-slate-900/50 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <FiShield className="text-emerald-500" />
                    <span className="text-slate-300 font-medium">Explainable XAI Active</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">SHAP & Grad-CAM</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT PROJECT */}
      <section id="about" className="py-24 px-6 border-t border-white/5 bg-slate-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-xs text-blue-400 uppercase tracking-widest font-extrabold">Project Abstract</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Why Multimodal Decision Fusion?</h3>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Clinical diagnostic pipelines for Alzheimer's Disease often treat cognitive questionnaires, clinical demographics, and MRI neuroimaging indexes separately. AetherMind AI implements a decision-level soft voting fusion system that links these signals, boosting classification safety and providing explainable diagnostic rationale to clinicians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 bg-slate-950/30 border border-white/5 hover:border-white/10 rounded-2xl hover-lift">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5 text-blue-400">
                <FiClipboard className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-white mb-2">Cognitive Deficits Assessment</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Runs conversational, responsive MMSE cognitive assessments. Automatically checks syntax rules and processes answers to evaluate language, memory, and orientation scales.</p>
            </div>
            
            <div className="glass-card p-6 bg-slate-950/30 border border-white/5 hover:border-white/10 rounded-2xl hover-lift">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5 text-purple-400">
                <FiActivity className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-white mb-2">Clinical Parameters Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Combines demographic attributes (Age, Gender, Education) and FAQ functional indicators utilizing high-performance gradient booster algorithms.</p>
            </div>

            <div className="glass-card p-6 bg-slate-950/30 border border-white/5 hover:border-white/10 rounded-2xl hover-lift">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5 text-cyan-400">
                <FiImage className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-white mb-2">MRI Deep learning Scanner</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Applies deep neuroimaging backbones to extract spatial patterns. Processes coronal and sagittal MRI voxel data to output model confidence intervals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs text-blue-400 uppercase tracking-widest font-extrabold">System Features</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Full-Suite Automated Diagnosis</h3>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              We present a highly cohesive architecture, tracking cognitive declines from primary clinical contact to explainable predictions and cognitive rehabilitation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-6 border border-white/5 hover:border-white/10 hover:shadow-lg transition-all rounded-3xl group hover-lift">
                <div className="mb-5">{f.icon}</div>
                <h4 className="font-bold text-md text-white group-hover:text-blue-400 transition-colors mb-2">{f.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7-STAGE PIPELINE & FLOWCHART */}
      <section id="workflow" className="py-24 px-6 border-t border-white/5 bg-slate-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <h2 className="text-xs text-blue-400 uppercase tracking-widest font-extrabold">Step-By-Step Workflow</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">The 7-Stage Predictive Pipeline</h3>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Understand how patient datasets transition from preliminary onboarding stages to decision fusion outputs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Steps Navigation list */}
            <div className="lg:col-span-5 space-y-3">
              {steps.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    activeStep === idx 
                      ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500 text-white font-bold shadow-md shadow-blue-500/5'
                      : 'bg-transparent border-white/5 hover:border-white/10 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-semibold">{s.badge} • {s.title}</span>
                  <FiChevronRight className={`transition-transform ${activeStep === idx ? 'translate-x-1 text-blue-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>

            {/* Step Detail Card */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card p-8 bg-slate-950/40 border border-white/10 rounded-3xl h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wide bg-blue-500/10 px-3 py-1 rounded-full">{steps[activeStep].badge}</span>
                    <h3 className="text-2xl font-bold text-white">{steps[activeStep].title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{steps[activeStep].desc}</p>
                  </div>
                  
                  {/* Pipeline Flowchart Component */}
                  <div className="mt-8 border-t border-white/5 pt-6">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Model Flowchart</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-900/60 p-4 rounded-xl border border-white/5 font-mono">
                      <span className="text-blue-400 font-bold">Input Assets</span>
                      <span className="text-slate-600">→</span>
                      <span className="text-purple-400 font-bold">ResNet/XGBoost</span>
                      <span className="text-slate-600">→</span>
                      <span className="text-indigo-400 font-bold">Fusion Engine</span>
                      <span className="text-slate-600">→</span>
                      <span className="text-emerald-400 font-bold">Explainable Report</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGIES USED */}
      <section id="technologies" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs text-blue-400 uppercase tracking-widest font-extrabold">System Architecture</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Project Technology Stack</h3>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Built on production-ready modern stacks across database models, neural architectures, and custom interface frames.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {technologies.map((t, idx) => (
              <div key={idx} className="glass-card p-5 bg-gradient-to-br from-slate-950/20 to-slate-950/40 border border-white/5 rounded-2xl">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded-full">{t.category}</span>
                <h4 className="font-bold text-white text-md mt-3">{t.name}</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLE-BASED BENEFITS */}
      <section id="benefits" className="py-24 px-6 border-t border-white/5 bg-slate-950/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs text-blue-400 uppercase tracking-widest font-extrabold">Value Proposition</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Benefits to Stakeholders</h3>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Designed explicitly to support clinical decision workflows as well as patient therapy goals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Patients Box */}
            <div className="glass-card p-8 border border-white/5 bg-slate-950/30 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">🤝</span>
                For Patients
              </h3>
              <div className="space-y-4">
                {benefits.patients.map((b, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <FiCheck className="text-emerald-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-300 leading-relaxed">{b}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctors Box */}
            <div className="glass-card p-8 border border-white/5 bg-slate-950/30 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">🩺</span>
                For Clinicians & Researchers
              </h3>
              <div className="space-y-4">
                {benefits.doctors.map((b, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <FiCheck className="text-blue-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-300 leading-relaxed">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-slate-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <FiHeart className="text-white text-sm" />
            </div>
            <span className="font-extrabold text-md text-white">AetherMind AI</span>
          </div>

          <p className="text-xs text-slate-500 text-center md:text-right leading-relaxed">
            © 2026 AetherMind AI Platform. B.Tech Computer Science & Engineering Final Year Project.<br />
            Explainable Multimodal Fusion for Early Alzheimer's Disease Prediction Using Brain MRI and Clinical Assessments.
          </p>
        </div>
      </footer>
    </div>
  );
}
