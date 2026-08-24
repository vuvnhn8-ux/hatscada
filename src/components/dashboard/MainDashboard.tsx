import React from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  Activity,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ChevronRight,
  Bot
} from 'lucide-react';
import { MachineStatus } from '../../types/scada';

interface MainDashboardProps {
  onSelectMachine: (machineId: string) => void;
  onNavigateToAlarms: () => void;
  onNavigateToAi: (initialPrompt?: string) => void;
  onNavigateToOee: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  onSelectMachine,
  onNavigateToAlarms,
  onNavigateToAi,
  onNavigateToOee
}) => {
  const {
    machines,
    alarmEvents,
    activeAlarmsCount,
    overallOee,
    plantPowerKw,
    plantOkRate,
    totalShiftProduction,
    calculateMachineOee,
    t
  } = useScada();

  const getStatusColor = (status: MachineStatus) => {
    switch (status) {
      case 'Running':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Idle':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Stop':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'Alarm':
        return 'bg-red-600/30 text-red-300 border-red-500/60 animate-pulse';
      case 'Maintenance':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getStatusText = (status: MachineStatus) => {
    switch (status) {
      case 'Running':
        return t('Đang chạy');
      case 'Idle':
        return t('Chờ');
      case 'Stop':
        return t('Dừng');
      case 'Alarm':
        return t('Cảnh báo');
      case 'Maintenance':
        return t('Bảo trì');
      default:
        return status;
    }
  };

  const runningCount = machines.filter(m => m.status === 'Running').length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{t('factoryCommandCenter')}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            {t('factoryTitle')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('factorySubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateToAi('Tổng hợp tình trạng sản xuất và cảnh báo toàn nhà máy hiện tại')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>{t('aiQuickEval')}</span>
          </button>
          <button
            onClick={onNavigateToOee}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>{t('viewOeeDetail')}</span>
          </button>
        </div>
      </div>

      {/* 4 Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Plant OEE */}
        <div
          onClick={onNavigateToOee}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('plantOee')}</span>
            <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`text-3xl font-black font-mono ${overallOee >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {overallOee}%
            </span>
            <span className="text-xs text-emerald-400 flex items-center font-medium">
              +1.8% {t('vsTarget')}
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${overallOee >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, overallOee)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-slate-500 font-mono">
            <span>{t('worldClass')}: 85%</span>
            <span>{t('target')}: 82%</span>
          </div>
        </div>

        {/* 2. Shift Output */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('shiftOutput')}</span>
            <div className="p-2 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-800/40">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-slate-100">
              {totalShiftProduction.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">Pcs</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>{t('okRate')}:</span>
            <span className="font-bold text-emerald-400 font-mono">{plantOkRate}%</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>{t('runningLines')}:</span>
            <span className="font-bold text-cyan-400 font-mono">{runningCount} / {machines.length} {t('dây chuyền')}</span>
          </div>
        </div>

        {/* 3. Active Alarms */}
        <div
          onClick={onNavigateToAlarms}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeAlarmsCount > 0
              ? 'bg-rose-950/30 border-rose-900/60 hover:border-rose-700/80'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('activeAlarmsCountLabel')}</span>
            <div className={`p-2 rounded-lg border ${activeAlarmsCount > 0 ? 'bg-rose-900/40 text-rose-400 border-rose-700/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`text-3xl font-black font-mono ${activeAlarmsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {activeAlarmsCount}
            </span>
            <span className="text-xs text-slate-400">{t('status')}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{t('criticalSeverity')}:</span>
            <span className="font-bold text-rose-400 font-mono">
              {alarmEvents.filter(a => a.status === 'Active' && a.priority === 'Critical').length}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-cyan-400 flex items-center space-x-1">
            <span>{t('acknowledge')}</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* 4. Plant Power & Efficiency */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('powerUsage')}</span>
            <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/40">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-amber-300">
              {plantPowerKw}
            </span>
            <span className="text-xs text-slate-400">kW</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>{t('powerFactor')}:</span>
            <span className="font-mono text-emerald-400">0.96 ({t('optimal')})</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>{t('gridFrequency')}:</span>
            <span className="font-mono text-cyan-400">50.0 Hz</span>
          </div>
        </div>
      </div>

      {/* Machine Status Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>{t('Chi Tiết Máy & Trạng Thái PLC (Machine Cards)')}</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {t('Tổng cộng:')} {machines.length} {t('Máy')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {machines.map(m => {
            const oee = calculateMachineOee(m);
            return (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                {/* Machine Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">{m.code}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(m.status)}`}>
                        {getStatusText(m.status)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mt-1">{m.name}</h3>
                    <p className="text-xs text-slate-400">{m.line}</p>
                  </div>

                  <button
                    onClick={() => onSelectMachine(m.id)}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={t('Chi Tiết Máy')}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Real-time gauges */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500">{t('TỐC ĐỘ')}</div>
                    <div className="text-xs font-bold text-cyan-400">{m.currentSpeed}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">{t('NHIỆT ĐỘ')}</div>
                    <div className={`text-xs font-bold ${m.temperature > 80 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {m.temperature}°C
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">{t('ÁP SUẤT')}</div>
                    <div className="text-xs font-bold text-slate-200">{m.pressure} Bar</div>
                  </div>
                </div>

                {/* Production Counts & OEE */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>{t('Sản lượng (OK / Total):')}</span>
                    <span className="font-mono font-bold text-slate-200">
                      {m.okCount.toLocaleString()} / {m.totalCount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>{t('Cycle Time (Thực / Mục tiêu):')}</span>
                    <span className="font-mono text-slate-300">
                      {m.cycleTimeSec}s / {m.targetCycleTimeSec}s
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>{t('OEE Hiệu suất:')}</span>
                    <span className={`font-mono font-bold ${oee.oee >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {oee.oee}% (A:{oee.availability}% P:{oee.performance}% Q:{oee.quality}%)
                    </span>
                  </div>
                </div>

                {/* Operator info & Action */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{t('runTime')}: {Math.round(m.runTimeSeconds / 60)}m</span>
                  </div>

                  <button
                    onClick={() => onSelectMachine(m.id)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{t('Chi Tiết Máy')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
