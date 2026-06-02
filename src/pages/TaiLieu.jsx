import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Search, FileText, Upload, BookOpen, GraduationCap, X, ExternalLink, Database, Server, Users, Award, Download } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import FileUploadField from '../components/FileUploadField';

const BLOCKS = ['Tất cả', 'Kinh tế', 'Kỹ thuật'];
const EXAM_TYPES = ['Tất cả', 'Giữa kỳ', 'Cuối kỳ'];
const DOCUMENT_TYPES = ['Tất cả', 'Giáo trình', 'Ghi chú', 'Slide', 'Đề thi', 'Bài tập', 'Báo cáo', 'Khóa luận'];
const LEGAL_SOURCES = [
  {
    title: 'Sinh viên đóng góp',
    description: 'Nhận tài liệu do người dùng có quyền chia sẻ gửi lên và đưa vào hàng chờ duyệt.',
    Icon: Users,
    action: 'Upload ngay',
    type: 'upload',
  },
  {
    title: 'Học liệu mở',
    description: 'Liên kết nhanh đến các kho học liệu mở để đội ngũ kiểm duyệt bổ sung tài liệu hợp pháp.',
    Icon: Database,
    action: 'Xem nguồn',
    href: 'https://openstax.org/',
  },
  {
    title: 'Kho trường công khai',
    description: 'Tập trung luận văn, khóa luận và nghiên cứu từ các thư viện số công khai.',
    Icon: Server,
    action: 'Xem mẫu nguồn',
    href: 'https://dspace.org/',
  },
];
const REWARD_RULES = [
  { label: 'Upload được duyệt', value: '+10', Icon: Upload },
  { label: 'Tài liệu được tải', value: '+2', Icon: Download },
  { label: 'Đánh giá tốt', value: '+5', Icon: Award },
];

