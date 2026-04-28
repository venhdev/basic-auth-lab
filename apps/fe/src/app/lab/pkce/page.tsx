'use client';

import { useState } from 'react';
import CryptoJS from 'crypto-js';

export default function PKCELabPage() {
  const [verifier, setVerifier] = useState('');
  const [challenge, setChallenge] = useState('');
  const [method, setMethod] = useState('S256');

  const generatePKCE = () => {
    // 1. Generate Verifier (Random string)
    const randomArray = new Uint8Array(32);
    window.crypto.getRandomValues(randomArray);
    const codeVerifier = btoa(String.fromCharCode.apply(null, Array.from(randomArray)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    setVerifier(codeVerifier);

    // 2. Generate Challenge
    if (method === 'S256') {
      const hash = CryptoJS.SHA256(codeVerifier);
      const codeChallenge = CryptoJS.enc.Base64.stringify(hash)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      setChallenge(codeChallenge);
    } else {
      setChallenge(codeVerifier); // 'plain' method
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-emerald-400">PKCE Security Lab</h1>
        
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-6 shadow-2xl">
          <p className="text-zinc-400">
            PKCE (Proof Key for Code Exchange) prevents authorization code injection attacks for public clients.
          </p>

          <div className="space-y-4">
            <button
              onClick={generatePKCE}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Generate PKCE Pair
            </button>
          </div>

          {verifier && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Code Verifier (The Secret)</label>
                <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono text-emerald-400 break-all select-all">
                  {verifier}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Code Challenge (Sent to Server)</label>
                <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono text-blue-400 break-all select-all">
                  {challenge}
                </div>
                <p className="text-xs text-zinc-600">Generated using SHA-256 + Base64UrlEncode</p>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2">How it works:</h3>
                <ol className="list-decimal list-inside text-sm text-zinc-400 space-y-2">
                  <li>Client generates <strong>Verifier</strong> and derives <strong>Challenge</strong>.</li>
                  <li>Client sends <strong>Challenge</strong> in Auth Request.</li>
                  <li>Provider returns <strong>Auth Code</strong>.</li>
                  <li>Client sends <strong>Auth Code</strong> + <strong>Verifier</strong> in Token Request.</li>
                  <li>Server hashes <strong>Verifier</strong> and compares with original <strong>Challenge</strong>.</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
