import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlots } from '../hooks/usePlots';
import { STATUS_CONFIG } from '../utils/constants';
import { ZoomIn, ZoomOut, Maximize2, Search } from 'lucide-react';

// ─── All plot IDs in the SVG ──────────────────────────────────
const ALL_PLOT_IDS = [
  'path478','path483','path301','path300','path500',
  'path503','path502','path270','path296','path269',
  'path297','path278','path277','path279','path276',
  'path273','path275','path265','path274','path283',
  'path282','path268','path281','path280','path266',
  'path267','path271','path272','path595','path488',
  'path494','path299','path298','path948','path952',
  'path951','path945','path950','path949','path943',
  'path944','path946','path947','path802','path262',
  'path810','path809','path263','path264','path808',
  'path807','path803','path804','path805','path806',
  'path961','path967','path971','path970','path964',
  'path969','path968','path962','path963','path965',
  'path966','path253','path250','path261','path260',
  'path251','path252','path259','path258','path254',
  'path255','path256','path257','path1029','path1033',
  'path1032','path1026','path1031','path1030','path1024',
  'path1025','path1027','path1028','path231','path228',
  'path239','path238','path229','path230','path237',
  'path236','path232','path233','path234','path235',
  'path1091','path1095','path1094','path1088','path1093',
  'path1092','path1086','path1087','path1089','path1090',
  'path227','path291','path284','path290','path295',
  'path294','path287','path293','path292','path285',
  'path286','path288','path289','path217',
    // LIG plots
  'path504','path505','path507','path509','path511','path513','path515','path621',
  // EWS plots
  'path240','path241','path242','path243','path244','path245','path246',
  'path247','path248','path527','path529',
];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
};

