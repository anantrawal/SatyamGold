import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePlots } from '../hooks/usePlots';
import { seedPlots } from '../firebase/seedPlots';
import { Map, TrendingUp, Home, Clock, CheckCircle, Database } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, color, icon: Icon, onClick }) => (
  <div onClick={onClick}
    className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${color} cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center opacity-20`}
        style={{ background: 'currentColor' }}>
        <Icon size={24} className={color.replace('border-', 'text-')} />
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { userProfile, isOwner } = useAuth();
  const { plots, loading }       = usePlots();
  const navigate                 = useNavigate();
  const [seeding, setSeeding]    = useState(false);

  const stats = {
    total:     plots.length,
    available: plots.filter(p => p.status === 'available').length,
    booked:    plots.filter(p => p.status === 'booked').length,
    sold:      plots.filter(p => p.status === 'sold').length,
    hold:      plots.filter(p => p.status === 'hold').length,
  };

  const soldPercent = stats.total ? Math.round((stats.sold / stats.total) * 100) : 0;

  const recentPlots = [...plots]
    .filter(p => p.status !== 'available')
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 5);

  const handleSeed = async () => {
    if (!window.confirm('This will create 150 plots in Firestore.\nOnly run this ONCE.\n\nProceed?')) return;
    setSeeding(true);
    try {
      await seedPlots();
      toast.success('150 plots created successfully!');
    } catch (err) {
      toast.error('Seeding failed: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, {userProfile?.name?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="text-primary-100 mt-1">SatyamGold Housing Society — Management Dashboard</p>
        {stats.total > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 bg-white/20 rounded-full h-2.5">
              <div className="bg-white rounded-full h-2.5 transition-all duration-1000"
                style={{ width: `${soldPercent}%` }} />
            </div>
            <span className="text-sm font-semibold whitespace-nowrap">{soldPercent}% Sold</span>
          </div>
        )}
      </div>

      {/* ── SEED BUTTON (shown only when plots = 0 or owner) ── */}
      {isOwner && stats.total === 0 && (
        <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-6 text-center">
          <Database size={36} className="text-amber-400 mx-auto mb-3" />
          <h3 className="font-bold text-amber-800 text-lg">Database is Empty</h3>
          <p className="text-amber-600 text-sm mt-1 mb-4">
            Click below to seed 150 plots into Firestore.<br />
            <strong>Run this only once!</strong>
          </p>
          <button onClick={handleSeed} disabled={seeding}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-xl transition shadow-md disabled:opacity-60 flex items-center gap-2 mx-auto">
            {seeding
              ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Seeding plots...</>
              : <><Database size={18} /> Seed 150 Plots Now</>
            }
          </button>
        </div>
      )}

      {/* Re-seed option if plots already exist (collapsed by default) */}
      {isOwner && stats.total > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Database size={15} />
            <span>{stats.total} plots in database</span>
          </div>
          <button onClick={handleSeed} disabled={seeding}
            className="text-xs text-gray-400 hover:text-red-500 transition font-medium">
            {seeding ? 'Seeding...' : 'Re-seed (resets all plots)'}
          </button>
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-28 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Plots"  value={stats.total}     color="border-gray-400"   icon={Home}        onClick={() => navigate('/plots')} />
          <StatCard label="Available"    value={stats.available} color="border-green-500"  icon={CheckCircle} onClick={() => navigate('/plots')} />
          <StatCard label="Booked"       value={stats.booked}    color="border-yellow-500" icon={Clock}       onClick={() => navigate('/plots')} />
          <StatCard label="Sold"         value={stats.sold}      color="border-red-500"    icon={TrendingUp}  onClick={() => navigate('/plots')} />
        </div>
      )}

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Map size={18} className="text-primary-500" /> Quick Access
          </h3>
          <button onClick={() => navigate('/plots')}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md">
            <Map size={20} /> Open Plot Map
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Recent Activity</h3>
          {recentPlots.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">
              No activity yet — all plots are available
            </p>
          ) : (
            <div className="space-y-3">
              {recentPlots.map(plot => (
                <div key={plot.id}
                  onClick={() => navigate(`/plots/${plot.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0
                    ${plot.status === 'sold'   ? 'bg-red-500'
                    : plot.status === 'booked' ? 'bg-yellow-500'
                    : plot.status === 'hold'   ? 'bg-blue-500'
                    :                            'bg-green-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700 text-sm">Plot #{plot.plotNumber}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {plot.customer?.name || 'No customer'} • {plot.size}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium
                    ${plot.status === 'sold'   ? 'bg-red-100 text-red-600'
                    : plot.status === 'booked' ? 'bg-yellow-100 text-yellow-600'
                    : plot.status === 'hold'   ? 'bg-blue-100 text-blue-600'
                    :                            'bg-green-100 text-green-600'}`}>
                    {plot.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3 text-sm">Plot Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Available', color: 'bg-green-500'  },
            { label: 'Booked',    color: 'bg-yellow-500' },
            { label: 'Sold',      color: 'bg-red-500'    },
            { label: 'On Hold',   color: 'bg-blue-500'   },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded ${s.color}`} />
              <span className="text-sm text-gray-600">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
