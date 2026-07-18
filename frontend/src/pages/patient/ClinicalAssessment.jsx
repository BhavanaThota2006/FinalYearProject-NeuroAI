import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submitClinical, getAssessmentHistory, getClinicalPrediction } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import { FiChevronRight, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// FAQ Questions with 4-point scale
const FAQ_QUESTIONS = [
  { id: 'q1', question: 'Can you prepare meals independently?' },
  { id: 'q2', question: 'Can you remember appointments?' },
  { id: 'q3', question: 'Can you manage daily expenses?' },
  { id: 'q4', question: 'Can you take medicines on time?' },
  { id: 'q5', question: 'Can you travel to familiar places alone?' },
];

const FAQ_OPTIONS = [
  { value: 0, label: 'No Difficulty', color: 'bg-green-50 border-green-300 text-green-700' },
  { value: 1, label: 'Some Difficulty', color: 'bg-yellow-50 border-yellow-300 text-yellow-700' },
  { value: 2, label: 'Needs Help', color: 'bg-orange-50 border-orange-300 text-orange-700' },
  { value: 3, label: 'Cannot Perform', color: 'bg-red-50 border-red-300 text-red-700' },
];

export default function ClinicalAssessment() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [education, setEducation] = useState('');
  const [faqAnswers, setFaqAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [mmseScore, setMmseScore] = useState(null);
  const [loadingMmse, setLoadingMmse] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const faqScore = Object.values(faqAnswers).reduce((sum, v) => sum + v, 0);
  const allAnswered = FAQ_QUESTIONS.every((q) => faqAnswers[q.id] !== undefined);

  useEffect(() => {
    const checkMmseScore = async () => {
      try {
        const { data } = await getAssessmentHistory(user.id);
        if (data && data.mmse) {
          setMmseScore(data.mmse.score);
        } else {
          toast.error('Stage 1 (MMSE Assessment) must be completed first.');
        }
      } catch (err) {
        console.error('Failed to fetch assessment history:', err);
      } finally {
        setLoadingMmse(false);
      }
    };
    if (user?.id) {
      checkMmseScore();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mmseScore === null) {
      toast.error('Please complete Stage 1 (MMSE Assessment) first');
      return;
    }
    if (!allAnswered) {
      toast.error('Please answer all FAQ questions');
      return;
    }
    setLoading(true);
    try {
      // 1. Submit clinical assessment details (demographics + FAQ)
      await submitClinical({
        patient_id: user.id,
        age: parseInt(age),
        gender,
        education: parseInt(education),
        faq_score: faqScore,
      });

      // 2. Automatically request prediction with MMSE & FAQ scores
      await getClinicalPrediction({
        patient_id: user.id,
        age: parseInt(age),
        gender,
        education: parseInt(education),
        mmse: mmseScore,
        faq: faqScore,
      });

      toast.success('Clinical Assessment submitted! Prediction computed.');
      navigate('/patient/clinical');
    } catch (err) {
      toast.error('Failed to submit assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Stage 2: Clinical Assessment</h1>
          <p className="text-gray-500 mt-1">Collect demographic data and functional assessment</p>
        </div>

        {/* MMSE Assessment Load Status Card */}
        {loadingMmse ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-blue-700 text-sm">
            Verifying cognitive assessment scores...
          </div>
        ) : mmseScore !== null ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-800">Stage 1: Cognitive Assessment Completed</h4>
              <p className="text-xs text-green-600">Your MMSE score has been automatically loaded.</p>
            </div>
            <div className="bg-green-500 text-white font-bold px-3 py-1.5 rounded-lg text-sm">
              MMSE: {mmseScore} / 30
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-red-800">Stage 1: Cognitive Assessment Incomplete</h4>
              <p className="text-xs text-red-600">You must complete the cognitive assessment before proceeding.</p>
            </div>
            <button type="button" onClick={() => navigate('/patient/assessment')} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition">
              Start Stage 1
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Demographics Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Patient Demographics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Age</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                  className="form-input" placeholder="e.g., 65" min="18" max="120" required />
              </div>
              <div>
                <label className="form-label">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="form-input">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="form-label">Years of Education</label>
                <input type="number" value={education} onChange={(e) => setEducation(e.target.value)}
                  className="form-input" placeholder="e.g., 16" min="0" max="30" required />
              </div>
            </div>
          </motion.div>

          {/* FAQ Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Functional Assessment Questionnaire</h3>
              <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full font-bold text-sm">
                FAQ Score: {faqScore} / 15
              </div>
            </div>

            <div className="space-y-5">
              {FAQ_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl bg-gray-50/80">
                  <p className="font-medium text-gray-700 mb-3">
                    <span className="text-primary-500 font-bold mr-2">{idx + 1}.</span>
                    {q.question}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {FAQ_OPTIONS.map((opt) => (
                      <button key={opt.value} type="button"
                        onClick={() => setFaqAnswers({ ...faqAnswers, [q.id]: opt.value })}
                        className={`p-3 rounded-lg text-sm font-medium border-2 transition-all ${
                          faqAnswers[q.id] === opt.value
                            ? opt.color + ' shadow-sm'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}>
                        <span className="block font-bold">{opt.value}</span>
                        <span className="block text-xs mt-0.5">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Progress Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Questions Answered</span>
              <span className="font-bold text-gray-800">{Object.keys(faqAnswers).length} / {FAQ_QUESTIONS.length}</span>
            </div>
            <div className="prediction-bar mt-2">
              <div className="prediction-bar-fill bg-gradient-to-r from-primary-500 to-accent-500"
                style={{ width: `${(Object.keys(faqAnswers).length / FAQ_QUESTIONS.length) * 100}%` }} />
            </div>
          </motion.div>

          {/* Submit */}
          <button type="submit" disabled={loading || !allAnswered || mmseScore === null} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
              <>Get Clinical Prediction <FiChevronRight /></>
            )}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
