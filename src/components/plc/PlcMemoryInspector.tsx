import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Search,
  RefreshCw,
  Edit3,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Database,
  Radio,
  Server
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';
import { PlcDevice } from '../../types/scada';

export const PlcMemoryInspector: React.FC<{
  selectedPlcId?: string;
  onSelectPlc?: (plcId: string) => void;
}> = ({ selectedPlcId, onSelectPlc }) => {
  const { plcs, tags, currentUser } = useScada();
  const [activePlcId, setActivePlcId] = useState<string>(selectedPlcId || plcs[0]?.id || '');
  const [filterQuery, setFilterQuery] = useState('');
  const [baseOffset, setBaseOffset] = useState<number>(0);
  const [refreshTick, setRefreshTick] = useState<number>(0);

  const selectedPlc = plcs.find(p => p.id === activePlcId) || plcs[0];

  const handlePlcChange = (id: string) => {
    setActivePlcId(id);
    if (onSelectPlc) onSelectPlc(id);
  };

  // Generate simulated register table based on PLC brand & type
  const memoryDump = useMemo(() => {
    if (!selectedPlc) return [];
    const rows = [];
    let prefix = 'DM';
    if (selectedPlc.brand === 'Mitsubishi') prefix = 'D';
    else if (selectedPlc.brand === 'Siemens') prefix = 'DB1.DBW';
    else if (selectedPlc.brand === 'Modbus') prefix = '%MW';
    else if (selectedPlc.brand === 'OPC_UA') prefix = 'ns=2;s=Reg_';

    const isConnected = selectedPlc.enabled && selectedPlc.status === 'Connected';

    for (let i = 0; i < 20; i++) {
      const regIndex = baseOffset + i * 2;
      const decVal = isConnected ? Math.floor(Math.random() * 4000 + 100) : 0;
      const hexVal = decVal.toString(16).toUpperCase().padStart(4, '0');
      const binVal = decVal.toString(2).padStart(16, '0');
      
      const regAddress = selectedPlc.brand === 'Siemens' 
        ? `DB1.DBW${regIndex}` 
        : `${prefix}${regIndex}`;

      // Check if linked to an active SCADA tag
      const matchedTag = tags.find(t => t.plcId === selectedPlc.id && (t.address === regAddress || t.address.includes(String(regIndex))));

      rows.push({
        register: regAddress,
        hex: `0x${hexVal}`,
        dec: matchedTag && typeof matchedTag.currentValue === 'number' ? Math.round(matchedTag.currentValue) : decVal,
        bin: binVal,
        tag: matchedTag?.name || null,
        quality: isConnected ? (matchedTag?.quality || 'GOOD') : 'BAD'
      });
    }
    return rows;
  }, [selectedPlc, baseOffset, tags, refreshTick]);

  return (
    <div className="space-y-4">
      {/* Top Selector & Config Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <span>PLC Register & Memory Table Inspector (Hex / Dec / Bit Array)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Giám sát trực tiếp vùng nhớ PLC trong thời gian thực (Real-time Word/Bit Monitor)
            </p>
          </div>
        </div>

        {/* PLC Dropdown */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Thiết bị:</span>
            <select
              value={selectedPlc?.id}
              onChange={e => handlePlcChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
            >
              {plcs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.brand} - {p.ipAddress})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setRefreshTick(t => t + 1)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Poll Registers</span>
          </button>
        </div>
      </div>

      {/* Memory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs font-mono text-slate-300">
            <span className="text-cyan-400 font-bold">{selectedPlc?.name}</span>
            <span>|</span>
            <span>Protocol: {selectedPlc?.protocol}</span>
            <span>|</span>
            <span>Scan: {selectedPlc?.scanIntervalMs}ms</span>
          </div>

          {/* Offset Buttons */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setBaseOffset(Math.max(0, baseOffset - 40))}
              disabled={baseOffset === 0}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            >
              &lt; Prev 20 Words
            </button>
            <span className="font-mono text-xs text-slate-400">Offset: {baseOffset}</span>
            <button
              onClick={() => setBaseOffset(baseOffset + 40)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Next 20 Words &gt;
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Register Addr</th>
                <th className="px-4 py-3">Hex Value</th>
                <th className="px-4 py-3">Dec Word</th>
                <th className="px-4 py-3">16-Bit Binary State (b15..b0)</th>
                <th className="px-4 py-3">Linked SCADA Tag</th>
                <th className="px-4 py-3">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {memoryDump.map(row => (
                <tr key={row.register} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-cyan-300">{row.register}</td>
                  <td className="px-4 py-2.5 text-amber-300 font-bold">{row.hex}</td>
                  <td className="px-4 py-2.5 text-slate-100 font-bold">{row.dec}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center space-x-0.5">
                      {row.bin.split('').map((bit, bitIdx) => (
                        <span
                          key={bitIdx}
                          title={`Bit ${15 - bitIdx}: ${bit}`}
                          className={`w-3.5 h-4 flex items-center justify-center text-[9px] font-bold rounded-xs ${bit === '1' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-600 border border-slate-800'}`}
                        >
                          {bit}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    {row.tag ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold text-[11px]">
                        {row.tag}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[10px]">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.quality === 'GOOD' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                      {row.quality}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
