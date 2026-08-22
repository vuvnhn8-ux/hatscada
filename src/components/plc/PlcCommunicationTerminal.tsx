import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Pause,
  Play,
  Copy,
  Check
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';
import { CommunicationLog } from '../../types/scada';

export const PlcCommunicationTerminal: React.FC<{ selectedPlcId?: string }> = ({ selectedPlcId }) => {
  const { communicationLogs, clearCommunicationLogs, plcs } = useScada();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPlc, setFilterPlc] = useState<string>(selectedPlcId || 'all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPlcId) {
      setFilterPlc(selectedPlcId);
    }
  }, [selectedPlcId]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [communicationLogs, autoScroll]);

  const filteredLogs = communicationLogs.filter(log => {
    if (filterType !== 'all' && log.type !== filterType) return false;
    if (filterPlc !== 'all' && log.plcId !== filterPlc) return false;
    return true;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] [${l.plcName}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogIcon = (type: CommunicationLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />;
      case 'warn':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />;
    }
  };

  const getLogTextColor = (type: CommunicationLog['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-300';
      case 'warn':
        return 'text-amber-300';
      case 'error':
        return 'text-rose-300 font-semibold';
      case 'info':
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[480px]">
      {/* Terminal Bar */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            PLC Communication Event Terminal
          </span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400 font-bold">
            {filteredLogs.length} events
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 text-xs">
          {/* PLC filter */}
          <select
            value={filterPlc}
            onChange={e => setFilterPlc(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Tất cả PLCs</option>
            {plcs.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Level filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warn">Warning</option>
            <option value="error">Error / Alarm</option>
          </select>

          {/* Pause / Resume */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? 'Tạm dừng auto scroll' : 'Bật auto scroll'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${autoScroll ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
          >
            {autoScroll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Copy Logs */}
          <button
            onClick={handleCopyLogs}
            title="Sao chép toàn bộ logs"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Logs */}
          <button
            onClick={clearCommunicationLogs}
            title="Xóa toàn bộ log"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-700 text-slate-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs bg-slate-950/95"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Terminal className="w-8 h-8 opacity-40" />
            <p className="text-xs">Chưa có bản ghi giao tiếp nào phù hợp với bộ lọc</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className="flex items-start space-x-2.5 p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 hover:bg-slate-900/80 transition-colors"
            >
              {getLogIcon(log.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">[{log.timestamp}]</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-cyan-300 font-bold">
                    {log.plcName}
                  </span>
                  {log.latencyMs !== undefined && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      RTT: {log.latencyMs}ms
                    </span>
                  )}
                </div>
                <div className={`mt-0.5 text-[11px] leading-relaxed break-words ${getLogTextColor(log.type)}`}>
                  {log.message}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div>Auto-Reconnect Backoff: 3 retries @ 1.2s timeout</div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400">Async Non-Blocking Thread Pool Active</span>
        </div>
      </div>
    </div>
  );
};
