import { Mail, Instagram } from "lucide-react";

const Footer = () => (
  <footer className="py-12 border-t border-border">
    <div className="container">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg lion-gradient flex items-center justify-center text-white text-xs font-bold">
            🦁
          </div>
          <div>
            <p className="font-bold text-sm font-display">LIKELION GNU</p>
            <p className="text-xs text-muted-foreground">경상국립대 · 14기</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a
            href="mailto:gyeongsang.univ@likelion.org"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Mail className="w-4 h-4" />
            이메일
          </a>
          <a
            href="https://instagram.com/likelion_gnu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Instagram className="w-4 h-4" />
            @likelion_gnu
          </a>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2026 멋쟁이사자처럼 경상국립대. Possibility to Reality.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
