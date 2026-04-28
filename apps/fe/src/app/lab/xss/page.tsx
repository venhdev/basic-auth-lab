'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function XSSLabPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Guest';
  const [cookieData, setCookieData] = useState('');

  useEffect(() => {
    // Try to read cookies via JS
    setCookieData(document.cookie || 'No accessible cookies found');
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-red-400">XSS Security Lab</h1>
        
        <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold">1. Reflected XSS Demo</h2>
          <p className="text-zinc-400">
            Welcome, <span className="text-blue-400 font-mono" dangerouslySetInnerHTML={{ __html: name }} />
          </p>
          <div className="text-xs text-zinc-600 bg-black p-3 rounded">
            URL: /lab/xss?name=&lt;img src=x onerror=alert(1)&gt;
          </div>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold">2. Token Theft Check</h2>
          <p className="text-zinc-400">Content of <code>document.cookie</code> (Accessible via JS):</p>
          <div className="bg-zinc-950 p-4 rounded border border-zinc-800 font-mono text-emerald-400 break-all">
            {cookieData}
          </div>
          <p className="text-sm text-zinc-500 italic">
            *If HttpOnly is working, your <code>refresh_token</code> should NOT appear here.
          </p>
        </section>

        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-blue-300 text-sm">
          <strong>Tip:</strong> Open DevTools Console and type <code>document.cookie</code> to verify yourself.
        </div>
      </div>
    </div>
  );
}
