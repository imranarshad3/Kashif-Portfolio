import type { Metadata, Viewport } from "next";
import { Caveat, Manrope, Sora } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { MagneticButtons } from "@/components/MagneticButtons";
import { ACCENT_PREPAINT } from "@/lib/accentScript";
import { HERO_PREPAINT } from "@/lib/heroPrepaint";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["500", "600"] });

const description =
  "Kashif Saeed — full-stack engineer for FinTech, SaaS and AI products. Python, Node.js, React and Next.js, from data model and APIs to production.";

export const metadata: Metadata = {
  title: { default: "Kashif Saeed — Full-Stack Engineer", template: "%s · Kashif Saeed" },
  description,
  openGraph: {
    title: "Kashif Saeed — Full-Stack Engineer",
    description,
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Kashif Saeed — Full-Stack Engineer", description },
};

export const viewport: Viewport = {
  themeColor: "#060608",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the pre-paint scripts may add data-accent / a class before React hydrates
    <html lang="en" className={`${manrope.variable} ${sora.variable} ${caveat.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* suppressHydrationWarning: extensions often inject their own <script> at the top of <head> */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `${ACCENT_PREPAINT};${HERO_PREPAINT}` }} />
      </head>
      <body className="min-h-dvh">
        <SmoothScroll />
        <MagneticButtons />
        {children}
      </body>
    </html>
  );
}
