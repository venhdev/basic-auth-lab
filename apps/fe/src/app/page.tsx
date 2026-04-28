import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent">
        Secure Auth Lab
      </h1>
      <p className="text-zinc-500 mb-12 text-lg">Mastering Authentication & Security Patterns</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        <Link href="/login" className="group bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-blue-500/50 transition-all">
          <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">Core Auth</h2>
          <p className="text-zinc-500 text-sm">JWT, Refresh Strategies (Blacklist/Whitelist), Silent Refresh.</p>
        </Link>

        <Link href="/lab/xss" className="group bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-red-500/50 transition-all">
          <h2 className="text-2xl font-bold mb-2 group-hover:text-red-400 transition-colors">XSS Security</h2>
          <p className="text-zinc-500 text-sm">HttpOnly Cookies, CSRF protection, CSP and XSS demonstration.</p>
        </Link>

        <Link href="/lab/pkce" className="group bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-emerald-500/50 transition-all">
          <h2 className="text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">OAuth2 & PKCE</h2>
          <p className="text-zinc-500 text-sm">Google OAuth integration and interactive PKCE challenge lab.</p>
        </Link>
      </div>
      
      <footer className="mt-20 text-zinc-600 text-sm font-mono">
        Built with NestJS + NextJS + TDD
      </footer>
    </div>
  );
}
