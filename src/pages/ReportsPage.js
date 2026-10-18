import React from 'react';
import { usePlots } from '../hooks/usePlots';
import { STATUS_CONFIG, PLOT_SIZES, formatPrice } from '../utils/constants';
import { BarChart3, TrendingUp, Home, PieChart } from 'lucide-react';

const Bar = ({ label, value, max, color }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm text-gray-600 w-24 flex-shrink-0">{label}</span>
    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
      <div className="h-full rounded-full flex items-center px-3 transition-all duration-700"
        style={{ width: max ? `${(value / max) * 100}%` : '0%', background: color, minWidth: value > 0 ? '2rem' : '0' }}>
        {value > 0 && <span className="text-white text-xs font-bold">{value}</span>}
      </div>
    </div>
    <span className="text-sm font-bold text-gray-700 w-8 text-right">{value}</span>
  </div>
);

export default function ReportsPage() {
  const { plots, loading } = usePlots();

  const stats = {
    total:     plots.length,
    available: plots.filter(p => p.status === 'available').length,
    booked:    plots.filter(p => p.status === 'booked').length,
    sold:      plots.filter(p => p.status === 'sold').length,
    hold:      plots.filter(p => p.status === 'hold').length,
  };

  // Stats per plot size
  const sizeStats = PLOT_SIZES.map(size => ({
    size,
    total:     plots.filter(p => p.size === size).length,
    available: plots.filter(p => p.size === size && p.status === 'available').length,
    sold:      plots.filter(p => p.size === size && p.status === 'sold').length,
    booked:    plots.filter(p => p.size === size && p.status === 'booked').length,
  })).filter(s => s.total > 0);

  const soldPercent    = stats.total ? Math.round((stats.sold    / stats.total) * 100) : 0;
  const bookedPercent  = stats.total ? Math.round((stats.booked  / stats.total) * 100) : 0;
  const availPercent   = stats.total ? Math.round((stats.available / stats.total) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-400">SatyamGold — Plot availability summary</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Plots',  value: stats.total,     color: 'from-gray-500 to-gray-400',    percent: 100 },
          { label: 'Available',    value: stats.available, color: 'from-green-500 to-green-400',  percent: availPercent  },
          { label: 'Sold',         value: stats.sold,      color: 'from-red-500 to-red-400',      percent: soldPercent   },
          { label: 'Booked',       value: stats.booked,    color: 'from-yellow-500 to-yellow-400',percent: bookedPercent },
        ].map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white shadow-md`}>
            <p className="text-white/80 text-sm font-medium">{card.label}</p>
            <p className="text-4xl font-bold mt-1">{card.value}</p>
            <p className="text-white/70 text-xs mt-2">{card.percent}% of total</p>
          </div>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
          <BarChart3 size={18} className="text-primary-500" /> Status Breakdown
        </h2>
        <div className="space-y-3">
          <Bar label="Available" value={stats.available} max={stats.total} color="#22c55e" />
          <Bar label="Sold"      value={stats.sold}      max={stats.total} color="#ef4444" />
          <Bar label="Booked"    value={stats.booked}    max={stats.total} color="#f59e0b" />
          <Bar label="On Hold"   value={stats.hold}      max={stats.total} color="#3b82f6" />
        </div>

        {/* Visual percentage bar */}
        <div className="mt-5">
          <div className="flex rounded-full overflow-hidden h-4">
            {stats.sold      > 0 && <div style={{ width: `${soldPercent}%`,   background: '#ef4444' }} title={`Sold: ${soldPercent}%`} />}
            {stats.booked    > 0 && <div style={{ width: `${bookedPercent}%`, background: '#f59e0b' }} title={`Booked: ${bookedPercent}%`} />}
            {stats.available > 0 && <div style={{ width: `${availPercent}%`,  background: '#22c55e' }} title={`Available: ${availPercent}%`} />}
            {stats.hold      > 0 && <div style={{ width: `${stats.total ? Math.round((stats.hold/stats.total)*100) : 0}%`, background: '#3b82f6' }} />}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
      </div>

      {/* By Plot Size */}
      {sizeStats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Home size={18} className="text-primary-500" /> By Plot Size
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Size', 'Total', 'Available', 'Sold', 'Booked', 'Availability'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sizeStats.map(row => (
                  <tr key={row.size} className="hover:bg-gray-50 transition">
                    <td className="py-3 pr-4 font-semibold text-gray-800">{row.size}</td>
                    <td className="py-3 pr-4 text-gray-600">{row.total}</td>
                    <td className="py-3 pr-4">
                      <span className="text-green-600 font-semibold">{row.available}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-red-500 font-semibold">{row.sold}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-yellow-500 font-semibold">{row.booked}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 w-20">
                          <div className="h-2 bg-green-400 rounded-full"
                            style={{ width: `${row.total ? (row.available/row.total)*100 : 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">
                          {row.total ? Math.round((row.available/row.total)*100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sold Plots List */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary-500" /> Sold & Booked Plots
        </h2>
        {plots.filter(p => ['sold','booked'].includes(p.status)).length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No sold or booked plots yet</p>
        ) : (
          <div className="space-y-2">
            {plots.filter(p => ['sold','booked'].includes(p.status)).map(plot => {
              const cfg = STATUS_CONFIG[plot.status];
              return (
                <div key={plot.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm">
                    {plot.plotNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">Plot #{plot.plotNumber} — {plot.size}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {plot.customer?.name || 'No name'} • {plot.customer?.phone || 'No phone'}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
