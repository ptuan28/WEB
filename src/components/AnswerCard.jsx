import { useState } from 'react';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { Flag, MessageCircle, ChevronDown, ChevronUp, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import CommentSection from './CommentSection';
import { getAnonIdentity } from '../lib/anonymousUser';

export default function AnswerCard({ answer, onDelete, questionCreatedBy }) {
  const [comments, setComments] = useState([]);
  const [lightbox, setLightbox] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      const data = await base44.entities.Comment.filter({ answer_id: answer.id }, 'created_date');
      setComments(data);
      setLoadingComments(false);
    }
    setShowComments(v => !v);
  };

  const handleReport = async () => {
    const newCount = (answer.report_count || 0) + 1;
    if (newCount >= 5) {
      await base44.entities.Answer.delete(answer.id);
      onDelete(answer.id);
    } else {
      await base44.entities.Answer.update(answer.id, { report_count: newCount });
    }
  };

  const { name, emoji, color } = getAnonIdentity(answer.created_by);
  const isOP = answer.created_by && answer.created_by === questionCreatedBy;

  return (
    <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_black]">
      {answer.image_url && (
        <>
          <img
            src={answer.image_url}
            alt="answer"
            onClick={() => setLightbox(true)}
            className="w-full max-h-52 object-contain rounded-xl border-2 border-black mb-3 bg-gray-50 cursor-zoom-in hover:opacity-90 transition-opacity"
          />
          {lightbox && createPortal(
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
              onClick={() => setLightbox(false)}
            >
              <img
                src={answer.image_url}
                alt="full"
                style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '16px', border: '4px solid white' }}
                onClick={e => e.stopPropagation()}
              />
              <button
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'white', border: '2px solid black', borderRadius: '50%', width: '36px', height: '36px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setLightbox(false)}
              >✕</button>
            </div>,
            document.body
          )}
        </>
      )}

      {answer.file_url && (
        <a
          href={answer.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-yellow-100 border-2 border-black rounded-xl text-sm font-grotesk font-semibold hover:bg-yellow-200 transition-colors"
        >
          <Paperclip className="w-4 h-4" />
          {answer.file_name || 'Tải file đính kèm'}
        </a>
      )}

      <p className="font-grotesk text-sm md:text-base leading-relaxed">{answer.text}</p>

      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full ${color} border-2 border-black flex items-center justify-center text-xs`}>{emoji}</span>
          <span className="font-bold text-gray-600">{name}</span>
          {isOP && <span className="bg-yellow-400 border border-black text-[10px] font-black px-1.5 py-0.5 rounded-full">OP</span>}
          <span className="text-gray-400">• {formatDistanceToNow(new Date(answer.created_date), { addSuffix: true, locale: vi })}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleComments} className="flex items-center gap-1 hover:text-yellow-600 font-bold">
            <MessageCircle className="w-3.5 h-3.5" />
            {loadingComments ? '...' : comments.length}
            {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button onClick={handleReport} className="flex items-center gap-1 text-red-400 hover:text-red-600">
            <Flag className="w-3.5 h-3.5" /> {answer.report_count || 0}
          </button>
        </div>
      </div>

      {showComments && (
        <CommentSection answerId={answer.id} comments={comments} setComments={setComments} questionCreatedBy={questionCreatedBy} answerCreatedBy={answer.created_by} questionId={answer.question_id} />
      )}
    </div>
  );
}