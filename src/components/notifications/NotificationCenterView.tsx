import React, { useState } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  Bell,
  Mail,
  Send,
  Users,
  Sliders,
  FileCode,
  History,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Play,
  RotateCcw,
  Trash2,
  Plus,
  Edit2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Terminal,
  Search,
  Filter,
  Check,
  X,
  MessageSquare,
  Globe,
  Tag as TagIcon
} from 'lucide-react';
import {
  NotificationContact,
  TagNotificationRule,
  AlarmNotificationRule,
  NotificationTemplate,
  NotificationChannelType,
  AlarmPriority
} from '../../types/scada';

export const NotificationCenterView: React.FC = () => {
  const {
    emailConfig,
    telegramConfig,
    webhookConfig,
    updateEmailConfig,
    updateTelegramConfig,
    updateWebhookConfig,
    sendTestEmail,
    sendTestTelegram,
    sendTestWebhook,
    notificationContacts,
    addContact,
    updateContact,
    deleteContact,
    toggleContactEnabled,
    tagNotificationRules,
    addTagNotificationRule,
    updateTagNotificationRule,
    deleteTagNotificationRule,
    toggleTagNotificationRule,
    alarmNotificationRules,
    addAlarmNotificationRule,
    updateAlarmNotificationRule,
    deleteAlarmNotificationRule,
    toggleAlarmNotificationRule,
    notificationTemplates,
    addNotificationTemplate,
    updateNotificationTemplate,
    deleteNotificationTemplate,
    notificationHistory,
    clearNotificationHistory,
    retryNotification,
    notificationQueue,
    tags,
    alarmRules
  } = useScada();

  const [activeTab, setActiveTab] = useState<'rules' | 'email-config' | 'contacts' | 'templates' | 'history'>('rules');

  // Email Config State
  const [smtpServer, setSmtpServer] = useState(emailConfig.smtpServer);
  const [smtpPort, setSmtpPort] = useState(emailConfig.smtpPort);
  const [securityType, setSecurityType] = useState(emailConfig.securityType);
  const [authUsername, setAuthUsername] = useState(emailConfig.authUsername);
  const [authPassword, setAuthPassword] = useState(emailConfig.authPassword);
  const [senderEmail, setSenderEmail] = useState(emailConfig.senderEmail);
  const [senderDisplayName, setSenderDisplayName] = useState(emailConfig.senderDisplayName);
  const [testEmailRecipient, setTestEmailRecipient] = useState('manager.factory@hatscada.vn');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestOutput, setEmailTestOutput] = useState<{ success: boolean; message: string; log: string[] } | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Telegram & Webhook Local State
  const [tgBotToken, setTgBotToken] = useState(telegramConfig.botToken);
  const [tgChatId, setTgChatId] = useState(telegramConfig.chatId);
  const [isTestingTg, setIsTestingTg] = useState(false);
  const [tgResult, setTgResult] = useState<string | null>(null);

  const [whEndpoint, setWhEndpoint] = useState(webhookConfig.endpointUrl);
  const [isTestingWh, setIsTestingWh] = useState(false);
  const [whResult, setWhResult] = useState<string | null>(null);

  // History Filtering
  const [historySearch, setHistorySearch] = useState('');
  const [historyChannelFilter, setHistoryChannelFilter] = useState<'ALL' | NotificationChannelType>('ALL');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'ALL' | 'Delivered' | 'Failed' | 'Processing'>('ALL');

  // Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<NotificationContact | null>(null);
  const [contactForm, setContactForm] = useState<Omit<NotificationContact, 'id'>>({
    name: '',
    email: '',
    phone: '',
    telegramChatId: '',
    role: 'Operator',
    department: 'Production',
    shift: 'All',
    enabled: true
  });

  // Tag Rule Modal State
  const [isTagRuleModalOpen, setIsTagRuleModalOpen] = useState(false);
  const [editingTagRule, setEditingTagRule] = useState<TagNotificationRule | null>(null);
  const [tagRuleForm, setTagRuleForm] = useState<Omit<TagNotificationRule, 'id' | 'triggerCount'>>({
    name: '',
    tagId: tags[0]?.id || 'tag-01',
    condition: 'GreaterThan',
    thresholdValue: 80,
    delaySeconds: 5,
    severity: 'High',
    channels: ['Email'],
    recipientContactIds: [],
    recipientEmails: [],
    templateId: notificationTemplates[0]?.id || 'tpl-01',
    enabled: true
  });

  // Alarm Rule Modal State
  const [isAlarmRuleModalOpen, setIsAlarmRuleModalOpen] = useState(false);
  const [editingAlarmRule, setEditingAlarmRule] = useState<AlarmNotificationRule | null>(null);
  const [alarmRuleForm, setAlarmRuleForm] = useState<Omit<AlarmNotificationRule, 'id'>>({
    name: '',
    alarmRuleId: 'All',
    priority: 'Critical',
    condition: ['OnTrigger'],
    channels: ['Email', 'Telegram'],
    recipientContactIds: [],
    recipientEmails: [],
    rateLimitMinutes: 10,
    templateId: notificationTemplates[0]?.id || 'tpl-01',
    enabled: true
  });

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<Omit<NotificationTemplate, 'id'>>({
    name: '',
    type: 'AlarmAlert',
    subject: '',
    body: '',
    variables: ['MachineName', 'TagName', 'Value', 'Limit', 'Timestamp']
  });

  // Email Server Save Handler
  const handleSaveEmailConfig = () => {
    updateEmailConfig({
      smtpServer,
      smtpPort,
      securityType,
      authUsername,
      authPassword,
      senderEmail,
      senderDisplayName
    });
    setSaveSuccessMsg('Cấu hình Email Server (SMTP) đã được lưu thành công.');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleRunEmailTest = async () => {
    setIsTestingEmail(true);
    setEmailTestOutput(null);
    try {
      const res = await sendTestEmail(testEmailRecipient);
      setEmailTestOutput(res);
    } catch (err: any) {
      setEmailTestOutput({
        success: false,
        message: err.message || 'Lỗi kiểm tra kết nối SMTP.',
        log: ['[CLIENT] Connection error: ' + (err.message || 'Timeout / Auth Failure')]
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleRunTgTest = async () => {
    setIsTestingTg(true);
    setTgResult(null);
    try {
      updateTelegramConfig({ botToken: tgBotToken, chatId: tgChatId });
      const res = await sendTestTelegram(tgChatId);
      setTgResult(res.message);
    } catch (e: any) {
      setTgResult('Lỗi Telegram: ' + e.message);
    } finally {
      setIsTestingTg(false);
    }
  };

  const handleRunWhTest = async () => {
    setIsTestingWh(true);
    setWhResult(null);
    try {
      updateWebhookConfig({ endpointUrl: whEndpoint });
      const res = await sendTestWebhook(whEndpoint);
      setWhResult(res.message);
    } catch (e: any) {
      setWhResult('Lỗi Webhook: ' + e.message);
    } finally {
      setIsTestingWh(false);
    }
  };

  // Filtered History
  const filteredHistory = notificationHistory.filter(item => {
    const matchSearch =
      item.subject.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.sourceName.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.recipients.some(r => r.toLowerCase().includes(historySearch.toLowerCase()));

    const matchChannel = historyChannelFilter === 'ALL' || item.channelType === historyChannelFilter;
    const matchStatus = historyStatusFilter === 'ALL' || item.status === historyStatusFilter;

    return matchSearch && matchChannel && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Bell className="w-4 h-4" />
            <span>CENTRALIZED SCADA NOTIFICATION ENGINE</span>
          </div>
          <h1 className="text-xl font-black text-slate-100 mt-1">
            Trung Tâm Quản Lý Thông Báo & Cảnh Báo Tự Động (Notification Center)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cấu hình SMTP Mail Server, luật gửi Email/Telegram/Webhook theo Alarm, ngưỡng Tag, và nhật ký gửi thời gian thực
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
            <span className="text-slate-400">SMTP:</span>
            <span className={`inline-flex items-center gap-1 font-bold ${emailConfig.connectionStatus === 'Connected' ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span className={`w-2 h-2 rounded-full ${emailConfig.connectionStatus === 'Connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {emailConfig.connectionStatus}
            </span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
            <span className="text-slate-400">Hàng đợi:</span>
            <span className="font-mono font-bold text-cyan-400">{notificationQueue.length} jobs</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Quy Tắc Thông Báo (Rules)</span>
          <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
            {tagNotificationRules.length + alarmNotificationRules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('email-config')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'email-config'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Cấu Hình Email Server (SMTP)</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'contacts'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh Bạ & Nhóm Nhận (Contacts)</span>
          <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
            {notificationContacts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Mẫu Tin Nhắn (Templates)</span>
          <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
            {notificationTemplates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Nhật Ký Gửi (Live History)</span>
          <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
            {notificationHistory.length}
          </span>
        </button>
      </div>

      {/* ==========================================================
          TAB 1: NOTIFICATION RULES (TAG RULES & ALARM RULES)
          ========================================================== */}
      {activeTab === 'rules' && (
        <div className="space-y-8">
          {/* Section 1: Alarm Notification Rules */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Quy Tắc Thông Báo Theo Sự Kiện Báo Động (Alarm Notification Rules)
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tự động gửi email/tin nhắn cho đội cơ điện khi Alarm kích hoạt, có tính năng chống spam lặp lại
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingAlarmRule(null);
                  setAlarmRuleForm({
                    name: `Quy tắc Alarm mới ${alarmNotificationRules.length + 1}`,
                    alarmRuleId: 'All',
                    priority: 'Critical',
                    condition: ['OnTrigger'],
                    channels: ['Email', 'Telegram'],
                    recipientContactIds: [notificationContacts[0]?.id || ''],
                    recipientEmails: [],
                    rateLimitMinutes: 10,
                    templateId: notificationTemplates[0]?.id || 'tpl-01',
                    enabled: true
                  });
                  setIsAlarmRuleModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Quy Tắc Alarm</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alarmNotificationRules.map(rule => {
                const template = notificationTemplates.find(t => t.id === rule.templateId);
                return (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-xl border transition-all ${
                      rule.enabled
                        ? 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                        : 'bg-slate-900/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            rule.priority === 'Critical'
                              ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                              : rule.priority === 'High'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <h3 className="text-xs font-bold text-slate-100">{rule.name}</h3>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => toggleAlarmNotificationRule(rule.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            rule.enabled
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {rule.enabled ? 'Active' : 'Disabled'}
                        </button>
                        <button
                          onClick={() => deleteAlarmNotificationRule(rule.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mức ưu tiên:</span>
                        <span className="font-semibold text-slate-200">{rule.priority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Kênh gửi:</span>
                        <div className="flex space-x-1">
                          {rule.channels.map(ch => (
                            <span key={ch} className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-cyan-300">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Điều kiện gửi:</span>
                        <span className="text-slate-300">{rule.condition.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Chống spam lặp:</span>
                        <span className="font-mono text-slate-300">{rule.rateLimitMinutes} phút</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mẫu tin nhắn:</span>
                        <span className="text-slate-300 truncate max-w-[140px]">{template?.name || 'Mặc định'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Tag Value Notification Rules */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <TagIcon className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Quy Tắc Cảnh Báo Giá Trị Tag (Tag Value Notification Rules)
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tự động kiểm tra giá trị thực tế của PLC Tag, trì hoãn chống nhiễu (Delay time) trước khi phát thông báo
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingTagRule(null);
                  setTagRuleForm({
                    name: `Quy tắc Tag mới ${tagNotificationRules.length + 1}`,
                    tagId: tags[0]?.id || 'tag-01',
                    condition: 'GreaterThan',
                    thresholdValue: 75,
                    delaySeconds: 5,
                    severity: 'High',
                    channels: ['Email'],
                    recipientContactIds: [notificationContacts[0]?.id || ''],
                    recipientEmails: [],
                    templateId: notificationTemplates[0]?.id || 'tpl-01',
                    enabled: true
                  });
                  setIsTagRuleModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Quy Tắc Tag</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tagNotificationRules.map(rule => {
                const targetTag = tags.find(t => t.id === rule.tagId);
                return (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-xl border transition-all ${
                      rule.enabled
                        ? 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                        : 'bg-slate-900/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            rule.severity === 'Critical'
                              ? 'bg-rose-500'
                              : rule.severity === 'High'
                              ? 'bg-amber-500'
                              : 'bg-cyan-400'
                          }`}
                        />
                        <h3 className="text-xs font-bold text-slate-100">{rule.name}</h3>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => toggleTagNotificationRule(rule.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            rule.enabled
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {rule.enabled ? 'Active' : 'Disabled'}
                        </button>
                        <button
                          onClick={() => deleteTagNotificationRule(rule.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tag giám sát:</span>
                        <span className="font-mono text-cyan-300">{targetTag?.name || rule.tagId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Điều kiện:</span>
                        <span className="font-semibold text-amber-300">
                          {rule.condition === 'GreaterThan' ? '>' : rule.condition === 'LessThan' ? '<' : '='} {rule.thresholdValue} {targetTag?.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Thời gian trễ (Delay):</span>
                        <span className="font-mono text-slate-300">{rule.delaySeconds}s (chống nhiễu)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Số lần đã kích hoạt:</span>
                        <span className="font-mono font-bold text-cyan-400">{rule.triggerCount} lần</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB 2: EMAIL SERVER CONFIGURATION (SMTP + TEST SOCKET)
          ========================================================== */}
      {activeTab === 'email-config' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SMTP Configuration Form */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Cấu Hình Máy Chủ Email SMTP (SMTP Server Configuration)
                </h2>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Module 31
              </span>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">SMTP Server Host</label>
                <input
                  type="text"
                  value={smtpServer}
                  onChange={e => setSmtpServer(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Port</label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={e => setSmtpPort(Number(e.target.value))}
                  placeholder="587"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Security Encryption</label>
                <select
                  value={securityType}
                  onChange={e => setSecurityType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="TLS">TLS (Recommended on Port 587)</option>
                  <option value="SSL">SSL (Port 465)</option>
                  <option value="STARTTLS">STARTTLS</option>
                  <option value="None">None (Plaintext)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Sender Display Name</label>
                <input
                  type="text"
                  value={senderDisplayName}
                  onChange={e => setSenderDisplayName(e.target.value)}
                  placeholder="HATSCADA Industrial Alert System"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Sender Email Address</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={e => setSenderEmail(e.target.value)}
                  placeholder="scada-alerts@factory.hatscada.vn"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Auth Username</label>
                <input
                  type="text"
                  value={authUsername}
                  onChange={e => setAuthUsername(e.target.value)}
                  placeholder="alerts@factory.hatscada.vn"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Password / App Secret Token</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <p className="text-[11px] text-slate-500">
                  Dành cho Gmail / Google Workspace: Sử dụng App Password 16 ký tự để bảo mật.
                </p>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <div className="text-xs text-slate-400">
                <span>Tổng số email đã gửi: </span>
                <span className="font-mono font-bold text-cyan-400">{emailConfig.totalSentCount} messages</span>
              </div>

              <button
                onClick={handleSaveEmailConfig}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/20 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Cấu Hình SMTP</span>
              </button>
            </div>

            {/* Telegram & Webhook Secondary integrations */}
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Kênh Phụ Trợ (Telegram Bot & REST Webhook)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
                    <MessageSquare className="w-4 h-4" />
                    <span>Telegram Bot Alert Channel</span>
                  </div>
                  <input
                    type="text"
                    value={tgBotToken}
                    onChange={e => setTgBotToken(e.target.value)}
                    placeholder="Bot Token (e.g. 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11)"
                    className="w-full px-2.5 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
                  />
                  <input
                    type="text"
                    value={tgChatId}
                    onChange={e => setTgChatId(e.target.value)}
                    placeholder="Chat ID / @channel (e.g. -1001928374)"
                    className="w-full px-2.5 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
                  />
                  <button
                    onClick={handleRunTgTest}
                    disabled={isTestingTg}
                    className="w-full py-1.5 bg-blue-600/80 hover:bg-blue-600 rounded-lg text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {isTestingTg ? 'Đang gửi...' : 'Gửi Test Telegram'}
                  </button>
                  {tgResult && <p className="text-[11px] text-blue-300">{tgResult}</p>}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-purple-400">
                    <Globe className="w-4 h-4" />
                    <span>REST Webhook Endpoint (MES/ERP)</span>
                  </div>
                  <input
                    type="text"
                    value={whEndpoint}
                    onChange={e => setWhEndpoint(e.target.value)}
                    placeholder="https://mes.plant.com/api/v1/scada-events"
                    className="w-full px-2.5 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-xs font-mono text-slate-200"
                  />
                  <div className="h-[34px] flex items-center text-[11px] text-slate-400">
                    Payload: JSON POST Event Structure
                  </div>
                  <button
                    onClick={handleRunWhTest}
                    disabled={isTestingWh}
                    className="w-full py-1.5 bg-purple-600/80 hover:bg-purple-600 rounded-lg text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {isTestingWh ? 'Đang gửi...' : 'Gửi Test Webhook'}
                  </button>
                  {whResult && <p className="text-[11px] text-purple-300">{whResult}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live SMTP Socket Diagnostic Console */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Kiểm Tra Kết Nối Trực Tiếp (Live SMTP Diagnostic Test)
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300">Địa chỉ Email nhận thử nghiệm</label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={e => setTestEmailRecipient(e.target.value)}
                    placeholder="your.email@company.com"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleRunEmailTest}
                    disabled={isTestingEmail}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isTestingEmail ? 'Testing...' : 'Send Test Email'}</span>
                  </button>
                </div>
              </div>

              {/* Socket Console Logs */}
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] space-y-1.5 min-h-[320px] max-h-[380px] overflow-y-auto">
                <div className="text-slate-500 pb-2 border-b border-slate-800/80 flex items-center justify-between">
                  <span>HATSCADA SMTP Socket Monitor</span>
                  <span className="text-[10px] text-emerald-400">READY</span>
                </div>

                {emailTestOutput ? (
                  <>
                    <div className={`p-2 rounded font-bold text-xs ${emailTestOutput.success ? 'bg-emerald-950/60 text-emerald-300' : 'bg-rose-950/60 text-rose-300'}`}>
                      {emailTestOutput.message}
                    </div>
                    {emailTestOutput.log.map((line, i) => (
                      <div
                        key={i}
                        className={`${
                          line.startsWith('[CLIENT]')
                            ? 'text-cyan-400'
                            : line.startsWith('[SERVER] 2')
                            ? 'text-emerald-400'
                            : line.startsWith('[SERVER] 3')
                            ? 'text-amber-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {line}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-center space-y-2">
                    <Mail className="w-8 h-8 opacity-40" />
                    <p>Nhập email và nhấn "Send Test Email" để chạy mô phỏng bắt tay SMTP Socket với {smtpServer}:{smtpPort}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-200">Trạng thái cấu hình hiện tại:</div>
              <div>• Lần gửi gần nhất: <span className="text-slate-300">{emailConfig.lastSentTime ? new Date(emailConfig.lastSentTime).toLocaleString('vi-VN') : 'Chưa gửi'}</span></div>
              <div>• Cơ chế thử lại (Retry): <span className="text-slate-300">Tối đa {emailConfig.retryCount} lần khi mất kết nối</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB 3: CONTACTS & RECIPIENT GROUPS
          ========================================================== */}
      {activeTab === 'contacts' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Danh Bạ Người Nhận & Nhóm Vận Hành (Notification Contacts)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Quản lý danh sách kỹ sư, trưởng ca, quản lý nhận thông báo qua Email, SMS và Telegram
              </p>
            </div>

            <button
              onClick={() => {
                setEditingContact(null);
                setContactForm({
                  name: '',
                  email: '',
                  phone: '',
                  telegramChatId: '',
                  role: 'Operator',
                  department: 'Production',
                  shift: 'All',
                  enabled: true
                });
                setIsContactModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Người Nhận Mới</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-4">HỌ VÀ TÊN</th>
                  <th className="py-3 px-4">EMAIL</th>
                  <th className="py-3 px-4">ĐIỆN THOẠI / TELEGRAM</th>
                  <th className="py-3 px-4">CHỨC DANH</th>
                  <th className="py-3 px-4">PHÒNG BAN</th>
                  <th className="py-3 px-4">CA LÀM VIỆC</th>
                  <th className="py-3 px-4 text-center">TRẠNG THÁI</th>
                  <th className="py-3 px-4 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {notificationContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-200">
                      {contact.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-400">
                      {contact.email}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{contact.phone || '—'}</div>
                      {contact.telegramChatId && (
                        <div className="text-[10px] text-blue-400 font-mono">TG: {contact.telegramChatId}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {contact.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {contact.department}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {contact.shift}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleContactEnabled(contact.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          contact.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {contact.enabled ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingContact(contact);
                          setContactForm({
                            name: contact.name,
                            email: contact.email,
                            phone: contact.phone || '',
                            telegramChatId: contact.telegramChatId || '',
                            role: contact.role,
                            department: contact.department,
                            shift: contact.shift,
                            enabled: contact.enabled
                          });
                          setIsContactModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-cyan-400 rounded cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => deleteContact(contact.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
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
          TAB 4: NOTIFICATION TEMPLATES STUDIO
          ========================================================== */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Mẫu Nội Dung Thông Báo (Notification Templates)
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tùy chỉnh tiêu đề và nội dung tin nhắn với các biến động như &#123;MachineName&#125;, &#123;TagName&#125;, &#123;Value&#125;, &#123;Timestamp&#125;
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setTemplateForm({
                    name: `Mẫu mới ${notificationTemplates.length + 1}`,
                    type: 'AlarmAlert',
                    subject: '[HATSCADA] Thông báo từ hệ thống',
                    body: 'Nội dung: {AlarmMessage}\nMáy: {MachineName}\nThời gian: {Timestamp}',
                    variables: ['MachineName', 'TagName', 'Value', 'Timestamp']
                  });
                  setIsTemplateModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Mẫu Mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notificationTemplates.map(tpl => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-100">{tpl.name}</h3>
                      <span className="text-[10px] font-mono text-cyan-400">{tpl.type}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setEditingTemplate(tpl);
                          setTemplateForm({
                            name: tpl.name,
                            type: tpl.type,
                            subject: tpl.subject,
                            body: tpl.body,
                            variables: tpl.variables
                          });
                          setIsTemplateModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-cyan-400 rounded cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteNotificationTemplate(tpl.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-500">Tiêu đề (Subject):</span>
                      <div className="p-2 rounded bg-slate-900 font-mono text-cyan-300 text-[11px] mt-1 border border-slate-800">
                        {tpl.subject}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500">Nội dung mẫu (Body):</span>
                      <pre className="p-2.5 rounded bg-slate-900 font-mono text-slate-300 text-[11px] mt-1 border border-slate-800 whitespace-pre-wrap max-h-36 overflow-y-auto">
                        {tpl.body}
                      </pre>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-1">
                    {tpl.variables.map(v => (
                      <span key={v} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-[10px] font-mono text-amber-300">
                        &#123;{v}&#123;
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB 5: LIVE NOTIFICATION QUEUE & HISTORY
          ========================================================== */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Nhật Ký & Hàng Đợi Gửi Thông Báo (Notification History & Queue)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Theo dõi chi tiết thời gian gửi, trạng thái giao nhận, độ trễ (latency) và thử lại khi gặp lỗi
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={clearNotificationHistory}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Nhật Ký</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                placeholder="Tìm kiếm theo tiêu đề, nguồn phát hoặc email người nhận..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex space-x-2 w-full sm:w-auto">
              <select
                value={historyChannelFilter}
                onChange={e => setHistoryChannelFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">Tất cả kênh</option>
                <option value="Email">Email (SMTP)</option>
                <option value="Telegram">Telegram</option>
                <option value="Webhook">Webhook</option>
                <option value="SMS">SMS</option>
              </select>

              <select
                value={historyStatusFilter}
                onChange={e => setHistoryStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="Delivered">Delivered</option>
                <option value="Failed">Failed</option>
                <option value="Processing">Processing</option>
              </select>
            </div>
          </div>

          {/* History Log Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-3">THỜI GIAN</th>
                  <th className="py-3 px-3">KÊNH</th>
                  <th className="py-3 px-3">NGUỒN PHÁT</th>
                  <th className="py-3 px-3">NGƯỜI NHẬN</th>
                  <th className="py-3 px-3">TIÊU ĐỀ & NỘI DUNG</th>
                  <th className="py-3 px-3 text-center">TRẠNG THÁI</th>
                  <th className="py-3 px-3 text-center">ĐỘ TRỄ</th>
                  <th className="py-3 px-3 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      Không tìm thấy bản ghi thông báo nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleTimeString('vi-VN')}
                        <div className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleDateString('vi-VN')}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px]">
                          {item.channelType}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{item.sourceName}</div>
                        <div className="text-[10px] text-slate-500">{item.source}</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-300 max-w-[180px] truncate">
                        {item.recipients.join(', ')}
                      </td>

                      <td className="py-3 px-3 max-w-[260px]">
                        <div className="font-semibold text-slate-100 truncate">{item.subject}</div>
                        <div className="text-[11px] text-slate-400 truncate">{item.messagePreview}</div>
                        {item.errorMessage && (
                          <div className="text-[10px] text-rose-400 mt-0.5">{item.errorMessage}</div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'Delivered'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.status === 'Failed'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-400">
                        {item.latencyMs ? `${item.latencyMs}ms` : '—'}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {item.status === 'Failed' && (
                          <button
                            onClick={() => retryNotification(item.id)}
                            className="px-2 py-1 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded text-[10px] font-bold cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3 inline mr-1" />
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODALS: CONTACT / TAG RULE / ALARM RULE / TEMPLATE
          ========================================================== */}

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">
                {editingContact ? 'Sửa Thông Tin Người Nhận' : 'Thêm Người Nhận Mới'}
              </h3>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Họ và Tên</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Ví dụ: Kỹ Sư Trực Ca Nguyễn Văn A"
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Email nhận cảnh báo</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="engineer@factory.vn"
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Số điện thoại / SMS</label>
                  <input
                    type="text"
                    value={contactForm.phone}
                    onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+84 901 234 567"
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Telegram Chat ID</label>
                  <input
                    type="text"
                    value={contactForm.telegramChatId}
                    onChange={e => setContactForm({ ...contactForm, telegramChatId: e.target.value })}
                    placeholder="@username hoặc ID"
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Chức danh</label>
                  <select
                    value={contactForm.role}
                    onChange={e => setContactForm({ ...contactForm, role: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                  >
                    <option value="Operator">Operator</option>
                    <option value="Engineer">Engineer</option>
                    <option value="MaintenanceLead">Maintenance Lead</option>
                    <option value="ShiftLeader">Shift Leader</option>
                    <option value="PlantManager">Plant Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Phòng ban</label>
                  <input
                    type="text"
                    value={contactForm.department}
                    onChange={e => setContactForm({ ...contactForm, department: e.target.value })}
                    placeholder="Bảo Trì & Cơ Điện"
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Ca trực</label>
                  <select
                    value={contactForm.shift}
                    onChange={e => setContactForm({ ...contactForm, shift: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                  >
                    <option value="All">Cả 3 Ca (24/7)</option>
                    <option value="Ca 1 (06:00 - 14:00)">Ca 1</option>
                    <option value="Ca 2 (14:00 - 22:00)">Ca 2</option>
                    <option value="Ca 3 (22:00 - 06:00)">Ca 3</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!contactForm.name || !contactForm.email) return;
                  if (editingContact) {
                    updateContact({ ...editingContact, ...contactForm });
                  } else {
                    addContact(contactForm);
                  }
                  setIsContactModalOpen(false);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs text-white font-bold cursor-pointer"
              >
                Lưu Người Nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alarm Rule Modal */}
      {isAlarmRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">
                {editingAlarmRule ? 'Chỉnh Sửa Quy Tắc Alarm' : 'Tạo Quy Tắc Thông Báo Alarm Mới'}
              </h3>
              <button
                onClick={() => setIsAlarmRuleModalOpen(false)}
                className="text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Tên quy tắc</label>
                <input
                  type="text"
                  value={alarmRuleForm.name}
                  onChange={e => setAlarmRuleForm({ ...alarmRuleForm, name: e.target.value })}
                  placeholder="Ví dụ: Cảnh báo khẩn cấp E-Stop & Quá nhiệt"
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Mức ưu tiên (Priority)</label>
                  <select
                    value={alarmRuleForm.priority}
                    onChange={e => setAlarmRuleForm({ ...alarmRuleForm, priority: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                  >
                    <option value="Critical">Critical (Nghiêm Trọng)</option>
                    <option value="High">High (Cao)</option>
                    <option value="Medium">Medium (Trung Bình)</option>
                    <option value="Low">Low (Thấp)</option>
                    <option value="All">Tất Cả Mức Độ</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Giới hạn chống spam (phút)</label>
                  <input
                    type="number"
                    value={alarmRuleForm.rateLimitMinutes}
                    onChange={e => setAlarmRuleForm({ ...alarmRuleForm, rateLimitMinutes: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Mẫu thông báo (Template)</label>
                <select
                  value={alarmRuleForm.templateId}
                  onChange={e => setAlarmRuleForm({ ...alarmRuleForm, templateId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                >
                  {notificationTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Kênh gửi</label>
                <div className="flex space-x-3 mt-1.5">
                  {(['Email', 'Telegram', 'Webhook'] as NotificationChannelType[]).map(ch => {
                    const isChecked = alarmRuleForm.channels.includes(ch);
                    return (
                      <label key={ch} className="flex items-center space-x-1.5 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const newCh = isChecked
                              ? alarmRuleForm.channels.filter(c => c !== ch)
                              : [...alarmRuleForm.channels, ch];
                            setAlarmRuleForm({ ...alarmRuleForm, channels: newCh });
                          }}
                          className="rounded bg-slate-800 border-slate-700"
                        />
                        <span>{ch}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
              <button
                onClick={() => setIsAlarmRuleModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!alarmRuleForm.name) return;
                  if (editingAlarmRule) {
                    updateAlarmNotificationRule({ ...editingAlarmRule, ...alarmRuleForm });
                  } else {
                    addAlarmNotificationRule(alarmRuleForm);
                  }
                  setIsAlarmRuleModalOpen(false);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs text-white font-bold cursor-pointer"
              >
                Lưu Quy Tắc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Rule Modal */}
      {isTagRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">
                {editingTagRule ? 'Chỉnh Sửa Quy Tắc Tag' : 'Tạo Quy Tắc Giám Sát Tag Mới'}
              </h3>
              <button
                onClick={() => setIsTagRuleModalOpen(false)}
                className="text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold">Tên quy tắc</label>
                <input
                  type="text"
                  value={tagRuleForm.name}
                  onChange={e => setTagRuleForm({ ...tagRuleForm, name: e.target.value })}
                  placeholder="Ví dụ: Cảnh báo áp suất nén vượt ngưỡng"
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Chọn PLC Tag giám sát</label>
                <select
                  value={tagRuleForm.tagId}
                  onChange={e => setTagRuleForm({ ...tagRuleForm, tagId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none font-mono"
                >
                  {tags.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.address}) - Hiện tại: {t.currentValue} {t.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Điều kiện so sánh</label>
                  <select
                    value={tagRuleForm.condition}
                    onChange={e => setTagRuleForm({ ...tagRuleForm, condition: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                  >
                    <option value="GreaterThan">Lớn hơn (&gt;)</option>
                    <option value="LessThan">Nhỏ hơn (&lt;)</option>
                    <option value="Equal">Bằng (=)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Ngưỡng kích hoạt (Threshold)</label>
                  <input
                    type="number"
                    value={tagRuleForm.thresholdValue}
                    onChange={e => setTagRuleForm({ ...tagRuleForm, thresholdValue: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold">Độ trễ chống nhiễu (Delay Giây)</label>
                  <input
                    type="number"
                    value={tagRuleForm.delaySeconds}
                    onChange={e => setTagRuleForm({ ...tagRuleForm, delaySeconds: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Mức độ nghiêm trọng</label>
                  <select
                    value={tagRuleForm.severity}
                    onChange={e => setTagRuleForm({ ...tagRuleForm, severity: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
              <button
                onClick={() => setIsTagRuleModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!tagRuleForm.name) return;
                  if (editingTagRule) {
                    updateTagNotificationRule({ ...editingTagRule, ...tagRuleForm });
                  } else {
                    addTagNotificationRule(tagRuleForm);
                  }
                  setIsTagRuleModalOpen(false);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs text-white font-bold cursor-pointer"
              >
                Lưu Quy Tắc Tag
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
                {editingTemplate ? 'Chỉnh Sửa Mẫu Tin Nhắn' : 'Tạo Mẫu Tin Nhắn Mới'}
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
                <label className="text-slate-300 font-semibold">Tên mẫu</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="Ví dụ: Mẫu báo động động cơ quá tải"
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Tiêu đề (Email Subject / Header)</label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={e => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  placeholder="[HATSCADA {Priority}] Báo động tại {MachineName}"
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Nội dung chi tiết (Body)</label>
                <textarea
                  rows={6}
                  value={templateForm.body}
                  onChange={e => setTemplateForm({ ...templateForm, body: e.target.value })}
                  placeholder="Chi tiết báo động:&#10;Máy: {MachineName}&#10;Nội dung: {AlarmMessage}&#10;Giá trị: {Value} | Giới hạn: {Limit}&#10;Thời gian: {Timestamp}"
                  className="w-full mt-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Biến hệ thống khả dụng:</div>
                <div className="font-mono text-amber-300">
                  &#123;MachineName&#125;, &#123;PLCName&#125;, &#123;TagName&#125;, &#123;TagAddress&#125;, &#123;Value&#125;, &#123;Limit&#125;, &#123;Unit&#125;, &#123;Timestamp&#125;, &#123;Priority&#125;, &#123;AlarmMessage&#125;
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!templateForm.name || !templateForm.subject) return;
                  if (editingTemplate) {
                    updateNotificationTemplate({ ...editingTemplate, ...templateForm });
                  } else {
                    addNotificationTemplate(templateForm);
                  }
                  setIsTemplateModalOpen(false);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs text-white font-bold cursor-pointer"
              >
                Lưu Mẫu Tin Nhắn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
