const ANIMALS = [
  'Gà Con', 'Vịt Bầu', 'Heo Nâu', 'Bò Sữa', 'Mèo Mướp',
  'Chó Đốm', 'Thỏ Bông', 'Cá Vàng', 'Ếch Xanh', 'Rùa Nhỏ',
  'Cò Trắng', 'Vẹt Đỏ', 'Sóc Nâu', 'Gấu Trúc', 'Hổ Vằn',
  'Cáo Cam', 'Chim Sẻ', 'Bướm Vàng', 'Ong Mật', 'Sư Tử',
];

const ADJECTIVES = [
  'Thông Thái', 'Dễ Thương', 'Siêu Cấp', 'Bí Ẩn', 'Vui Vẻ',
  'Ngầu Lòi', 'Học Giỏi', 'Hay Ho', 'Chill', 'Huyền Bí',
];

const AVATAR_EMOJIS = ['🐔', '🐣', '🦆', '🐷', '🐮', '🐱', '🐶', '🐰', '🐟', '🐸',
  '🐢', '🦜', '🐿️', '🐼', '🦁', '🦊', '🐦', '🦋', '🐝', '🐯'];

const AVATAR_COLORS = [
  'bg-yellow-300', 'bg-pink-300', 'bg-blue-300', 'bg-green-300', 'bg-purple-300',
  'bg-orange-300', 'bg-red-300', 'bg-teal-300', 'bg-indigo-300', 'bg-lime-300',
];

const ANON_ID_KEY = 'tcw_anon_user_id';

// Tạo hoặc lấy random ID cố định cho thiết bị này
export function getAnonUserId() {
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAnonIdentity(createdBy) {
  if (!createdBy) return { name: 'Gà Ẩn Danh', emoji: '🐔', color: 'bg-yellow-300' };
  const h = hashString(createdBy);
  const name = `${ADJECTIVES[h % ADJECTIVES.length]} ${ANIMALS[(h >> 3) % ANIMALS.length]}`;
  const emoji = AVATAR_EMOJIS[h % AVATAR_EMOJIS.length];
  const color = AVATAR_COLORS[(h >> 2) % AVATAR_COLORS.length];
  return { name, emoji, color };
}