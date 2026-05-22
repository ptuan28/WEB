import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Flag, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function QuestionCard({ question, onReport }) {
  const handleReport = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newCount = (question.report_count || 0) + 1;
    if (newCount >= 5) {
      await base44.entities.Question.delete(question.id);
      onReport(question.id, true);
    } else {
      await base44.entities.Question.update(question.id, { report_count: newCount });
      onReport(question.id, false, newCount);
    }
  };

  const tags = [question.school, question.major, question.cohort ? `K${question.cohort}` : null, question.subject].filter(Boolean);
  const tagColors = ['bg-yellow-300', 'bg-pink-300', 'bg-blue-200', 'bg-green-200'];

  return (
    <Link to={`/question/${question.id}`}>
      <div className="bg-white border-2 border-black rounded-3xl p-5 shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer group">
        {question.image_url && (
          <img src={question.image_url} alt="question" className="w-full h-40 object-cover rounded-2xl border-2 border-black mb-3" />
        )}

        <p className="font-grotesk font-medium text-sm md:text-base leading-relaxed mb-3 line-clamp-3">
          {question.text}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag, i) => (
              <span key={tag} className={`${tagColors[i % tagColors.length]} border border-black text-xs font-bold px-2 py-0.5 rounded-full`}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 font-grotesk">
          <span>🐔 Gà ẩn danh • {formatDistanceToNow(new Date(question.created_date), { addSuffix: true, locale: vi })}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> trả lời</span>
            <button
              onClick={handleReport}
              className="flex items-center gap-1 text-red-400 hover:text-red-600 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" /> {question.report_count || 0}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}