export default function PlotMapPage() {
  const navigate           = useNavigate();
  const { plots, loading } = usePlots();
  const svgContainerRef    = useRef(null);
  const containerRef       = useRef(null);

  const [scale,     setScale]     = useState(0.8);
  const [translate, setTranslate] = useState({ x: 10, y: 10 });
  const [dragging,  setDragging]  = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('all');
  const [tooltip,   setTooltip]   = useState(null);
  const [svgReady,  setSvgReady]  = useState(false);

  // Map Firestore data by id
  const plotMap = {};
  plots.forEach(p => { plotMap[p.id] = p; });

  const getStatus = (id) => plotMap[id]?.status || 'available';
  const getColor  = (id) => STATUS_CONFIG[getStatus(id)]?.color || '#22c55e';

  // Once SVG and plots are loaded — color all plots
  useEffect(() => {
    if (loading || !svgReady) return;
    colorAllPlots();
  }, [plots, loading, svgReady, filter, search]);

  const colorAllPlots = () => {
    const container = svgContainerRef.current;
    if (!container) return;
    ALL_PLOT_IDS.forEach(id => {
      const el = container.querySelector(`#${id}`);
      if (!el) return;
      const plot       = plotMap[id];
      const status     = plot?.status || 'available';
      const color      = STATUS_CONFIG[status]?.color || '#22c55e';
      const matchSearch =
        search === '' ||
        id.replace('plots','').toLowerCase().includes(search.toLowerCase()) ||
        (plot?.customer?.name || '').toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || status === filter;
      const visible     = matchSearch && matchFilter;

      el.setAttribute('fill', visible ? color : '#d1d5db');
      el.style.opacity = visible ? '1' : '0.3';
      el.style.cursor  = visible ? 'pointer' : 'default';
    });
  };

  // Attach click + hover listeners to SVG plots
  const attachListeners = () => {
    const container = svgContainerRef.current;
    if (!container) return;
    ALL_PLOT_IDS.forEach(id => {
      const el = container.querySelector(`#${id}`);
      if (!el) return;

      el.addEventListener('click', () => {
        const plot = plotMap[id];
        console.log('SVG Path ID clicked:', id);
        if (filter !== 'all' && plot?.status !== filter) return;
        navigate(`/plots/${id}`);
      });

      el.addEventListener('mouseenter', (e) => {
        const plot = plotMap[id];
        el.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))';
        el.style.strokeWidth = '3';
        setTooltip({
          x:        e.clientX,
          y:        e.clientY,
          id,
          label:    id.replace('plots', ''),
          size:     plot?.size     || 'N/A',
          status:   plot?.status   || 'available',
          customer: plot?.customer?.name || null,
        });
      });

      el.addEventListener('mousemove', (e) => {
        setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null);
      });

      el.addEventListener('mouseleave', () => {
        el.style.filter = '';
        el.style.strokeWidth = '1.5';
        setTooltip(null);
      });
    });
    setSvgReady(true);
  };

  // Load SVG inline
  useEffect(() => {
    const loadSVG = async () => {
      try {
        const res  = await fetch('/output.svg');
        const text = await res.text();
        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = text;
          // Make SVG responsive
          const svgEl = svgContainerRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.width  = '100%';
            svgEl.style.height = '100%';
          }
          attachListeners();
        }
      } catch (err) {
        console.error('SVG load error:', err);
      }
    };
    loadSVG();
  }, []);

  // Re-attach listeners when plots load
  useEffect(() => {
    if (!loading && svgReady) {
      attachListeners();
      colorAllPlots();
    }
  }, [plots, loading]);

  // Pan
  const onMouseDown = (e) => {
    if (e.target.closest('.plot-shape') || e.target.tagName === 'rect' || e.target.tagName === 'polygon') return;
    setDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => setDragging(false);

  // Zoom
  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(s => Math.min(5, Math.max(0.2, s * delta)));
  };
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.addEventListener('wheel', onWheel, { passive: false });
    return () => { if (el) el.removeEventListener('wheel', onWheel); };
  });

  const resetView = () => { setScale(0.8); setTranslate({ x: 10, y: 10 }); };

  const counts = {
    available: plots.filter(p => p.status === 'available').length,
    booked:    plots.filter(p => p.status === 'booked').length,
    sold:      plots.filter(p => p.status === 'sold').length,
    hold:      plots.filter(p => p.status === 'hold').length,
  };

  return (
    <div className="flex flex-col gap-4 fade-in" style={{ height: 'calc(100vh - 120px)' }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Plot Map</h1>
          <p className="text-sm text-gray-400">Satyam Gold — Click any plot to view details</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition
              ${filter === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200'}`}>
            All
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilter(filter === key ? 'all' : key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition
                ${filter === key ? `${cfg.bg} ${cfg.text} ${cfg.border}` : 'bg-white text-gray-500 border-gray-200'}`}>
              <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
              {cfg.label}: {counts[key] || 0}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs flex-shrink-0">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search plot number or customer..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white" />
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {[
            { icon: <ZoomIn  size={18}/>, fn: () => setScale(s => Math.min(5, s * 1.2)) },
            { icon: <ZoomOut size={18}/>, fn: () => setScale(s => Math.max(0.2, s * 0.8)) },
            { icon: <Maximize2 size={15}/>, fn: resetView },
          ].map((b, i) => (
            <button key={i} onClick={b.fn}
              className="w-9 h-9 bg-white shadow-md rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-600 transition">
              {b.icon}
            </button>
          ))}
        </div>

        {/* Scale */}
        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm text-xs text-gray-500 px-2.5 py-1.5 rounded-lg shadow">
          {Math.round(scale * 100)}%
        </div>

        {/* Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm text-xs text-gray-500 px-3 py-1.5 rounded-full shadow whitespace-nowrap">
          🖱 Scroll to zoom &nbsp;•&nbsp; Drag to pan &nbsp;•&nbsp; Click any plot
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Loading map data...</p>
            </div>
          </div>
        )}

        <div ref={containerRef} className="w-full h-full"
          style={{ cursor: dragging ? 'grabbing' : 'grab', background: '#f0ebe0' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => { onMouseUp(); setTooltip(null); }}>

          <div style={{ transform: `translate(${translate.x}px,${translate.y}px) scale(${scale})`, transformOrigin: '0 0', transition: dragging ? 'none' : 'transform 0.1s' }}>
            <div ref={svgContainerRef} style={{ width: '1100px', height: '1050px' }} />
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x + 14, top: tooltip.y - 75 }}>
          <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-2xl min-w-[140px]">
            <p className="font-bold text-sm">Plot {tooltip.label}</p>
            <p className="text-gray-300 mt-0.5">{tooltip.size}</p>
            <div className="mt-1.5"><StatusBadge status={tooltip.status} /></div>
            {tooltip.customer && (
              <p className="text-gray-300 mt-1.5">👤 {tooltip.customer}</p>
            )}
            <p className="text-gray-500 text-xs mt-1.5 italic">Click to open</p>
          </div>
        </div>
      )}
    </div>
  );
}
