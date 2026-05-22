import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import QuestionCard from '../components/QuestionCard';
import FilterBar from '../components/FilterBar';
import AskQuestionModal from '../components/AskQuestionModal';
import { Link } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ school: '', major: '', cohort: '', subject: '' });

  const fetchQuestions = async () => {
    setLoading(true);
    const data = await base44.entities.Question.list('-created_date', 100);
    setQuestions(data);
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, []);

  const filtered = questions.filter(q => {
    const matchSearch = !searchQuery ||
      q.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSchool = !filters.school || q.school === filters.school;
    const matchMajor = !filters.major || q.major === filters.major;
    const matchCohort = !filters.cohort || q.cohort === filters.cohort;
    const matchSubject = !filters.subject || (q.subject && q.subject.toLowerCase().includes(filters.subject.toLowerCase()));
    return matchSearch && matchSchool && matchMajor && matchCohort && matchSubject;
  });

  const handleReport = (id, deleted, newCount) => {
    if (deleted) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    } else {
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, report_count: newCount } : q));
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      {/* Hero */}
      <div className="bg-yellow-400 border-b-4 border-black px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto flex justify-end mb-2">
          <NotificationBell />
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl md:text-8xl mb-2">🐔</div>
          <h1 className="font-lexend font-black text-3xl md:text-5xl text-black leading-tight tracking-tight">
            The Chicken's<br />Whisper
          </h1>
          <p className="mt-2 font-grotesk font-medium text-black/70 text-sm md:text-base">
            Hỏi bài ẩn danh · Trả lời ẩn danh · Không cần đăng nhập 🤫
          </p>
          <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 px-8 py-4 bg-black text-yellow-400 font-lexend font-black text-lg rounded-2xl border-2 border-black shadow-[4px_4px_0px_#FFD600] hover:shadow-[6px_6px_0px_#FFD600] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            🐔 Thì thầm câu hỏi mới
          </button>
          <Link
            to="/history"
            className="px-6 py-4 bg-white text-black font-lexend font-black text-lg rounded-2xl border-2 border-black shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            📜 Lịch sử của tôi
          </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="flex items-center justify-between">
          <h2 className="font-lexend font-black text-xl">
            {filtered.length === 0 && !loading ? '😢 Không tìm thấy câu hỏi nào' : `${filtered.length} câu hỏi đang chờ 🧠`}
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="text-5xl animate-bounce">🐔</div>
            <p className="font-grotesk font-medium text-gray-500">Gà đang tải câu hỏi...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(q => (
              <QuestionCard key={q.id} question={q} onReport={handleReport} />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🐔💭</div>
                <p className="font-grotesk font-bold text-gray-400 text-lg">Chưa có câu hỏi nào phù hợp</p>
                <p className="font-grotesk text-gray-400 text-sm mt-1">Hãy là người đầu tiên thì thầm!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <AskQuestionModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchQuestions}
        />
      )}
    </div>
  );
}