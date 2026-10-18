import React, { useEffect, useState } from 'react';
import { getOfficeUsers, deleteUser } from '../firebase/services';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Plus, Trash2, Users, Mail, X, Eye, EyeOff } from 'lucide-react';
import { getInitials, isValidEmail } from '../utils/constants';

export default function UsersPage() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { createOfficeUser, userProfile } = useAuth();

  const load = async () => {
    const data = await getOfficeUsers();
    setUsers(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('All fields are required'); return; }
    if (!isValidEmail(form.email))                   { toast.error('Invalid email address'); return; }
    if (form.password.length < 6)                    { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await createOfficeUser(form.email, form.password, form.name);
      toast.success(`Office account created for ${form.name}`);
      setShowForm(false);
      setForm({ name: '', email: '', password: '' });
      load();
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') toast.error('Email already in use');
      else toast.error('Failed to create account');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (uid, name) => {
    if (!window.confirm(`Remove ${name}'s access?`)) return;
    try {
      await deleteUser(uid);
      toast.success('User removed');
      load();
    } catch {
      toast.error('Failed to remove user');
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-sm text-gray-400">Manage office staff accounts</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow transition">
          <Plus size={18} /> Add Staff
        </button>
      </div>

      {/* Owner Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            {getInitials(userProfile?.name)}
          </div>
          <div>
            <p className="font-bold text-lg">{userProfile?.name}</p>
            <p className="text-primary-100 text-sm">{userProfile?.email}</p>
          </div>
          <span className="ml-auto bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-semibold">
            👑 Owner
          </span>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={18} className="text-primary-500" /> Office Staff ({users.length})
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10">
            <Users size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No office staff yet</p>
            <p className="text-gray-400 text-sm mt-1">Add staff members to let them manage plots</p>
            <button onClick={() => setShowForm(true)}
              className="mt-4 bg-primary-500 text-white px-5 py-2 rounded-xl font-semibold hover:bg-primary-600 transition text-sm">
              + Add First Staff Member
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 font-bold text-sm">
                  {getInitials(user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Mail size={11} /> {user.email}
                  </p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-semibold">Office</span>
                <button onClick={() => handleDelete(user.id, user.name)}
                  className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Add Office Staff</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Full Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Staff member name"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email Address *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="staff@email.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Password *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 6 characters"
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition disabled:opacity-60">
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
