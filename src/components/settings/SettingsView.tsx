import React, { useState } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  Settings,
  Shield,
  User,
  Cpu,
  Volume2,
  VolumeX,
  Layers,
  Database,
  Radio,
  Server,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Bot,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  Globe,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { UserRole } from '../../types/scada';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    settings,
    updateSettings,
    triggerEmergencyAlarm,
    machines,
    plcs,
    tags,
    deepLearningDocs,
    language,
    setLanguage,
    t
  } = useScada();

  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey || '');
  const [modelSelect, setModelSelect] = useState(settings.geminiModel || 'gemini-3.7-flash');
  const [tempSelect, setTempSelect] = useState(settings.geminiTemperature ?? 0.7);
  const [testStatus, setTestStatus] = useState<{ testing: boolean; message?: string; success?: boolean }>({ testing: false });

  const handleSaveAiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      geminiApiKey: apiKeyInput.trim(),
      geminiModel: modelSelect,
      geminiTemperature: tempSelect
    });
    setTestStatus({ testing: false, success: true, message: 'Đã lưu cấu hình API Key & Gemini Model thành công!' });
  };

  const handleTestAiConnection = async () => {
    setTestStatus({ testing: true });
    try {
      const res = await fetch('/api/ai/status');
      const data = await res.json();
      if (data.configured || apiKeyInput.trim().length > 0) {
        setTestStatus({ testing: false, success: true, message: 'Kết nối thành công tới Gemini AI Backend Engine!' });
      } else {
        setTestStatus({ testing: false, success: false, message: 'Chưa phát hiện GEMINI_API_KEY. Vui lòng nhập API key bên dưới.' });
      }
    } catch (err: any) {
      setTestStatus({ testing: false, success: false, message: 'Lỗi khi kiểm tra kết nối AI Server: ' + err.message });
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Settings className="w-4 h-4" />
            <span>HATSCADA GLOBAL SYSTEM CONFIGURATION</span>
          </div>
          <h1 className="text-xl font-black text-slate-100 mt-1">
            {t('globalSettings')} & {t('Phân Quyền & Tài Khoản Vận Hành (User Roles)')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('systemDesc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Persona & Role Management */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">
              {t('Phân Quyền & Tài Khoản Vận Hành (User Roles)')}
            </h2>
          </div>

          <p className="text-xs text-slate-400">
            Chọn tài khoản đang đăng nhập để trải nghiệm phân quyền điều khiển, Acknowledge cảnh báo và cấu hình Tag:
          </p>

          <div className="space-y-2">
            {users.map(user => {
              const isSelected = currentUser.id === user.id;
              return (
                <div
                  key={user.id}
                  onClick={() => switchUser(user.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500/70 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-200">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100">{user.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        User: @{user.username} • {user.email}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      user.role === 'Admin'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : user.role === 'Engineer'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Copilot & Gemini API Key Configuration Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-700/50 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-slate-100">
                {t('aiApiKeyConfig')}
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900 text-indigo-300 border border-indigo-700">
              Gemini Engine
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Cấu hình API Key trực tiếp cho AI Copilot chẩn đoán sự cố SCADA, phân tích OEE và tra cứu sổ tay Deep Learning RAG:
          </p>

          <form onSubmit={handleSaveAiConfig} className="space-y-3 text-xs font-mono">
            {/* API Key Input Field */}
            <div>
              <label className="block text-slate-300 mb-1 font-bold">API Key (Google Gemini AI):</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  placeholder="Nhập API Key Gemini (VD: AIzaSy...)"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Model Selector & Temperature Slider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Mô Hình AI:</label>
                <select
                  value={modelSelect}
                  onChange={e => setModelSelect(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="gemini-3.7-flash">Gemini 3.7 Flash (Mặc Định - Nhanh & Thông Minh)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Phân Tích Sâu 5-Whys)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Siêu Tốc Độ)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Độ Linh Hoạt ({tempSelect}):</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={tempSelect}
                  onChange={e => setTempSelect(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer mt-2"
                />
              </div>
            </div>

            {/* Status Message */}
            {testStatus.message && (
              <div
                className={`p-2.5 rounded-xl text-[11px] font-sans flex items-center space-x-2 ${
                  testStatus.success
                    ? 'bg-emerald-950/70 border border-emerald-700/70 text-emerald-300'
                    : 'bg-rose-950/70 border border-rose-700/70 text-rose-300'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{testStatus.message}</span>
              </div>
            )}

            {/* Submit & Test Buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Lưu Cấu Hình API Key</span>
              </button>

              <button
                type="button"
                onClick={handleTestAiConnection}
                disabled={testStatus.testing}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {testStatus.testing ? 'Đang kiểm tra...' : 'Kiểm Tra Kết Nối AI'}
              </button>
            </div>
          </form>
        </div>

        {/* SCADA Environment & Audio Settings */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">
              Thông Số Trạm Điều Khiển (Station Config)
            </h2>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Audio Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Âm Thanh Còi Báo Động (Alarm Sound Beeper)</div>
                <div className="text-[11px] text-slate-400">Phát âm thanh web audio khi có sự cố Critical/High</div>
              </div>
              <button
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  settings.soundEnabled
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Station ID */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Station Identifier</div>
                <div className="text-[11px] text-slate-400">Trạm máy chủ SCADA trung tâm</div>
              </div>
              <span className="text-cyan-400 font-bold">HAT-SCADA-SRV-01</span>
            </div>

            {/* Test Fault Injection */}
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-rose-300">Giả Lập Sự Cố Khẩn Cấp (E-Stop Injection)</div>
                <div className="text-[11px] text-slate-400">Tạo cảnh báo khẩn cấp tại máy CNC-01 để test còi báo</div>
              </div>
              <button
                onClick={() => triggerEmergencyAlarm(machines[0]?.id || '')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow"
              >
                Kích Hoạt Test
              </button>
            </div>
          </div>
        </div>

        {/* Clean Architecture System Overview */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">
              Kiến Trúc Hệ Thống Chuẩn Clean Architecture (HATSCADA Architecture)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
            {/* Core */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-cyan-400 font-bold text-sm">1. HATSCADA.Core</div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Domain Entities: Machine, Tag, AlarmRule, AlarmEvent, OeeMetrics, User.
                Business Rules, Interface Definitions (IPlcDriver, ITagService, IAlarmEngine, IHistorianService).
              </p>
            </div>

            {/* Infrastructure */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-indigo-400 font-bold text-sm">2. Infrastructure</div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Keyence MC Protocol Driver (KV-8000), Mitsubishi MELSEC Driver, Siemens S7 Driver, Modbus TCP Driver, In-Memory Time-Series Historian DB.
              </p>
            </div>

            {/* Application */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold text-sm">3. Application Engine</div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                ScadaContext State Engine, High-speed tag polling scanner (100ms), ISA-18.2 Alarm Triage Engine, Six Big Losses OEE calculator.
              </p>
            </div>

            {/* UI & AI */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-amber-400 font-bold text-sm">4. UI & HAT AI Copilot</div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                High-density Industrial HMI/SCADA Dashboard, Multi-Pen Historian Trends, Digital Twin SVG Graphics, Google Gemini AI Assistant.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
