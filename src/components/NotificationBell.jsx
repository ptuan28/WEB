import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUserEmail(me.email);
        const data = await base44.entities.Notification.filter({ user_email: me.email }, '-created_date', 20);
        setNotifications(data);
      } catch {}
    };
    init();
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const handleOpen = async () => {
    setOpen(v => !v);
    if (!open && unread > 0) {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      await Promise.all(unreadIds.map(id => base44.entities.Notification.update(id, { read: true })));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  if (!userEmail) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 bg-black text-yellow-400 rounded-xl hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 border-2 border-black rounded-full text-white text-[10px] font-black flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_black] z-50 overflow-hidden">
          <div className="px-4 py-3 border-b-2 border-black bg-yellow-400">
            <h3 className="font-lexend font-black text-sm">🔔 Thông báo</h3>
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="text-3xl mb-2">🐔</div>
              <p className="text-sm text-gray-400 font-grotesk">Chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
              {notifications.map(n => (
                <Link
                  key={n.id}
                  to={`/question/${n.question_id}`}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 hover:bg-yellow-50 transition-colors ${!n.read ? 'bg-yellow-50' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{n.type === 'answer' ? '🧠' : '💬'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-grotesk font-semibold text-gray-800 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(n.created_date), { addSuffix: true, locale: vi })}
                      </p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-pink-500 mt-1 shrink-0" />}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}