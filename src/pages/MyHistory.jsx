import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Trash2, MessageCircle, HelpCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getMyQuestionIds, getMyAnswerIds, removeMyQuestion, removeMyAnswer } from '../lib/userHistory';

export default function MyHistory() {
  const [tab, setTab] = useState('questions');
  const [myQuestions, setMyQuestions] = useState([]);
  const [myAnswers, setMyAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const qIds = getMyQuestionIds();
      const aIds = getMyAnswerIds();

      const [questions, answers] = await Promise.all([
        qIds.length > 0 ? Promise.all(qIds.map(id => base44.entities.Question.get(id).catch(() => null))) : Promise.resolve([]),
        aIds.length > 0 ? Promise.all(aIds.map(id => base44.entities.Answer.get(id).catch(() => null))) : Promise.resolve([]),
      ]);

      setMyQuestions(questions.filter(Boolean));
      setMyAnswers(answers.filter(Boolean));
      setLoading(false);
    };
    load();
  }, []);

  const handleDeleteQuestion = async (question) => {
    if (!confirm('Xóa câu hỏi này? Toàn bộ câu trả lời liên quan cũng bị xóa.')) return;
    await base44.entities.Question.delete(question.id);
    removeMyQuestion(question.id);
    setMyQuestions(prev => prev.filter(q => q.id !== question.id));
  };

  const handleDeleteAnswer = async (answer) => {
    if (!confirm('Xóa câu trả lời này?')) return;
    await base44.entities.Answer.delete(answer.id);
    removeMyAnswer(answer.id);
    setMyAnswers(prev => prev.filter(a => a.id !== answer.id));
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      <div className="bg-yellow-400 border-b-4 border-black px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/" className="p-2 bg-black text-yellow-400 rounded-xl hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-lexend font-black text-xl">📜 Lịch sử của tôi</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('questions')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-black font-lexend font-black text-sm transition-all shadow-[3px_3px_0px_black] hover:shadow-[1px_1px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 ${tab === 'questions' ? 'bg-yellow-400' : 'bg-white'}`}
          >
            <HelpCircle className="w-4 h-4" />
            Câu hỏi đã hỏi ({myQuestions.length})
          </button>
          <button
            onClick={() => setTab('answers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-black font-lexend font-black text-sm transition-all shadow-[3px_3px_0px_black] hover:shadow-[1px_1px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 ${tab === 'answers' ? 'bg-pink-400' : 'bg-white'}`}
          >
            <MessageCircle className="w-4 h-4" />
            Câu trả lời ({myAnswers.length})
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="text-5xl animate-bounce">🐔</div>
            <p className="font-grotesk text-gray-400">Đang tải lịch sử...</p>
          </div>
        ) : tab === 'questions' ? (
          <div className="space-y-4">
            {myQuestions.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-3">🐣</div>
                <p className="font-grotesk font-bold text-gray-400">Bạn chưa đặt câu hỏi nào</p>
              </div>
            ) : myQuestions.map(q => (
              <div key={q.id} className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_black]">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/question/${q.id}`} className="flex-1 group">
                    <p className="font-grotesk font-medium text-sm leading-relaxed group-hover:text-yellow-700 transition-colors line-clamp-3">
                      {q.text}
                    </p>
                  </Link>
                  <button
                    onClick={() => handleDeleteQuestion(q)}
                    className="flex-shrink-0 p-2 bg-red-100 hover:bg-red-200 border-2 border-red-400 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[q.school, q.major, q.cohort ? `K${q.cohort}` : null, q.subject].filter(Boolean).map(tag => (
                    <span key={tag} className="bg-yellow-100 border border-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 font-grotesk">
                  🐔 {formatDistanceToNow(new Date(q.created_date), { addSuffix: true, locale: vi })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {myAnswers.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-3">🐣</div>
                <p className="font-grotesk font-bold text-gray-400">Bạn chưa trả lời câu hỏi nào</p>
              </div>
            ) : myAnswers.map(a => (
              <div key={a.id} className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_black]">
                <div className="flex items-start justify-between gap-3">
                  <p className="flex-1 font-grotesk text-sm leading-relaxed line-clamp-3">{a.text}</p>
                  <button
                    onClick={() => handleDeleteAnswer(a)}
                    className="flex-shrink-0 p-2 bg-red-100 hover:bg-red-200 border-2 border-red-400 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-400 font-grotesk">
                    🐔 {formatDistanceToNow(new Date(a.created_date), { addSuffix: true, locale: vi })}
                  </p>
                  <Link to={`/question/${a.question_id}`} className="text-xs font-bold text-yellow-700 hover:underline">
                    Xem câu hỏi →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}