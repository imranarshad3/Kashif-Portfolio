import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow justify-center">404</p>
        <h1 className="mt-4 font-display text-4xl text-text">This page doesn&apos;t exist</h1>
        <Link href="/" className="btn-gold mt-8">
          Back home
        </Link>
      </div>
    </main>
  );
}
