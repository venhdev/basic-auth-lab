'use client';

import api from '@/lib/auth/api';
import { useAuthStore } from '@/lib/auth/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);
  const { logout, accessToken, isExpired, setExpired, user } = useAuthStore();
  const router = useRouter();

  // Đợi Zustand nạp xong dữ liệu từ LocalStorage
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!accessToken && !isExpired) {
      router.push('/login');
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (err) {
        // Interceptor handles 401/refresh
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      fetchProducts();
    }
  }, [accessToken, hasHydrated, isExpired, router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    logout();
    router.push('/login');
  };

  const goToLogin = () => {
    setExpired(false);
    router.push('/login');
  };

  if (!hasHydrated || (isLoading && !isExpired)) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      {/* Session Expired Modal */}
      {isExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-sm w-full shadow-2xl text-center scale-in-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Session Expired</h2>
            <p className="text-zinc-400 mb-8">Your security token has expired. Please sign in again to continue.</p>
            <button
              onClick={goToLogin}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              Products Lab
            </h1>
            {user && (
              <div className="flex flex-wrap gap-3 items-center mt-2">
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono text-zinc-300">
                    {user.email}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(user.roles?.length ? user.roles : ['user']).map((r) => (
                    <span
                      key={r}
                      className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded border ${
                        r === 'admin'
                          ? 'bg-purple-900/50 text-purple-400 border-purple-800'
                          : 'bg-zinc-900/50 text-zinc-500 border-zinc-800'
                      }`}
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-zinc-600 font-mono">
                  ID: {user.sub}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            {user?.roles?.includes('admin') && (
              <button
                onClick={() => router.push('/admin')}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg transition-all text-sm font-bold shadow-lg shadow-purple-500/20"
              >
                👑 Admin Panel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-6 py-2 rounded-lg transition-all text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl hover:border-blue-500/50 transition-all">
              <h3 className="text-xl font-semibold mb-2">{p.name}</h3>
              <p className="text-2xl font-bold text-blue-400">${p.price}</p>
              <div className="mt-4 flex items-center text-sm text-zinc-500">
                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                  Verified with JWT
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
