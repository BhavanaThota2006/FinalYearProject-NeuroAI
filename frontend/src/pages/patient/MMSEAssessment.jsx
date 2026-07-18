import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submitMMSE, evaluateAnswer } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import { FiChevronRight, FiChevronLeft, FiCheck, FiRotateCcw, FiMic, FiMicOff, FiVolume2, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Vector illustration for Pencil Naming Task
const PencilIcon = () => (
  <svg className="w-32 h-32 text-blue-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 5l3 3M9 11l3 3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Vector illustration for Watch Naming Task
const WatchIcon = () => (
  <svg className="w-32 h-32 text-blue-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 9v3l2 2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 5V2M12 19v3M9 5l1.5-3h3L15 5M9 19l1.5 3h3L15 19" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LANGUAGES = [
  { code: 'en-US', name: 'English', nativeName: 'English' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' }
];

const SECTIONS = [
  { id: 'orientation', label: 'Orientation' },
  { id: 'registration', label: 'Registration' },
  { id: 'attention', label: 'Attention' },
  { id: 'recall', label: 'Recall' },
  { id: 'language', label: 'Language' },
  { id: 'visuospatial', label: 'Visuospatial' }
];

const MMSE_QUESTIONS = {
  'en-US': [
    { id: 'welcome', text: "Hello. I am your AI Cognitive Assessment Assistant. I will ask you a few questions to evaluate your memory, attention, and thinking abilities. Please answer naturally. If you do not understand a question, you may ask me to repeat it.", type: 'greet' },
    { id: 'year', text: "What is the current year?", section: 'orientation', field: 'year', type: 'speech' },
    { id: 'month', text: "What is the current month?", section: 'orientation', field: 'month', type: 'speech' },
    { id: 'date', text: "What is today's date?", section: 'orientation', field: 'date', type: 'speech' },
    { id: 'day', text: "What day of the week is it?", section: 'orientation', field: 'day', type: 'speech' },
    { id: 'season', text: "What is the current season?", section: 'orientation', field: 'season', type: 'speech' },
    { id: 'country', text: "What country are we in?", section: 'orientation', field: 'country', type: 'speech' },
    { id: 'state', text: "What state is this?", section: 'orientation', field: 'state', type: 'speech' },
    { id: 'city', text: "What city is this?", section: 'orientation', field: 'city', type: 'speech' },
    { id: 'hospital', text: "What is the name of this hospital or clinic?", section: 'orientation', field: 'hospital', type: 'speech' },
    { id: 'floor', text: "What floor of the building are we on?", section: 'orientation', field: 'floor', type: 'speech' },
    { id: 'registration', text: "I am going to say three words. Please repeat them: Apple, Table, Penny. Please say them now.", section: 'registration', type: 'speech' },
    { id: 'attention', text: "Please spell the word WORLD backwards, or subtract 7 from 100 repeatedly: 93, 86, 79, and so on.", section: 'attention', type: 'speech' },
    { id: 'recall', text: "What were the three words I asked you to remember earlier?", section: 'recall', type: 'speech' },
    { id: 'naming1', text: "What is this object shown on the screen called?", section: 'language', type: 'naming', image: 'pencil' },
    { id: 'naming2', text: "What is this object shown on the screen called?", section: 'language', type: 'naming', image: 'watch' },
    { id: 'repeat', text: "Please repeat this sentence after me: 'No ifs, ands, or buts.'", section: 'language', type: 'speech' },
    { id: 'command', text: "Take a sheet of paper, fold it in half, and put it on the table. When done, please say: 'I have folded the paper'.", section: 'language', type: 'speech' },
    { id: 'reading', text: "Please read the instruction on the screen and obey it. When done, say: 'I have closed my eyes'.", section: 'language', type: 'reading_text', instruction: 'CLOSE YOUR EYES' },
    { id: 'writing', text: "Please speak a complete, meaningful sentence aloud.", section: 'language', type: 'speech' },
    { id: 'visuospatial', text: "Please draw the intersecting pentagons using the canvas shown on the screen.", section: 'visuospatial', type: 'drawing' }
  ],
  'te-IN': [
    { id: 'welcome', text: "నమస్కారం. నేను మీ జ్ఞాపకశక్తి మరియు ఆలోచనా సామర్థ్యాన్ని అంచనా వేయడానికి కొన్ని ప్రశ్నలు అడుగుతాను. దయచేసి సహజంగా సమాధానం ఇవ్వండి. ప్రశ్న అర్ధం కాకపోతే మళ్ళీ అడగవచ్చు.", type: 'greet' },
    { id: 'year', text: "ప్రస్తుతం ఏ సంవత్సరం నడుస్తోంది?", section: 'orientation', field: 'year', type: 'speech' },
    { id: 'month', text: "ప్రస్తుతం ఏ నెల నడుస్తోంది?", section: 'orientation', field: 'month', type: 'speech' },
    { id: 'date', text: "ఈ రోజు తేదీ ఎంత?", section: 'orientation', field: 'date', type: 'speech' },
    { id: 'day', text: "ఈ రోజు వారంలో ఏ రోజు?", section: 'orientation', field: 'day', type: 'speech' },
    { id: 'season', text: "ఇది ఏ రుతువు లేదా కాలము?", section: 'orientation', field: 'season', type: 'speech' },
    { id: 'country', text: "మనం ఏ దేశంలో ఉన్నాము?", section: 'orientation', field: 'country', type: 'speech' },
    { id: 'state', text: "ఇది ఏ రాష్ట్రం?", section: 'orientation', field: 'state', type: 'speech' },
    { id: 'city', text: "ఇది ఏ నగరం లేదా ఊరు?", section: 'orientation', field: 'city', type: 'speech' },
    { id: 'hospital', text: "ఈ ఆసుపత్రి లేదా క్లినిక్ పేరు ఏమిటి?", section: 'orientation', field: 'hospital', type: 'speech' },
    { id: 'floor', text: "మనం ఏ అంతస్తులో ఉన్నాము?", section: 'orientation', field: 'floor', type: 'speech' },
    { id: 'registration', text: "నేను మూడు పదాలు చెప్తాను. దయచేసి వాటిని తిరిగి చెప్పండి: యాపిల్, టేబుల్, పెన్నీ. దయచేసి ఇప్పుడు చెప్పండి.", section: 'registration', type: 'speech' },
    { id: 'attention', text: "దయచేసి WORLD పదాన్ని వెనుక నుండి అక్షరాల వారీగా చెప్పండి, లేదా 100 నుండి 7 తగ్గించుకుంటూ వెళ్ళండి.", section: 'attention', type: 'speech' },
    { id: 'recall', text: "నేను మిమ్మల్ని ఇంతకుముందు గుర్తుంచుకోమన్న ఆ మూడు పదాలు ఏమిటి?", section: 'recall', type: 'speech' },
    { id: 'naming1', text: "తెరపై చూపిస్తున్న ఈ వస్తువు పేరు ఏమిటి?", section: 'language', type: 'naming', image: 'pencil' },
    { id: 'naming2', text: "తెరపై చూపిస్తున్న ఈ వస్తువు పేరు ఏమిటి?", section: 'language', type: 'naming', image: 'watch' },
    { id: 'repeat', text: "నేను చెప్పిన వాక్యాన్ని తిరిగి చెప్పండి: 'పట్టువదలని విక్రమార్కుడు.'", section: 'language', type: 'speech' },
    { id: 'command', text: "నేను చెప్పిన పని చేయండి: ఒక కాగితాన్ని చేతిలోకి తీసుకోండి, దానిని సగానికి మడవండి మరియు టేబుల్‌పై ఉంచండి. చేసిన తర్వాత, 'నేను మడిచాను' అని చెప్పండి.", section: 'language', type: 'speech' },
    { id: 'reading', text: "తెరపై ఉన్న సూచనను చదివి దానిని పాటించండి. చేసిన తర్వాత 'నేను కళ్ళు మూసుకున్నాను' అని చెప్పండి.", section: 'language', type: 'reading_text', instruction: 'కళ్ళు మూసుకోండి' },
    { id: 'writing', text: "దయచేసి ఏదైనా ఒక పూర్తి వాక్యాన్ని మాట్లాడండి.", section: 'language', type: 'speech' },
    { id: 'visuospatial', text: "దయచేసి స్క్రీన్ పై ఉన్న డ్రాయింగ్ బోర్డులో చూపిన విధంగా డ్రాయింగ్ వేయండి.", section: 'visuospatial', type: 'drawing' }
  ],
  'hi-IN': [
    { id: 'welcome', text: "नमस्कार। मैं आपका एआई कॉग्निटिव असेसमेंट असिस्टेंट हूं। मैं आपकी याददाश्त, ध्यान और सोचने की क्षमताओं का मूल्यांकन करने के लिए कुछ प्रश्न पूछूंगा। कृपया स्वाभाविक रूप से उत्तर दें। प्रश्न समझ न आने पर आप दोहराने को कह सकते हैं।", type: 'greet' },
    { id: 'year', text: "अभी कौन सा वर्ष है?", section: 'orientation', field: 'year', type: 'speech' },
    { id: 'month', text: "अभी कौन सा महीना चल रहा है?", section: 'orientation', field: 'month', type: 'speech' },
    { id: 'date', text: "आज की तारीख क्या है?", section: 'orientation', field: 'date', type: 'speech' },
    { id: 'day', text: "आज सप्ताह का कौन सा दिन है?", section: 'orientation', field: 'day', type: 'speech' },
    { id: 'season', text: "अभी कौन सी ऋतु या मौसम है?", section: 'orientation', field: 'season', type: 'speech' },
    { id: 'country', text: "हम किस देश में हैं?", section: 'orientation', field: 'country', type: 'speech' },
    { id: 'state', text: "यह कौन सा राज्य है?", section: 'orientation', field: 'state', type: 'speech' },
    { id: 'city', text: "यह कौन सा शहर है?", section: 'orientation', field: 'city', type: 'speech' },
    { id: 'hospital', text: "इस अस्पताल या क्लिनिक का नाम क्या है?", section: 'orientation', field: 'hospital', type: 'speech' },
    { id: 'floor', text: "हम इमारत की किस मंजिल पर हैं?", section: 'orientation', field: 'floor', type: 'speech' },
    { id: 'registration', text: "मैं तीन शब्द कहने जा रहा हूँ। कृपया उन्हें दोहराएं: एप्पल, टेबल, पेनी। कृपया अब कहें।", section: 'registration', type: 'speech' },
    { id: 'attention', text: "कृपया WORLD शब्द को उल्टा वर्तनी करें (D-L-R-O-W), या 100 में से 7 घटाते रहें: 93, 86, 79, इत्यादि।", section: 'attention', type: 'speech' },
    { id: 'recall', text: "वे तीन शब्द कौन से थे जिन्हें मैंने आपको पहले याद रखने के लिए कहा था?", section: 'recall', type: 'speech' },
    { id: 'naming1', text: "स्क्रीन पर दिखाई गई इस वस्तु को क्या कहते हैं?", section: 'language', type: 'naming', image: 'pencil' },
    { id: 'naming2', text: "स्क्रीन पर दिखाई गई इस वस्तु को क्या कहते हैं?", section: 'language', type: 'naming', image: 'watch' },
    { id: 'repeat', text: "कृपया मेरे बाद इस वाक्य को दोहराएं: 'किन्तु परन्तु कुछ भी नहीं।'", section: 'language', type: 'speech' },
    { id: 'command', text: "एक कागज का टुकड़ा लें, उसे आधा मोड़ें, और मेज पर रख दें। जब हो जाए, तो कहें: 'मैंने मोड़ा है' या 'हाँ'।", section: 'language', type: 'speech' },
    { id: 'reading', text: "कृपया स्क्रीन पर दिए गए निर्देश को पढ़ें और उसका पालन करें। जब हो जाए, तो कहें: 'मैंने आँखें बंद कर ली हैं।'", section: 'language', type: 'reading_text', instruction: 'अपनी आँखें बंद करें' },
    { id: 'writing', text: "कृपया कोई भी एक पूर्ण और अर्थपूर्ण वाक्य बोलें।", section: 'language', type: 'speech' },
    { id: 'visuospatial', text: "कृपया कैनवास का उपयोग करके प्रतिच्छेद करने वाले पंचकोणों को ड्रा करें।", section: 'visuospatial', type: 'drawing' }
  ]
};

export default function MMSEAssessment() {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [interactionState, setInteractionState] = useState('idle'); // 'idle', 'speaking', 'listening', 'processing', 'thinking'
  const [transcription, setTranscription] = useState('');
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Score tallies
  const [sectionScores, setSectionScores] = useState({
    orientation: 0,
    registration: 0,
    attention: 0,
    recall: 0,
    language: 0,
    visuospatial: 0
  });

  const [collectedResponses, setCollectedResponses] = useState([]);
  const [voiceUnavailable, setVoiceUnavailable] = useState(false);
  const [visuospatialScore, setVisuospatialScore] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Web Speech API references
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Drawing Canvas for visuospatial part
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);

  // Initialize Speech Recognition
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Web Speech API is not supported in this browser. Please use Chrome/Edge.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setRecognitionActive(true);
      setInteractionState('listening');
    };

    rec.onresult = (event) => {
      let speechToText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        speechToText += event.results[i][0].transcript;
      }
      setTranscription(speechToText);
    };

    rec.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setRecognitionActive(false);
      setInteractionState('idle');
      
      if (event.error === 'no-speech') {
        speakPrompt("I did not hear anything. Could you please say that again?");
      } else if (event.error === 'not-allowed') {
        toast.error("Microphone permission blocked. Please enable it in browser settings.");
      }
    };

    rec.onend = () => {
      setRecognitionActive(false);
      setInteractionState('processing');
    };

    recognitionRef.current = rec;
  }, []);

  useEffect(() => {
    initSpeechRecognition();
    
    // Initialize voices asynchronously on mount
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [initSpeechRecognition]);

  // Check if voice exists for this language
  const isLanguageVoiceSupported = (langCode) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false;
    const voices = window.speechSynthesis.getVoices();
    const prefix = langCode.split('-')[0].toLowerCase();
    return voices.some(v => v.lang.toLowerCase().startsWith(prefix) || v.lang.toLowerCase().includes(prefix));
  };

  // Main Speech Synthesis Speaker
  const speakText = (text, lang, callback) => {
    if (!synthRef.current) {
      if (callback) callback();
      return;
    }

    // Check if voice exists for this language
    if (!isLanguageVoiceSupported(lang)) {
      console.warn(`Voice not supported for language: ${lang}. Bypassing speech synthesis.`);
      setInteractionState('idle');
      if (callback) callback();
      return;
    }
    
    // Fix Chrome/Edge speech synthesis bug: resume before speaking
    synthRef.current.resume();
    synthRef.current.cancel();
    setInteractionState('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // Load matching voice
    const voices = synthRef.current.getVoices();
    let voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (!voice) {
      voice = voices.find(v => v.lang.toLowerCase().includes(lang.split('-')[0].toLowerCase()));
    }
    if (voice) {
      utterance.voice = voice;
    }

    // Keep global/window reference to prevent garbage collection
    if (!window.activeUtterances) {
      window.activeUtterances = [];
    }
    window.activeUtterances.push(utterance);

    utterance.onend = () => {
      window.activeUtterances = window.activeUtterances.filter(u => u !== utterance);
      setInteractionState('idle');
      if (callback) callback();
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesisUtterance Error:", e);
      window.activeUtterances = window.activeUtterances.filter(u => u !== utterance);
      setInteractionState('idle');
      if (callback) callback();
    };

    synthRef.current.speak(utterance);
  };

  // Speak a prompt and restart recognition automatically if needed
  const speakPrompt = (text, followUp = true) => {
    speakText(text, selectedLanguage, () => {
      if (followUp && recognitionRef.current) {
        setTranscription('');
        // Short timeout to avoid capturing prompt echo
        setTimeout(() => {
          try {
            if (recognitionRef.current) {
              recognitionRef.current.lang = selectedLanguage;
              recognitionRef.current.start();
            }
          } catch (e) {
            console.error("Failed to start speech recognition:", e);
          }
        }, 300);
      }
    });
  };

  // Start Voice Flow on Language Selection
  const selectLanguage = (langCode) => {
    setSelectedLanguage(langCode);
    setCurrentIdx(0);

    const supported = isLanguageVoiceSupported(langCode);
    if (!supported) {
      setVoiceUnavailable(true);
      toast.error(`Voice synthesis unavailable for ${langCode === 'te-IN' ? 'Telugu' : langCode === 'hi-IN' ? 'Hindi' : 'English'} on this device. Questions will be displayed on screen.`, { duration: 6000 });
      // Proceed directly to first question bypassing welcome speech
      setCurrentIdx(1);
    } else {
      setVoiceUnavailable(false);
      const welcomePrompt = MMSE_QUESTIONS[langCode][0];
      speakText(welcomePrompt.text, langCode, () => {
        // Proceed to first question after welcome
        setCurrentIdx(1);
      });
    }
  };

  const currentQuestion = selectedLanguage ? MMSE_QUESTIONS[selectedLanguage][currentIdx] : null;

  // React to question changes
  useEffect(() => {
    if (!currentQuestion) return;

    if (currentQuestion.type === 'speech' || currentQuestion.type === 'naming' || currentQuestion.type === 'reading_text') {
      setTranscription('');
      speakPrompt(currentQuestion.text, true);
    } else if (currentQuestion.type === 'drawing') {
      synthRef.current.cancel();
      setInteractionState('idle');
    }
  }, [currentIdx, selectedLanguage]);

  // Handle Response evaluation when Speech finishes
  useEffect(() => {
    if (interactionState === 'processing' && transcription.trim() !== '') {
      handleAnswerEvaluation();
    }
  }, [interactionState]);

  const handleAnswerEvaluation = async () => {
    setInteractionState('thinking');
    try {
      const response = await evaluateAnswer({
        question_id: currentQuestion.id,
        recognized_text: transcription,
        lang: selectedLanguage
      });

      const { score, feedback, expected_answer } = response.data;

      // Log detailed response
      const stepResponse = {
        question_id: currentQuestion.id,
        question_text: currentQuestion.text,
        patient_response: transcription,
        expected_answer,
        score,
        section: currentQuestion.section
      };

      setCollectedResponses(prev => [...prev, stepResponse]);

      // Update Section Scores
      setSectionScores(prev => {
        const sect = currentQuestion.section;
        return {
          ...prev,
          [sect]: prev[sect] + score
        };
      });

      // Acknowledge patient result and continue
      speakText(feedback, selectedLanguage, () => {
        if (currentIdx < MMSE_QUESTIONS[selectedLanguage].length - 1) {
          setCurrentIdx(prev => prev + 1);
        }
      });

    } catch (e) {
      toast.error("Failed to evaluate response. Proceeding...");
      // Add zero fallback
      setCollectedResponses(prev => [...prev, {
        question_id: currentQuestion.id,
        question_text: currentQuestion.text,
        patient_response: transcription,
        expected_answer: '',
        score: 0,
        section: currentQuestion.section
      }]);
      setTimeout(() => {
        if (currentIdx < MMSE_QUESTIONS[selectedLanguage].length - 1) {
          setCurrentIdx(prev => prev + 1);
        }
      }, 1000);
    }
  };

  // Repeating the question
  const repeatQuestion = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setTranscription('');
    speakPrompt(currentQuestion.text, true);
  };

  // Drawing Canvas logic (standard implementation)
  const startDrawing = useCallback((e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setLastPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const draw = useCallback((e) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
    setLastPos({ x, y });
  }, [isDrawing, lastPos]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    // Redraw guidelines
    drawGuidelines(canvasRef.current);
  };

  const drawGuidelines = (canvas) => {
    const ctx = canvas.getContext('2d');
    const drawPentagon = (cx, cy, r) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    drawPentagon(130, 120, 60);
    drawPentagon(220, 120, 60);
  };

  const drawRefPentagons = useCallback((canvas) => {
    if (!canvas) return;
    canvasRef.current = canvas;
    drawGuidelines(canvas);
  }, []);

  // Submit MMSE assessment
  const handleFinalSubmit = async () => {
    setLoading(true);
    const finalScores = {
      orientation: sectionScores.orientation,
      registration: sectionScores.registration,
      attention: sectionScores.attention,
      recall: sectionScores.recall,
      language: sectionScores.language,
      visuospatial: visuospatialScore
    };

    const mmseTotal = Object.values(finalScores).reduce((a, b) => a + b, 0);

    // Prepare details list including visuospatial
    const fullResponses = [
      ...collectedResponses,
      {
        question_id: 'visuospatial',
        question_text: 'Please draw the intersecting pentagons.',
        patient_response: 'Image drawn on canvas',
        expected_answer: 'Intersecting pentagons',
        score: visuospatialScore,
        section: 'visuospatial'
      }
    ];

    try {
      await submitMMSE({
        patient_id: user.id,
        ...finalScores,
        mmse_total: mmseTotal,
        responses: fullResponses
      });
      // Update state to show completed score page
      setSectionScores(finalScores);
      setCompleted(true);
      toast.success(`Speech Cognitive AI Assessment Complete! Score: ${mmseTotal}/30`);
    } catch (e) {
      toast.error('Failed to submit cognitive assessment');
    } finally {
      setLoading(false);
    }
  };

  // Render language selection
  if (!selectedLanguage) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-10 shadow-xl border border-gray-100 rounded-3xl bg-white/70 backdrop-blur-md">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Cognitive AI Assistant</h2>
            <p className="text-gray-500 mb-8 text-base">Please select your preferred language to start the voice-based cognitive assessment.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-lg mx-auto">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  id={`lang-btn-${lang.code}`}
                  onClick={() => selectLanguage(lang.code)}
                  className="p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group hover:shadow-lg"
                >
                  <span className="text-2xl font-bold text-gray-800 mb-1 group-hover:text-blue-600">{lang.nativeName}</span>
                  <span className="text-xs text-gray-400 group-hover:text-blue-400">{lang.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Render Completed View
  if (completed) {
    const mmseTotal = Object.values(sectionScores).reduce((a, b) => a + b, 0);
    const getSeverity = (score) => {
      if (score >= 24) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50' };
      if (score >= 19) return { label: 'Mild Impairment', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      if (score >= 10) return { label: 'Moderate Impairment', color: 'text-orange-600', bg: 'bg-orange-50' };
      return { label: 'Severe Impairment', color: 'text-red-600', bg: 'bg-red-50' };
    };
    const severity = getSeverity(mmseTotal);

    return (
      <DashboardLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
          <div className="glass-card p-10 text-center mb-6 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="text-3xl text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Voice Assessment Complete</h2>
            <div className={`inline-block px-4 py-2 rounded-full ${severity.bg} ${severity.color} font-semibold mt-2`}>
              {severity.label}
            </div>
          </div>

          <div className="glass-card p-8 mb-6 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl">
            <div className="text-center mb-6">
              <p className="text-5xl font-bold text-blue-600">{mmseTotal}</p>
              <p className="text-gray-500 mt-1">out of 30</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SECTIONS.map((sect) => {
                const maxScores = { orientation: 10, registration: 3, attention: 5, recall: 3, language: 8, visuospatial: 1 };
                return (
                  <div key={sect.id} className="text-center p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">{sect.label}</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{sectionScores[sect.id]} / {maxScores[sect.id]}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => navigate('/patient/clinical-assessment')} className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
            Continue to Clinical Assessment <FiChevronRight />
          </button>
        </motion.div>
      </DashboardLayout>
    );
  }

  // Get active section info
  const activeSectionId = currentQuestion ? currentQuestion.section : 'welcome';
  const activeSectionIndex = SECTIONS.findIndex(s => s.id === activeSectionId);
  const totalQuestions = MMSE_QUESTIONS[selectedLanguage].length - 1; // skip welcome in index
  const progressPercent = currentIdx === 0 ? 0 : Math.round((currentIdx / totalQuestions) * 100);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Stage 1: Voice Cognitive Assessment</h1>
            <p className="text-gray-500 mt-1">Mini-Mental State Examination — Multilingual Speech Interface</p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-semibold text-xs border border-blue-100 uppercase">
            {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
          </div>
        </div>

        {/* Stepper progress (non-drawing mode) */}
        {currentQuestion.type !== 'drawing' && currentIdx > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center text-sm font-semibold text-gray-500 mb-2 px-1">
              <span>Section: {SECTIONS[activeSectionIndex]?.label}</span>
              <span>Question {currentIdx} / {totalQuestions}</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} className="bg-blue-600 h-full rounded-full transition-all duration-300" />
            </div>
          </div>
        )}

        {/* Stepper dot view for desktop */}
        {currentIdx > 0 && (
          <div className="flex items-center justify-between mb-8 px-4">
            {SECTIONS.map((section, i) => (
              <div key={section.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`stepper-dot w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < activeSectionIndex ? 'bg-green-500 text-white' : i === activeSectionIndex ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400'}`}>
                    {i < activeSectionIndex ? <FiCheck /> : i + 1}
                  </div>
                  <span className="text-xs text-gray-500 mt-2 hidden md:block font-medium">{section.label}</span>
                </div>
                {i < SECTIONS.length - 1 && (
                  <div className={`w-8 lg:w-16 h-0.5 mx-1 ${i < activeSectionIndex ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main Content card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 rounded-3xl bg-white/70 backdrop-blur-md border border-gray-100/50 shadow-xl"
          >
            {voiceUnavailable && currentQuestion && currentQuestion.type !== 'drawing' && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm text-center font-semibold">
                ⚠️ Voice synthesis is not supported for this language on your device. Please read the question below and answer verbally.
              </div>
            )}
            {/* Greeting welcome state */}
            {currentQuestion.type === 'greet' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <FiVolume2 className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Welcome to Cognitive Assistant</h3>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed">{currentQuestion.text}</p>
                <div className="mt-8 flex justify-center">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" /> AI Assistant is speaking...
                  </span>
                </div>
              </div>
            )}

            {/* Speaking / Listening State for Speech Assessments */}
            {currentQuestion.type === 'speech' && (
              <div className="flex flex-col items-center py-6">
                <span className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Voice Question</span>
                
                <h3 className="text-xl font-bold text-gray-800 text-center max-w-xl mb-8 leading-relaxed">
                  {currentQuestion.text}
                </h3>

                {/* Vector illustration fallback forWORLD backward word reminder */}
                {currentQuestion.id === 'attention' && (
                  <div className="my-2 px-6 py-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 font-bold tracking-widest text-lg mb-6">
                    WORLD
                  </div>
                )}

                {/* Animation States */}
                <div className="relative w-36 h-36 flex items-center justify-center mb-8">
                  {interactionState === 'speaking' && (
                    <div className="absolute inset-0 flex items-center justify-between px-6">
                      {[...Array(5)].map((_, i) => (
                        <motion.span
                          key={i}
                          animate={{ height: ['20%', '80%', '20%'] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                          className="w-1.5 bg-blue-500 rounded-full h-full"
                        />
                      ))}
                    </div>
                  )}

                  {interactionState === 'listening' && (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-red-100 rounded-full opacity-60"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                        className="absolute inset-4 bg-red-200 rounded-full opacity-80"
                      />
                    </>
                  )}

                  {interactionState === 'thinking' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      className="absolute inset-8 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                  )}

                  {/* Icon container */}
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg relative ${interactionState === 'listening' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
                    {interactionState === 'listening' ? <FiMic className="text-3xl" /> : <FiVolume2 className="text-3xl" />}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mb-6 font-semibold flex items-center gap-2">
                  {interactionState === 'speaking' && <span className="text-blue-600 flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" /> AI Speaking...</span>}
                  {interactionState === 'listening' && <span className="text-red-500 flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" /> Listening... (Microphone Active)</span>}
                  {interactionState === 'thinking' && <span className="text-blue-600 flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce" /> Grading response...</span>}
                  {interactionState === 'idle' && <span className="text-gray-400">Waiting...</span>}
                </div>

                {/* Live Transcription Box */}
                {transcription && (
                  <div className="w-full max-w-md bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">You are saying</p>
                    <p className="text-gray-700 italic">"{transcription}"</p>
                  </div>
                )}

                {/* Control Actions */}
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={repeatQuestion}
                    className="px-5 py-2.5 rounded-full border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2 text-sm shadow-sm transition-all"
                  >
                    <FiRefreshCw /> Repeat Question
                  </button>
                </div>
              </div>
            )}

            {/* Reading Text State */}
            {currentQuestion.type === 'reading_text' && (
              <div className="flex flex-col items-center py-6">
                <span className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Reading Task</span>
                <p className="text-gray-500 mb-6 text-sm text-center">Read and obey the instruction displayed below: </p>
                
                <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center shadow-inner mb-8 w-full max-w-md">
                  <span className="text-3xl font-extrabold text-red-600 tracking-wider">
                    {currentQuestion.instruction}
                  </span>
                </div>

                <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                  {interactionState === 'listening' && (
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-red-100 rounded-full opacity-60" />
                  )}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md ${interactionState === 'listening' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
                    {interactionState === 'listening' ? <FiMic className="text-2xl" /> : <FiVolume2 className="text-2xl" />}
                  </div>
                </div>

                <p className="font-semibold text-gray-700 mb-4">{currentQuestion.text}</p>
                
                {transcription && (
                  <div className="w-full max-w-md bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center italic text-gray-700">
                    "{transcription}"
                  </div>
                )}
                
                <div className="mt-6">
                  <button onClick={repeatQuestion} className="px-4 py-2 rounded-full border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2 text-xs shadow-sm">
                    <FiRefreshCw /> Repeat Prompt
                  </button>
                </div>
              </div>
            )}

            {/* Naming State */}
            {currentQuestion.type === 'naming' && (
              <div className="flex flex-col items-center py-4">
                <span className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Naming Object Task</span>
                
                <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 mb-6 w-full max-w-md flex items-center justify-center bg-white shadow-inner">
                  {currentQuestion.image === 'pencil' ? <PencilIcon /> : <WatchIcon />}
                </div>

                <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
                  {currentQuestion.text}
                </h3>

                <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                  {interactionState === 'listening' && (
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-red-100 rounded-full opacity-60" />
                  )}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md ${interactionState === 'listening' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
                    {interactionState === 'listening' ? <FiMic className="text-2xl" /> : <FiVolume2 className="text-2xl" />}
                  </div>
                </div>

                {transcription && (
                  <div className="w-full max-w-md bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center italic text-gray-700">
                    "{transcription}"
                  </div>
                )}

                <div className="mt-6">
                  <button onClick={repeatQuestion} className="px-4 py-2 rounded-full border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2 text-xs shadow-sm">
                    <FiRefreshCw /> Repeat Question
                  </button>
                </div>
              </div>
            )}

            {/* Drawing Canvas section (keep Visuospatial Canvas) */}
            {currentQuestion.type === 'drawing' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Section 6: Visuospatial Design</h3>
                <p className="text-gray-500 mb-4">{currentQuestion.text}</p>
                
                <div className="flex flex-col items-center">
                  <div className="glass-card p-6 border border-gray-200/80 bg-white rounded-3xl shadow-lg flex flex-col items-center w-full max-w-lg">
                    <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">Draw inside the guideline grid below:</p>
                    <canvas
                      ref={drawRefPentagons}
                      width={380}
                      height={240}
                      className="border border-dashed border-gray-300 rounded-2xl bg-slate-50 cursor-crosshair shadow-inner"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    
                    <div className="flex gap-3 mt-4 w-full">
                      <button onClick={clearCanvas} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl border border-gray-200">
                        <FiRotateCcw /> Clear Board
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 w-full max-w-lg">
                    <label className="block text-sm font-semibold text-gray-600 mb-3 text-center">Score details: Did the designs intersect properly?</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setVisuospatialScore(0)}
                        className={`flex-1 py-3 rounded-2xl font-bold shadow-md transition-all cursor-pointer ${visuospatialScore === 0 ? 'bg-red-500 text-white ring-4 ring-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        0 - Incorrect
                      </button>
                      <button
                        onClick={() => setVisuospatialScore(1)}
                        className={`flex-1 py-3 rounded-2xl font-bold shadow-md transition-all cursor-pointer ${visuospatialScore === 1 ? 'bg-green-500 text-white ring-4 ring-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        1 - Correct Match
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Global Nav Bottom */}
        <div className="flex justify-between mt-6 px-1">
          <button
            onClick={() => {
              if (currentIdx > 1) {
                setCurrentIdx(prev => prev - 1);
              } else if (currentIdx === 1) {
                // Return to language selection
                setSelectedLanguage(null);
                if (synthRef.current) {
                  synthRef.current.cancel();
                }
              }
            }}
            className="btn-secondary flex items-center gap-2 hover:bg-gray-50 border border-gray-200 py-3 px-6 rounded-2xl font-semibold shadow-sm text-sm"
          >
            <FiChevronLeft /> Back
          </button>
          
          {currentQuestion?.type === 'drawing' && (
            <button
              onClick={handleFinalSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2 py-3 px-6 rounded-2xl font-semibold shadow-md inline-flex items-center text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Submit Assessment <FiCheck /></>
              )}
            </button>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
