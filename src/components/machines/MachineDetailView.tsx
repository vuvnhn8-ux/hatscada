import React, { useState } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  Cpu,
  Play,
  Square,
  RotateCcw,
  Wrench,
  AlertOctagon,
  Bot,
  Thermometer,
  Gauge,
  Zap,
  Activity,
  Edit3,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Tag } from '../../types/scada';

interface MachineDetailViewProps {
  selectedMachineId?: string;
  onNavigateToAi: (prompt: string) => void;
  onNavigateToHistorian: (tagId?: string) => void;
}

export const MachineDetailView: React.FC<MachineDetailViewProps> = ({
  selectedMachineId,
  onNavigateToAi,
  onNavigateToHistorian
}) => {
  const {
    machines,
    tags,
    plcs,
    controlMachine,
    writeTagValue,
    triggerEmergencyAlarm,
    calculateMachineOee,
    currentUser,
    t
  } = useScada();

  const [activeMachineId, setActiveMachineId] = useState<string>(
    selectedMachineId || (machines.length > 0 ? machines[0].id : '')
  );

  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [overrideValue, setOverrideValue] = useState<string>('');

  const currentMachine = machines.find(m => m.id === activeMachineId) || machines[0];
  const machinePlc = plcs.find(p => p.id === currentMachine?.plcId);
  const machineTags = tags.filter(t => t.machineId === currentMachine?.id);
  const oee = currentMachine ? calculateMachineOee(currentMachine) : null;

  if (!currentMachine) {
    return <div className="p-8 text-center text-slate-400">Không tìm thấy thông tin máy.</div>;
  }

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
      {/* Machine Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800">
        {machines.map(m => {
          const isSelected = m.id === activeMachineId;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMachineId(m.id)}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="font-mono text-cyan-400">{m.code}</span>
              <span>{m.name}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  m.status === 'Running'
                    ? 'bg-emerald-400 animate-pulse'
                    : m.status === 'Alarm'
                    ? 'bg-red-500 animate-ping'
                    : m.status === 'Stop'
                    ? 'bg-rose-500'
                    : 'bg-amber-400'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Main Machine Control & Digital Twin Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Digital Twin 2D Graphic & Sensor Telemetry (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Digital Twin SVG / Graphic Stage */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Header info */}
            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    DIGITAL TWIN SCHEMATIC
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    PLC: {machinePlc?.name} ({machinePlc?.protocol})
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-100 mt-2">
                  {currentMachine.name} [{currentMachine.code}]
                </h2>
                <p className="text-xs text-slate-400">{currentMachine.line} • Job: {currentMachine.currentJob}</p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                    currentMachine.status === 'Running'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                      : currentMachine.status === 'Alarm'
                      ? 'bg-red-600/30 text-red-300 border-red-500/60 animate-bounce'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {currentMachine.status.toUpperCase()}
                </span>
                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  Operator: {currentMachine.operatorName}
                </div>
              </div>
            </div>

            {/* Industrial SVG Schematic Simulation */}
            <div className="my-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center relative min-h-[220px]">
              {/* Background Tech Grid */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] bg-[size:20px_20px]" />

              <div className="relative z-10 w-full flex flex-col items-center justify-center space-y-4">
                {/* Visual Representation by Machine Type */}
                <div className="flex items-center justify-center space-x-8">
                  {/* Spindle / Actuator Rotor */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all ${
                        currentMachine.status === 'Running'
                          ? 'border-cyan-400 shadow-xl shadow-cyan-500/30 rotate-animation'
                          : currentMachine.status === 'Alarm'
                          ? 'border-red-500 animate-ping'
                          : 'border-slate-700'
                      }`}
                    >
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-cyan-300/40 flex items-center justify-center bg-slate-900">
                        <Cpu className={`w-8 h-8 ${currentMachine.status === 'Running' ? 'text-cyan-400 animate-spin' : 'text-slate-600'}`} />
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-300 mt-2">
                      {currentMachine.currentSpeed} {currentMachine.code === 'CNC-01' ? 'RPM' : 'Units/hr'}
                    </span>
                  </div>

                  {/* Machine Core Diagram details */}
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-slate-900 border border-slate-800">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-slate-400">Thermal Probe:</span>
                      <span className={`font-bold ${currentMachine.temperature > 80 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {currentMachine.temperature}°C
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-slate-900 border border-slate-800">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-slate-400">Pressure Sensor:</span>
                      <span className="font-bold text-slate-200">{currentMachine.pressure} Bar</span>
                    </div>

                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-slate-900 border border-slate-800">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-400">Active Load:</span>
                      <span className="font-bold text-slate-200">{currentMachine.powerKw} kW</span>
                    </div>
                  </div>
                </div>

                {/* Status Bar Indicator below schematic */}
                <div className="w-full flex items-center justify-between text-[11px] font-mono px-4 text-slate-400">
                  <span>CYCLE: {currentMachine.cycleTimeSec}s / TARGET {currentMachine.targetCycleTimeSec}s</span>
                  <span>VIBRATION: {currentMachine.vibration} mm/s (ISO 10816 Class II)</span>
                </div>
              </div>
            </div>

            {/* Operator Machine Control Bar */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => controlMachine(currentMachine.id, 'start')}
                  disabled={currentMachine.status === 'Running'}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{t('startMachine')}</span>
                </button>

                <button
                  onClick={() => controlMachine(currentMachine.id, 'stop')}
                  disabled={currentMachine.status === 'Stop'}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>{t('stopMachine')}</span>
                </button>

                <button
                  onClick={() => controlMachine(currentMachine.id, 'reset')}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('resetError')}</span>
                </button>

                <button
                  onClick={() => controlMachine(currentMachine.id, 'maintenance')}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-300 text-xs font-medium border border-blue-800 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{t('maintenanceMode')}</span>
                </button>
              </div>

              {/* Emergency Stop Trip Button */}
              <button
                onClick={() => triggerEmergencyAlarm(currentMachine.id)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-black tracking-wider transition-all shadow-lg shadow-red-900/40 cursor-pointer"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>{t('Dừng Máy Khẩn')}</span>
              </button>
            </div>
          </div>

          {/* Machine Real-Time PLC Tags List */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-200">
                  {t('liveTagMonitor')} ({machineTags.length} Tags)
                </h3>
              </div>
              <button
                onClick={() => onNavigateToHistorian(machineTags[0]?.id)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                {t('historianDatabase')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">{t('tagName')}</th>
                    <th className="pb-2">{t('tagAddress')}</th>
                    <th className="pb-2">{t('dataType')}</th>
                    <th className="pb-2 text-right">{t('currentValue')}</th>
                    <th className="pb-2 text-center">{t('quality')}</th>
                    <th className="pb-2 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {machineTags.map(tag => (
                    <tr key={tag.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-bold text-slate-200">{tag.name}</td>
                      <td className="py-2.5 text-cyan-400">{tag.address}</td>
                      <td className="py-2.5 text-slate-400">{tag.dataType}</td>
                      <td className="py-2.5 text-right font-bold text-slate-100">
                        {String(tag.currentValue)} <span className="text-slate-500">{tag.unit}</span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {tag.quality}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => {
                            setEditingTag(tag);
                            setOverrideValue(String(tag.currentValue));
                          }}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                          title="Ghi đè giá trị Tag PLC"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: OEE Deep Dive & AI Diagnostic (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Copilot Machine Diagnostic Widget */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-700/50 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-indigo-300">
              <Bot className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h3 className="font-bold text-sm text-slate-100">HAT AI Copilot Diagnostic</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trợ lý AI sẵn sàng phân tích dữ liệu cảm biến, nguyên nhân rung động, nhiệt độ bất thường hoặc hiệu suất của <strong className="text-slate-200">{currentMachine.code}</strong>.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() =>
                  onNavigateToAi(`Hãy phân tích tình trạng vận hành, nhiệt độ (${currentMachine.temperature}°C) và độ rung (${currentMachine.vibration} mm/s) của máy ${currentMachine.name} (${currentMachine.code}).`)
                }
                className="w-full p-2.5 rounded-xl bg-slate-900/90 hover:bg-indigo-900/40 border border-indigo-800/40 text-left text-xs text-indigo-200 hover:text-white transition-all flex items-center justify-between"
              >
                <span>🔍 Chẩn đoán nhiệt & độ rung Spindle</span>
                <span className="text-[10px] text-indigo-400 font-mono">Ask AI →</span>
              </button>

              <button
                onClick={() =>
                  onNavigateToAi(`Đánh giá hiệu suất OEE (${oee?.oee}%) và phân tích 6 tổn thất lớn (Six Big Losses) của máy ${currentMachine.code}. Đề xuất giải pháp cải tiến Kaizen.`)
                }
                className="w-full p-2.5 rounded-xl bg-slate-900/90 hover:bg-indigo-900/40 border border-indigo-800/40 text-left text-xs text-indigo-200 hover:text-white transition-all flex items-center justify-between"
              >
                <span>📊 Phân tích sụt giảm OEE & Six Big Losses</span>
                <span className="text-[10px] text-indigo-400 font-mono">Ask AI →</span>
              </button>
            </div>
          </div>

          {/* Machine OEE & Loss Breakdown */}
          {oee && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-200">
                    OEE Performance Breakdown ({currentMachine.code})
                  </h3>
                </div>
                <span className={`text-base font-mono font-bold ${oee.oee >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {oee.oee}%
                </span>
              </div>

              {/* 3 Pillars: Availability, Performance, Quality */}
              <div className="space-y-3 font-mono text-xs">
                {/* Availability */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Availability (Khả dụng):</span>
                    <span className="font-bold text-emerald-400">{oee.availability}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${oee.availability}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Operating: {oee.actualOperatingMinutes}m / Planned: {oee.plannedProductionMinutes}m
                  </div>
                </div>

                {/* Performance */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Performance (Hiệu suất):</span>
                    <span className="font-bold text-cyan-400">{oee.performance}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full" style={{ width: `${oee.performance}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Actual: {oee.actualCount} pcs / Target: {oee.targetCount} pcs
                  </div>
                </div>

                {/* Quality */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Quality (Chất lượng):</span>
                    <span className="font-bold text-indigo-400">{oee.quality}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: `${oee.quality}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    OK: {oee.okCount} / NG: {oee.ngCount} pcs
                  </div>
                </div>
              </div>

              {/* 6 Big Losses */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Phân Tích 6 Tổn Thất Lớn (Six Big Losses):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-500">Sự cố thiết bị (Breakdown)</div>
                    <div className="font-bold text-rose-400">{oee.sixBigLosses.equipmentFailureMin} phút</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-500">Setup & Cài đặt dao</div>
                    <div className="font-bold text-amber-400">{oee.sixBigLosses.setupAndAdjustmentMin} phút</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-500">Dừng vặt (Minor Stops)</div>
                    <div className="font-bold text-slate-300">{oee.sixBigLosses.idlingAndMinorStopsMin} phút</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="text-slate-500">Giảm tốc độ máy</div>
                    <div className="font-bold text-slate-300">{oee.sixBigLosses.reducedSpeedMin} phút</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Tag Override Modal */}
      {editingTag && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100">Ghi Đè Giá Trị PLC Tag</h3>
              <button
                onClick={() => setEditingTag(null)}
                className="text-slate-400 hover:text-white"
              >
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
                  Giá trị mới cần ghi xuống PLC ({editingTag.unit}):
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
