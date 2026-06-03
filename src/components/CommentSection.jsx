import { useState } from 'react';
import { getAnonIdentity, getAnonUserId } from '../lib/anonymousUser';
import { base44 } from '@/api/base44Client';
import { Flag, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '@/lib/AuthContext'; // Import useAuth
import { toast } from 'sonner'; // Import toast

export default function CommentSection({ answerId, comments, setComments, questionCreatedBy, answerCreatedBy, questionId }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth(); // Lấy trạng thái đăng nhập

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!isAuthenticated) { // Kiểm tra người dùng đã đăng nhập chưa
      toast.error('Bạn cần đăng nhập để bình luận!');
      return;
    }

    setLoading(true);
    try {
      const comment = await base44.entities.Comment.create({ answer_id: answerId, text, report_count: 0, created_by: getAnonUserId() });

      if (comment) { // Đảm bảo comment đã được tạo thành công
        setComments(prev => [...prev, comment]);
        setText('');
        toast.success('Bình luận đã được gửi!');

        if (answerCreatedBy) {
          try {
            const me = await base44.auth.me();
            if (me.email !== answerCreatedBy) {
              await base44.entities.Notification.create({
                user_email: answerCreatedBy,
                type: 'comment',
                question_id: questionId || comment.answer_id,
                message: `Có người vừa bình luận vào câu trả lời của bạn: "${text.slice(0, 60)}${text.length > 60 ? '...' : ''}"`,
                read: false,
              });
            }
          } catch (notificationError) {
            console.error('Lỗi khi tạo thông báo:', notificationError);
            // Có thể hiển thị toast cảnh báo cho người dùng về lỗi thông báo nếu cần
          }
        }
      } else {
        // Trường hợp comment là null/undefined dù không throw lỗi
        toast.error('Có lỗi xảy ra khi gửi bình luận. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi khi gửi bình luận:', error);
      toast.error('Không thể gửi bình luận. Vui lòng thử lại hoặc đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (comment) => {
    // ... (giữ nguyên logic hiện tại)
    const newCount = (comment.report_count || 0) + 1;
    if (newCount >= 5) {
      await base44.entities.Comment.delete(comment.id);
      setComments(prev => prev.filter(c => c.id !== comment.id));
    } else {
      await base44.entities.Comment.update(comment.id, { report_count: newCount });
      setComments(prev => prev.map(c => c.id === comment.id ? { ...c, report_count: newCount } : c));
    }
  };

  return (
    <div className="ml-4 mt-3 space-y-2 border-l-2 border-dashed border-gray-300 pl-4">
      {comments.map(c => (
        <div key={c.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
          {(() => {
            const { name, emoji, color } = getAnonIdentity(c.created_by);
            const isOP = c.created_by && c.created_by === questionCreatedBy;
            return (
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`w-5 h-5 rounded-full ${color} border border-black flex items-center justify-center text-[10px]`}>{emoji}</span>
                <span className="text-xs font-bold text-gray-600">{name}</span>
                {isOP && <span className="bg-yellow-400 border border-black text-[9px] font-black px-1 py-0.5 rounded-full">OP</span>}
              </div>
            );
          })()}
          <p className="text-sm font-grotesk">{c.text}</p>
          <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
            <span>{formatDistanceToNow(new Date(c.created_date), { addSuffix: true, locale: vi })}</span>
            <button onClick={() => handleReport(c)} className="flex items-center gap-1 text-red-400 hover:text-red-600">
              <Flag className="w-3 h-3" /> {c.report_count || 0}
            </button>
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Bình luận thêm... 💬"
          className="flex-1 border-2 border-gray-300 rounded-xl px-3 py-1.5 text-sm font-grotesk focus:outline-none focus:border-yellow-400"
        />
        <button
          type="submit"
          disabled={loading || !text.trim() || !isAuthenticated} // Disable nếu chưa đăng nhập
          className="p-1.5 bg-yellow-400 border-2 border-black rounded-xl hover:bg-yellow-300 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}