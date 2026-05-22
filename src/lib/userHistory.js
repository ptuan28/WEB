// Quản lý lịch sử hỏi/trả lời ẩn danh qua localStorage

const QUESTIONS_KEY = 'tcw_my_questions';
const ANSWERS_KEY = 'tcw_my_answers';

export function saveMyQuestion(id) {
  const list = getMyQuestionIds();
  if (!list.includes(id)) {
    list.unshift(id);
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(list));
  }
}

export function saveMyAnswer(id) {
  const list = getMyAnswerIds();
  if (!list.includes(id)) {
    list.unshift(id);
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(list));
  }
}

export function getMyQuestionIds() {
  try { return JSON.parse(localStorage.getItem(QUESTIONS_KEY)) || []; }
  catch { return []; }
}

export function getMyAnswerIds() {
  try { return JSON.parse(localStorage.getItem(ANSWERS_KEY)) || []; }
  catch { return []; }
}

export function removeMyQuestion(id) {
  const list = getMyQuestionIds().filter(q => q !== id);
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(list));
}

export function removeMyAnswer(id) {
  const list = getMyAnswerIds().filter(a => a !== id);
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(list));
}