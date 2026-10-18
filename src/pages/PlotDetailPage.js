import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlot, updatePlot } from '../firebase/services';
import { useAuth } from '../hooks/useAuth';
import { STATUS_CONFIG, PLOT_SIZES, FACING_OPTIONS, formatPrice, isValidEmail, isValidPhone } from '../utils/constants';
import toast from 'react-hot-toast';
import {
  ArrowLeft, User, Phone, Mail, Home,
  Edit2, Save, X, Image, MapPin, Ruler,
  DollarSign, Compass, CheckSquare
} from 'lucide-react';

const Field = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
      <Icon size={16} className="text-primary-500" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-gray-800 font-semibold text-sm mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

export default function PlotDetailPage() {
  const { plotId } = useParams();
  const cleanPlotId = plotId?.trim();
  const navigate   = useNavigate();
  const { isOwner, isOffice } = useAuth();
  
  const [plot,    setPlot]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({});

useEffect(() => {
  const load = async () => {
    const data = await getPlot(plotId);
    setPlot(data);
    setForm(data || {});
    setLoading(false);
  };
  load();
}, [plotId]);
  

  const canEdit = isOwner || isOffice;
  
  
  const handleChange = (field, value) => {
  if (field.startsWith('customer.')) {
    const key = field.split('.')[1];
    setForm(f => ({ ...f, customer: { ...f.customer, [key]: value } }));
  } else {
    setForm(f => ({ ...f, [field]: value }));
  }
};
  
  const handleSave = async () => {
    // Validate customer fields if status is sold/booked
    if (['sold', 'booked'].includes(form.status)) {
      if (!form.customer?.name?.trim()) { toast.error('Customer name is required'); return; }
      if (form.customer?.email && !isValidEmail(form.customer.email)) { toast.error('Invalid email address'); return; }
      if (form.customer?.phone && !isValidPhone(form.customer.phone)) { toast.error('Invalid phone number'); return; }
    }
    setSaving(true);
    try {
      const updated = { ...form, updatedAt: new Date().toISOString() };
      await updatePlot(cleanPlotId, updated);
      setPlot(updated);
      setEditing(false);
      toast.success('Plot updated successfully!');
    } catch {
      toast.error('Failed to update plot');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setForm(plot); setEditing(false); };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!plot) return (
    <div className="text-center py-16">
      <Home size={48} className="text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500">Plot not found</p>
      <button onClick={() => navigate('/plots')} className="mt-4 text-primary-500 hover:underline text-sm">
        ← Back to Plot Map
      </button>
    </div>
  );

  const statusCfg  = STATUS_CONFIG[form.status] || STATUS_CONFIG.available;
  const showCustomer = ['sold', 'booked', 'hold'].includes(form.status);

  return (
    <div className="max-w-2xl mx-auto space-y-4 fade-in">

      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/plots')}
          className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center hover:bg-gray-50 transition">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Plot #{plot.plotNumber}</h1>
          <p className="text-sm text-gray-400">{plot.size} • {plot.facing} Facing</p>
        </div>
        <div className="ml-auto">
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Plot Info Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Home size={18} className="text-primary-500" /> Plot Information
          </h2>
          {canEdit && !editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition">
              <Edit2 size={14} /> Edit
            </button>
          )}
          {editing && (
            <div className="flex gap-2">
              <button onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
                <X size={14} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-60">
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Status</label>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button key={key} onClick={() => handleChange('status', key)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition
                      ${form.status === key ? `${cfg.bg} ${cfg.text} ${cfg.border}` : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Plot Number</label>
              <input value={form.plotNumber || ''} onChange={e => handleChange('plotNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Size</label>
              <select value={form.size || ''} onChange={e => handleChange('size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                <option value="">Select size</option>
                {PLOT_SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Facing</label>
              <select value={form.facing || ''} onChange={e => handleChange('facing', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                <option value="">Select facing</option>
                {FACING_OPTIONS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Price (PKR)</label>
              <input type="number" value={form.price || ''} onChange={e => handleChange('price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="corner" checked={form.isCorner || false}
                onChange={e => handleChange('isCorner', e.target.checked)}
                className="w-4 h-4 accent-primary-500" />
              <label htmlFor="corner" className="text-sm text-gray-700 font-medium">Corner Plot</label>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plot Number" value={`#${plot.plotNumber}`}  icon={Home}       />
            <Field label="Size"        value={plot.size}              icon={Ruler}      />
            <Field label="Facing"      value={plot.facing}            icon={Compass}    />
            <Field label="Price"       value={formatPrice(plot.price)} icon={DollarSign} />
            <Field label="Location"    value={plot.block || 'Block A'} icon={MapPin}     />
            <Field label="Corner Plot" value={plot.isCorner ? 'Yes ✓' : 'No'} icon={CheckSquare} />
          </div>
        )}
      </div>

      {/* Customer Details */}
      {showCustomer && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User size={18} className="text-primary-500" /> Customer Details
          </h2>
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Full Name *</label>
                <input value={form.customer?.name || ''} onChange={e => handleChange('customer.name', e.target.value)}
                  placeholder="Customer full name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Phone Number</label>
                <input value={form.customer?.phone || ''} onChange={e => handleChange('customer.phone', e.target.value)}
                  placeholder="03xx-xxxxxxx"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email Address</label>
                <input type="email" value={form.customer?.email || ''} onChange={e => handleChange('customer.email', e.target.value)}
                  placeholder="customer@email.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
            </div>
          ) : plot.customer?.name ? (
            <div className="space-y-3">
              <Field label="Customer Name"  value={plot.customer?.name}  icon={User}  />
              <Field label="Phone Number"   value={plot.customer?.phone} icon={Phone} />
              <Field label="Email Address"  value={plot.customer?.email} icon={Mail}  />
            </div>
          ) : (
            <div className="text-center py-6">
              <User size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No customer details added yet</p>
              {canEdit && (
                <button onClick={() => setEditing(true)}
                  className="mt-2 text-primary-500 text-sm hover:underline">
                  + Add customer details
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Elevation Viewer Button */}
      <button onClick={() => navigate(`/plots/${plotId}`, { state: { openElevations: true } })}
        className="w-full bg-gradient-to-r from-primary-500 to-primary-400 text-white font-semibold py-4 rounded-2xl
          shadow-lg hover:shadow-xl hover:from-primary-600 hover:to-primary-500 transition flex items-center justify-center gap-2">
        <Image size={20} />
        View Elevation Designs for {plot.size || 'This Plot'}
      </button>

      {/* Elevations Panel (inline) */}
      <ElevationsPanel plotSize={plot.size} />
    </div>
  );
}

// ─── Inline Elevations Panel ──────────────────────────────────
import { getElevations } from '../firebase/services';

function ElevationsPanel({ plotSize }) {
  const [elevations, setElevations] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [tab,        setTab]        = useState('front'); // 'front' | 'floor'

  useEffect(() => {
    if (!plotSize) return;
    getElevations(plotSize).then(data => { setElevations(data); setLoading(false); });
  }, [plotSize]);

  if (!plotSize) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
        <Image size={18} className="text-primary-500" /> Elevation Designs
      </h2>
      <p className="text-xs text-gray-400 mb-4">Designs available for {plotSize}</p>

      {loading ? (
        <div className="flex gap-3">
          {[1,2,3].map(i => <div key={i} className="flex-1 h-32 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : elevations.length === 0 ? (
        <div className="text-center py-8">
          <Image size={36} className="text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No designs uploaded for {plotSize} yet</p>
          <p className="text-gray-300 text-xs mt-1">Owner can add designs from the Elevations section</p>
        </div>
      ) : (
        <>
          {/* Design Thumbnails */}
          <div className="flex gap-3 mb-4 overflow-x-auto pb-1">
            {elevations.map((elev, i) => (
              <button key={elev.id} onClick={() => setSelected(elev)}
                className={`flex-shrink-0 w-28 h-20 rounded-xl overflow-hidden border-2 transition
                  ${selected?.id === elev.id ? 'border-primary-500 shadow-md' : 'border-gray-200 hover:border-primary-300'}`}>
                {elev.frontViewUrl ? (
                  <img src={elev.frontViewUrl} alt={elev.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-400 font-medium">Design {i+1}</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Selected Design Viewer */}
          {selected && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button onClick={() => setTab('front')}
                  className={`flex-1 py-2.5 text-sm font-semibold transition
                    ${tab === 'front' ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  Front View
                </button>
                <button onClick={() => setTab('floor')}
                  className={`flex-1 py-2.5 text-sm font-semibold transition
                    ${tab === 'floor' ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  Floor Plan
                </button>
              </div>
              <div className="p-4 bg-gray-50 min-h-48 flex items-center justify-center">
                {(tab === 'front' ? selected.frontViewUrl : selected.floorPlanUrl) ? (
                  <img
                    src={tab === 'front' ? selected.frontViewUrl : selected.floorPlanUrl}
                    alt={`${selected.name} ${tab}`}
                    className="max-w-full max-h-80 rounded-lg shadow-md object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <Image size={36} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">
                      {tab === 'front' ? 'Front view' : 'Floor plan'} not uploaded yet
                    </p>
                  </div>
                )}
              </div>
              <div className="px-4 py-3 bg-white border-t border-gray-100">
                <p className="font-semibold text-gray-800 text-sm">{selected.name}</p>
                <p className="text-xs text-gray-400">{selected.description || ''}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
