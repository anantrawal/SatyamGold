import { useEffect, useState } from 'react';
import { getPlots } from '../firebase/services';

export const usePlots = () => {
  const [plots,   setPlots]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = getPlots((data) => {
      setPlots(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const getPlotById = (id) => plots.find(p => p.id === id);

  const plotsByStatus = {
    available: plots.filter(p => p.status === 'available'),
    booked:    plots.filter(p => p.status === 'booked'),
    sold:      plots.filter(p => p.status === 'sold'),
    hold:      plots.filter(p => p.status === 'hold'),
  };

  return { plots, loading, getPlotById, plotsByStatus };
};
