import React, { useState } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  Search,
  Filter,
  Star,
  Edit3,
  LineChart,
  Radio,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import { Tag } from '../../types/scada';

interface LiveTagMonitorProps {
  onNavigateToHistorian: (tagId: string) => void;
}

export const LiveTagMonitor: React.FC<LiveTagMonitorProps> = ({ onNavigateToHistorian }) => {
  const { tags, machines, plcs, writeTagValue, toggleTagFavorite, currentUser } = useScada();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMachineFilter, setSelectedMachineFilter] = useState('ALL');
  const [selectedPlcFilter, setSelectedPlcFilter] = useState('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [overrideValue, setOverrideValue] = useState<string>('');

  const filteredTags = tags.filter(t => {
    if (favoritesOnly && !t.isFavorite) return false;
    if (selectedMachineFilter !== 'ALL' && t.machineId !== selectedMachineFilter) return false;
    if (selectedPlcFilter !== 'ALL' && t.plcId !== selectedPlcFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleTagWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;

    let parsedVal: number | string | boolean = overrideValue;
    if (editingTag.dataType === 'Bool') {
      parsedVal = overrideValue === 'true' || overrideValue === '1';
    } else if (editingTag.dataType === 'Int' || editingTag.dataType === 'DInt') {
      parsedVal = parseInt(overrideValue, 10);
    } else if (editingTag.dataType === 'Float' || editingTag.dataType === 'Double') {
      parsedVal = parseFloat(overrideValue);
    }

    const success = writeTagValue(editingTag.id, parsedVal);
    if (success) {
      setEditingTag(null);
      setOverrideValue('');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Filter Controls */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>HIGH-FREQUENCY REAL-TIME TAG MONITOR</span>
            </div>
            <h1 className="text-xl font-black text-slate-100 mt-1">
              Bảng Giám Sát Tag Trực Tuyến ({filteredTags.length} / {tags.length} Tags)
            </h1>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Scan Cycle: 100ms - 1000ms</span>
            </span>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Tag, Địa chỉ (DM100, D500)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none font-mono"
            />
          </div>

          {/* Machine Filter */}
          <select
            value={selectedMachineFilter}
            onChange={e => setSelectedMachineFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:border-cyan-500 outline-none"
          >
            <option value="ALL">Tất cả máy (All Machines)</option>
            {machines.map(m => (
              <option key={m.id} value={m.id}>
                {m.code} - {m.name}
              </option>
            ))}
          </select>

          {/* PLC Filter */}
          <select
            value={selectedPlcFilter}
            onChange={e => setSelectedPlcFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:border-cyan-500 outline-none"
          >
            <option value="ALL">Tất cả PLC Driver</option>
            {plcs.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.brand})
              </option>
            ))}
          </select>

          {/* Favorite Only Toggle */}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
              favoritesOnly
                ? 'bg-amber-950/60 border-amber-600/70 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Chỉ Tag Yêu Thích (Starred)</span>
          </button>
        </div>
      </div>

      {/* Live Tag Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 w-10 text-center">★</th>
                <th className="py-3 px-4">Tag Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Machine</th>
                <th className="py-3 px-4">PLC & Address</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Live Value</th>
                <th className="py-3 px-4 text-center">Quality</th>
                <th className="py-3 px-4 text-center">Historian</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTags.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    Không có Tag nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredTags.map(tag => {
                  const targetMachine = machines.find(m => m.id === tag.machineId);
                  const targetPlc = plcs.find(p => p.id === tag.plcId);

                  return (
                    <tr
                      key={tag.id}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Favorite star */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleTagFavorite(tag.id)}
                          className="text-slate-600 hover:text-amber-400 transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${tag.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                          />
                        </button>
                      </td>

                      {/* Tag Name */}
                      <td className="py-3 px-4 font-bold text-slate-100">
                        {tag.name}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {tag.description}
                      </td>

                      {/* Machine */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                          {targetMachine?.code || 'N/A'}
                        </span>
                      </td>

                      {/* PLC & Address */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">{targetPlc?.name.split('-')[1] || 'PLC'}</span>
                          <span className="text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                            {tag.address}
                          </span>
                        </div>
                      </td>

                      {/* Data Type */}
                      <td className="py-3 px-4 text-slate-400">
                        {tag.dataType}
                      </td>

                      {/* Live Value with Highlighting */}
                      <td className="py-3 px-4 text-right font-bold text-sm text-cyan-300">
                        <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 inline-block min-w-[70px]">
                          {String(tag.currentValue)}{' '}
                          <span className="text-[10px] text-slate-500 font-normal">{tag.unit}</span>
                        </span>
                      </td>

                      {/* Quality */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            tag.quality === 'GOOD'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border-rose-800'
                          }`}
                        >
                          {tag.quality}
                        </span>
                      </td>

                      {/* Historian Flag */}
                      <td className="py-3 px-4 text-center">
                        {tag.enableHistorian ? (
                          <span className="text-emerald-400 text-[11px] font-bold flex items-center justify-center space-x-1">
                            <Database className="w-3 h-3" />
                            <span>ON</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">OFF</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onNavigateToHistorian(tag.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                            title="Xem biểu đồ Historian Trend"
                          >
                            <LineChart className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingTag(tag);
                              setOverrideValue(String(tag.currentValue));
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Ghi đè giá trị Tag (Write Tag)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Tag Override Modal */}
      {editingTag && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100">Ghi Đè Giá Trị PLC Tag</h3>
              <button onClick={() => setEditingTag(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <div><span className="text-slate-500">Tag:</span> {editingTag.name}</div>
              <div><span className="text-slate-500">Address:</span> <span className="text-cyan-400">{editingTag.address}</span></div>
              <div><span className="text-slate-500">DataType:</span> {editingTag.dataType}</div>
              <div><span className="text-slate-500">Current:</span> {String(editingTag.currentValue)} {editingTag.unit}</div>
            </div>

            <form onSubmit={handleTagWriteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">
                  Giá trị mới ghi xuống PLC ({editingTag.unit}):
                </label>
                {editingTag.dataType === 'Bool' ? (
                  <select
                    value={overrideValue}
                    onChange={e => setOverrideValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono"
                  >
                    <option value="true">TRUE (1 - ON)</option>
                    <option value="false">FALSE (0 - OFF)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={overrideValue}
                    onChange={e => setOverrideValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono focus:border-cyan-500 outline-none"
                    placeholder="Nhập giá trị..."
                    autoFocus
                  />
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTag(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                >
                  Ghi Tag PLC (Write)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
