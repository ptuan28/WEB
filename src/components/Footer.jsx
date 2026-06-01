import { Facebook, Github, Instagram, Mail, Music2 } from 'lucide-react';

export default function Footer() {
  const links = [
    { label: "GitHub", href: "https://github.com/ptuan28", icon: <Github className="w-5 h-5" /> },
    { label: "Facebook", href: "https://www.facebook.com/fantuan123", icon: <Facebook className="w-5 h-5" /> },
    { label: "Instagram", href: "https://www.instagram.com", icon: <Instagram className="w-5 h-5" /> },
    { label: "TikTok", href: "https://www.tiktok.com/@p.tuan0_0", icon: <Music2 className="w-5 h-5" /> },
    { label: "Email", href: "mailto:fantuan0203@gmail.com", icon: <Mail className="w-5 h-5" /> },
  ];
  const socialLinks = links.slice(0, -1);
  const emailLink = links[links.length - 1];

  return (
    <footer className="bg-[#1a1a1a] mt-auto">
      <div className="max-w-6xl mx-auto border-t border-[#2d2d2d] px-8 py-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <a href="https://vnu.edu.vn" target="_blank" rel="noopener noreferrer" className="inline-block">
            <div className="font-lexend font-black text-2xl leading-none tracking-wide text-[#16a34a]">
              VNU
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase leading-none text-[#16a34a]">
              &#272;&#7840;I H&#7884;C QU&#7888;C GIA H&#192; N&#7896;I
            </div>
            <div className="mt-1 text-[10px] font-medium leading-none text-gray-300">
              Vietnam National University, Hanoi
            </div>
          </a>

          <div className="flex items-center gap-3">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                className="w-11 h-11 rounded-full bg-[#242424] border border-[#3a3a3a] flex items-center justify-center text-gray-200 hover:bg-[#303030] hover:border-[#555] transition-all hover:-translate-y-0.5"
              >
                {icon}
              </a>
            ))}
            <div className="h-8 w-px bg-[#3a3a3a] mx-2" />
            <a
              href={emailLink.href}
              title={emailLink.label}
              className="w-11 h-11 rounded-full bg-[#242424] border border-[#3a3a3a] flex items-center justify-center text-gray-200 hover:bg-[#303030] hover:border-[#555] transition-all hover:-translate-y-0.5"
            >
              {emailLink.icon}
            </a>
          </div>
        </div>
        <p className="mt-1 text-center text-xs text-[#555]">&copy; 2025 ptuan28 &middot; The Chicken's Whisper</p>
      </div>
    </footer>
  );
}
