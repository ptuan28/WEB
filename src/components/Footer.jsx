export default function Footer() {
  const links = [
    { label: "VNU", href: "https://vnu.edu.vn", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Vietnam_National_University%2C_Hanoi_logo.svg/200px-Vietnam_National_University%2C_Hanoi_logo.svg.png" className="w-7 h-7 rounded-full bg-white p-0.5 object-contain" alt="VNU" /> },
    { label: "GitHub", href: "https://github.com/ptuan28/WEB", icon: <GithubIcon /> },
    { label: "Facebook", href: "https://www.facebook.com/fantuan123", icon: <FbIcon /> },
    { label: "Instagram", href: "https://www.instagram.com", icon: <IgIcon /> },
    { label: "TikTok", href: "https://www.tiktok.com/@p.tuan0_0", icon: <TiktokIcon /> },
    { label: "Email", href: "mailto:fantuan0203@gmail.com", icon: <MailIcon /> },
  ];

  return (
    <footer className="bg-[#1a1a1a] border-t border-[#333] py-7 mt-auto">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          {links.map(({ label, href, icon }) => (
            <a key={label} href={href} target={href.startsWith("mailto") ? "_self" : "_blank"}
              rel="noopener noreferrer" title={label}
              className="w-11 h-11 rounded-full bg-[#2a2a2a] border border-[#3a3a3a] flex items-center justify-center hover:bg-[#333] hover:border-[#555] transition-all hover:-translate-y-0.5">
              {icon}
            </a>
          ))}
        </div>
        <p className="text-xs text-[#555]">© 2025 ptuan28 · The Chicken's Whisper</p>
      </div>
    </footer>
  );
}