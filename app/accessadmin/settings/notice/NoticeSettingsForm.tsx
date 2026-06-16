'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Sparkles, Bell, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NoticeSettingsForm({ initialIsActive, initialMessage, initialStyle }: { 
  initialIsActive: boolean; 
  initialMessage: string;
  initialStyle: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [message, setMessage] = useState(initialMessage);
  const [style, setStyle] = useState(initialStyle || 'purple');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings/notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive, message, style })
      });
      if (res.ok) {
        toast.success('Notice saved!');
        router.refresh();
      } else {
        toast.error('Failed to save');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
          <Bell className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-medium text-gray-300">Site Notice</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold">
          Custom <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Notice</span>
        </h1>
        <p className="text-gray-400 text-lg mt-2">Configure the announcement banner shown above the products page.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-purple-500"
            />
            Enable Notice
          </label>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Message</label>
            <textarea
              rows={3}
              required
              placeholder="✨ Custom orders are available! Contact us via live chat or email."
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Style / Color
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            >
              <option value="purple">Purple (Default)</option>
              <option value="info">Info (Blue)</option>
              <option value="warning">Warning (Yellow)</option>
              <option value="success">Success (Green)</option>
              <option value="danger">Danger (Red)</option>
            </select>
          </div>

          <div className="pt-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Preview</h3>
            <div className={`p-4 rounded-xl ${
              style === 'info' ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' :
              style === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300' :
              style === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' :
              style === 'danger' ? 'bg-red-500/20 border border-red-500/30 text-red-300' :
              'bg-purple-500/20 border border-purple-500/30 text-purple-300'
            }`}>
              {message || 'Your notice will appear here'}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'} <Save className="w-4 h-4 inline ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
}
