import React, { useState, useMemo } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  LineChart as LineChartIcon,
  Download,
  Calendar,
  Layers,
  Database,
  TrendingUp,
  RefreshCw,
  Sliders,
  Filter
} from 'lucide-react';
import { Tag } from '../../types/scada';

interface HistorianTrendsViewProps {
  initialSelectedTagId?: string;
}

export const HistorianTrendsView: React.FC<HistorianTrendsViewProps> = ({ initialSelectedTagId }) => {
  const { tags, tagHistoryBuffer, machines, plcs, t } = useScada();

  const historianLogs = useMemo(() => {
    const list: Array<{ id: string; tagId: string; timestamp: string; value: number | string | boolean; quality: string }> = [];
    Object.entries(tagHistoryBuffer || {}).forEach(([tagId, pts]) => {
      pts.forEach((pt, idx) => {
        list.push({
          id: `${tagId}-${idx}`,
          tagId,
          timestamp: pt.timestamp,
          value: pt.value,
          quality: pt.quality
        });
      });
    });
    return list;
  }, [tagHistoryBuffer]);

  const numericTags = useMemo(
    () => tags.filter(t => t.dataType === 'Int' || t.dataType === 'DInt' || t.dataType === 'Float' || t.dataType === 'Double'),
    [tags]
  );

  const [selectedMachineId, setSelectedMachineId] = useState<string>('ALL');
  const [selectedPlcId, setSelectedPlcId] = useState<string>('ALL');

  const contextualNumericTags = useMemo(() => {
    return numericTags.filter(t => {
      if (selectedMachineId !== 'ALL' && t.machineId !== selectedMachineId) return false;
      if (selectedPlcId !== 'ALL' && t.plcId !== selectedPlcId) return false;
      return true;
    });
  }, [numericTags, selectedMachineId, selectedPlcId]);

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialSelectedTagId ? [initialSelectedTagId] : numericTags.slice(0, 3).map(t => t.id)
  );

  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | '1h'>('5m');

  const handleToggleTag = (id: string) => {
    if (selectedTagIds.includes(id)) {
      if (selectedTagIds.length > 1) {
        setSelectedTagIds(selectedTagIds.filter(t => t !== id));
      }
    } else {
      if (selectedTagIds.length < 5) {
        setSelectedTagIds([...selectedTagIds, id]);
      }
    }
  };

  // Pen Colors
  const PEN_COLORS = ['#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];

  // Filter historian logs for selected tags
  const activeLogs = useMemo(() => {
    return historianLogs
      .filter(log => selectedTagIds.includes(log.tagId))
      .slice(-100);
  }, [historianLogs, selectedTagIds]);

  // Tag Statistics Calculation
  const tagStats = useMemo(() => {
    return selectedTagIds.map((tagId, index) => {
      const tag = tags.find(t => t.id === tagId);
      const values = historianLogs
        .filter(l => l.tagId === tagId)
        .map(l => Number(l.value))
        .filter(v => !isNaN(v));

      const min = values.length > 0 ? Math.min(...values) : 0;
      const max = values.length > 0 ? Math.max(...values) : 0;
      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

      return {
        tag,
        color: PEN_COLORS[index % PEN_COLORS.length],
        current: tag?.currentValue ?? 0,
        min: min.toFixed(1),
        max: max.toFixed(1),
        avg: avg.toFixed(1),
        count: values.length
      };
    });
  }, [selectedTagIds, historianLogs, tags]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = 'Timestamp,TagID,TagName,Address,Value,Quality\n';
    const rows = activeLogs.map(l => {
      const t = tags.find(tag => tag.id === l.tagId);
      return `"${l.timestamp}","${l.tagId}","${t?.name || ''}","${t?.address || ''}",${l.value},"${l.quality}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HATSCADA_Historian_Export_${new Date().toISOString().slice(0, 19)}.csv`;
    link.click();
  };

  // Build SVG Path for each selected tag
  const chartWidth = 800;
  const chartHeight = 240;

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Database className="w-4 h-4" />
            <span>TIME-SERIES HISTORIAN ENGINE & MULTI-PEN TREND</span>
          </div>
          <h1 className="text-xl font-black text-slate-100 mt-1">
            {t('historianTitle')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('historianDesc')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t('exportCsv')}</span>
          </button>
        </div>
      </div>

      {/* Main Trend Stage & Multi-Pen Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pen Selector (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Lọc Theo Context Thiết Bị</span>
              </span>
            </div>

            {/* Context Selectors */}
            <div className="space-y-2 text-xs font-mono">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Chọn Máy (Machine):</label>
                <select
                  value={selectedMachineId}
                  onChange={e => setSelectedMachineId(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value="ALL">Tất cả các máy ({machines.length})</option>
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Chọn PLC Bộ Điều Khiển:</label>
                <select
                  value={selectedPlcId}
                  onChange={e => setSelectedPlcId(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value="ALL">Tất cả PLC ({plcs.length})</option>
                  {plcs.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.ipAddress})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <span>Chọn Bút Vẽ ({contextualNumericTags.length} Tags)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Max 5 Pens</span>
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {contextualNumericTags.map(tag => {
                const isChecked = selectedTagIds.includes(tag.id);
                const penIndex = selectedTagIds.indexOf(tag.id);
                const penColor = isChecked ? PEN_COLORS[penIndex % PEN_COLORS.length] : undefined;

                return (
                  <button
                    key={tag.id}
                    onClick={() => handleToggleTag(tag.id)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isChecked
                        ? 'bg-slate-800/90 border-slate-600 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{
                          backgroundColor: isChecked ? penColor : 'transparent',
                          borderColor: isChecked ? penColor : '#475569'
                        }}
                      />
                      <div>
                        <div className="font-bold font-mono text-slate-200 text-[11px] truncate max-w-[140px]">
                          {tag.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {tag.address} • {tag.unit}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-300">
                      {String(tag.currentValue)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Chart & Statistics (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Real-time Trend SVG Canvas Area */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            {/* Top Chart Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                <LineChartIcon className="w-4 h-4 text-cyan-400" />
                <span>Multi-Pen Live Historian Stream (Real-Time 1Hz Buffer)</span>
              </div>

              {/* Time Range Selector */}
              <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                {(['1m', '5m', '15m', '1h'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      timeRange === range
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Industrial SVG Multi-Pen Chart */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative min-h-[280px] flex flex-col justify-between overflow-hidden">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] bg-[size:40px_30px]" />

              {/* SVG Curve Plotting */}
              <div className="relative z-10 w-full h-[220px]">
                <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                  {/* Horizontal Guideline levels */}
                  <line x1="0" y1="60" x2={chartWidth} y2="60" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
                  <line x1="0" y1="120" x2={chartWidth} y2="120" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
                  <line x1="0" y1="180" x2={chartWidth} y2="180" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />

                  {/* Lines for each active tag */}
                  {selectedTagIds.map((tagId, penIdx) => {
                    const logs = historianLogs.filter(l => l.tagId === tagId).slice(-40);
                    if (logs.length < 2) return null;

                    const values = logs.map(l => Number(l.value));
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    const range = max - min || 1;

                    // Normalize points to SVG space
                    const points = logs.map((l, i) => {
                      const x = (i / (logs.length - 1)) * chartWidth;
                      const normVal = (Number(l.value) - min) / range;
                      const y = chartHeight - 20 - normVal * (chartHeight - 40);
                      return `${x},${y}`;
                    }).join(' ');

                    const color = PEN_COLORS[penIdx % PEN_COLORS.length];

                    return (
                      <g key={tagId}>
                        <polyline
                          fill="none"
                          stroke={color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* X Axis Time Marks */}
              <div className="relative z-10 flex justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                <span>-5 phút trước</span>
                <span>-4 phút</span>
                <span>-3 phút</span>
                <span>-2 phút</span>
                <span>-1 phút</span>
                <span className="text-cyan-400 font-bold">Hiện Tại (Live)</span>
              </div>
            </div>
          </div>

          {/* Statistical Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tagStats.map(stat => {
              if (!stat.tag) return null;
              return (
                <div
                  key={stat.tag.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                    <span className="font-bold text-xs text-slate-200 font-mono truncate">{stat.tag.name}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-1 font-mono text-center text-xs">
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">MIN</div>
                      <div className="text-slate-300 font-bold">{stat.min}</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">AVG</div>
                      <div className="text-cyan-400 font-bold">{stat.avg}</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500">MAX</div>
                      <div className="text-rose-400 font-bold">{stat.max}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-1">
                    <span>Live: <strong className="text-slate-100">{String(stat.current)} {stat.tag.unit}</strong></span>
                    <span>Samples: {stat.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
