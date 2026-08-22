import React, { useState } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  FileSpreadsheet,
  Calendar,
  Clock,
  Play,
  Download,
  Mail,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  RefreshCw,
  Search,
  Eye,
  Sliders,
  Send,
  FileText,
  Layers,
  BarChart3,
  Printer,
  X,
  Share2
} from 'lucide-react';
import {
  ReportTemplateConfig,
  ReportScheduleConfig,
  GeneratedReportArchiveItem,
  ReportCategory,
  ReportTimeRange,
  ReportOutputFormat
} from '../../types/scada';

export const ReportManagementView: React.FC = () => {
  const {
    reportTemplates,
    addReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    reportSchedules,
    addReportSchedule,
    updateReportSchedule,
    deleteReportSchedule,
    toggleReportSchedule,
    executeReportScheduleNow,
    generatedReportArchive,
    generateCustomReport,
    emailReportToRecipients,
    notificationContacts,
    machines,
    alarmEvents,
    overallOee,
    plantPowerKw,
    plantOkRate,
    totalShiftProduction,
    currentUser
  } = useScada();

  const [activeTab, setActiveTab] = useState<'designer' | 'schedules' | 'archive' | 'shift-handover'>('designer');

  // Preview / View Report Modal
  const [selectedArchiveItem, setSelectedArchiveItem] = useState<GeneratedReportArchiveItem | null>(null);

  // Share by Email Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareReportItem, setShareReportItem] = useState<GeneratedReportArchiveItem | null>(null);
  const [selectedRecipientEmails, setSelectedRecipientEmails] = useState<string[]>([]);
  const [customShareEmail, setCustomShareEmail] = useState('');
  const [isSendingShareEmail, setIsSendingShareEmail] = useState(false);
  const [shareSuccessMsg, setShareSuccessMsg] = useState<string | null>(null);

  // Template Modal
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplateConfig | null>(null);
  const [templateForm, setTemplateForm] = useState<Omit<ReportTemplateConfig, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    category: 'Production',
    description: '',
    format: 'PDF',
    defaultTimeRange: 'Today',
    includeSections: ['KPI_Summary', 'Machine_Comparison', 'Shift_Breakdown', 'Alarm_Top10'],
    targetMachineIds: ['All'],
    chartTypes: ['BarChart', 'PieChart']
  });

  // Schedule Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReportScheduleConfig | null>(null);
  const [scheduleForm, setScheduleForm] = useState<Omit<ReportScheduleConfig, 'id'>>({
    name: '',
    templateId: reportTemplates[0]?.id || 'rtpl-01',
    frequency: 'Daily',
    executionTime: '06:00',
    timeRange: 'PreviousDay',
    emailDelivery: true,
    recipientContactIds: [],
    recipientEmails: ['factory.manager@hatscada.vn'],
    enabled: true
  });

  // Shift Handover AI State
  const [shiftName, setShiftName] = useState('Ca 1 (06:00 - 14:00)');
  const [aiReportContent, setAiReportContent] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Immediate Schedule Run state
  const [runningScheduleId, setRunningScheduleId] = useState<string | null>(null);

  // Archive Filter
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveCategoryFilter, setArchiveCategoryFilter] = useState<'ALL' | ReportCategory>('ALL');

  const handleRunScheduleNow = async (schedId: string) => {
    setRunningScheduleId(schedId);
    try {
      const generated = await executeReportScheduleNow(schedId);
      setSelectedArchiveItem(generated);
    } catch (err: any) {
      alert('Lỗi tạo báo cáo: ' + err.message);
    } finally {
      setRunningScheduleId(null);
    }
  };

  const handleGenerateTemplateInstant = (template: ReportTemplateConfig) => {
    const rep = generateCustomReport(template);
    setSelectedArchiveItem(rep);
  };

  const handleSendReportEmail = async () => {
    if (!shareReportItem) return;
    const finalRecipients = Array.from(new Set([
      ...selectedRecipientEmails,
      ...(customShareEmail ? [customShareEmail] : [])
    ])).filter(Boolean);

    if (finalRecipients.length === 0) {
      alert('Vui lòng chọn ít nhất 1 email người nhận.');
      return;
    }

    setIsSendingShareEmail(true);
    try {
      const res = await emailReportToRecipients(shareReportItem.id, finalRecipients);
      setShareSuccessMsg(res.message);
      setTimeout(() => {
        setIsShareModalOpen(false);
        setShareSuccessMsg(null);
      }, 2500);
    } catch (e: any) {
      alert('Lỗi gửi email: ' + e.message);
    } finally {
      setIsSendingShareEmail(false);
    }
  };

  const handleGenerateAiReport = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/ai/generate-shift-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftName,
          machines,
          alarmEvents: alarmEvents.slice(0, 10),
          overallOee,
          totalShiftProduction,
          plantPowerKw
        })
      });

      const data = await response.json();
      if (data.report) {
        setAiReportContent(data.report);
      } else {
        setAiReportContent('Không thể tạo báo cáo tự động từ AI Copilot.');
      }
    } catch (err) {
      console.error(err);
      setAiReportContent('⚠️ Báo Cáo Ca Sản Xuất (Tạo Tự Động)\n- Tổng sản lượng ca: ' + totalShiftProduction + ' pcs\n- Tỷ lệ đạt: ' + plantOkRate + '%\n- OEE: ' + overallOee + '%\n- Cảnh báo: ' + alarmEvents.length + ' sự cố ghi nhận.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const filteredArchive = generatedReportArchive.filter(item => {
    const titleStr = item.title || item.reportName || '';
    const templateStr = item.templateName || '';
    const matchSearch = titleStr.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      templateStr.toLowerCase().includes(archiveSearch.toLowerCase());
    const matchCategory = archiveCategoryFilter === 'ALL' || item.category === archiveCategoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <FileSpreadsheet className="w-4 h-4" />
            <span>ENTERPRISE INDUSTRIAL REPORTING & SCHEDULER ENGINE</span>
          </div>
          <h1 className="text-xl font-black text-slate-100 mt-1">
            Hệ Thống Quản Lý & Tự Động Hóa Báo Cáo (Report Management)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Thiết kế mẫu báo cáo OEE, sản lượng, lập lịch tự động gửi Email cho Ban Giám Đốc và lưu trữ Historian
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setEditingTemplate(null);
              setTemplateForm({
                name: `Mẫu Báo Cáo Mới #${reportTemplates.length + 1}`,
                category: 'Production',
                description: 'Báo cáo tổng hợp tùy chỉnh theo ca và dây chuyền',
                format: 'PDF',
                defaultTimeRange: 'Today',
                includeSections: ['KPI_Summary', 'Machine_Comparison', 'Shift_Breakdown'],
                targetMachineIds: ['All'],
                chartTypes: ['BarChart']
              });
              setIsTemplateModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thiết Kế Mẫu Mới</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('designer')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'designer'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Mẫu Báo Cáo (Report Designer)</span>
          <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
            {reportTemplates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'schedules'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Lập Lịch Tự Động (Scheduler)</span>
          <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
            {reportSchedules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'archive'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Kho Lưu Trữ Báo Cáo (Archive)</span>
          <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
            {generatedReportArchive.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('shift-handover')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'shift-handover'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Bàn Giao Ca & AI Copilot Report</span>
        </button>
      </div>

      {/* ==========================================================
          TAB 1: REPORT DESIGNER & TEMPLATES
          ========================================================== */}
      {activeTab === 'designer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reportTemplates.map(tpl => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 font-mono text-[10px] font-bold uppercase">
                        {tpl.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100 mt-1.5">{tpl.name}</h3>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingTemplate(tpl);
                          setTemplateForm({
                            name: tpl.name,
                            category: tpl.category,
                            description: tpl.description || '',
                            format: tpl.format,
                            defaultTimeRange: tpl.defaultTimeRange,
                            includeSections: tpl.includeSections,
                            targetMachineIds: tpl.targetMachineIds || ['All'],
                            chartTypes: tpl.chartTypes
                          });
                          setIsTemplateModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-cyan-400 rounded cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteReportTemplate(tpl.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {tpl.description || 'Không có mô tả chi tiết'}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Định dạng xuất:</span>
                      <span className="font-mono text-cyan-300 font-bold">{tpl.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Khung thời gian:</span>
                      <span className="text-slate-200">{tpl.defaultTimeRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Các phần nội dung:</span>
                      <span className="text-slate-300">{tpl.includeSections.length} sections</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {tpl.includeSections.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                        {s.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleGenerateTemplateInstant(tpl)}
                    className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Xuất Báo Cáo Ngay (Run Now)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB 2: REPORT SCHEDULER AUTOMATION
          ========================================================== */}
      {activeTab === 'schedules' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Lập Lịch Tự Động & Gửi Email (Scheduled Report Automation)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cấu hình hệ thống tự động tổng hợp dữ liệu SCADA theo ca, hàng ngày và gửi trực tiếp vào hòm thư Email quản lý
              </p>
            </div>

            <button
              onClick={() => {
                setEditingSchedule(null);
                setScheduleForm({
                  name: `Lịch Báo Cáo Mới ${reportSchedules.length + 1}`,
                  templateId: reportTemplates[0]?.id || 'rtpl-01',
                  frequency: 'Daily',
                  executionTime: '06:00',
                  timeRange: 'PreviousDay',
                  emailDelivery: true,
                  recipientContactIds: [],
                  recipientEmails: ['manager.factory@hatscada.vn'],
                  enabled: true
                });
                setIsScheduleModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Lịch Báo Cáo</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-4">TÊN LỊCH</th>
                  <th className="py-3 px-4">MẪU BÁO CÁO</th>
                  <th className="py-3 px-4">TẦN SUẤT & GIỜ CHẠY</th>
                  <th className="py-3 px-4">TỰ ĐỘNG GỬI EMAIL</th>
                  <th className="py-3 px-4">LẦN CHẠY GẦN NHẤT</th>
                  <th className="py-3 px-4 text-center">TRẠNG THÁI</th>
                  <th className="py-3 px-4 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {reportSchedules.map(schedule => {
                  const template = reportTemplates.find(t => t.id === schedule.templateId);
                  const isRunning = runningScheduleId === schedule.id;

                  return (
                    <tr key={schedule.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-100">
                        {schedule.name}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-cyan-400 font-medium">{template?.name || schedule.templateId}</span>
                        <div className="text-[10px] text-slate-500 font-mono">{template?.format} Format</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300">
                        <div>{schedule.frequency} ({schedule.executionTime})</div>
                        <div className="text-[10px] text-slate-500">{schedule.timeRange}</div>
                      </td>

                      <td className="py-3 px-4">
                        {schedule.emailDelivery ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                              <Mail className="w-3 h-3" />
                              Bật ({schedule.recipientEmails.length} emails)
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                              {schedule.recipientEmails.join(', ')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">Chỉ xuất file lưu trữ</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleString('vi-VN') : 'Chưa chạy'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleReportSchedule(schedule.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            schedule.enabled
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {schedule.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleRunScheduleNow(schedule.id)}
                          disabled={isRunning}
                          className="px-2.5 py-1 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded text-[11px] font-bold cursor-pointer disabled:opacity-50"
                        >
                          {isRunning ? <RefreshCw className="w-3 h-3 animate-spin inline" /> : <Play className="w-3 h-3 inline mr-1" />}
                          Run Now
                        </button>

                        <button
                          onClick={() => {
                            setEditingSchedule(schedule);
                            setScheduleForm({
                              name: schedule.name,
                              templateId: schedule.templateId,
                              frequency: schedule.frequency,
                              executionTime: schedule.executionTime,
                              timeRange: schedule.timeRange,
                              emailDelivery: schedule.emailDelivery,
                              recipientContactIds: schedule.recipientContactIds,
                              recipientEmails: schedule.recipientEmails,
                              enabled: schedule.enabled
                            });
                            setIsScheduleModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-cyan-400 rounded cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 inline" />
                        </button>

                        <button
                          onClick={() => deleteReportSchedule(schedule.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
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

      {/* ==========================================================
          TAB 3: GENERATED REPORT ARCHIVE & EXPORTS
          ========================================================== */}
      {activeTab === 'archive' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Kho Lưu Trữ Báo Cáo Đã Tạo (Generated Report Archive)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Xem lại báo cáo lịch sử, tải về định dạng PDF/Excel và chia sẻ thủ công qua Email
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={archiveSearch}
                onChange={e => setArchiveSearch(e.target.value)}
                placeholder="Tìm kiếm báo cáo theo tiêu đề..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={archiveCategoryFilter}
              onChange={e => setArchiveCategoryFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">Tất cả phân loại</option>
              <option value="Production">Production</option>
              <option value="OEE">OEE</option>
              <option value="Alarm">Alarm</option>
              <option value="ShiftHandover">Shift Handover</option>
              <option value="Energy">Energy</option>
            </select>
          </div>

          {/* Archive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-4">TIÊU ĐỀ BÁO CÁO</th>
                  <th className="py-3 px-4">PHÂN LOẠI</th>
                  <th className="py-3 px-4">ĐỊNH DẠNG / DUNG LƯỢNG</th>
                  <th className="py-3 px-4">CHỈ SỐ TỔNG HỢP (OEE / SẢN LƯỢNG)</th>
                  <th className="py-3 px-4">THỜI ĐIỂM TẠO</th>
                  <th className="py-3 px-4 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredArchive.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{item.title}</div>
                      <div className="text-[10px] text-slate-500">Mẫu: {item.templateName}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-cyan-300 text-[10px]">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      <span>{item.format}</span>
                      <span className="text-[10px] text-slate-500 ml-2">({item.fileSizeKb} KB)</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-semibold">
                        OEE: <span className="text-emerald-400">{item.summary.avgOee}%</span> | Sản lượng: <span className="text-cyan-300">{item.summary.totalProduction.toLocaleString()} pcs</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        OK Rate: {item.summary.okRate}% • Downtime: {item.summary.totalDowntimeMinutes}m
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(item.generatedAt).toLocaleString('vi-VN')}
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedArchiveItem(item)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" />
                        Xem
                      </button>

                      <button
                        onClick={() => {
                          setShareReportItem(item);
                          setSelectedRecipientEmails([notificationContacts[0]?.email || 'manager@hatscada.vn']);
                          setIsShareModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded text-[11px] font-bold cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 inline mr-1" />
                        Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB 4: SHIFT HANDOVER & AI COPILOT REPORT
          ========================================================== */}
      {activeTab === 'shift-handover' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-POWERED SHIFT HANDOVER REPORT</span>
                </div>
                <h2 className="text-base font-bold text-slate-100 mt-1">
                  Báo Cáo Bàn Giao Ca Sản Xuất Tự Động
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tự động phân tích sản lượng, nguyên nhân dừng máy, sự cố kỹ thuật và khuyến nghị vận hành cho ca kế tiếp
                </p>
              </div>

              <button
                onClick={handleGenerateAiReport}
                disabled={isGeneratingAi}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isGeneratingAi ? 'Đang Tổng Hợp AI...' : 'Tạo Báo Cáo Ca Với AI Copilot'}</span>
              </button>
            </div>

            {/* Shift KPI Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div className="text-slate-400 text-xs">OEE Toàn Nhà Máy</div>
                <div className="text-xl font-mono font-black text-emerald-400 mt-1">{overallOee}%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Mục tiêu: &gt; 85.0%</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div className="text-slate-400 text-xs">Tổng Sản Lượng Ca</div>
                <div className="text-xl font-mono font-black text-cyan-400 mt-1">{totalShiftProduction.toLocaleString()} pcs</div>
                <div className="text-[10px] text-slate-500 mt-0.5">OK Rate: {plantOkRate}%</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div className="text-slate-400 text-xs">Công Suất Điện Tiêu Thụ</div>
                <div className="text-xl font-mono font-black text-amber-400 mt-1">{plantPowerKw} kW</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Ổn định &lt; 280 kW</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div className="text-slate-400 text-xs">Sự Cố Báo Động (Alarm)</div>
                <div className="text-xl font-mono font-black text-rose-400 mt-1">{alarmEvents.length} events</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Đã xử lý & ghi nhận</div>
              </div>
            </div>

            {/* Generated AI Content Display */}
            {aiReportContent && (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-xs font-mono text-cyan-400 font-bold">NỘI DUNG BÁO CÁO BÀN GIAO CA SẢN XUẤT</span>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In / Xuất PDF</span>
                  </button>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {aiReportContent}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================================
          MODALS: REPORT PREVIEW / SHARE EMAIL / TEMPLATE / SCHEDULE
          ========================================================== */}

      {/* Report Preview Modal */}
      {selectedArchiveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">{selectedArchiveItem.category} REPORT</span>
                <h3 className="text-base font-bold text-slate-100">{selectedArchiveItem.title}</h3>
              </div>
              <button
                onClick={() => setSelectedArchiveItem(null)}
                className="text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[11px] text-slate-400">Tổng sản lượng</div>
                <div className="text-base font-mono font-bold text-cyan-300 mt-0.5">
                  {selectedArchiveItem.summary.totalProduction.toLocaleString()} pcs
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[11px] text-slate-400">Tỷ lệ OK</div>
                <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                  {selectedArchiveItem.summary.okRate}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[11px] text-slate-400">OEE Trung Bình</div>
                <div className="text-base font-mono font-bold text-cyan-400 mt-0.5">
                  {selectedArchiveItem.summary.avgOee}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[11px] text-slate-400">Downtime</div>
                <div className="text-base font-mono font-bold text-amber-400 mt-0.5">
                  {selectedArchiveItem.summary.totalDowntimeMinutes} phút
                </div>
              </div>
            </div>

            {/* Machines Breakdown Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Chi Tiết Từng Máy / Cell</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px]">
                      <th className="py-2 px-3">MÃ MÁY</th>
                      <th className="py-2 px-3">TÊN THIẾT BỊ</th>
                      <th className="py-2 px-3 text-center">OEE</th>
                      <th className="py-2 px-3 text-right">TỔNG SẢN LƯỢNG</th>
                      <th className="py-2 px-3 text-right">OK / NG</th>
                      <th className="py-2 px-3 text-right">DOWNTIME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {selectedArchiveItem.machines.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono font-bold text-cyan-400">{m.code}</td>
                        <td className="py-2 px-3 text-slate-200">{m.name}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-emerald-400">{m.oee}%</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-100">{m.total.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-300">{m.ok} / {m.ng}</td>
                        <td className="py-2 px-3 text-right font-mono text-amber-400">{m.downtimeMin}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setShareReportItem(selectedArchiveItem);
                  setSelectedRecipientEmails([notificationContacts[0]?.email || 'manager@hatscada.vn']);
                  setIsShareModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Gửi Email Báo Cáo Này</span>
              </button>

              <button
                onClick={() => setSelectedArchiveItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Email Modal */}
      {isShareModalOpen && shareReportItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Gửi Báo Cáo Qua Email</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {shareSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{shareSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Báo cáo đính kèm:</label>
                <div className="font-bold text-slate-100 mt-0.5">{shareReportItem.title}</div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Chọn người nhận từ danh bạ:</label>
                <div className="max-h-32 overflow-y-auto space-y-1.5 mt-1.5 p-2 bg-slate-800/60 rounded-xl border border-slate-700">
                  {notificationContacts.map(c => {
                    const isChecked = selectedRecipientEmails.includes(c.email);
                    return (
                      <label key={c.id} className="flex items-center space-x-2 text-slate-300 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedRecipientEmails(selectedRecipientEmails.filter(e => e !== c.email));
                            } else {
                              setSelectedRecipientEmails([...selectedRecipientEmails, c.email]);
                            }
                          }}
                          className="rounded bg-slate-800"
                        />
                        <span>{c.name} ({c.email})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Hoặc nhập email trực tiếp:</label>
                <input
                  type="email"
                  value={customShareEmail}
                  onChange={e => setCustomShareEmail(e.target.value)}
                  placeholder="director@company.com"
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSendReportEmail}
                disabled={isSendingShareEmail}
                className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingShareEmail ? 'Đang gửi...' : 'Gửi Email Ngay'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">
                {editingTemplate ? 'Chỉnh Sửa Mẫu Báo Cáo' : 'Thiết Kế Mẫu Báo Cáo Mới'}
              </h3>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Tên mẫu báo cáo</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="Ví dụ: Báo Cáo Sản Xuất Hàng Ngày & OEE"
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Phân loại (Category)</label>
                  <select
                    value={templateForm.category}
                    onChange={e => setTemplateForm({ ...templateForm, category: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                  >
                    <option value="Production">Production</option>
                    <option value="OEE">OEE</option>
                    <option value="Alarm">Alarm</option>
                    <option value="ShiftHandover">Shift Handover</option>
                    <option value="Energy">Energy</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Định dạng file xuất</label>
                  <select
                    value={templateForm.format}
                    onChange={e => setTemplateForm({ ...templateForm, format: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                  >
                    <option value="PDF">PDF (A4 Executive)</option>
                    <option value="Excel">Excel (.xlsx)</option>
                    <option value="CSV">CSV (Raw Data)</option>
                    <option value="HTML">HTML Email</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Khung thời gian mặc định</label>
                <select
                  value={templateForm.defaultTimeRange}
                  onChange={e => setTemplateForm({ ...templateForm, defaultTimeRange: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                >
                  <option value="Today">Hôm nay (Today)</option>
                  <option value="CurrentShift">Ca hiện tại (Current Shift)</option>
                  <option value="PreviousDay">Ngày hôm trước (Previous Day)</option>
                  <option value="ThisWeek">Tuần này (This Week)</option>
                  <option value="ThisMonth">Tháng này (This Month)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!templateForm.name) return;
                  if (editingTemplate) {
                    updateReportTemplate({ ...editingTemplate, ...templateForm });
                  } else {
                    addReportTemplate(templateForm);
                  }
                  setIsTemplateModalOpen(false);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Lưu Mẫu Báo Cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">
                {editingSchedule ? 'Sửa Lịch Báo Cáo' : 'Tạo Lịch Báo Cáo Tự Động Mới'}
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Tên lịch trình</label>
                <input
                  type="text"
                  value={scheduleForm.name}
                  onChange={e => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                  placeholder="Ví dụ: Tự động gửi báo cáo OEE 06:00 sáng hàng ngày"
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Mẫu báo cáo sử dụng</label>
                <select
                  value={scheduleForm.templateId}
                  onChange={e => setScheduleForm({ ...scheduleForm, templateId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                >
                  {reportTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.format})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Tần suất chạy</label>
                  <select
                    value={scheduleForm.frequency}
                    onChange={e => setScheduleForm({ ...scheduleForm, frequency: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                  >
                    <option value="Daily">Hàng ngày (Daily)</option>
                    <option value="ShiftBased">Mỗi ca (End of Shift)</option>
                    <option value="Weekly">Hàng tuần (Weekly)</option>
                    <option value="Monthly">Hàng tháng (Monthly)</option>
                    <option value="Hourly">Mỗi giờ (Hourly)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Giờ chạy (HH:mm)</label>
                  <input
                    type="time"
                    value={scheduleForm.executionTime}
                    onChange={e => setScheduleForm({ ...scheduleForm, executionTime: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center space-x-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleForm.emailDelivery}
                    onChange={e => setScheduleForm({ ...scheduleForm, emailDelivery: e.target.checked })}
                    className="rounded bg-slate-800"
                  />
                  <span className="font-semibold">Tự động gửi Email khi xuất xong</span>
                </label>

                {scheduleForm.emailDelivery && (
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px]">Danh sách Email người nhận (phân cách bằng dấu phẩy)</label>
                    <input
                      type="text"
                      value={scheduleForm.recipientEmails.join(', ')}
                      onChange={e => setScheduleForm({
                        ...scheduleForm,
                        recipientEmails: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      placeholder="plant.manager@factory.vn, engineer.lead@factory.vn"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!scheduleForm.name) return;
                  if (editingSchedule) {
                    updateReportSchedule({ ...editingSchedule, ...scheduleForm });
                  } else {
                    addReportSchedule(scheduleForm);
                  }
                  setIsScheduleModalOpen(false);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Lưu Lịch Trình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
