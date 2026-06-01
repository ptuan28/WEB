import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Search, FileText, Upload, BookOpen, GraduationCap, X, ExternalLink, Globe } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

const BLOCKS = ['Tất cả', 'Kinh tế', 'Kỹ thuật'];
const EXAM_TYPES = ['Tất cả', 'Giữa kỳ', 'Cuối kỳ'];
const SEARCH_FORMATS = [
  {
    label: 'PDF',
    querySuffix: 'filetype:pdf',
    snippet: 'Danh sách kết quả Google đã lọc riêng các tệp PDF.',
  },
  {
    label: 'DOCX',
    querySuffix: 'filetype:docx',
    snippet: 'Danh sách kết quả Google đã lọc riêng các tệp Word .docx.',
  },
  {
    label: 'DOC',
    querySuffix: 'filetype:doc',
    snippet: 'Danh sách kết quả Google đã lọc riêng các tệp Word .doc.',
  },
  {
    label: 'DRIVE',
    querySuffix: '(site:drive.google.com OR site:docs.google.com)',
    snippet: 'Danh sách tài liệu được chia sẻ qua Google Drive hoặc Google Docs.',
  },
];

const getGoogleSearchUrl = (query) => `https://www.google.com/search?q=${encodeURIComponent(query)}`;

const buildSearchShortcutResults = (query) => SEARCH_FORMATS.map(format => {
  const searchQuery = `${query} ${format.querySuffix}`;
  return {
    title: `${format.label}: ${query}`,
    link: getGoogleSearchUrl(searchQuery),
    displayLink: format.label === 'DRIVE' ? 'drive.google.com / docs.google.com' : 'google.com/search',
    snippet: format.snippet,
    fileType: format.label,
    isSearchShortcut: true,
  };
});

