'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth/auth-store';
import { useRouter } from 'next/navigation';
import api from '@/lib/auth/api';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

export default function AdminPage() {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Client-side role check
  const isAdmin = user?.roles?.includes('admin');

  // Đợi Zustand nạp xong dữ liệu từ LocalStorage
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.replace('/login');
      return;
    }
    
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [usersRes, productsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/products')
        ]);
        setUsers(usersRes.data);
        setProducts(productsRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, accessToken, isAdmin, router, hasHydrated]);

  if (!hasHydrated || (loading && isAdmin)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Authenticating...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="mt-2 text-zinc-400">You need admin privileges to view this page.</p>
          <button 
            onClick={() => router.push('/products')}
            className="mt-6 text-blue-500 hover:underline"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-zinc-500 mt-1">Management Overview</p>
          </div>
          <button 
            onClick={() => router.push('/products')}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2 rounded-lg text-sm"
          >
            Public View
          </button>
        </div>

        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl">
            Error: {error}
          </div>
        )}

        {/* --- USERS SECTION --- */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-semibold">Users</h2>
            <span className="bg-zinc-900 text-zinc-500 text-xs px-2 py-1 rounded-full border border-zinc-800">
              {users.length} total
            </span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Roles</th>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4 text-right">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{u.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {u.roles.map((r) => (
                          <span key={r.id} className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            r.name === 'admin' ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 'bg-blue-900/30 text-blue-400 border-blue-800'
                          }`}>
                            {r.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-zinc-500">{u.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 text-right text-zinc-500 text-sm">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- PRODUCTS SECTION --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold">Inventory</h2>
              <span className="bg-zinc-900 text-zinc-500 text-xs px-2 py-1 rounded-full border border-zinc-800">
                {products.length} items
              </span>
            </div>
          </div>

          {/* Quick Add Form */}
          <div className="mb-8 bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">Quick Add Product</h3>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  name: formData.get('name') as string,
                  price: Number(formData.get('price')),
                  description: formData.get('description') as string,
                };
                try {
                  await api.post('/products', data);
                  // Refresh products
                  const res = await api.get('/products');
                  setProducts(res.data);
                  (e.target as HTMLFormElement).reset();
                } catch (err: any) {
                  alert(err.response?.data?.message || 'Failed to add product');
                }
              }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <input 
                name="name" 
                placeholder="Product Name" 
                required 
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input 
                name="price" 
                type="number" 
                step="0.01" 
                placeholder="Price ($)" 
                required 
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input 
                name="description" 
                placeholder="Brief description..." 
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm md:col-span-1 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
              >
                Add Item
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-all" />
                <h3 className="text-lg font-bold mb-1">{p.name}</h3>
                <p className="text-zinc-500 text-xs mb-4 line-clamp-2">{p.description}</p>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black text-blue-400">${p.price}</span>
                  <span className="text-[10px] text-zinc-600 font-mono">SKU-{p.id}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
