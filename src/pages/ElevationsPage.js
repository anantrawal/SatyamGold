import React, { useEffect, useState } from 'react';
import { getAllElevations, createElevation, deleteElevation, uploadImage } from '../firebase/services';
import { PLOT_SIZES } from '../utils/constants';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload, Image, X, ChevronDown } from 'lucide-react';

export default function ElevationsPage() {
  const [elevations, setElevations] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [filter,     setFilter]     = useState('all');

  const [form, setForm] = useState({
    name: '', plotSize: '', description: '',
    frontViewFile: null, floorPlanFile: null,
    frontViewPreview: null, floorPlanPreview: null,
  });

  const load = async () => {
    const data = await getAllElevations();
    setElevations(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleFileChange = (field, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm(f => ({ ...f, [`${field}File`]: file, [`${field}Preview`]: preview }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.plotSize) { toast.error('Name and plot size are required'); return; }
    setSaving(true);
    try {
      const id = `${Date.now()}`;
      let frontViewUrl = '', floorPlanUrl = '';

      if (form.frontViewFile) {
        frontViewUrl = await uploadImage(form.frontViewFile, `elevations/${id}/front_view`);
      }
      if (form.floorPlanFile) {
        floorPlanUrl = await uploadImage(form.floorPlanFile, `elevations/${id}/floor_plan`);
      }

      await createElevation({
        name:        form.name,
        plotSize:    form.plotSize.toLowerCase().replace(' ', '_'),
        description: form.description,
        frontViewUrl,
        floorPlanUrl,
        createdAt:   new Date().toISOString(),
      });

      toast.success('Elevation design added!');
      setShowForm(false);
      setForm({ name: '', plotSize: '', description: '', frontViewFile: null, floorPlanFile: null, frontViewPreview: null, floorPlanPreview: null });
      load();
    } catch (err) {
      toast.error('Failed to add elevation');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this elevation design?')) return;
    try {
      await deleteElevation(id);
      toast.success('Deleted successfully');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = filter === 'all'
    ? elevations
    : elevations.filter(e => e.plotSize === filter.toLowerCase().replace(' ', '_'));

  const groupedBySize = PLOT_SIZES.reduce((acc, size) => {
    const key = size.toLowerCase().replace(' ', '_');
    acc[size] = filtered.filter(e => e.plotSize === key);
    return acc;
  }, {});

  return (
    <div className="space-y-6 fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Elevation Designs</h1>
          <p className="text-sm text-gray-400">Manage house designs per plot size</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow transition">
          <Plus size={18} /> Add Design
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition
            ${filter === 'all' ? 'bg-primary-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
          All
        </button>
        {PLOT_SIZES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition
              ${filter === s ? 'bg-primary-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Elevations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-56 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        Object.entries(groupedBySize).map(([size, designs]) => (
          designs.length > 0 && (
            <div key={size}>
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-5 bg-primary-400 rounded-full inline-block" />
                {size} — {designs.length} design{designs.length !== 1 ? 's' : ''}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {designs.map(elev => (
                  <div key={elev.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
                    <div className="h-44 bg-gray-100 relative overflow-hidden">
                      {elev.frontViewUrl ? (
                        <img src={elev.frontViewUrl} alt={elev.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image size={36} className="text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <button onClick={() => handleDelete(elev.id)}
                          className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-white/90 text-xs font-semibold text-gray-700 px-2 py-1 rounded-lg">
                          {size}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-800">{elev.name}</h4>
                      {elev.description && <p className="text-xs text-gray-400 mt-0.5">{elev.description}</p>}
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${elev.frontViewUrl ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          Front View {elev.frontViewUrl ? '✓' : '✗'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${elev.floorPlanUrl ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          Floor Plan {elev.floorPlanUrl ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))
      )}

      {!loading && elevations.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl">
          <Image size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No elevation designs yet</p>
          <p className="text-gray-400 text-sm mt-1">Add designs for customers to preview house looks</p>
          <button onClick={() => setShowForm(true)}
            className="mt-4 bg-primary-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-600 transition">
            + Add First Design
          </button>
        </div>
      )}

      {/* Add Design Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Add Elevation Design</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Design Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Modern Classic A"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Plot Size *</label>
                <select value={form.plotSize} onChange={e => setForm(f => ({ ...f, plotSize: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="">Select plot size</option>
                  {PLOT_SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description..."
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
              </div>

              {/* Front View Upload */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Front View Image</label>
                <label className="block cursor-pointer">
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition
                    ${form.frontViewPreview ? 'border-primary-300' : 'border-gray-200 hover:border-primary-300'}`}>
                    {form.frontViewPreview ? (
                      <img src={form.frontViewPreview} alt="preview"
                        className="max-h-32 mx-auto rounded-lg object-contain" />
                    ) : (
                      <div className="py-3">
                        <Upload size={24} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Click to upload front view</p>
                        <p className="text-xs text-gray-300 mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => handleFileChange('frontView', e.target.files[0])} />
                </label>
              </div>

              {/* Floor Plan Upload */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Floor Plan Image</label>
                <label className="block cursor-pointer">
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition
                    ${form.floorPlanPreview ? 'border-primary-300' : 'border-gray-200 hover:border-primary-300'}`}>
                    {form.floorPlanPreview ? (
                      <img src={form.floorPlanPreview} alt="preview"
                        className="max-h-32 mx-auto rounded-lg object-contain" />
                    ) : (
                      <div className="py-3">
                        <Upload size={24} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Click to upload floor plan</p>
                        <p className="text-xs text-gray-300 mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => handleFileChange('floorPlan', e.target.files[0])} />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition disabled:opacity-60">
                  {saving ? 'Uploading...' : 'Add Design'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