export default function TaiLieu() {
  const { user } = useAuth();
  const [tab, setTab] = useState('local');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState('Tất cả');
  const [examType, setExamType] = useState('Tất cả');
  const [localSearch, setLocalSearch] = useState('');
  const [documentQuery, setDocumentQuery] = useState('');
  const [documentType, setDocumentType] = useState('Tất cả');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subject: '',
    block: 'Kinh tế',
    exam_type: 'Giữa kỳ',
    // Khi upload file lên sẽ nhận được URL để lưu vào document
    file_url: '',
    description: '',
  });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Document.filter({ status: 'approved' }, '-created_date');
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const filtered = documents.filter(d => {
    const matchSearch = !localSearch || d.title?.toLowerCase().includes(localSearch.toLowerCase()) || d.subject?.toLowerCase().includes(localSearch.toLowerCase());
    const matchBlock = block === 'Tất cả' || d.block === block;
    const matchExam = examType === 'Tất cả' || d.exam_type === examType;
    return matchSearch && matchBlock && matchExam;
  });

  const getDocumentType = (doc) => {
    const text = `${doc.title || ''} ${doc.exam_type || ''} ${doc.description || ''}`.toLowerCase();
    if (text.includes('giáo trình')) return 'Giáo trình';
    if (text.includes('ghi chú') || text.includes('note')) return 'Ghi chú';
    if (text.includes('slide') || text.includes('ppt')) return 'Slide';
    if (text.includes('bài tập') || text.includes('assignment')) return 'Bài tập';
    if (text.includes('báo cáo') || text.includes('thực tập')) return 'Báo cáo';
    if (text.includes('khóa luận') || text.includes('luận văn')) return 'Khóa luận';
    if (text.includes('đề') || text.includes('giữa kỳ') || text.includes('cuối kỳ')) return 'Đề thi';
    return 'Tài liệu';
  };

  const documentResults = documents.filter(doc => {
    const haystack = `${doc.title || ''} ${doc.subject || ''} ${doc.block || ''} ${doc.exam_type || ''} ${doc.description || ''}`.toLowerCase();
    const matchSearch = !documentQuery || haystack.includes(documentQuery.toLowerCase());
    const matchType = documentType === 'Tất cả' || getDocumentType(doc) === documentType;
    return matchSearch && matchType;
  });

  const myApprovedDocuments = documents.filter(doc => doc.uploaded_by === user?.email);
  const contributionPoints = myApprovedDocuments.length * 10;

  const openUploadModal = () => {
    setRightsConfirmed(false);
    setShowModal(true);
  };

  const closeUploadModal = () => {
    setRightsConfirmed(false);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.file_url) return;
    if (!rightsConfirmed) {
      alert('Bạn cần xác nhận có quyền chia sẻ tài liệu này.');
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.Document.create({
        ...form,
        uploaded_by: user?.email || 'anonymous',
        status: 'pending',
        created_date: new Date().toISOString(),
      });
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `[Tai lieu moi] ${form.title}`,
          description: `Mon: ${form.subject} | Khoi: ${form.block} | Loai: ${form.exam_type}\nLink: ${form.file_url}`,
          userEmail: user?.email || 'An danh',
        }),
      });
      closeUploadModal();
      setForm({
        title: '',
        subject: '',
        block: 'Kinh tế',
        exam_type: 'Giữa kỳ',
        file_url: '',
        description: '',
      });
      alert('Đã gửi tài liệu! Admin sẽ duyệt sớm.');
    } catch {
      alert('Gửi thất bại, thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      <div className="bg-yellow-400 border-b-4 border-black px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to="/" className="p-2 bg-black text-yellow-400 rounded-xl hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-lexend font-black text-xl flex-1">📚 Tài liệu học tập</span>
          <button onClick={openUploadModal}
            className="flex items-center gap-2 px-4 py-2 bg-black text-yellow-400 rounded-xl font-lexend font-black text-sm hover:bg-gray-800 transition-colors">
            <Upload className="w-4 h-4" /> Góp tài liệu (file/link)
          </button>
          <NotificationBell />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div className="flex flex-wrap gap-2 bg-white border-2 border-black rounded-2xl p-1.5 w-fit">
          <button onClick={() => setTab('local')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-lexend font-black text-sm transition-all ${tab === 'local' ? 'bg-black text-yellow-400' : 'hover:bg-yellow-50'}`}>
            <FileText className="w-4 h-4" /> Tài liệu cộng đồng
          </button>
          <button onClick={() => setTab('document')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-lexend font-black text-sm transition-all ${tab === 'document' ? 'bg-black text-yellow-400' : 'hover:bg-yellow-50'}`}>
            <FileText className="w-4 h-4" /> Document
          </button>
        </div>

        {tab === 'local' && (
          <>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={localSearch} onChange={e => setLocalSearch(e.target.value)}
                placeholder="Tìm kiếm tài liệu, môn học..."
                className="w-full pl-12 pr-4 py-3 border-2 border-black rounded-2xl font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-500" />
                {BLOCKS.map(b => (
                  <button key={b} onClick={() => setBlock(b)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-lexend font-bold border-2 transition-all ${block === b ? 'bg-black text-yellow-400 border-black' : 'bg-white border-black hover:bg-yellow-50'}`}>
                    {b}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                {EXAM_TYPES.map(t => (
                  <button key={t} onClick={() => setExamType(t)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-lexend font-bold border-2 transition-all ${examType === t ? 'bg-black text-yellow-400 border-black' : 'bg-white border-black hover:bg-yellow-50'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <p className="font-grotesk text-sm text-gray-500">Tìm thấy <span className="font-bold text-black">{filtered.length}</span> tài liệu</p>
            {loading ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <div className="text-5xl animate-bounce">🐔</div>
                <p className="font-grotesk text-gray-400">Đang tải tài liệu...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl py-16 text-center">
                <div className="text-5xl mb-3">📭</div>
                <p className="font-lexend font-bold text-gray-500">Chưa có tài liệu nào</p>
                <p className="font-grotesk text-gray-400 text-sm mt-1">Hãy là người đầu tiên góp tài liệu!</p>
                <button onClick={() => setTab('document')}
                  className="mt-4 px-4 py-2 bg-black text-yellow-400 rounded-xl font-lexend font-black text-sm">
                  Xem Document →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map(doc => (
                  <div key={doc.id} onClick={() => setPreviewItem(doc)} className="bg-white border-2 border-black rounded-2xl p-5 shadow-[3px_3px_0px_black] hover:shadow-[5px_5px_0px_black] hover:-translate-y-0.5 transition-all space-y-3 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-rose-100 border-2 border-black rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-rose-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-lexend font-black text-sm text-gray-800 leading-snug line-clamp-2">{doc.title}</h3>
                        {doc.subject && <p className="font-grotesk text-xs text-gray-500 mt-0.5">{doc.subject}</p>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-yellow-100 border border-yellow-400 rounded-full text-xs font-bold text-yellow-700">{doc.block}</span>
                      <span className="px-2 py-0.5 bg-blue-100 border border-blue-400 rounded-full text-xs font-bold text-blue-700">{doc.exam_type}</span>
                    </div>
                    {doc.description && <p className="font-grotesk text-xs text-gray-500 line-clamp-2">{doc.description}</p>}
                    <a href={doc.file_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 border-2 border-black rounded-xl font-lexend font-black text-sm transition-all shadow-[2px_2px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                      <ExternalLink className="w-4 h-4" /> Xem tài liệu
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'document' && (
          <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border-2 border-black bg-black text-white shadow-[4px_4px_0px_#facc15]">
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-3 py-1.5 font-lexend text-xs font-black text-black">
                    <FileText className="h-4 w-4" />
                    Document Hub
                  </div>
                  <div>
                    <h2 className="font-lexend text-2xl font-black leading-tight sm:text-3xl">
                      Kho chia sẻ tài liệu hợp pháp cho sinh viên
                    </h2>
                    <p className="mt-2 max-w-2xl font-grotesk text-sm leading-relaxed text-white/75">
                      Tìm tài liệu đã duyệt, upload tài liệu của bạn, tích điểm đóng góp và để admin kiểm duyệt trước khi phát hành.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={openUploadModal}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-yellow-400 bg-yellow-400 px-4 py-2 font-lexend text-sm font-black text-black transition-all hover:bg-yellow-300"
                    >
                      <Upload className="h-4 w-4" />
                      Upload tài liệu
                    </button>
                    <button
                      onClick={() => {
                        setDocumentQuery('');
                        setDocumentType('Tất cả');
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-4 py-2 font-lexend text-sm font-black text-white transition-all hover:bg-white/20"
                    >
                      <Search className="h-4 w-4" />
                      Xem tất cả
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
                  {[
                    { label: 'Tài liệu', value: documents.length, Icon: FileText },
                    { label: 'Đã góp', value: myApprovedDocuments.length, Icon: Users },
                    { label: 'Điểm', value: contributionPoints, Icon: Award },
                  ].map(({ label, value, Icon }) => (
                    <div key={label} className="rounded-xl border border-white/15 bg-white/10 p-3">
                      <Icon className="h-4 w-4 text-yellow-300" />
                      <p className="mt-2 font-lexend text-2xl font-black">{value}</p>
                      <p className="font-grotesk text-xs font-bold text-white/60">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
              <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_black]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-lexend text-lg font-black">Tìm tài liệu</h3>
                    <p className="font-grotesk text-sm text-gray-500">Tìm trong kho đã được duyệt.</p>
                  </div>
                  <Search className="h-5 w-5 text-gray-400" />
                </div>

                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={documentQuery}
                      onChange={e => setDocumentQuery(e.target.value)}
                      placeholder="Nhập môn học, tiêu đề, từ khóa..."
                      className="w-full rounded-xl border-2 border-black py-3 pl-10 pr-3 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {DOCUMENT_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => setDocumentType(type)}
                        className={`shrink-0 rounded-xl border-2 px-3 py-1.5 font-lexend text-xs font-black transition-all ${documentType === type ? 'border-black bg-black text-yellow-400' : 'border-black bg-white hover:bg-yellow-50'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {loading ? (
                    <div className="rounded-2xl border-2 border-dashed border-gray-300 py-10 text-center">
                      <p className="font-grotesk text-sm text-gray-400">Đang tải kho tài liệu...</p>
                    </div>
                  ) : documentResults.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-gray-300 py-10 text-center">
                      <p className="font-lexend font-bold text-gray-500">Chưa có tài liệu phù hợp</p>
                      <button onClick={openUploadModal}
                        className="mt-3 rounded-xl bg-black px-4 py-2 font-lexend text-sm font-black text-yellow-400">
                        Góp tài liệu này
                      </button>
                    </div>
                  ) : (
                    documentResults.slice(0, 6).map(doc => (
                      <div key={doc.id} onClick={() => setPreviewItem(doc)} className="cursor-pointer rounded-2xl border-2 border-black bg-[#FFFDF5] p-4 transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_black]">
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-yellow-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-lexend text-sm font-black leading-tight text-black">{doc.title}</h4>
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 font-grotesk text-[11px] font-bold text-blue-700">
                                {getDocumentType(doc)}
                              </span>
                            </div>
                            <p className="mt-1 font-grotesk text-xs text-gray-500">{doc.subject || 'Chưa rõ môn'} · {doc.block || 'Chưa phân loại'} · {doc.exam_type || 'Tài liệu'}</p>
                          </div>
                          <a href={doc.file_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white hover:bg-yellow-50">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}  
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_black]">
                  <h3 className="font-lexend text-lg font-black">Nguồn hợp pháp</h3>
                  <div className="mt-3 space-y-3">
                    {LEGAL_SOURCES.map(source => {
                      const Icon = source.Icon;
                      return (
                        <div key={source.title} className="rounded-xl border-2 border-black bg-[#FFFDF5] p-3">
                          <div className="flex gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400">
                              <Icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-lexend text-sm font-black">{source.title}</p>
                              <p className="mt-1 font-grotesk text-xs text-gray-500">{source.description}</p>
                              {source.type === 'upload' ? (
                                <button onClick={openUploadModal} className="mt-2 font-lexend text-xs font-black text-yellow-700 underline">
                                  {source.action}
                                </button>
                              ) : (
                                <a href={source.href} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-lexend text-xs font-black text-yellow-700 underline">
                                  {source.action}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_black]">
                  <h3 className="font-lexend text-lg font-black">Điểm thưởng</h3>
                  <div className="mt-3 grid gap-2">
                    {REWARD_RULES.map(rule => {
                      const Icon = rule.Icon;
                      return (
                        <div key={rule.label} className="flex items-center justify-between rounded-xl border-2 border-black bg-yellow-50 px-3 py-2">
                          <span className="flex items-center gap-2 font-grotesk text-sm font-bold text-gray-700">
                            <Icon className="h-4 w-4" />
                            {rule.label}
                          </span>
                          <span className="font-lexend text-sm font-black text-black">{rule.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}
      </div>


      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-3xl p-6 w-full max-w-md shadow-[8px_8px_0px_black] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-lexend font-black text-xl">📤 Góp tài liệu</h2>
              <button onClick={closeUploadModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-lexend font-black text-sm mb-1">Tên tài liệu <span className="text-rose-500">*</span></label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="VD: Đề thi giữa kỳ Kinh tế vi mô 2024" required
                  className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block font-lexend font-black text-sm mb-1">Môn học</label>
                <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="VD: Kinh tế vi mô"
                  className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-lexend font-black text-sm mb-1">Khối ngành</label>
                  <select value={form.block} onChange={e => setForm(p => ({ ...p, block: e.target.value }))}
                    className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <option>Kinh tế</option>
                    <option>Kỹ thuật</option>
                  </select>
                </div>
                <div>
                  <label className="block font-lexend font-black text-sm mb-1">Loại đề</label>
                  <select value={form.exam_type} onChange={e => setForm(p => ({ ...p, exam_type: e.target.value }))}
                    className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <option>Giữa kỳ</option>
                    <option>Cuối kỳ</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block font-lexend font-black text-sm mb-1">Tải file hoặc dán link tài liệu <span className="text-rose-500">*</span></label>

                <FileUploadField
                  onFileUploaded={(res) => {
                    // res: { url, name } hoặc null
                    if (!res?.url) return;
                    setForm(p => ({ ...p, file_url: res.url }));
                  }}
                />

                <div>
                  <input
                    type="url"
                    value={form.file_url}
                    onChange={e => setForm(p => ({ ...p, file_url: e.target.value }))}
                    placeholder="Hoặc dán https://drive.google.com/..." 
                    required
                    className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
              <div>
                <label className="block font-lexend font-black text-sm mb-1">Mô tả thêm</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Năm học, ghi chú thêm..." rows={2}
                  className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <label className="flex items-start gap-3 rounded-2xl border-2 border-black bg-yellow-50 p-3">
                <input
                  type="checkbox"
                  checked={rightsConfirmed}
                  onChange={e => setRightsConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-yellow-400"
                />
                <span className="font-grotesk text-sm font-bold text-gray-700">
                  Tôi có quyền chia sẻ tài liệu này và đồng ý để admin kiểm duyệt trước khi công khai.
                </span>
              </label>
              <button type="submit" disabled={submitting || !rightsConfirmed}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 border-2 border-black rounded-2xl font-lexend font-black text-base transition-all shadow-[3px_3px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50">
                {submitting ? '⏳ Đang gửi...' : '📤 Gửi tài liệu'}
              </button>
            </form>
          </div>
        </div>
      )}
      {previewItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewItem(null)}>
          <div className="bg-[#FFF7C6] border-4 border-black rounded-2xl p-5 w-full max-w-2xl shadow-[8px_8px_0px_black] max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewItem(null)} className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-lexend font-black text-lg leading-tight">{(previewItem.title || previewItem.name) || 'Tài liệu'}</h3>
            {previewItem.subject && <p className="font-grotesk text-sm text-gray-700 mt-2">Môn: {previewItem.subject}</p>}
            <p className="font-grotesk text-sm text-gray-700 mt-3 line-clamp-4">{previewItem.snippet || previewItem.description || previewItem.summary || 'Không có mô tả'}</p>

            <div className="mt-5">
              <a href={previewItem.link || previewItem.file_url} target="_blank" rel="noreferrer" onClick={() => setPreviewItem(null)}
                className="block w-full text-center py-3 bg-yellow-400 hover:bg-yellow-300 border-2 border-black rounded-2xl font-lexend font-black text-sm transition-all shadow-[2px_2px_0px_black]">
                <ExternalLink className="inline w-4 h-4 mr-2" /> Xem tài liệu
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
