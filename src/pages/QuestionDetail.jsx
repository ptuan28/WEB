import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Send, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import AnswerCard from '../components/AnswerCard';
import NotificationBell from '../components/NotificationBell';
import { getAnonIdentity } from '../lib/anonymousUser';
import { saveMyAnswer } from '../lib/userHistory';
import ImageCapture from '../components/ImageCapture';
import FileUpload from '../components/FileUpload';

export default function QuestionDetail() {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [imageData, setImageData] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [q, ans] = await Promise.all([
        base44.entities.Question.get(questionId),
        base44.entities.Answer.filter({ question_id: questionId }, 'created_date'),
      ]);
      setQuestion(q);
      setAnswers(ans);
      setLoading(false);
    };
    load();
  }, [questionId]);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true);

    try {
      let image_url = null;
      if (imageData) {
        const blob = await (await fetch(imageData)).blob();
        const file = new File([blob], 'answer.jpg', { type: 'image/jpeg' });
        const res = await base44.integrations.Core.UploadFile({ file });
        image_url = res.file_url;
      }

      const answer = await base44.entities.Answer.create({
        question_id: questionId,
        text: answerText,
        image_url: image_url || undefined,
        file_url: attachedFile?.url || undefined,
        file_name: attachedFile?.name || undefined,
        report_count: 0,
      });

      saveMyAnswer(answer.id);

      if (question.created_by) {
        try {
          let myEmail = null;
          try {
            const me = await base44.auth.me();
            myEmail = me?.email ?? null;
          } catch {
            // Người dùng ẩn danh, không có session
          }

          if (myEmail !== question.created_by) {
            await base44.entities.Notification.create({
              user_email: question.created_by,
              type: 'answer',
              question_id: questionId,
              message: `Có người vừa trả lời câu hỏi của bạn: "${question.text.slice(0, 60)}${question.text.length > 60 ? '...' : ''}"`,
              read: false,
            });
          }
        } catch {
          // Notification fail cũng không sao
        }
      }

      setAnswers(prev => [...prev, answer]);
      setAnswerText('');
      setImageData(null);
      setAttachedFile(null);
    } catch (err) {
      console.error('Lỗi khi gửi câu trả lời:', err);
      alert('Gửi thất bại! Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportQuestion = async () => {
    const newCount = (question.report_count || 0) + 1;
    if (newCount >= 5) {
      await base44.entities.Question.delete(question.id);
      window.location.href = '/';
    } else {
      await base44.entities.Question.update(question.id, { report_count: newCount });
      setQuestion(q => ({ ...q, report_count: newCount }));
    }
  };

  const handleDeleteAnswer = (id) => {
    setAnswers(prev => prev.filter(a => a.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center gap-4">
      <div className="text-6xl animate-bounce">🐔</div>
      <p className="font-grotesk font-medium text-gray-500">Gà đang tải...</p>
    </div>
  );

  if (!question) return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center gap-4">
      <div className="text-6xl">😵</div>
      <p className="font-grotesk font-bold text-gray-500">Câu hỏi không tồn tại hoặc đã bị xóa</p>
      <Link to="/" className="bg-yellow-400 border-2 border-black px-6 py-2 rounded-2xl font-bold">← Về nhà</Link>
    </div>
  );

  const tags = [question.school, question.major, question.cohort ? `K${question.cohort}` : null, question.subject].filter(Boolean);
  const tagColors = ['bg-yellow-300', 'bg-pink-300', 'bg-blue-200', 'bg-green-200'];

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      <div className="bg-yellow-400 border-b-4 border-black px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/" className="p-2 bg-black text-yellow-400 rounded-xl hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-lexend font-black text-xl flex-1">🐔 The Chicken's Whisper</span>
          <NotificationBell />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Question */}
        <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_black]">
          <div className="flex items-start justify-between mb-3">
            {(() => {
              const { name, emoji, color } = getAnonIdentity(question.created_by);
              return (
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full ${color} border-2 border-black flex items-center justify-center text-sm`}>{emoji}</span>
                  <span className="text-xs font-bold text-gray-600 font-grotesk">{name}</span>
                  <span className="text-xs text-gray-400 font-grotesk">• {formatDistanceToNow(new Date(question.created_date), { addSuffix: true, locale: vi })}</span>
                </div>
              );
            })()}
            <button onClick={handleReportQuestion} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-bold">
              <Flag className="w-3.5 h-3.5" /> Report ({question.report_count || 0}/5)
            </button>
          </div>

          {question.image_url && (
            <img src={question.image_url} alt="question" className="w-full max-h-64 object-contain rounded-2xl border-2 border-black mb-4 bg-gray-50" />
          )}

          <p className="font-grotesk font-semibold text-base md:text-lg leading-relaxed">{question.text}</p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {tags.map((tag, i) => (
                <span key={tag} className={`${tagColors[i % tagColors.length]} border border-black text-xs font-bold px-3 py-1 rounded-full`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Answers */}
        <div>
          <h2 className="font-lexend font-black text-xl mb-4">
            {answers.length === 0 ? '😶 Chưa có ai trả lời' : `${answers.length} câu trả lời 🧠`}
          </h2>
          <div className="space-y-4">
            {answers.map(a => (
              <AnswerCard key={a.id} answer={a} questionCreatedBy={question.created_by} onDelete={handleDeleteAnswer} />
            ))}
          </div>
        </div>

        {/* Answer Form */}
        <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-[4px_4px_0px_black]">
          <h3 className="font-lexend font-black text-lg mb-4">✍️ Trả lời ẩn danh</h3>
          <form onSubmit={handleAnswerSubmit} className="space-y-4">
            <textarea
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              placeholder="Chia sẻ kiến thức của bạn... Đừng ngại, mình ẩn danh mà! 🤫"
              rows={4}
              required
              className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <div className="flex flex-wrap gap-3">
              <ImageCapture onImage={setImageData} />
              <FileUpload onUpload={setAttachedFile} />
            </div>
            <button
              type="submit"
              disabled={submitting || !answerText.trim()}
              className="w-full py-3 bg-yellow-400 border-2 border-black rounded-2xl font-lexend font-black text-lg hover:bg-yellow-300 transition-all shadow-[4px_4px_0px_black] hover:shadow-[2px_2px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? '⏳ Đang gửi...' : <><Send className="w-5 h-5" /> Gửi câu trả lời 🐔</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}