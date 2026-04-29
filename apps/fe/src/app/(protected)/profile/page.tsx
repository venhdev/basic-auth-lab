'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth/auth-store';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  bio: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/profile/me`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setBio(data?.bio || '');
          setAvatarUrl(data?.avatar_url || '');
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, accessToken, router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    try {
      // PATCH /profile/:userId — OwnershipGuard checks user.sub === :userId
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/${user.sub}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bio, avatar_url: avatarUrl }),
        },
      );

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.message || `HTTP ${res.status}` });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-500 mt-1">{user?.email}</p>
          <div className="mt-2 flex gap-2">
            {user?.roles?.map((role) => (
              <span
                key={role}
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          {/* User ID info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <p className="text-sm text-gray-400 font-mono">{user?.sub}</p>
            <p className="text-xs text-gray-300 mt-1">
              (Lab 06: Try PATCHing another user&apos;s profile using their ID)
            </p>
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label
              htmlFor="avatar-url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Avatar URL
            </label>
            <input
              id="avatar-url"
              type="url"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Save button */}
          <button
            id="save-profile-btn"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
