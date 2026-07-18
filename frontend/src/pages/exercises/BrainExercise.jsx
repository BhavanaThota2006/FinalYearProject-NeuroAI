import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitExercise } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import { FiTarget, FiRefreshCw, FiCheck, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// ===== EXERCISE CONFIGURATIONS =====
// Assigned based on prediction: CN=Sudoku, MCI=ShoppingList, Early AD=PictureMatching, Moderate=ObjectRecognition, Severe=FamilyFace

// ===== SUDOKU (for Healthy/CN) =====
function SudokuGame({ onComplete }) {
  const puzzle = [
    [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9],
  ];
  const solution = [
    [5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9],
  ];

  const [grid, setGrid] = useState(puzzle.map(row => [...row]));
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleChange = (r, c, val) => {
    const v = parseInt(val) || 0;
    if (v < 0 || v > 9) return;
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = v;
    setGrid(newGrid);
  };

  const checkSolution = () => {
    let correct = 0, total = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] === 0) {
          total++;
          if (grid[r][c] === solution[r][c]) correct++;
        }
      }
    }
    const score = Math.round((correct / total) * 100);
    clearInterval(intervalRef.current);
    onComplete(score);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">🧩 Sudoku Puzzle</h3>
        <div className="flex items-center gap-2 text-gray-500">
          <FiClock /> {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </div>
      </div>
      <div className="grid grid-cols-9 gap-px bg-gray-300 rounded-xl overflow-hidden w-fit mx-auto">
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <input key={`${r}-${c}`}
              type="number" min="0" max="9"
              value={cell || ''}
              onChange={(e) => handleChange(r, c, e.target.value)}
              disabled={puzzle[r][c] !== 0}
              className={`w-10 h-10 text-center font-bold text-sm border-0 outline-none ${
                puzzle[r][c] !== 0 ? 'bg-blue-50 text-blue-800' : 'bg-white text-gray-800'
              } ${c % 3 === 2 && c < 8 ? 'border-r-2 border-gray-400' : ''}
              ${r % 3 === 2 && r < 8 ? 'border-b-2 border-gray-400' : ''}`}
            />
          ))
        )}
      </div>
      <button onClick={checkSolution} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
        <FiCheck /> Check Solution
      </button>
    </div>
  );
}

