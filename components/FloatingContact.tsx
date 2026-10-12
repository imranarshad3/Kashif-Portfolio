"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { profile } from "@/content/profile";

/** Sticky contact action that appears after the hero and hides over the contact section. */
export function FloatingContact() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const contact = document.getElementById("contact");
    let overContact = false;
    const update = () => setVisible(window.scrollY > window.innerHeight * 0.9 && !overContact);
    const io = contact
      ? new IntersectionObserver(([e]) => {
          overContact = e.isIntersecting;
          update();
        })
      : null;
    if (contact && io) io.observe(contact);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      io?.disconnect();
    };
  }, []);

  return (
    <a
      href={profile.upworkUrl}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      aria-label="Discuss your idea on Upwork"
      className={`btn-gold fixed bottom-5 right-4 z-40 shadow-2xl transition-all duration-500 max-sm:h-12 max-sm:w-12 max-sm:justify-center max-sm:p-0! sm:bottom-8 sm:right-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <MessageCircle className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden />
      <span className="max-sm:sr-only">Discuss your idea</span>
    </a>
  );
}
