import { Search, X } from 'lucide-react';
import { ALL_SCHOOLS, getMajorsBySchool, COHORTS } from '../lib/schoolData';

export default function FilterBar({ filters, setFilters, searchQuery, setSearchQuery }) {
  const hasFilters = filters.school || filters.major || filters.cohort || filters.subject || searchQuery;
  const availableMajors = getMajorsBySchool(filters.school);

  const handleSchoolChange = (school) => {
    setFilters(f => ({ ...f, school, major: '' }));
  };

  const clearAll = () => {
    setFilters({ school: '', major: '', cohort: '', subject: '' });
    setSearchQuery('');
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="🔍 Tìm trong câu hỏi... (ví dụ: giải tích, vi phân...)"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-2xl font-grotesk font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white text-sm"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <select
          value={filters.school}
          onChange={e => handleSchoolChange(e.target.value)}
          className="border-2 border-black rounded-xl px-3 py-2 font-grotesk font-medium text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 truncate"
        >
          <option value="">🏫 Chọn trường</option>
          {ALL_SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={filters.major}
          onChange={e => setFilters(f => ({ ...f, major: e.target.value }))}
          disabled={!filters.school}
          className="border-2 border-black rounded-xl px-3 py-2 font-grotesk font-medium text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{filters.school ? '📚 Chọn ngành' : '📚 Chọn trường trước'}</option>
          {availableMajors.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <select
          value={filters.cohort}
          onChange={e => setFilters(f => ({ ...f, cohort: e.target.value }))}
          className="border-2 border-black rounded-xl px-3 py-2 font-grotesk font-medium text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="">📅 Chọn khóa</option>
          {COHORTS.map(c => <option key={c} value={c}>K{c}</option>)}
        </select>

        <input
          type="text"
          placeholder="✏️ Môn học..."
          value={filters.subject}
          onChange={e => setFilters(f => ({ ...f, subject: e.target.value }))}
          className="border-2 border-black rounded-xl px-3 py-2 font-grotesk font-medium text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {filters.school && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 font-grotesk">Đang lọc:</span>
          {filters.school && (
            <span className="bg-yellow-200 border border-black text-xs font-bold px-2 py-0.5 rounded-full">
              🏫 {filters.school}
            </span>
          )}
          {filters.major && (
            <span className="bg-pink-200 border border-black text-xs font-bold px-2 py-0.5 rounded-full">
              📚 {filters.major}
            </span>
          )}
          {filters.cohort && (
            <span className="bg-blue-200 border border-black text-xs font-bold px-2 py-0.5 rounded-full">
              📅 K{filters.cohort}
            </span>
          )}
        </div>
      )}

      {hasFilters && (
        <button onClick={clearAll} className="flex items-center gap-1 text-sm font-bold text-red-500 hover:text-red-700">
          <X className="w-4 h-4" /> Xóa bộ lọc
        </button>
      )}
    </div>
  );
}