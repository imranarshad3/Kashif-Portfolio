import Link from "next/link";
import { profile } from "@/content/profile";
import { Logo } from "./ui/Logo";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-10">
        <Link href="/" aria-label="Kashif Saeed — home">
          <Logo />
        </Link>
        <p className="text-[12px] text-faint">
          © {profile.name} · {profile.title} · {profile.location}
        </p>
        <a href={profile.upworkUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] text-muted hover:text-gold-bright">
          Message on Upwork ↗
        </a>
      </div>
    </footer>
  );
}
