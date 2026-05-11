import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import {
  CheckCircle2,
  ChevronRight,
  Vote,
  BarChart3,
  Info,
  Moon,
  Sun,
  LayoutDashboard,
  CheckCircle,
  HelpCircle,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import mcqData from './data/mcqs.json';

// --- Types ---
interface Explanation {
  correctFlag: boolean;
  explanation: string;
  why_right: string;
  core_concept: string;
  next_step: string;
}

interface MCQ {
  id: number;
  question_text: string;
  solution_text: string;
  solution_image_urls?: string[];
  solution_images_base64?: string[];
  correct_answer: string;
  no_of_options: number;
  explanations: {
    [modelName: string]: {
      [option: string]: Explanation;
    };
  };
}

// --- Components ---

const Header = ({ onShowVotes }: { onShowVotes: () => void }) => (
  <header className="h-12 border-b border-slate-200 flex items-center justify-between px-4 bg-white shrink-0 sticky top-0 z-50 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="bg-brand text-white font-extrabold p-1 rounded text-[10px] px-2 select-none tracking-tighter">AHAGURU</div>
      <h1 className="font-bold text-base text-slate-800 tracking-tight">MCQ Reasoning Assistant</h1>
      <span className="bg-slate-100 text-slate-500 text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-widest hidden sm:inline-block border border-slate-200">INTERNAL VALIDATION v2.0</span>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex-col items-end hidden md:flex leading-none">
        <span className="text-[9px] text-slate-400 uppercase font-black">Reviewer</span>
        <span className="text-[11px] font-bold text-slate-700 italic">Director / Mentor</span>
      </div>
      <button
        id="check-vote-btn"
        onClick={onShowVotes}
        className="bg-brand hover:bg-brand-dark text-white px-3 py-1.5 rounded text-[11px] font-black shadow-md transition-all uppercase tracking-wider active:scale-95"
      >
        Check Results
      </button>
    </div>
  </header>
);

const Sidebar = ({
  questions,
  activeId,
  onSelect,
  votes,
  isQuestionVoted
}: {
  questions: MCQ[];
  activeId: number;
  onSelect: (id: number) => void;
  votes: Record<number, Record<string, string>>;
  isQuestionVoted: (qid: number) => boolean;
}) => (
  <aside className="w-64 border-r border-slate-200 flex flex-col bg-slate-50 shrink-0 select-none">
    <div className="p-4 border-b border-slate-200 bg-white">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Question Index</h2>
      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((q, idx) => {
          const isVoted = isQuestionVoted(q.id);
          const votedCount = votes[q.id] ? Object.keys(votes[q.id]).length : 0;
          const isActive = activeId === q.id;
          return (
            <button
              key={q.id}
              onClick={() => onSelect(q.id)}
              className={`relative h-8 flex items-center justify-center rounded border transition-all text-xs font-bold
                ${isActive
                  ? 'border-brand bg-orange-50 text-brand'
                  : isVoted
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}
            >
              {(idx + 1).toString().padStart(2, '0')}
              {isVoted && !isActive && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white text-[6px] flex items-center justify-center text-white font-black">{votedCount}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>

    <div className="p-4 bg-orange-50 border-b border-orange-100">
      <p className="text-[11px] leading-relaxed text-orange-800">
        <strong>Reviewer Instructions:</strong><br />
        Compare the model-generated reasoning for each option. Select the most accurate and pedagogically sound output.
      </p>
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-2 scroll-hide">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Questions</h3>
      {questions.map((q) => (
        <button
          key={q.id}
          onClick={() => onSelect(q.id)}
          className={`w-full text-left p-3 rounded text-[11px] transition-all border-l-4 truncate
            ${activeId === q.id
              ? 'bg-white border border-slate-200 shadow-sm border-l-brand font-bold text-slate-900'
              : 'bg-transparent border-transparent border-l-transparent text-slate-500 hover:bg-slate-200/50'}`}
        >
          {q.question_text.replace(/\\\(|\\\)|[\r\n]/g, '').substring(0, 40)}...
        </button>
      ))}
    </div>
  </aside>
);

const Footer = ({ voteCount, total }: { voteCount: number; total: number }) => (
  <footer className="h-8 border-t border-slate-200 px-6 flex items-center justify-between text-[10px] font-medium text-slate-400 bg-slate-50 shrink-0">
    <div>Session ID: AG-VLD-{new Date().getFullYear()} | Validation Environment</div>
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-1">
        Local Memory Sync: <span className="text-green-600 font-bold">ACTIVE</span>
      </span>
      <span>Total Votes Cast: <span className="text-slate-900 font-bold">{voteCount}/{total}</span></span>
    </div>
  </footer>
);

const MathContent = ({ content, size = 'base' }: { content: string; size?: 'sm' | 'base' | 'lg' }) => {
  const sizeClasses = {
    sm: 'text-[11px] [&_.katex]:text-[11px] [&_.katex-display]:text-[11px]',
    base: 'text-sm sm:text-base [&_.katex]:text-sm sm:[&_.katex]:text-base',
    lg: 'text-lg [&_.katex]:text-lg [&_.katex-display]:text-lg'
  };

  // Pre-process content to convert \( \) and \[ \] to $ and $$
  // Also handle some common LaTeX patterns that might be missing $ delimiters
  const processedContent = content
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$')
    .replace(/\\\[/g, '$$$')
    .replace(/\\\]/g, '$$$');

  return (
    <div className={`prose prose-slate max-w-none 
      [&_p]:m-0 [&_p]:leading-relaxed
      [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
      [&_.katex-display]:my-2 [&_.katex-display]:overflow-x-auto [&_.katex-display]:py-2
      ${sizeClasses[size]}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

const ImageModal = ({
  image,
  onClose,
  isBase64,
  count = 1,
  currentIndex = 0,
  onNext,
  onPrev
}: {
  image: string;
  onClose: () => void;
  isBase64: boolean;
  count?: number;
  currentIndex?: number;
  onNext?: () => void;
  onPrev?: () => void;
}) => (
  <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
    />
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl max-h-[90vh] flex flex-col"
    >
      <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-700">Solution Reference {count > 1 ? `(${currentIndex + 1}/${count})` : ''} {isBase64 ? '📎 Embedded' : '🔗 URL'}</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
        <img
          src={image}
          alt="Solution Reference"
          className="w-full h-auto block object-contain max-h-[calc(90vh-120px)]"
          referrerPolicy="no-referrer"
        />
      </div>
      {count > 1 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onPrev}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition-all"
          >
            ← Previous
          </button>
          <span className="text-sm font-bold text-slate-700">{currentIndex + 1} / {count}</span>
          <button
            onClick={onNext}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </motion.div>
  </div>
);

const VoteSummary = ({
  votes,
  onClose,
  onClearVotes,
  questions
}: {
  votes: Record<number, Record<string, string>>;
  onClose: () => void;
  onClearVotes: () => void;
  questions: MCQ[];
}) => {
  const modelWins: Record<string, number> = {};
  Object.values(votes).forEach(optMap => {
    Object.values(optMap).forEach(modelName => {
      modelWins[modelName] = (modelWins[modelName] || 0) + 1;
    });
  });
  const totalVotes = Object.values(modelWins).reduce((a, b) => a + b, 0);
  const votedQuestions = questions.filter(q => votes[q.id] && Object.keys(votes[q.id]).length > 0);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Review Summary</h2>
            <p className="text-gray-500 font-medium text-sm">{totalVotes} vote{totalVotes !== 1 ? 's' : ''} across {votedQuestions.length} question{votedQuestions.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand shadow-sm border border-gray-100">
            <BarChart3 size={24} />
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {totalVotes === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Info size={32} />
              </div>
              <p className="text-gray-500 font-bold">No votes yet</p>
              <p className="text-sm text-gray-400">Select the best AI response for each option to build your report.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Overall Wins</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(modelWins).sort(([, a], [, b]) => b - a).map(([model, count]) => (
                    <div key={model} className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                      <div className="text-[10px] font-black text-brand/60 uppercase tracking-widest mb-1">{model.split('_').pop()}</div>
                      <div className="text-2xl font-black text-slate-900">{count} <span className="text-xs font-medium text-slate-500">/ {totalVotes}</span></div>
                      <div className="mt-1.5 h-1.5 bg-orange-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${Math.round(count / totalVotes * 100)}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{Math.round(count / totalVotes * 100)}% win rate</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Question Breakdown</h3>
                <div className="space-y-2">
                  {votedQuestions.map(q => (
                    <div key={q.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-black text-gray-700">Q#{q.id}</span>
                        <span className="text-[10px] text-gray-400">{Object.keys(votes[q.id]).length} option(s) reviewed</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(votes[q.id]).sort().map(([opt, model]) => (
                          <div key={opt} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg">
                            <span className="text-[10px] font-black text-brand">Option {opt}</span>
                            <span className="text-[10px] text-gray-300">→</span>
                            <span className="text-[10px] font-bold text-gray-700">{model.split('_').pop()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          {confirmClear ? (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <span className="text-sm font-bold text-red-700">Clear all votes and start fresh?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-lg text-xs hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onClearVotes(); onClose(); }}
                  className="px-3 py-1.5 bg-red-500 text-white font-bold rounded-lg text-xs hover:bg-red-600 transition-all"
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setConfirmClear(true)}
                className="px-4 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 border border-red-100 hover:border-red-200 font-bold rounded-xl text-xs transition-all"
              >
                🗑 Clear All Votes
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-brand text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-orange-100"
              >
                Back to Review
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- Splash Screen ---
const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 2800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white"
      style={{ background: 'linear-gradient(135deg, #fff7f0 0%, #fff 60%, #f0f4ff 100%)' }}
    >
      {/* Brand pill */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: 'backOut' }}
        className="mb-5"
      >
        <span
          className="inline-block font-black tracking-tighter px-6 py-3 rounded-2xl text-white shadow-2xl text-4xl sm:text-5xl"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', letterSpacing: '-0.04em' }}
        >
          AhaGuru
        </span>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.55, ease: 'easeOut' }}
        className="text-slate-600 font-semibold text-lg sm:text-xl tracking-wide"
      >
        MCQ Reasoning Assistant
      </motion.p>

      {/* Pulsing dot loader */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.4 }}
        className="mt-12 flex gap-2"
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-orange-400"
            animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  // votes: { [questionId]: { [option]: modelName } }
  const [votes, setVotes] = useState<Record<number, Record<string, string>>>(() => {
    const saved = localStorage.getItem('ag-mcq-votes-v2');
    return saved ? JSON.parse(saved) : {};
  });
  const [activeId, setActiveId] = useState<number>(mcqData[0].id);
  const [activeOption, setActiveOption] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ src: string; isBase64: boolean; index: number; total: number } | null>(null);

  const activeMcq = (mcqData as MCQ[]).find(q => q.id === activeId) || mcqData[0];
  const models = Object.keys(activeMcq.explanations);

  useEffect(() => {
    setActiveOption(activeMcq.correct_answer);
  }, [activeId, activeMcq.correct_answer]);

  const getOptions = () => {
    const optionSet = new Set<string>();
    models.forEach(model => {
      Object.keys(activeMcq.explanations[model] || {}).forEach(opt => optionSet.add(opt));
    });
    if (optionSet.size > 0) return Array.from(optionSet).sort();
    return ['A', 'B', 'C', 'D'].slice(0, activeMcq.no_of_options || 4);
  };

  const options = getOptions();

  useEffect(() => {
    localStorage.setItem('ag-mcq-votes-v2', JSON.stringify(votes));
  }, [votes]);

  // Vote for a model for the currently viewed option
  const handleVote = (model: string, option: string) => {
    setVotes(prev => ({
      ...prev,
      [activeId]: { ...(prev[activeId] || {}), [option]: model }
    }));
  };

  // A question is "voted" if at least one option has been voted
  const isQuestionVoted = (qid: number) => votes[qid] && Object.keys(votes[qid]).length > 0;

  // Total vote entries across all questions & options
  const totalVoteEntries = Object.values(votes).reduce((sum, optMap) => sum + Object.keys(optMap).length, 0);

  const getModelColor = (index: number) => {
    const colors = ['bg-slate-800', 'bg-blue-600', 'bg-purple-700'];
    return colors[index % colors.length];
  };
  const getModelAccent = (index: number) => {
    const accents = ['border-slate-700 bg-slate-50', 'border-blue-500 bg-blue-50', 'border-purple-600 bg-purple-50'];
    return accents[index % accents.length];
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden font-sans">
      <Header onShowVotes={() => setShowSummary(true)} />

      <main className="flex flex-1 overflow-hidden">
        <Sidebar
          questions={mcqData as MCQ[]}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id);
            setActiveOption('A');
          }}
          votes={votes}
          isQuestionVoted={isQuestionVoted}
        />

        <section className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Question Section - Compact */}
          <div className="px-6 py-3 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 shrink-0">
            <div className="flex justify-between items-start gap-4 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-brand uppercase tracking-widest">Q#{activeMcq.id}</span>
                {(activeMcq.solution_images_base64?.length || activeMcq.solution_image_urls?.length) > 0 && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">📎 {(activeMcq.solution_images_base64?.length || 0) + (activeMcq.solution_image_urls?.length || 0)}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(activeMcq.solution_images_base64?.length || 0) > 0 && (
                  <button
                    onClick={() => setSelectedImage({
                      src: activeMcq.solution_images_base64![0],
                      isBase64: true,
                      index: 0,
                      total: activeMcq.solution_images_base64!.length
                    })}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-xs transition-all"
                  >
                    Solution
                  </button>
                )}
                {(activeMcq.solution_image_urls?.length || 0) > 0 && (
                  <button
                    onClick={() => setSelectedImage({
                      src: activeMcq.solution_image_urls![0],
                      isBase64: false,
                      index: 0,
                      total: activeMcq.solution_image_urls!.length
                    })}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-all"
                  >
                    Reference
                  </button>
                )}
                <span className={`text-xs font-bold px-2 py-1 rounded ${isQuestionVoted(activeId) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {isQuestionVoted(activeId) ? `✓ ${Object.keys(votes[activeId] || {}).length} voted` : '○ Not voted'}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="bg-white p-3 rounded border border-blue-300 shadow-sm">
              <div className="text-base font-semibold text-slate-900 leading-relaxed">
                <MathContent content={activeMcq.question_text} size="base" />
              </div>
            </div>
          </div>

          {/* Options Selection - Much more compact */}
          <div className="px-6 py-2 border-b border-slate-200 bg-white shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-2 overflow-x-auto py-1 scroll-hide">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Options:</span>
              {options.map(opt => {
                const isCorrect = activeMcq.correct_answer === opt;
                const isActive = activeOption === opt;

                return (
                  <button
                    key={opt}
                    onClick={() => setActiveOption(opt)}
                    className={`relative min-w-[50px] h-9 rounded-full font-black text-sm transition-all flex items-center justify-center gap-1.5 border-2
                      ${isActive
                        ? 'bg-brand border-brand text-white shadow-lg scale-105'
                        : isCorrect
                          ? 'bg-green-50 border-green-400 text-green-700 hover:bg-green-100'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {opt}
                    {isCorrect && !isActive && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                    {isActive && isCorrect && <CheckCircle className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison Cards Section */}
          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/30">
            <div className="px-6 py-2.5 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 tracking-tight">Compare AI Reasoning</h4>
                  <p className="text-[10px] text-slate-400 font-medium -mt-0.5">
                    Viewing Option <span className="font-bold text-brand">{activeOption}</span>
                    {votes[activeId]?.[activeOption] && (
                      <span className="ml-2 text-green-600">· Best: <span className="font-black">{votes[activeId][activeOption].split('_').pop()}</span></span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {models.map((m, i) => (
                  <span key={m} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <div className={`w-2 h-2 rounded-full ${getModelColor(i)}`}></div>
                    {m.split('_').pop()?.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {models.map((model, idx) => {
                const exp = activeMcq.explanations[model]?.[activeOption];
                const isSelectedForOption = votes[activeId]?.[activeOption] === model;

                return (
                  <motion.div
                    key={model}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex flex-col rounded-2xl overflow-hidden border-2 transition-all duration-300
                      ${isSelectedForOption
                        ? 'border-brand ring-4 ring-brand/10 shadow-xl bg-white'
                        : 'border-slate-100 bg-white/70 hover:border-slate-300 hover:bg-white hover:shadow-lg'}`}
                  >
                    {/* Compact model header strip */}
                    <div className={`px-4 py-2 flex items-center justify-between ${getModelColor(idx)}`}>
                      <span className="text-white font-black text-xs uppercase tracking-widest">{model.split('_').pop()}</span>
                      {isSelectedForOption && (
                        <span className="flex items-center gap-1 bg-white/20 rounded px-2 py-0.5 text-white text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Best for {activeOption}
                        </span>
                      )}
                    </div>

                    {/* Content - main focus */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {exp ? (
                        <>
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">💡 Correct Understanding</span>
                            <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100">
                              <MathContent content={exp.explanation} size="base" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">🎓 Why Your Answer Seems Right</span>
                            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100">
                              <MathContent content={exp.why_right} size="base" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">🧠 Key Concept</span>
                            <div className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-100">
                              <MathContent content={exp.core_concept} size="base" />
                            </div>
                          </div>

                          {exp.next_step && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-black text-green-600 uppercase tracking-wider">🚀What to do next</span>
                              <div className="bg-green-50 p-3.5 rounded-xl border border-green-100">
                                <MathContent content={exp.next_step} size="base" />
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center text-slate-300">
                          <HelpCircle size={28} strokeWidth={1} className="mb-2" />
                          <span className="text-xs font-bold uppercase tracking-widest">No data for this option</span>
                        </div>
                      )}
                    </div>

                    {/* Per-option vote footer - improved UX */}
                    <div className="px-4 pb-4 pt-3 border-t border-slate-100 space-y-2">
                      {/* Primary: vote for currently viewed option */}
                      <button
                        onClick={() => handleVote(model, activeOption)}
                        disabled={!exp}
                        className={`w-full py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-2
                          ${isSelectedForOption
                            ? 'bg-brand text-white shadow-md shadow-brand/20'
                            : !exp
                              ? 'bg-slate-50 text-slate-200 cursor-not-allowed border border-slate-100'
                              : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-brand hover:text-brand hover:bg-orange-50'}`}
                      >
                        {isSelectedForOption
                          ? <><CheckCircle2 className="w-3.5 h-3.5" /> Best for Option {activeOption}</>
                          : <>Pick as Best · Option {activeOption}</>}
                      </button>

                      {/* Secondary: vote chips for other options */}
                      {options.filter(o => o !== activeOption).length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Other options:</span>
                          {options.filter(o => o !== activeOption).map(opt => {
                            const isVotedHere = votes[activeId]?.[opt] === model;
                            const hasOtherVote = votes[activeId]?.[opt] && !isVotedHere;
                            const optExp = activeMcq.explanations[model]?.[opt];
                            return (
                              <button
                                key={opt}
                                onClick={() => handleVote(model, opt)}
                                disabled={!optExp || !!hasOtherVote}
                                title={`Mark as best for Option ${opt}`}
                                className={`px-2 py-0.5 rounded text-[10px] font-black border transition-all
                                  ${isVotedHere
                                    ? 'bg-brand border-brand text-white'
                                    : hasOtherVote
                                      ? 'bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed'
                                      : !optExp
                                        ? 'bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed'
                                        : 'bg-white border-slate-200 text-slate-400 hover:border-brand hover:text-brand'}`}
                              >
                                {opt}{isVotedHere ? ' ✓' : ''}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer voteCount={totalVoteEntries} total={(mcqData as MCQ[]).length} />

      <AnimatePresence>
        {showSplash && (
          <SplashScreen onDone={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSummary && (
          <VoteSummary
            votes={votes}
            onClose={() => setShowSummary(false)}
            onClearVotes={() => {
              localStorage.removeItem('ag-mcq-votes-v2');
              setVotes({});
              setShowSummary(false);
            }}
            questions={mcqData as MCQ[]}
          />
        )}
        {selectedImage && (
          <ImageModal
            image={selectedImage.src}
            isBase64={selectedImage.isBase64}
            count={selectedImage.total}
            currentIndex={selectedImage.index}
            onClose={() => setSelectedImage(null)}
            onNext={() => {
              if (selectedImage.index < selectedImage.total - 1) {
                const newIndex = selectedImage.index + 1;
                const images = selectedImage.isBase64 ? activeMcq.solution_images_base64 : activeMcq.solution_image_urls;
                if (images?.[newIndex]) {
                  setSelectedImage({
                    src: images[newIndex],
                    isBase64: selectedImage.isBase64,
                    index: newIndex,
                    total: selectedImage.total
                  });
                }
              }
            }}
            onPrev={() => {
              if (selectedImage.index > 0) {
                const newIndex = selectedImage.index - 1;
                const images = selectedImage.isBase64 ? activeMcq.solution_images_base64 : activeMcq.solution_image_urls;
                if (images?.[newIndex]) {
                  setSelectedImage({
                    src: images[newIndex],
                    isBase64: selectedImage.isBase64,
                    index: newIndex,
                    total: selectedImage.total
                  });
                }
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