export default function TaiLieu() {
  const { user } = useAuth();
  const [tab, setTab] = useState('local');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState('Tất cả');
  const [examType, setExamType] = useState('Tất cả');
  const [localSearch, setLocalSearch] = useState('');
  const [googleQuery, setGoogleQuery] = useState('');
  const [googleBlock, setGoogleBlock] = useState('Tất cả');
  const [googleExamType, setGoogleExamType] = useState('Tất cả');
  const [googleResults, setGoogleResults] = useState([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleNotice, setGoogleNotice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', block: 'Kinh tế', exam_type: 'Giữa kỳ', file_url: '', description: '' });

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

  const handleGoogleSearch = async () => {
    if (!googleQuery.trim()) return;
    setGoogleLoading(true);
    setGoogleNotice('');
    setGoogleResults([]);

    // Construct search query dynamically
    let query = `đề thi ${googleQuery.trim()}`;
    if (googleExamType && googleExamType !== 'Tất cả') {
      query += ` ${googleExamType}`;
    }
    if (googleBlock && googleBlock !== 'Tất cả') {
      if (!googleQuery.toLowerCase().includes(googleBlock.toLowerCase())) {
        query += ` ${googleBlock}`;
      }
    }

    // Direct Google query targeting word, pdf, and drive links
    const primaryQuery = `${query} (filetype:pdf OR filetype:docx OR filetype:doc OR site:drive.google.com OR site:docs.google.com)`;
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
    const engineId = import.meta.env.VITE_GOOGLE_CX || import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

    try {
      if (!apiKey || !engineId) {
        setGoogleNotice('Chưa cấu hình Google Search API, nên đang hiển thị các nguồn tìm nhanh theo đúng định dạng tài liệu.');
        setGoogleResults(buildSearchShortcutResults(query));
        return;
      }

      // 1. Try search with format query
      let res = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${encodeURIComponent(primaryQuery)}&num=10`
      );
      let data = await res.json();

      // if (data.error) {
      //   setGoogleNotice('Google Search API đang hết quota, nên đang hiển thị các nguồn tìm nhanh theo đúng định dạng tài liệu.');
      //   setGoogleResults(buildSearchShortcutResults(query));
      //   return;
      // }

      // 2. Fallback: if no PDFs/Word/Drive found, search without strict formats
      if (!data.items || data.items.length === 0) {
        res = await fetch(
          `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${encodeURIComponent(query)}&num=10`
        );
        data = await res.json();
      }

      // if (data.error) {
      //   setGoogleNotice('Google Search API đang hết quota, nên đang hiển thị các nguồn tìm nhanh theo đúng định dạng tài liệu.');
      //   setGoogleResults(buildSearchShortcutResults(query));
      //   return;
      // }

      // if (!data.items || data.items.length === 0) {
      //   setGoogleNotice('Chưa tìm thấy kết quả trực tiếp, nên đang hiển thị các nguồn tìm nhanh theo đúng định dạng tài liệu.');
      //   setGoogleResults(buildSearchShortcutResults(query));
      //   return;
      // }

      // Validate that at least one item matches the file format criteria
      const validItems = data.items.filter(isValidFileLink);
      if (validItems.length === 0) {
        setGoogleNotice('Kết quả trực tiếp chưa có PDF, Word hoặc Drive, nên đang hiển thị các nguồn tìm nhanh theo đúng định dạng tài liệu.');
        setGoogleResults(buildSearchShortcutResults(query));
        return;
      }

      setGoogleResults(validItems);
    } catch {
      setGoogleNotice('Không kết nối được Google Search API, nên đang hiển thị các nguồn tìm nhanh theo đúng định dạng tài liệu.');
      setGoogleResults(buildSearchShortcutResults(query));
    } finally {
      setGoogleLoading(false);
    }
  };

  const isValidFileLink = (url) => {
    if (!url) return false;
    const low = url.toLowerCase();
    const isPdf = low.endsWith('.pdf') || low.includes('.pdf');
    const isWord = low.endsWith('.doc') || low.endsWith('.docx') || low.includes('.doc?') || low.includes('.docx?') || low.includes('/document/d/');
    const isDrive = low.includes('drive.google.com') || low.includes('docs.google.com');
    return isPdf || isWord || isDrive;
  };

  const isDisplayableSearchResult = (item) => item?.isSearchShortcut || isValidFileLink(item?.link);

  const getFileTypeLabel = (item) => {
    if (item?.fileType) return item.fileType;
    const low = item?.link?.toLowerCase() || '';
    if (low.includes('drive.google.com') || low.includes('docs.google.com')) return 'DRIVE';
    if (low.includes('.docx')) return 'DOCX';
    if (low.includes('.doc')) return 'DOC';
    if (low.includes('.pdf')) return 'PDF';
    return 'LINK';
  };

  const handleImportDocument = async (item) => {
    if (!isValidFileLink(item.link)) {
      alert('Chỉ chấp nhận các tệp tin định dạng PDF, Word (.doc, .docx) hoặc liên kết Google Drive!');
      return;
    }
    try {
      const cleanTitle = item.title.replace(/<\/?[^>]+(>|$)/g, "");
      await base44.entities.Document.create({
        title: cleanTitle,
        subject: googleQuery || "Chưa rõ môn",
        block: googleBlock === 'Tất cả' ? 'Kinh tế' : googleBlock,
        exam_type: googleExamType === 'Tất cả' ? 'Giữa kỳ' : googleExamType,
        file_url: item.link,
        description: item.snippet || `Nguồn: ${item.displayLink}`,
        uploaded_by: user?.email || 'anonymous',
        status: 'approved',
        created_date: new Date().toISOString(),
      });
      alert(`Đã lưu tài liệu "${cleanTitle}" vào kho tài liệu thành công!`);
      fetchDocuments(); // Reload the community documents list
    } catch (err) {
      console.error('Failed to import document:', err);
      alert('Lưu tài liệu thất bại, vui lòng thử lại sau.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.file_url) return;
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
      setShowModal(false);
      setForm({ title: '', subject: '', block: 'Kinh tế', exam_type: 'Giữa kỳ', file_url: '', description: '' });
      alert('Đã gửi tài liệu! Admin sẽ duyệt sớm.');
    } catch {
      alert('Gửi thất bại, thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const visibleGoogleResults = googleResults.filter(isDisplayableSearchResult);

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      <div className="bg-yellow-400 border-b-4 border-black px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to="/" className="p-2 bg-black text-yellow-400 rounded-xl hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-lexend font-black text-xl flex-1">📚 Tài liệu học tập</span>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-yellow-400 rounded-xl font-lexend font-black text-sm hover:bg-gray-800 transition-colors">
            <Upload className="w-4 h-4" /> Góp tài liệu
          </button>
          <NotificationBell />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div className="flex gap-2 bg-white border-2 border-black rounded-2xl p-1.5 w-fit">
          <button onClick={() => setTab('local')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-lexend font-black text-sm transition-all ${tab === 'local' ? 'bg-black text-yellow-400' : 'hover:bg-yellow-50'}`}>
            <FileText className="w-4 h-4" /> Tài liệu cộng đồng
          </button>
          <button onClick={() => setTab('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-lexend font-black text-sm transition-all ${tab === 'search' ? 'bg-black text-yellow-400' : 'hover:bg-yellow-50'}`}>
            <Globe className="w-4 h-4" /> Tìm trên Internet
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
                <button onClick={() => {
                  setGoogleQuery(localSearch);
                  setTab('search');
                }}
                  className="mt-4 px-4 py-2 bg-black text-yellow-400 rounded-xl font-lexend font-black text-sm">
                  Tìm trên Internet →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map(doc => (
                  <div key={doc.id} className="bg-white border-2 border-black rounded-2xl p-5 shadow-[3px_3px_0px_black] hover:shadow-[5px_5px_0px_black] hover:-translate-y-0.5 transition-all space-y-3">
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
                    <a href={doc.file_url} target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 border-2 border-black rounded-xl font-lexend font-black text-sm transition-all shadow-[2px_2px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                      <ExternalLink className="w-4 h-4" /> Xem tài liệu
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'search' && (
          <>
            <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[3px_3px_0px_black] space-y-4">
              <p className="font-lexend font-black text-base">🔍 Tìm tài liệu trên Internet</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-lexend font-black text-xs mb-1">Khối ngành</label>
                  <select value={googleBlock} onChange={e => setGoogleBlock(e.target.value)}
                    className="w-full border-2 border-black rounded-xl p-2.5 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <option>Tất cả</option>
                    <option>Kinh tế</option>
                    <option>Kỹ thuật</option>
                  </select>
                </div>
                <div>
                  <label className="block font-lexend font-black text-xs mb-1">Loại đề</label>
                  <select value={googleExamType} onChange={e => setGoogleExamType(e.target.value)}
                    className="w-full border-2 border-black rounded-xl p-2.5 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <option>Tất cả</option>
                    <option>Giữa kỳ</option>
                    <option>Cuối kỳ</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="text" value={googleQuery} onChange={e => setGoogleQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGoogleSearch()}
                  placeholder="Nhập tên môn học... (VD: Kinh tế vi mô)"
                  className="flex-1 border-2 border-black rounded-xl p-3 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                <button onClick={handleGoogleSearch} disabled={googleLoading}
                  className="px-5 py-3 bg-black text-yellow-400 rounded-xl font-lexend font-black text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors">
                  {googleLoading ? '⏳' : '🔍'}
                </button>
              </div>
              <p className="font-grotesk text-xs text-gray-400">
                Tìm kiếm: "đề thi {googleExamType} {googleQuery || '...'} {googleBlock} filetype:pdf"
              </p>
            </div>

            {googleLoading && (
              <div className="flex flex-col items-center py-10 gap-3">
                <div className="text-4xl animate-bounce">🔍</div>
                <p className="font-grotesk text-gray-400 text-sm">Đang tìm kiếm tài liệu...</p>
              </div>
            )}

            {googleNotice && !googleLoading && (
              <div className="bg-yellow-50 border-2 border-black rounded-2xl p-4 shadow-[2px_2px_0px_black] flex items-start gap-3">
                <span className="text-xl shrink-0">💡</span>
                <p className="font-grotesk text-sm text-gray-700 leading-relaxed">{googleNotice}</p>
              </div>
            )}

            {visibleGoogleResults.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="font-lexend font-black text-base">
                    📄 Kết quả tìm kiếm
                    <span className="ml-2 px-2 py-0.5 bg-black text-yellow-400 text-xs rounded-full font-black">
                      {visibleGoogleResults.length} tài liệu
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visibleGoogleResults.map((item, i) => {
                    const fileType = getFileTypeLabel(item);
                    const fileColors = {
                      PDF: { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-600', icon: '📄' },
                      DOCX: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-600', icon: '📝' },
                      DOC: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-600', icon: '📝' },
                      DRIVE: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-600', icon: '🗂️' },
                      LINK: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700', icon: '🔗' },
                    };
                    const color = fileColors[fileType] || fileColors.LINK;
                    const cleanTitle = (item.title || '').replace(/<\/?[^>]+(>|$)/g, '');

                    return (
                      <div key={i} className="bg-white border-4 border-black rounded-3xl p-5 shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black] hover:-translate-y-0.5 transition-all flex flex-col gap-3">

                        {/* File type + shortcut badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 ${color.bg} border-2 ${color.border} rounded-full text-xs font-lexend font-black ${color.text}`}>
                            {color.icon} {fileType}
                          </span>
                          {item.isSearchShortcut && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 border-2 border-purple-400 rounded-full text-xs font-lexend font-black text-purple-700">
                              ⚡ TÌM NHANH
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-lexend font-black text-sm text-gray-900 leading-snug line-clamp-2">
                          {cleanTitle || 'Tài liệu không có tiêu đề'}
                        </h3>

                        {/* Source URL */}
                        <p className="font-grotesk text-xs text-green-700 truncate font-semibold">
                          🌐 {item.displayLink}
                        </p>

                        {/* Snippet */}
                        {item.snippet && (
                          <p className="font-grotesk text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {item.snippet}
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-auto pt-1">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className={`${item.isSearchShortcut ? 'w-full' : 'flex-1'} flex items-center justify-center gap-2 py-2.5 bg-yellow-400 hover:bg-yellow-300 border-2 border-black rounded-2xl font-lexend font-black text-sm transition-all shadow-[3px_3px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] text-black`}
                          >
                            <ExternalLink className="w-4 h-4" />
                            {item.isSearchShortcut ? 'Mở danh sách' : 'Xem tài liệu'}
                          </a>
                          {!item.isSearchShortcut && (
                            <button
                              onClick={() => handleImportDocument(item)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-400 hover:bg-green-300 border-2 border-black rounded-2xl font-lexend font-black text-sm transition-all shadow-[3px_3px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] text-black"
                            >
                              📌 Lưu vào Web
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>


      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-3xl p-6 w-full max-w-md shadow-[8px_8px_0px_black] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-lexend font-black text-xl">📤 Góp tài liệu</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
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
              <div>
                <label className="block font-lexend font-black text-sm mb-1">Link tài liệu <span className="text-rose-500">*</span></label>
                <input type="url" value={form.file_url} onChange={e => setForm(p => ({ ...p, file_url: e.target.value }))}
                  placeholder="https://drive.google.com/..." required
                  className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block font-lexend font-black text-sm mb-1">Mô tả thêm</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Năm học, ghi chú thêm..." rows={2}
                  className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 border-2 border-black rounded-2xl font-lexend font-black text-base transition-all shadow-[3px_3px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50">
                {submitting ? '⏳ Đang gửi...' : '📤 Gửi tài liệu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
