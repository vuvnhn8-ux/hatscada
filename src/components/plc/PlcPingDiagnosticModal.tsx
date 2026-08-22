import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Server,
  ArrowDownUp,
  RotateCcw
} from 'lucide-react';
import { PlcDevice, PingResult } from '../../types/scada';
import { useScada } from '../../context/ScadaContext';

interface PlcPingDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  plc: PlcDevice | null;
}

export const PlcPingDiagnosticModal: React.FC<PlcPingDiagnosticModalProps> = ({
  isOpen,
  onClose,
  plc
}) => {
  const { pingPlc } = useScada();
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<PingResult | null>(null);

  const runDiagnostic = async () => {
    if (!plc) return;
    setIsRunning(true);
    try {
      const res = await pingPlc(plc.id);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen && plc) {
      setResult(null);
      runDiagnostic();
    }
  }, [isOpen, plc?.id]);

  if (!isOpen || !plc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Network Ping & Latency Tracer
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {plc.name} | {plc.ipAddress}:{plc.port} ({plc.protocol})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Target Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Brand / Type</div>
              <div className="text-xs font-bold text-slate-200 mt-0.5">{plc.brand}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Socket Port</div>
              <div className="text-xs font-mono font-bold text-cyan-400 mt-0.5">{plc.port}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Timeout</div>
              <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{plc.timeoutMs || 2000}ms</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Worker State</div>
              <div className={`text-xs font-bold mt-0.5 ${plc.enabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                {plc.enabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>

          {/* Tracer Status Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-amber-400 animate-ping' : (result?.status === 'Online' ? 'bg-emerald-500' : 'bg-rose-500')}`} />
                <span className="text-xs font-bold text-slate-200">
                  {isRunning ? 'Đang gửi gói tin thăm dò (ICMP / TCP Syn-Ack)...' : `Trạng thái: ${result?.status || 'Sẵn sàng'}`}
                </span>
              </div>
              <button
                disabled={isRunning}
                onClick={runDiagnostic}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                <span>Re-Test Ping</span>
              </button>
            </div>

            {/* Results Grid */}
            {result && (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center">
                  <div className="p-2 rounded-lg bg-slate-900/60">
                    <div className="text-[10px] text-slate-400">Packets Tx/Rx</div>
                    <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                      {result.packetsSent} / {result.packetsReceived}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60">
                    <div className="text-[10px] text-slate-400">Loss Rate</div>
                    <div className={`text-xs font-mono font-bold mt-0.5 ${result.lossRate === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.lossRate}%
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60">
                    <div className="text-[10px] text-slate-400">Avg Latency</div>
                    <div className="text-xs font-mono font-bold text-cyan-400 mt-0.5">
                      {result.avgRtt} ms
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60">
                    <div className="text-[10px] text-slate-400">Min / Max RTT</div>
                    <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                      {result.minRtt} / {result.maxRtt} ms
                    </div>
                  </div>
                </div>

                {/* Packet latency timeline */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-mono text-slate-400 flex justify-between">
                    <span>Packet Sequence Latency Samples:</span>
                    <span>Timestamp: {result.timestamp}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {result.history.map((rtt, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">Seq #{idx + 1}</span>
                        <span className={`text-xs font-mono font-bold ${rtt > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {rtt > 0 ? `${rtt} ms` : 'TIMED_OUT'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-[11px] text-cyan-300 flex items-start space-x-2">
            <Activity className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <strong>Đánh giá chất lượng đường truyền (SCADA QoS):</strong>
              <div className="text-slate-400 mt-0.5">
                Độ trễ phản hồi dưới 20ms đảm bảo chu kỳ scan 100ms hoạt động ổn định không bị trôi mẫu dữ liệu (Jitter-free).
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex justify-end bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
