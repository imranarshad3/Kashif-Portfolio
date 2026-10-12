import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { FloatingContact } from "@/components/FloatingContact";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { Companies } from "@/components/sections/Companies";
import { Contact } from "@/components/sections/Contact";
import { AmbientLight } from "@/components/AmbientLight";
import { Intro } from "@/components/Intro";

export default function Home() {
  return (
    <>
      <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Intro />
      <AmbientLight />
      <Nav />
      <main className="relative">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Companies />
        <Contact />
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
