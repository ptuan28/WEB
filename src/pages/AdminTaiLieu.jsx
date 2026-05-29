import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Check, X, Plus, ExternalLink, Trash2, FileText } from 'lucide-react';

export default function AdminTaiLieu() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', block: 'Kinh tế', exam_type: 'Giữa kỳ', file_url: '', description: '' });

  const ADMIN_EMAIL = 'fantuan0203@gmail.com';

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;
    fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Document.list('-created_date', 200);
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doc) => {
    try {
      await base44.entities.Document.update(doc.id, { status: 'approved' });
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'approved' } : d));
    } catch (err) { console.error(err); }
  };

  const handleReject = async (doc) => {
    if (!confirm('Từ chối tài liệu này?')) return;
    try {
      await base44.entities.Document.update(doc.id, { status: 'rejected' });
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'rejected' } : d));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (doc) => {
    if (!confirm('Xóa tài liệu này vĩnh viễn?')) return;
    try {
      await base44.entities.Document.delete(doc.id);
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
    } catch (err) { console.error(err); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const doc = await base44.entities.Document.create({
        ...form,
        uploaded_by: user.email,
        status: 'approved',
        created_date: new Date().toISOString(),
      });
      setDocuments(prev => [doc, ...prev]);
      setShowAddModal(false);
      setForm({ title: '', subject: '', block: 'Kinh tế', exam_type: 'Giữa kỳ', file_url: '', description: '' });
    } catch (err) {
      alert('Thêm thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="font-lexend font-black text-xl">Không có quyền truy cập</p>
          <Link to="/" className="mt-4 inline-block text-yellow-600 font-bold underline">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  const filtered = documents.filter(d => d.status === tab);

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      <div className="bg-yellow-400 border-b-4 border-black px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link to="/" className="p-2 bg-black text-yellow-400 rounded-xl hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-lexend font-black text-xl flex-1">⚙️ Admin — Tài liệu</span>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-yellow-400 rounded-xl font-lexend font-black text-sm hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> Thêm tài liệu
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Chờ duyệt', key: 'pending', color: 'bg-yellow-100 border-yellow-400 text-yellow-700' },
            { label: 'Đã duyệt', key: 'approved', color: 'bg-green-100 border-green-400 text-green-700' },
            { label: 'Từ chối', key: 'rejected', color: 'bg-red-100 border-red-400 text-red-700' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setTab(s.key)}
              className={`p-4 border-2 rounded-2xl text-center transition-all ${tab === s.key ? s.color + ' border-2' : 'bg-white border-black'}`}
            >
              <p className="font-lexend font-black text-2xl">{documents.filter(d => d.status === s.key).length}</p>
              <p className="font-grotesk text-sm font-bold">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Document list */}
        {loading ? (
          <div className="text-center py-10">
            <div className="text-4xl animate-bounce">🐔</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-2xl">
            <p className="font-grotesk text-gray-400">Không có tài liệu nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(doc => (
              <div key={doc.id} className="bg-white border-2 border-black rounded-2xl p-4 shadow-[2px_2px_0px_black]">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-rose-100 border-2 border-black rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-lexend font-black text-sm">{doc.title}</h3>
                    <p className="font-grotesk text-xs text-gray-500 mt-0.5">
                      {doc.subject} · {doc.block} · {doc.exam_type} · {doc.uploaded_by}
                    </p>
                    {doc.description && <p className="font-grotesk text-xs text-gray-400 mt-1">{doc.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={doc.file_url} target="_blank" rel="noreferrer"
                      className="p-1.5 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors">
                      <ExternalLink className="w-4 h-4 text-blue-500" />
                    </a>
                    {tab === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(doc)}
                          className="p-1.5 bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 transition-colors">
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                        <button onClick={() => handleReject(doc)}
                          className="p-1.5 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition-colors">
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(doc)}
                      className="p-1.5 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal thêm tài liệu */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-3xl p-6 w-full max-w-md shadow-[8px_8px_0px_black]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-lexend font-black text-xl">➕ Thêm tài liệu</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Tên tài liệu *" required
                className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="Môn học"
                className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.block} onChange={e => setForm(p => ({ ...p, block: e.target.value }))}
                  className="border-2 border-black rounded-2xl p-3 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  <option>Kinh tế</option>
                  <option>Kỹ thuật</option>
                </select>
                <select value={form.exam_type} onChange={e => setForm(p => ({ ...p, exam_type: e.target.value }))}
                  className="border-2 border-black rounded-2xl p-3 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  <option>Giữa kỳ</option>
                  <option>Cuối kỳ</option>
                </select>
              </div>
              <input type="url" value={form.file_url} onChange={e => setForm(p => ({ ...p, file_url: e.target.value }))}
                placeholder="Link tài liệu (Google Drive/PDF) *" required
                className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Mô tả thêm..." rows={2}
                className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 border-2 border-black rounded-2xl font-lexend font-black text-base transition-all shadow-[3px_3px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50">
                {submitting ? '⏳ Đang thêm...' : '➕ Thêm tài liệu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
