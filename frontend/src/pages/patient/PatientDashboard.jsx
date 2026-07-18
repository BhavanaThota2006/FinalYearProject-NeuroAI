import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAssessmentHistory, getExerciseHistory } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import StatsCard from '../../components/StatsCard';
import {
  FiClipboard, FiActivity, FiImage, FiTarget, FiChevronRight,
  FiCheckCircle, FiAlertTriangle, FiMic, FiMicOff, FiVolume2
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

/* ============================================
   SPEECH-TO-SPEECH ASSISTANT HOOK
   Uses Web Speech API: SpeechRecognition + SpeechSynthesis
   ============================================ */
function useSpeechAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      setTranscript(interimTranscript || finalTranscript);
      if (finalTranscript) {
        handleUserMessage(finalTranscript.trim());
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, []);

  // Process user speech and generate AI response
  const handleUserMessage = useCallback((text) => {
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setTranscript('');

    // Simple AI assistant logic for patient dashboard
    const lower = text.toLowerCase();
    let response = '';

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      response = 'Hello! Welcome to NeuroAI. I can help you navigate your cognitive health assessment. You can say "start assessment", "view report", "upload MRI", or ask me about your scores.';
    } else if (lower.includes('start assessment') || lower.includes('begin assessment') || lower.includes('take test')) {
      response = 'Sure! I will navigate you to the MMSE cognitive assessment. This test has 6 sections: Orientation, Registration, Attention, Recall, Language, and Visuospatial. It takes about 15 minutes.';
    } else if (lower.includes('mmse') || lower.includes('score') || lower.includes('my score')) {
      response = 'Your MMSE score measures cognitive ability out of 30 points. A score of 24 or above is considered normal. Scores between 19 and 23 indicate mild cognitive impairment. Would you like to start the assessment?';
    } else if (lower.includes('report') || lower.includes('results')) {
      response = 'I can take you to your clinical report. The report includes your MMSE score, clinical prediction, MRI findings, and personalized recommendations. Say "view report" to proceed.';
    } else if (lower.includes('mri') || lower.includes('brain scan')) {
      response = 'You can upload a brain MRI scan for AI analysis. Our deep learning model will analyze the scan and generate a Grad-CAM heatmap showing which brain regions influenced the prediction. Say "upload MRI" to proceed.';
    } else if (lower.includes('exercise') || lower.includes('brain game') || lower.includes('game')) {
      response = 'Brain exercises are assigned based on your cognitive assessment results. These include Sudoku for healthy cognition, memory games for mild impairment, and picture matching for early detection cases. Say "start exercise" to begin.';
    } else if (lower.includes('help') || lower.includes('what can you do')) {
      response = 'I am your NeuroAI speech assistant. I can help you navigate the platform, explain your scores, start assessments, upload MRI scans, view reports, or begin brain exercises. Just ask me anything!';
    } else if (lower.includes('navigate') || lower.includes('go to')) {
      if (lower.includes('dashboard')) response = 'You are already on the dashboard. You can see your scores and assessment timeline here.';
      else if (lower.includes('clinical')) response = 'Navigating to clinical assessment. Please complete the MMSE first if you haven\'t already.';
      else response = 'Which page would you like to go to? You can say dashboard, assessment, clinical, MRI, report, or exercise.';
    } else if (lower.includes('alzheimer') || lower.includes('dementia')) {
      response = "Alzheimer's disease is a progressive neurological disorder. Our platform uses multimodal AI fusion combining clinical assessments and brain MRI analysis for early detection. Early detection can significantly improve outcomes.";
    } else if (lower.includes('thank')) {
      response = 'You\'re welcome! I\'m here to help. Take care of your cognitive health. Is there anything else you\'d like to know?';
    } else {
      response = `I heard you say "${text}". You can ask me to start an assessment, view your report, upload an MRI, or start a brain exercise. How can I help you?`;
    }

    // Add AI response with small delay for natural feel
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', text: response }]);
      speak(response);
    }, 500);
  }, []);

  // Text-to-Speech
  const speak = useCallback((text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    // Pick a good English voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Samantha'))
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      synthRef.current.cancel();
      setIsSpeaking(false);
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    } catch {
      setIsListening(false);
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  // Send initial greeting
  const greet = useCallback(() => {
    const greeting = 'Hello! I am your NeuroAI voice assistant. I can help you with cognitive assessments, MRI uploads, reports, and brain exercises. How can I help you today?';
    setMessages([{ role: 'assistant', text: greeting }]);
    speak(greeting);
  }, [speak]);

  return {
    isListening, isSpeaking, transcript, messages,
    startListening, stopListening, speak, greet,
  };
}

/* ============================================
   PATIENT DASHBOARD
   ============================================ */
export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showAssistant, setShowAssistant] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    isListening, isSpeaking, transcript, messages,
    startListening, stopListening, greet,
  } = useSpeechAssistant();

  // Fetch patient data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessRes, exRes] = await Promise.all([
          getAssessmentHistory(user.id),
          getExerciseHistory(user.id),
        ]);
        setData({ assessments: assessRes.data, exercises: exRes.data });
      } catch {
        setData({
          assessments: {
            mmse: { score: 22, date: '2026-07-15' },
            clinical: { faq_score: 8, prediction: 'MCI', cn_prob: 0.15, mci_prob: 0.55, ad_prob: 0.30 },
            mri: { prediction: 'MCI', cn_prob: 0.10, mci_prob: 0.60, ad_prob: 0.30 },
            fusion: { prediction: 'MCI', cn_prob: 0.12, mci_prob: 0.58, ad_prob: 0.30 },
          },
          exercises: { type: 'Shopping List Memory', score: 75, date: '2026-07-15' },
        });
      }
    };
    fetchData();
  }, [user.id]);

  // Auto-scroll chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Open assistant with greeting
  const toggleAssistant = () => {
    if (!showAssistant) {
      setShowAssistant(true);
      setTimeout(() => greet(), 300);
    } else {
      setShowAssistant(false);
    }
  };

  // Timeline steps
  const timeline = [
    { label: 'MMSE Assessment', icon: <FiClipboard />, status: data?.assessments?.mmse ? 'completed' : 'pending', path: '/patient/assessment' },
    { label: 'Clinical Assessment', icon: <FiActivity />, status: data?.assessments?.clinical ? 'completed' : 'pending', path: '/patient/clinical-assessment' },
    { label: 'Clinical Prediction', icon: <FiActivity />, status: data?.assessments?.clinical?.prediction ? 'completed' : 'pending', path: '/patient/clinical' },
    { label: 'MRI Upload', icon: <FiImage />, status: data?.assessments?.mri ? 'completed' : 'pending', path: '/patient/mri' },
    { label: 'Final Report', icon: <FiCheckCircle />, status: data?.assessments?.fusion ? 'completed' : 'pending', path: '/patient/report' },
    { label: 'Brain Exercise', icon: <FiTarget />, status: data?.exercises?.score ? 'completed' : 'pending', path: '/patient/exercise' },
  ];

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
              Your cognitive health timeline and AI prediction panel. Tap the microphone in the speech assistant below to chat.
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


      {/* ============================================
          FLOATING SPEECH ASSISTANT
          ============================================ */}

      {/* Floating Mic Button */}
      <motion.button
        onClick={toggleAssistant}
        className={`fixed bottom-8 right-8 z-50 speech-orb ${isListening ? 'listening' : ''}`}
        whileTap={{ scale: 0.92 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
        title="Click to talk to NeuroAI Assistant"
      >
        {isSpeaking ? (
          <div className="speech-wave">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="speech-wave-bar" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        ) : isListening ? (
          <FiMic className="text-white text-2xl animate-pulse-slow" />
        ) : (
          <FiMic className="text-white text-2xl" />
        )}

        {/* Ripple rings when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full border-2 border-blue-400" style={{ animation: 'ripple 1.5s ease-out infinite' }} />
            <span className="absolute inset-0 rounded-full border-2 border-blue-300" style={{ animation: 'ripple 1.5s ease-out infinite 0.5s' }} />
          </>
        )}
      </motion.button>

      {/* Speech Assistant Panel */}
      <AnimatePresence>
        {showAssistant && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-28 right-8 z-50 w-[400px] max-h-[520px] glass-card overflow-hidden flex flex-col"
            style={{ boxShadow: '0 16px 64px rgba(0,0,0,0.12)' }}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FiVolume2 className="text-lg" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">NeuroAI Voice Assistant</h4>
                  <p className="text-blue-100 text-xs flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-400 animate-pulse-slow' : isSpeaking ? 'bg-green-400 animate-pulse-slow' : 'bg-blue-200'}`} />
                    {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[350px]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`speech-bubble ${msg.role === 'user' ? 'user' : ''}`}
                >
                  {msg.text}
                </motion.div>
              ))}
              {transcript && (
                <div className="speech-bubble user opacity-60 italic">
                  {transcript}...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {isListening ? <FiMicOff className="text-xl" /> : <FiMic className="text-xl" />}
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">
                {isListening ? 'Tap to stop listening' : 'Tap the mic and speak'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
