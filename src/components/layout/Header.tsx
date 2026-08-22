import React, { useState } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  Activity,
  AlertTriangle,
  Radio,
  Clock,
  UserCheck,
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Zap,
  Bot
} from 'lucide-react';

interface HeaderProps {
  onNavigateToAi: () => void;
  onNavigateToAlarms: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToAi, onNavigateToAlarms }) => {
  const {
    currentUser,
    users,
    switchUser,
    activeAlarmsCount,
    overallOee,
    settings,
    updateSettings,
    totalShiftProduction
  } = useScada();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString('vi-VN'));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('vi-VN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & System Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
            <Zap className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300">
                HATSCADA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-700/50">
                v2.5 Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">
              Hoang Automation Technology • Smart Factory Platform
            </p>
          </div>
        </div>

        {/* Global Connection Badge */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-mono">PLC RACK: ONLINE</span>
          <span className="text-slate-500 text-[10px]">|</span>
          <span className="text-cyan-400 font-mono font-medium">5 DRIVERS SYNC</span>
        </div>
      </div>

      {/* Real-time Ticker & Metrics in Header */}
      <div className="hidden md:flex items-center space-x-5 text-xs font-mono">
        <div className="flex items-center space-x-2 px-3 py-1 rounded bg-slate-800/40 border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">PLANT OEE:</span>
          <span className={`font-bold ${overallOee >= 85 ? 'text-emerald-400' : overallOee >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
            {overallOee}%
          </span>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1 rounded bg-slate-800/40 border border-slate-800">
          <Radio className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">OUTPUT:</span>
          <span className="font-bold text-slate-200">{totalShiftProduction.toLocaleString()} pcs</span>
        </div>

        <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-800/30 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Action Controls & User Switcher */}
      <div className="flex items-center space-x-3">
        {/* Active Alarms Quick Pill */}
        <button
          onClick={onNavigateToAlarms}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${
            activeAlarmsCount > 0
              ? 'bg-rose-950/60 border-rose-600/70 text-rose-300 shadow-md shadow-rose-900/30 hover:bg-rose-900/80 animate-pulse'
              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Xem danh sách cảnh báo thời gian thực"
        >
          <AlertTriangle className={`w-4 h-4 ${activeAlarmsCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
          <span>{activeAlarmsCount} ALARMS</span>
        </button>

        {/* AI Copilot Quick Button */}
        <button
          onClick={onNavigateToAi}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 text-xs font-semibold shadow-md shadow-indigo-950/40 transition-all group"
          title="Mở trợ lý AI HAT Copilot"
        >
          <Bot className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">AI COPILOT</span>
        </button>

        {/* Simulation Mode Toggle */}
        <button
          onClick={() => updateSettings({ simulationMode: !settings.simulationMode })}
          className={`p-2 rounded-lg border text-xs transition-colors ${
            settings.simulationMode
              ? 'bg-emerald-950/50 border-emerald-700/50 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
          title={settings.simulationMode ? 'Tạm dừng mô phỏng PLC' : 'Bật luồng mô phỏng dữ liệu PLC'}
        >
          {settings.simulationMode ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
          title={settings.soundEnabled ? 'Tắt âm thanh cảnh báo' : 'Bật âm thanh cảnh báo'}
        >
          {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-md object-cover border border-cyan-500/50"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono leading-none">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-800 text-xs">
                <div className="text-slate-400 font-medium">Chuyển đổi vai trò người dùng (RBAC):</div>
              </div>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setShowUserDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center space-x-3 hover:bg-slate-800 transition-colors text-xs ${
                    u.id === currentUser.id ? 'bg-cyan-950/40 text-cyan-300' : 'text-slate-300'
                  }`}
                >
                  <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{u.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{u.role}</span>
                      {u.id === currentUser.id && <UserCheck className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