// ===== SHOPPING LIST MEMORY (for MCI) =====
function ShoppingListGame({ onComplete }) {
  const items = ['🍎 Apples', '🥛 Milk', '🍞 Bread', '🥚 Eggs', '🧀 Cheese', '🍌 Bananas', '🥕 Carrots', '🍅 Tomatoes'];
  const [phase, setPhase] = useState('memorize'); // memorize, recall
  const [timer, setTimer] = useState(15);
  const [selectedItems, setSelectedItems] = useState([]);
  const shuffledItems = useRef([...items, '🍗 Chicken', '🐟 Fish', '🍕 Pizza', '🍪 Cookies'].sort(() => Math.random() - 0.5)).current;

  useEffect(() => {
    if (phase === 'memorize' && timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
    if (phase === 'memorize' && timer === 0) setPhase('recall');
  }, [timer, phase]);

  const toggleItem = (item) => {
    setSelectedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const checkAnswer = () => {
    const correct = selectedItems.filter(i => items.includes(i)).length;
    const incorrect = selectedItems.filter(i => !items.includes(i)).length;
    const score = Math.max(0, Math.round(((correct - incorrect) / items.length) * 100));
    onComplete(score);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800">🛒 Shopping List Memory Game</h3>
      {phase === 'memorize' ? (
        <div className="text-center">
          <p className="text-gray-500 mb-4">Memorize these items! Time remaining: <span className="font-bold text-primary-600">{timer}s</span></p>
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
            {items.map(item => (
              <motion.div key={item} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="p-3 rounded-xl bg-primary-50 text-center font-medium text-sm">{item}</motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-500 mb-4">Select the items that were on the shopping list:</p>
          <div className="grid grid-cols-3 gap-3">
            {shuffledItems.map(item => (
              <button key={item} onClick={() => toggleItem(item)}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  selectedItems.includes(item) ? 'bg-primary-500 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>{item}</button>
            ))}
          </div>
          <button onClick={checkAnswer} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
            <FiCheck /> Submit Answers
          </button>
        </div>
      )}
    </div>
  );
}

// ===== PICTURE MATCHING (for Early AD) =====
function PictureMatchingGame({ onComplete }) {
  const emojis = ['🌟', '🎨', '🎵', '🌺', '🦋', '🍀'];
  const cards = useRef([...emojis, ...emojis].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }))).current;
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [cardState, setCardState] = useState(cards);

  const handleFlip = (id) => {
    if (flipped.length === 2 || cardState[id].matched || flipped.includes(id)) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    setMoves(m => m + 1);

    if (newFlipped.length === 2) {
      const [a, b] = newFlipped;
      if (cardState[a].emoji === cardState[b].emoji) {
        const newMatched = [...matched, cardState[a].emoji];
        setMatched(newMatched);
        setCardState(prev => prev.map(c => c.emoji === cardState[a].emoji ? { ...c, matched: true } : c));
        setFlipped([]);
        if (newMatched.length === emojis.length) {
          const score = Math.max(0, Math.round((1 - (moves - emojis.length) / (emojis.length * 3)) * 100));
          onComplete(Math.min(100, score));
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">🎯 Picture Matching</h3>
        <span className="text-sm text-gray-500">Moves: {moves}</span>
      </div>
      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
        {cardState.map((card) => (
          <motion.button key={card.id}
            onClick={() => handleFlip(card.id)}
            whileTap={{ scale: 0.95 }}
            className={`w-16 h-16 rounded-xl text-2xl flex items-center justify-center transition-all ${
              card.matched ? 'bg-green-100 border-2 border-green-400' :
              flipped.includes(card.id) ? 'bg-primary-100 border-2 border-primary-400' :
              'bg-gray-200 hover:bg-gray-300'
            }`}>
            {(flipped.includes(card.id) || card.matched) ? card.emoji : '?'}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ===== OBJECT RECOGNITION (for Moderate AD) =====
function ObjectRecognitionGame({ onComplete }) {
  const questions = [
    { emoji: '🕰️', options: ['Clock', 'Phone', 'Box', 'Lamp'], answer: 'Clock' },
    { emoji: '🔑', options: ['Pen', 'Key', 'Pin', 'Nail'], answer: 'Key' },
    { emoji: '📚', options: ['Books', 'Papers', 'Cards', 'Blocks'], answer: 'Books' },
    { emoji: '🪑', options: ['Table', 'Chair', 'Stool', 'Stand'], answer: 'Chair' },
    { emoji: '✂️', options: ['Knife', 'Scissors', 'Pen', 'Ruler'], answer: 'Scissors' },
  ];
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (answer) => {
    const newScore = answer === questions[current].answer ? score + 1 : score;
    setScore(newScore);
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      onComplete(Math.round((newScore / questions.length) * 100));
    }
  };

  return (
    <div className="space-y-4 text-center">
      <h3 className="text-lg font-bold text-gray-800">🔍 Object Recognition</h3>
      <p className="text-sm text-gray-500">Question {current + 1} of {questions.length}</p>
      <div className="text-8xl my-8">{questions[current].emoji}</div>
      <p className="text-lg font-medium text-gray-700 mb-4">What is this object?</p>
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {questions[current].options.map(opt => (
          <button key={opt} onClick={() => handleAnswer(opt)}
            className="p-4 rounded-xl bg-gray-100 hover:bg-primary-50 hover:border-primary-300 border-2 border-transparent font-medium text-gray-700 transition-all">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ===== FAMILY FACE RECOGNITION (for Severe AD) =====
function FamilyFaceGame({ onComplete }) {
  const faces = [
    { emoji: '👨', name: 'Father', options: ['Father', 'Uncle', 'Brother', 'Friend'] },
    { emoji: '👩', name: 'Mother', options: ['Aunt', 'Mother', 'Sister', 'Neighbor'] },
    { emoji: '👧', name: 'Daughter', options: ['Niece', 'Friend', 'Daughter', 'Cousin'] },
    { emoji: '👦', name: 'Son', options: ['Nephew', 'Son', 'Student', 'Brother'] },
  ];
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (answer) => {
    const newScore = answer === faces[current].name ? score + 1 : score;
    setScore(newScore);
    if (current < faces.length - 1) {
      setCurrent(current + 1);
    } else {
      onComplete(Math.round((newScore / faces.length) * 100));
    }
  };

  return (
    <div className="space-y-4 text-center">
      <h3 className="text-lg font-bold text-gray-800">👨‍👩‍👧‍👦 Family Face Recognition</h3>
      <p className="text-sm text-gray-500">Person {current + 1} of {faces.length}</p>
      <div className="text-8xl my-8">{faces[current].emoji}</div>
      <p className="text-lg font-medium text-gray-700 mb-4">Who is this person?</p>
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {faces[current].options.map(opt => (
          <button key={opt} onClick={() => handleAnswer(opt)}
            className="p-4 rounded-xl bg-gray-100 hover:bg-primary-50 hover:border-primary-300 border-2 border-transparent font-medium text-gray-700 transition-all">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ===== MAIN EXERCISE PAGE =====
export default function BrainExercise() {
  const { user } = useAuth();
  const [exerciseType, setExerciseType] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Determine exercise based on prediction result from session
  const prediction = sessionStorage.getItem('prediction') || 'MCI';

  const exercises = {
    CN: { name: 'Sudoku', component: SudokuGame, icon: '🧩', desc: 'Challenge your logical thinking' },
    MCI: { name: 'Shopping List Memory', component: ShoppingListGame, icon: '🛒', desc: 'Test your memory skills' },
    'Early AD': { name: 'Picture Matching', component: PictureMatchingGame, icon: '🎯', desc: 'Match pairs of pictures' },
    'Moderate AD': { name: 'Object Recognition', component: ObjectRecognitionGame, icon: '🔍', desc: 'Identify common objects' },
    'Severe AD': { name: 'Family Face Recognition', component: FamilyFaceGame, icon: '👨‍👩‍👧‍👦', desc: 'Recognize family members' },
  };

  const assignedExercise = exercises[prediction] || exercises['MCI'];

  const handleComplete = async (finalScore) => {
    setScore(finalScore);
    setCompleted(true);
    try {
      await submitExercise({
        patient_id: user.id,
        exercise_type: assignedExercise.name,
        score: finalScore,
      });
      toast.success(`Exercise complete! Score: ${finalScore}%`);
    } catch {
      toast.success(`Exercise complete! Score: ${finalScore}%`);
    }
  };

  if (completed) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="glass-card p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Exercise Complete!</h2>
            <p className="text-gray-500 mb-6">{assignedExercise.name}</p>
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle cx="60" cy="60" r="50" stroke="#3b82f6" strokeWidth="8" fill="none"
                  strokeDasharray={`${score * 3.14} 314`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-800">{score}%</span>
              </div>
            </div>
            <button onClick={() => { setCompleted(false); setExerciseType(null); }}
              className="btn-secondary flex items-center justify-center gap-2 mx-auto">
              <FiRefreshCw /> Try Again
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (!exerciseType) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Cognitive Rehabilitation</h1>
            <p className="text-gray-500 mt-1">Brain exercises assigned based on your cognitive assessment</p>
          </div>

          {/* Assigned Exercise */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-6 text-center">
            <div className="text-5xl mb-4">{assignedExercise.icon}</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{assignedExercise.name}</h2>
            <p className="text-gray-500 mb-6">{assignedExercise.desc}</p>
            <button onClick={() => setExerciseType(prediction)} className="btn-primary flex items-center gap-2 mx-auto">
              <FiTarget /> Start Exercise
            </button>
          </motion.div>

          {/* All Exercises Grid */}
          <h3 className="text-lg font-bold text-gray-800 mb-4">All Exercises</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(exercises).map(([key, ex]) => (
              <motion.button key={key} whileHover={{ y: -2 }}
                onClick={() => setExerciseType(key)}
                className={`glass-card p-5 text-left transition-all hover:shadow-lg ${
                  key === prediction ? 'border-2 border-primary-300' : ''
                }`}>
                <div className="text-3xl mb-3">{ex.icon}</div>
                <h4 className="font-bold text-gray-800 text-sm">{ex.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{ex.desc}</p>
                {key === prediction && (
                  <span className="inline-block mt-2 text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold">RECOMMENDED</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const GameComponent = exercises[exerciseType]?.component || ShoppingListGame;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
          <GameComponent onComplete={handleComplete} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
