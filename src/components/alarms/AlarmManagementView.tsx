import React, { useState } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Plus,
  Bot,
  Volume2,
  VolumeX,
  Clock,
  Filter,
  Check,
  XCircle,
  Sliders,
  TrendingDown
} from 'lucide-react';
import { AlarmRule, AlarmEvent, AlarmPriority, AlarmCondition } from '../../types/scada';

interface AlarmManagementViewProps {
  onNavigateToAi: (prompt: string) => void;
}

export const AlarmManagementView: React.FC<AlarmManagementViewProps> = ({ onNavigateToAi }) => {
  const {
    alarmEvents,
    alarmRules,
    tags,
    machines,
    acknowledgeAlarm,
    clearAlarm,
    createAlarmRule,
    toggleAlarmRule,
    deleteAlarmRule,
    currentUser
  } = useScada();

  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'rules' | 'stats'>('active');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('ALL');
  const [isCreatingRule, setIsCreatingRule] = useState(false);

  // Acknowledge Comment Modal
  const [ackModalAlarm, setAckModalAlarm] = useState<AlarmEvent | null>(null);
  const [ackComment, setAckComment] = useState('');

  // New Rule Form
  const [newRule, setNewRule] = useState<{
    name: string;
    tagId: string;
    machineId: string;
    condition: AlarmCondition;
    limitValue: number;
    priority: AlarmPriority;
    message: string;
    enabled: boolean;
    soundAlert: boolean;
    autoAcknowledge: boolean;
  }>({
    name: '',
    tagId: tags[0]?.id || '',
    machineId: machines[0]?.id || '',
    condition: 'GreaterThan',
    limitValue: 80,
    priority: 'High',
    message: '',
    enabled: true,
    soundAlert: true,
    autoAcknowledge: false
  });

  const activeAlarms = alarmEvents.filter(a => a.status === 'Active' || a.status === 'Acknowledged');
  const historyAlarms = alarmEvents.filter(a => a.status === 'Cleared');

  const filteredActive = activeAlarms.filter(a => {
    if (selectedPriorityFilter !== 'ALL' && a.priority !== selectedPriorityFilter) return false;
    return true;
  });

  const handleAcknowledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ackModalAlarm) return;
    acknowledgeAlarm(ackModalAlarm.id, ackComment || 'Xác nhận xử lý');
    setAckModalAlarm(null);
    setAckComment('');
  };

  const handleCreateRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name || !newRule.message) {
      alert('Vui lòng nhập tên quy tắc và thông báo cảnh báo.');
      return;
    }
    createAlarmRule(newRule);
    setIsCreatingRule(false);
  };

  const getPriorityBadge = (priority: AlarmPriority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-950 text-red-300 border-red-700 animate-pulse';
      case 'High':
        return 'bg-rose-950 text-rose-300 border-rose-700';
      case 'Medium':
        return 'bg-amber-950 text-amber-300 border-amber-700';
      case 'Low':
        return 'bg-blue-950 text-blue-300 border-blue-700';
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span>SMART INDUSTRIAL ALARM ENGINE & TRIAGE</span>
          </div>
          <h1 className="text-xl font-black text-slate-100 mt-1">
            Quản Lý Sự Cố & Cảnh Báo Nhà Máy ({activeAlarms.length} Active Alarms)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quy trình Acknowledge chuẩn ISA-18.2, phân tích nguyên nhân gốc rễ và cảnh báo âm thanh
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCreatingRule(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Quy Tắc Alarm Mới</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'bg-rose-950 text-rose-300 border border-rose-700/60 shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          Cảnh Báo Đang Hoạt Động ({activeAlarms.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-slate-800 text-slate-100 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          Lịch Sử Đã Xử Lý ({historyAlarms.length})
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-slate-800 text-slate-100 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          Cấu Hình Ngưỡng & Rules ({alarmRules.length})
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-slate-800 text-slate-100 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          Thống Kê Tần Suất & Pareto
        </button>
      </div>

      {/* TAB 1: Active Alarms */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Hiển thị {filteredActive.length} cảnh báo đang chờ xử lý
            </span>

            {/* Filter Priority */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Lọc Mức Độ:</span>
              <select
                value={selectedPriorityFilter}
                onChange={e => setSelectedPriorityFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono"
              >
                <option value="ALL">Tất cả mức độ</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Alarm Name</th>
                    <th className="py-3 px-4">Machine</th>
                    <th className="py-3 px-4">Tag & Value</th>
                    <th className="py-3 px-4">Triggered Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredActive.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                        🎉 Không có sự cố cảnh báo nào đang hoạt động. Toàn bộ hệ thống an toàn!
                      </td>
                    </tr>
                  ) : (
                    filteredActive.map(alarm => (
                      <tr key={alarm.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(alarm.priority)}`}>
                            {alarm.priority}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-100 font-sans">{alarm.alarmName}</div>
                          <div className="text-[11px] text-slate-400 font-sans">{alarm.message}</div>
                        </td>

                        <td className="py-3 px-4 text-slate-300 font-sans">
                          {alarm.machineName}
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-cyan-400">{alarm.tagName}</div>
                          <div className="text-[11px] text-slate-400">
                            Giá trị: <span className="text-rose-400 font-bold">{String(alarm.value)}</span> (Ngưỡng: {alarm.limitValue})
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-400">
                          {new Date(alarm.triggeredAt).toLocaleTimeString('vi-VN')}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              alarm.status === 'Active'
                                ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                                : 'bg-amber-950 text-amber-400 border-amber-800'
                            }`}
                          >
                            {alarm.status}
                          </span>
                          {alarm.acknowledgedBy && (
                            <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                              bởi {alarm.acknowledgedBy}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() =>
                                onNavigateToAi(
                                  `Phân tích chuyên sâu sự cố: ${alarm.alarmName} tại máy ${alarm.machineName}. Tag ${alarm.tagName} = ${alarm.value} (Ngưỡng: ${alarm.limitValue}). Hãy đưa ra nguyên nhân gốc rễ và quy trình khắc phục từng bước cho kỹ sư.`
                                )
                              }
                              className="px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 text-[11px] font-sans font-medium flex items-center space-x-1 cursor-pointer"
                              title="Hỏi AI Copilot chẩn đoán nguyên nhân"
                            >
                              <Bot className="w-3 h-3 text-indigo-400" />
                              <span>AI Triage</span>
                            </button>

                            {alarm.status === 'Active' && (
                              <button
                                onClick={() => {
                                  setAckModalAlarm(alarm);
                                  setAckComment('');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-[11px] font-sans font-semibold cursor-pointer"
                              >
                                Ack
                              </button>
                            )}

                            <button
                              onClick={() => clearAlarm(alarm.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-sans cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: History */}
      {activeTab === 'history' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Alarm Name</th>
                  <th className="py-3 px-4">Machine</th>
                  <th className="py-3 px-4">Triggered / Cleared</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Operator Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {historyAlarms.map(alarm => (
                  <tr key={alarm.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(alarm.priority)}`}>
                        {alarm.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200 font-sans">
                      {alarm.alarmName}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {alarm.machineName}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div>{new Date(alarm.triggeredAt).toLocaleTimeString('vi-VN')}</div>
                      <div className="text-[10px] text-slate-500">
                        Cleared: {alarm.clearedAt ? new Date(alarm.clearedAt).toLocaleTimeString('vi-VN') : '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-cyan-400">
                      {alarm.durationSeconds ? `${Math.round(alarm.durationSeconds / 60)} phút` : '< 1 phút'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {alarm.comment || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Alarm Rules */}
      {activeTab === 'rules' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4">Rule Name</th>
                  <th className="py-3 px-4">Source Tag</th>
                  <th className="py-3 px-4">Condition & Threshold</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Alarm Message</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {alarmRules.map(rule => {
                  const targetTag = tags.find(t => t.id === rule.tagId);
                  return (
                    <tr key={rule.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-200 font-sans">{rule.name}</td>
                      <td className="py-3 px-4 text-cyan-400">{targetTag?.name || rule.tagId}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-amber-300">
                          {rule.condition} {rule.limitValue} {targetTag?.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(rule.priority)}`}>
                          {rule.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-sans">{rule.message}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleAlarmRule(rule.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                            rule.enabled
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                        >
                          {rule.enabled ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Xóa quy tắc cảnh báo ${rule.name}?`)) {
                              deleteAlarmRule(rule.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Alarm Statistics & Pareto */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>Top Sự Cố Xuất Hiện Nhiều Nhất (Alarm Pareto)</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>1. SMT03 Feeder Motor Over-Temperature</span>
                  <span className="font-bold text-rose-400">15 lần (42%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[42%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>2. CNC01 Spindle Temperature Warning</span>
                  <span className="font-bold text-amber-400">8 lần (24%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[24%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>3. ROBOT02 Optics Thermal Warning</span>
                  <span className="font-bold text-cyan-400">6 lần (18%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full w-[18%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>4. CNC01 Low Coolant Pressure</span>
                  <span className="font-bold text-slate-300">4 lần (12%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-500 h-full w-[12%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-slate-100">Chỉ Số Độ Tin Cậy Nhà Máy (RAMS Metrics)</h3>
            <div className="grid grid-cols-2 gap-3 text-center font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">MTTR (MEAN TIME TO REPAIR)</div>
                <div className="text-xl font-bold text-amber-400 mt-1">14.2 phút</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Thời gian xử lý trung bình</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">MTBF (MEAN TIME BETWEEN FAILURES)</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">168 giờ</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Thời gian hoạt động liên tục</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200">
              💡 <strong>Gợi ý từ AI Copilot:</strong> Sự cố quá nhiệt motor đầu hút tại SMT-03 chiếm 42% tổng downtime hôm nay. Khuyến nghị kiểm tra bụi bẩn tại quạt tản nhiệt driver trước ca 3.
            </div>
          </div>
        </div>
      )}

      {/* Acknowledge Modal */}
      {ackModalAlarm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100">Xác Nhận Xử Lý Cảnh Báo (Acknowledge)</h3>
              <button onClick={() => setAckModalAlarm(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-slate-200">{ackModalAlarm.alarmName}</div>
              <div className="text-slate-400">{ackModalAlarm.machineName}</div>
              <div className="text-slate-500 font-mono text-[11px]">Tag: {ackModalAlarm.tagName} = {String(ackModalAlarm.value)}</div>
            </div>

            <form onSubmit={handleAcknowledgeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">
                  Ghi chú của Kỹ sư / Trưởng ca (Operator Comment):
                </label>
                <input
                  type="text"
                  value={ackComment}
                  onChange={e => setAckComment(e.target.value)}
                  placeholder="e.g. Đã kiểm tra dầu bôi trơn, máy đang giảm tải..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAckModalAlarm(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 cursor-pointer"
                >
                  Xác Nhận Acknowledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Alarm Rule Modal */}
      {isCreatingRule && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">Tạo Quy Tắc Cảnh Báo (Alarm Rule)</h3>
              <button onClick={() => setIsCreatingRule(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateRuleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">Tên Cảnh Báo *</label>
                  <input
                    type="text"
                    required
                    value={newRule.name}
                    onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="e.g. Quá Nhiệt Động Cơ Trục Chính"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">Chọn Tag Nguồn *</label>
                  <select
                    value={newRule.tagId}
                    onChange={e => {
                      const selTag = tags.find(t => t.id === e.target.value);
                      setNewRule({
                        ...newRule,
                        tagId: e.target.value,
                        machineId: selTag?.machineId || newRule.machineId
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                  >
                    {tags.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.address})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">Điều Kiện Kích Hoạt (Condition)</label>
                  <select
                    value={newRule.condition}
                    onChange={e => setNewRule({ ...newRule, condition: e.target.value as AlarmCondition })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                  >
                    <option value="GreaterThan">Lớn hơn (&gt;)</option>
                    <option value="LessThan">Nhỏ hơn (&lt;)</option>
                    <option value="Equal">Bằng (=)</option>
                    <option value="Between">Nằm trong khoảng (Between)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">Giá Trị Ngưỡng (Threshold) *</label>
                  <input
                    type="number"
                    required
                    value={newRule.limitValue}
                    onChange={e => setNewRule({ ...newRule, limitValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">Mức Độ Nghiêm Trọng (Priority)</label>
                  <select
                    value={newRule.priority}
                    onChange={e => setNewRule({ ...newRule, priority: e.target.value as AlarmPriority })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                  >
                    <option value="Critical">Critical (Dừng dây chuyền khẩn cấp)</option>
                    <option value="High">High (Lỗi nghiêm trọng)</option>
                    <option value="Medium">Medium (Cảnh báo thông số)</option>
                    <option value="Low">Low (Thông tin giám sát)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">Âm Thanh Báo Động</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      checked={newRule.soundAlert}
                      onChange={e => setNewRule({ ...newRule, soundAlert: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-rose-500"
                    />
                    <span className="text-xs text-slate-300">Phát còi báo động loa nhà máy</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">Nội Dung Thông Điệp Cảnh Báo *</label>
                <input
                  type="text"
                  required
                  value={newRule.message}
                  onChange={e => setNewRule({ ...newRule, message: e.target.value })}
                  placeholder="e.g. Nhiệt độ vượt quá giới hạn an toàn 80°C. Nguy cơ cháy cuộn dây."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingRule(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  Lưu Quy Tắc Cảnh Báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
