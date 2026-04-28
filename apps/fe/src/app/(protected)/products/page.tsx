'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/auth/api';
import { useAuthStore } from '@/lib/auth/auth-store';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logout, accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
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

    fetchProducts();
  }, [accessToken, router]);

  const handleLogout = async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      } catch (e) {}
    }
    logout();
    router.push('/login');
  };

  if (isLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Products Lab
          </h1>
          <button
            onClick={handleLogout}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-6 py-2 rounded-lg transition-all"
          >
            Sign Out
          </button>
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
