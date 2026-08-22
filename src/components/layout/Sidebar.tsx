import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Radio,
  Tags,
  Server,
  AlertTriangle,
  LineChart,
  Gauge,
  FileSpreadsheet,
  Bot,
  Settings,
  Sparkles,
  Bell,
  BookOpen
} from 'lucide-react';
import { useScada } from '../../context/ScadaContext';

export type ViewType =
  | 'dashboard'
  | 'machines'
  | 'tags-live'
  | 'tags-studio'
  | 'plc-drivers'
  | 'alarms'
  | 'notifications'
  | 'historian'
  | 'oee'
  | 'reports'
  | 'ai-copilot'
  | 'deep-learning'
  | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView }) => {
  const { activeAlarmsCount, plcs, emailConfig, deepLearningDocs, t } = useScada();

  const navItems: Array<{
    id: ViewType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    section?: string;
  }> = [
    { section: t('monitoring'), id: 'dashboard', label: t('mainDashboard'), icon: LayoutDashboard },
    { id: 'machines', label: t('machinesTwin'), icon: Cpu, badge: '5 Cells' },
    { id: 'tags-live', label: t('liveTagMonitor'), icon: Radio },

    { section: t('controlEngineering'), id: 'tags-studio', label: t('tagManagement'), icon: Tags },
    { id: 'plc-drivers', label: t('plcCommunication'), icon: Server, badge: `${plcs.length} PLCs` },
    {
      id: 'alarms',
      label: t('alarmManagement'),
      icon: AlertTriangle,
      badge: activeAlarmsCount > 0 ? activeAlarmsCount : undefined,
      badgeColor: 'bg-rose-500 text-white font-bold'
    },
    {
      id: 'notifications',
      label: t('notificationCenter'),
      icon: Bell,
      badge: emailConfig.connectionStatus === 'Connected' ? 'SMTP' : undefined,
      badgeColor: 'bg-emerald-600/80 text-white font-mono'
    },

    { section: t('analyticsMes'), id: 'historian', label: t('historianDatabase'), icon: LineChart },
    { id: 'oee', label: t('oeeAnalytics'), icon: Gauge },
    { id: 'reports', label: t('reportManagement'), icon: FileSpreadsheet },

    { section: t('intelligence'), id: 'ai-copilot', label: t('aiCopilot'), icon: Bot, badge: 'Gemini', badgeColor: 'bg-indigo-600 text-white' },
    { id: 'deep-learning', label: t('deepLearningFolder'), icon: BookOpen, badge: `${deepLearningDocs.length} Docs`, badgeColor: 'bg-purple-600 text-white font-mono' },
    { id: 'settings', label: t('globalSettings'), icon: Settings }
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div className="py-4 space-y-6">
        <div className="px-3 space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <React.Fragment key={item.id}>
                {item.section && (
                  <div className={`px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase ${idx !== 0 ? 'pt-4 pb-1' : 'pb-1'}`}>
                    {item.section}
                  </div>
                )}
                <button
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/80 to-slate-800/90 text-cyan-300 border-l-4 border-cyan-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        item.badgeColor || 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* AI Quick Banner Bottom */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
        <button
          onClick={() => onSelectView('ai-copilot')}
          className="w-full p-3 rounded-xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-700/40 text-left hover:border-indigo-500/70 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>Industrial AI Copilot</span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">
            {t('Phân tích nguyên nhân dừng máy, chẩn đoán Alarm & dự đoán bảo trì tức thì.')}
          </p>
        </button>
      </div>
    </aside>
  );
};
