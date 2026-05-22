import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send } from 'lucide-react';
import ImageCapture from './ImageCapture';
import { ALL_SCHOOLS, getMajorsBySchool, COHORTS } from '../lib/schoolData';
import { saveMyQuestion } from '../lib/userHistory';

export default function AskQuestionModal({ onClose, onSuccess }) {
  const [text, setText] = useState('');
  const [school, setSchool] = useState('');
  const [major, setMajor] = useState('');
  const [cohort, setCohort] = useState('');
  const [subject, setSubject] = useState('');
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableMajors = getMajorsBySchool(school);

  const handleSchoolChange = (value) => {
    setSchool(value);
    setMajor('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    let image_url = null;
    if (imageData) {
      const blob = await (await fetch(imageData)).blob();
      const file = new File([blob], 'question.jpg', { type: 'image/jpeg' });
      const res = await base44.integrations.Core.UploadFile({ file });
      image_url = res.file_url;
    }

    const q = await base44.entities.Question.create({
      text,
      school: school || undefined,
      major: major || undefined,
      cohort: cohort || undefined,
      subject: subject || undefined,
      image_url: image_url || undefined,
      report_count: 0,
    });
    saveMyQuestion(q.id);

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#FFFDF5] border-4 border-black rounded-3xl w-full max-w-lg shadow-[8px_8px_0px_black] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-lexend font-black">🐔 Thì thầm câu hỏi...</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Câu hỏi của bạn là gì? Đừng ngại, mình ẩn danh mà 🤫"
              rows={4}
              required
              className="w-full border-2 border-black rounded-2xl p-3 font-grotesk text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
            />

            <div className="grid grid-cols-2 gap-2">
              <select value={school} onChange={e => handleSchoolChange(e.target.value)}
                className="border-2 border-black rounded-xl px-3 py-2 font-grotesk text-sm bg-white focus:outline-none col-span-2">
                <option value="">🏫 Chọn trường (tùy chọn)</option>
                {ALL_SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <select value={major} onChange={e => setMajor(e.target.value)}
                disabled={!school}
                className="border-2 border-black rounded-xl px-3 py-2 font-grotesk text-sm bg-white focus:outline-none disabled:opacity-50 col-span-2">
                <option value="">{school ? '📚 Chọn ngành' : '📚 Chọn trường trước'}</option>
                {availableMajors.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              <select value={cohort} onChange={e => setCohort(e.target.value)}
                className="border-2 border-black rounded-xl px-3 py-2 font-grotesk text-sm bg-white focus:outline-none">
                <option value="">📅 Khóa</option>
                {COHORTS.map(c => <option key={c} value={c}>K{c}</option>)}
              </select>

              <input
                type="text" value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="✏️ Môn học (vd: Giải tích)"
                className="border-2 border-black rounded-xl px-3 py-2 font-grotesk text-sm bg-white focus:outline-none"
              />
            </div>

            <ImageCapture onImage={setImageData} />

            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="w-full py-3 bg-yellow-400 border-2 border-black rounded-2xl font-lexend font-black text-lg hover:bg-yellow-300 transition-all shadow-[4px_4px_0px_black] hover:shadow-[2px_2px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? '⏳ Đang đăng...' : <><Send className="w-5 h-5" /> Thì thầm thôi! 🐔</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}