import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Send, Trash2, Clock, Settings, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import FileUpload from '../components/FileUpload';
import NotificationBell from '../components/NotificationBell';
import { getMyBugReportIds, saveMyBugReport, removeMyBugReport } from '../lib/userHistory';

export default function BugReport() {
  const { user, appPublicSettings } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (user?.email) {
        // Fetch reports for logged-in user
        const data = await base44.entities.BugReport.filter({ user_email: user.email }, '-created_date');
        setReports(data);
      } else {
        // Fetch reports using local history for anonymous user
        const reportIds = getMyBugReportIds();
        if (reportIds.length > 0) {
          const fetched = await Promise.all(
            reportIds.map(id => base44.entities.BugReport.get(id).catch(() => null))
          );
          setReports(fetched.filter(Boolean));
        } else {
          setReports([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bug reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);

    try {
      // 1. Create the private BugReport entity
      const report = await base44.entities.BugReport.create({
        user_email: user?.email || 'anonymous',
        title: title.trim(),
        description: description.trim(),
        file_url: attachedFile?.url || undefined,
        file_name: attachedFile?.name || undefined,
        status: 'Đã gửi ⏳',
        created_date: new Date().toISOString(),
      });

      // 2. Save to local history if anonymous
      if (!user) {
        saveMyBugReport(report.id);
      }

      // 3. Send Notification to Admin
      const adminEmail = appPublicSettings?.created_by || 'admin@thechickenswhisper.com';
      await base44.entities.Notification.create({
        user_email: adminEmail,
        type: 'bug_report',
        question_id: '',
        message: `🚨 Báo lỗi mới: "${title.trim().slice(0, 50)}${title.trim().length > 50 ? '...' : ''}" từ người dùng ẩn danh.`,
        read: false,
      });

      // Reset form and reload
      setTitle('');
      setDescription('');
      setAttachedFile(null);
      await fetchReports();
    } catch (error) {
      console.error('Failed to submit bug report:', error);
      alert('Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (report) => {
    if (!confirm('Xóa báo cáo lỗi này khỏi lịch sử của bạn?')) return;
    try {
      await base44.entities.BugReport.delete(report.id);
      if (!user) {
        removeMyBugReport(report.id);
      }
      setReports(prev => prev.filter(r => r.id !== report.id));
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đang xử lý ⚙️':
        return (
          <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-600 border border-blue-400">
            <Settings className="w-3.5 h-3.5 animate-spin" /> Đang xử lý
          </span>
        );
      case 'Đã xử lý ✅':
        return (
          <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-600 border border-green-400">
            <CheckCircle className="w-3.5 h-3.5" /> Đã sửa lỗi
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-600 border border-yellow-400">
            <Clock className="w-3.5 h-3.5" /> Đã gửi
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      {/* Header */}
      <div className="bg-yellow-400 border-b-4 border-black px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/" className="p-2 bg-black text-yellow-400 rounded-xl hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-lexend font-black text-xl flex-1">🐛 Báo cáo lỗi hệ thống</span>
          <NotificationBell />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Banner */}
        <div className="bg-red-50 border-4 border-black rounded-3xl p-5 shadow-[4px_4px_0px_black] flex gap-3 items-start">
          <AlertTriangle className="w-8 h-8 text-rose-500 shrink-0" />
          <div>
            <h3 className="font-lexend font-black text-lg text-black">Báo cáo lỗi riêng tư</h3>
            <p className="font-grotesk font-medium text-sm text-gray-600 mt-1 leading-relaxed">
              Các báo cáo lỗi của bạn hoàn toàn bảo mật và chỉ được hiển thị với bạn và ban quản trị. Chúng tôi sẽ nhanh chóng khắc phục để đem lại trải nghiệm tốt nhất.
            </p>
          </div>
        </div>

        {/* Form Báo Lỗi */}
        <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_black]">
          <h2 className="font-lexend font-black text-xl mb-4">✍️ Gửi báo cáo lỗi mới hoặc những cái thiếu sót</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-lexend font-black text-sm mb-1">Tiêu đề lỗi <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ví dụ: Lỗi không tải được ảnh bài tập, Lỗi font chữ..."
                required
                className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block font-lexend font-black text-sm mb-1">Mô tả chi tiết <span className="text-rose-500">*</span></label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Mô tả cụ thể sự cố xảy ra, các bước gặp lỗi để quản trị viên dễ dàng tìm và khắc phục nhé..."
                rows={5}
                required
                className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block font-lexend font-black text-sm mb-2">Hình ảnh / Tệp tin minh họa (nếu có)</label>
              <FileUpload onUpload={setAttachedFile} />
            </div>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !description.trim()}
              className="w-full py-3.5 bg-rose-400 hover:bg-rose-300 border-2 border-black rounded-2xl font-lexend font-black text-lg transition-all shadow-[4px_4px_0px_black] hover:shadow-[2px_2px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? '⏳ Đang gửi báo cáo...' : <><Send className="w-5 h-5" /> Gửi báo cáo lỗi 🐛</>}
            </button>
          </form>
        </div>

        {/* Lịch Sử Báo Lỗi Của Tôi */}
        <div>
          <h2 className="font-lexend font-black text-xl mb-4">📜 Lịch sử báo lỗi của bạn</h2>
          {loading ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="text-5xl animate-bounce">🐔</div>
              <p className="font-grotesk text-gray-400">Đang tải lịch sử báo lỗi...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-400 rounded-3xl py-12 text-center">
              <div className="text-5xl mb-3">😇</div>
              <p className="font-grotesk font-bold text-gray-500">Tuyệt vời! Bạn chưa báo cáo lỗi nào.</p>
              <p className="font-grotesk text-gray-400 text-sm mt-1">Hệ thống đang vận hành rất trơn tru.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map(r => (
                <div key={r.id} className="bg-white border-2 border-black rounded-2xl p-5 shadow-[3px_3px_0px_black] space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-lexend font-black text-base text-gray-800 leading-snug">{r.title}</h3>
                    <button
                      onClick={() => handleDelete(r)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-300 rounded-xl text-red-500 hover:text-red-700 transition-colors"
                      title="Xóa khỏi lịch sử"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-grotesk text-sm text-gray-600 leading-relaxed whitespace-pre-line">{r.description}</p>
                  
                  {r.file_url && (
                    <div className="pt-1">
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-700 hover:underline bg-yellow-50 px-3 py-1 rounded-full border border-yellow-300"
                      >
                        📎 Xem ảnh minh họa
                      </a>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-400 font-grotesk">
                      Gửi {formatDistanceToNow(new Date(r.created_date), { addSuffix: true, locale: vi })}
                    </span>
                    {getStatusBadge(r.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
