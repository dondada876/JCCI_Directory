'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading, updateProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    phone: '',
    whatsapp: '',
    country: '',
    city: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        display_name: profile.display_name || '',
        phone: profile.phone || '',
        whatsapp: profile.whatsapp || '',
        country: profile.country || '',
        city: profile.city || '',
      });
    }
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    setMessage('');

    const { error } = await updateProfile(formData);

    if (error) {
      setMessage('Error updating profile');
    } else {
      setMessage('Profile updated successfully!');
      setEditing(false);
    }

    setSaving(false);
  }

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
            >
              Sign Out
            </button>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-md ${
                message.includes('Error')
                  ? 'bg-red-50 text-red-800'
                  : 'bg-green-50 text-green-800'
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Profile Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Type
                  </label>
                  <input
                    type="text"
                    value={profile.user_type || 'member'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 capitalize"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) =>
                      setFormData({ ...formData, display_name: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2 bg-[#009B3A] text-white rounded-md hover:bg-[#008030] transition"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-[#009B3A] text-white rounded-md hover:bg-[#008030] transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setMessage('');
                      if (profile) {
                        setFormData({
                          full_name: profile.full_name || '',
                          display_name: profile.display_name || '',
                          phone: profile.phone || '',
                          whatsapp: profile.whatsapp || '',
                          country: profile.country || '',
                          city: profile.city || '',
                        });
                      }
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            {profile.user_type === 'business_owner' && (
              <div className="mt-8 pt-8 border-t">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  My Businesses
                </h2>
                <a
                  href="/directory/new"
                  className="inline-block px-6 py-2 bg-[#FDB913] text-black rounded-md hover:bg-[#e5a711] transition"
                >
                  Add New Business
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
