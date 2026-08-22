import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Machine,
  PlcDevice,
  Tag,
  AlarmRule,
  AlarmEvent,
  User,
  SystemSettings,
  ProductionReport,
  AiChatMessage,
  TagHistoryPoint,
  OeeMetrics,
  MachineStatus,
  CommunicationLog,
  PingResult,
  FactoryHierarchyItem,
  PlcBrand,
  PlcProtocol,
  EmailConfiguration,
  TelegramConfiguration,
  WebhookConfiguration,
  NotificationContact,
  TagNotificationRule,
  AlarmNotificationRule,
  NotificationTemplate,
  NotificationHistoryItem,
  NotificationQueueItem,
  ReportTemplateConfig,
  ReportScheduleConfig,
  GeneratedReportArchiveItem,
  ReportTimeRange,
  NotificationChannelType,
  DeepLearningDoc
} from '../types/scada';
import {
  initialMachines,
  initialPlcs,
  initialTags,
  initialAlarmRules,
  initialAlarmEvents,
  initialUsers,
  initialReports,
  initialSettings,
  initialEmailConfig,
  initialTelegramConfig,
  initialWebhookConfig,
  initialNotificationContacts,
  initialTagNotificationRules,
  initialAlarmNotificationRules,
  initialNotificationTemplates,
  initialNotificationHistory,
  initialReportTemplates,
  initialReportSchedules,
  initialGeneratedReports,
  initialDeepLearningDocs
} from '../mock/initialData';
import { translations, translateDynamic, LanguageCode, Translations } from '../i18n/translations';

interface ScadaContextType {
  machines: Machine[];
  plcs: PlcDevice[];
  tags: Tag[];
  alarmRules: AlarmRule[];
  alarmEvents: AlarmEvent[];
  users: User[];
  currentUser: User;
  reports: ProductionReport[];
  settings: SystemSettings;
  aiChatHistory: AiChatMessage[];
  tagHistoryBuffer: Record<string, TagHistoryPoint[]>;
  communicationLogs: CommunicationLog[];
  activeAlarmsCount: number;
  overallOee: number;
  plantPowerKw: number;
  plantOkRate: number;
  totalShiftProduction: number;
  factoryHierarchy: FactoryHierarchyItem[];
  
  // Notification & Email System
  emailConfig: EmailConfiguration;
  telegramConfig: TelegramConfiguration;
  webhookConfig: WebhookConfiguration;
  notificationContacts: NotificationContact[];
  tagNotificationRules: TagNotificationRule[];
  alarmNotificationRules: AlarmNotificationRule[];
  notificationTemplates: NotificationTemplate[];
  notificationHistory: NotificationHistoryItem[];
  notificationQueue: NotificationQueueItem[];
  
  // Dynamic Report System
  reportTemplates: ReportTemplateConfig[];
  reportSchedules: ReportScheduleConfig[];
  generatedReportArchive: GeneratedReportArchiveItem[];

  // Actions
  switchUser: (userId: string) => void;
  writeTagValue: (tagId: string, value: number | string | boolean) => boolean;
  addTag: (tag: Omit<Tag, 'id' | 'lastUpdated' | 'quality' | 'currentValue'>) => void;
  updateTag: (tag: Tag) => void;
  deleteTag: (tagId: string) => void;
  toggleTagFavorite: (tagId: string) => void;
  
  addPlc: (plc: Omit<PlcDevice, 'id' | 'packetsSent' | 'packetsReceived' | 'errorCount' | 'status' | 'lastPingMs'>) => void;
  updatePlc: (plc: PlcDevice) => void;
  deletePlc: (plcId: string) => void;
  togglePlcEnabled: (plcId: string) => void;
  reconnectPlc: (plcId: string) => void;
  disconnectPlc: (plcId: string) => void;
  pingPlc: (plcId: string) => Promise<PingResult>;
  testPlcConnection: (ip: string, port: number, protocol: PlcProtocol) => Promise<{ success: boolean; rtt: number; message: string }>;
  addBatchPlcFleet: (count: number, brand?: PlcBrand) => void;
  clearCommunicationLogs: () => void;
  
  controlMachine: (machineId: string, action: 'start' | 'stop' | 'reset' | 'maintenance') => void;
  updateMachine: (machine: Machine) => void;
  
  createAlarmRule: (rule: Omit<AlarmRule, 'id'>) => void;
  toggleAlarmRule: (ruleId: string) => void;
  deleteAlarmRule: (ruleId: string) => void;
  acknowledgeAlarm: (alarmId: string, comment?: string) => void;
  clearAlarm: (alarmId: string) => void;
  
  calculateMachineOee: (machine: Machine) => OeeMetrics;
  
  generateReport: (reportType: ProductionReport['reportType'], title: string, machineId?: string) => ProductionReport;
  
  sendAiMessage: (userPrompt: string) => Promise<void>;
  clearAiChat: () => void;
  
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  triggerEmergencyAlarm: (machineId: string) => void;

  // Notification Operations
  updateEmailConfig: (config: Partial<EmailConfiguration>) => void;
  updateTelegramConfig: (config: Partial<TelegramConfiguration>) => void;
  updateWebhookConfig: (config: Partial<WebhookConfiguration>) => void;
  sendTestEmail: (targetEmail?: string) => Promise<{ success: boolean; latencyMs: number; message: string; log: string[] }>;
  sendTestTelegram: (targetChatId?: string) => Promise<{ success: boolean; latencyMs: number; message: string }>;
  sendTestWebhook: (targetUrl?: string) => Promise<{ success: boolean; latencyMs: number; message: string }>;
  
  addContact: (contact: Omit<NotificationContact, 'id'>) => void;
  updateContact: (contact: NotificationContact) => void;
  deleteContact: (contactId: string) => void;
  toggleContactEnabled: (contactId: string) => void;

  addTagNotificationRule: (rule: Omit<TagNotificationRule, 'id' | 'triggerCount'>) => void;
  updateTagNotificationRule: (rule: TagNotificationRule) => void;
  deleteTagNotificationRule: (ruleId: string) => void;
  toggleTagNotificationRule: (ruleId: string) => void;

  addAlarmNotificationRule: (rule: Omit<AlarmNotificationRule, 'id'>) => void;
  updateAlarmNotificationRule: (rule: AlarmNotificationRule) => void;
  deleteAlarmNotificationRule: (ruleId: string) => void;
  toggleAlarmNotificationRule: (ruleId: string) => void;

  addNotificationTemplate: (template: Omit<NotificationTemplate, 'id'>) => void;
  updateNotificationTemplate: (template: NotificationTemplate) => void;
  deleteNotificationTemplate: (templateId: string) => void;

  clearNotificationHistory: () => void;
  retryNotification: (historyId: string) => Promise<void>;
  dispatchManualNotification: (item: {
    channelType: NotificationChannelType;
    source: 'Alarm' | 'TagRule' | 'PLCEvent' | 'Production' | 'ScheduledReport' | 'Test';
    sourceName: string;
    recipients: string[];
    subject: string;
    message: string;
  }) => Promise<void>;

  // Dynamic Report Operations
  addReportTemplate: (template: Omit<ReportTemplateConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReportTemplate: (template: ReportTemplateConfig) => void;
  deleteReportTemplate: (templateId: string) => void;

  addReportSchedule: (schedule: Omit<ReportScheduleConfig, 'id'>) => void;
  updateReportSchedule: (schedule: ReportScheduleConfig) => void;
  deleteReportSchedule: (scheduleId: string) => void;
  toggleReportSchedule: (scheduleId: string) => void;
  executeReportScheduleNow: (scheduleId: string) => Promise<GeneratedReportArchiveItem>;

  generateCustomReport: (template: ReportTemplateConfig, timeRange?: ReportTimeRange) => GeneratedReportArchiveItem;
  emailReportToRecipients: (reportArchiveId: string, recipientEmails: string[]) => Promise<{ success: boolean; message: string }>;

  // Tag Service Architecture (Req 51)
  getTagsByMachine: (machineId: string) => Tag[];
  getTagsByPlc: (plcId: string) => Tag[];
  getTagsByLine: (lineName: string) => Tag[];
  getTagHistory: (tagId: string) => TagHistoryPoint[];
  getScopedTags: (
    scopeMode: 'Current Machine' | 'Current PLC' | 'Current Line' | 'Entire Factory',
    scopeId?: string
  ) => Tag[];

  // Deep Learning & RAG Knowledge Base
  deepLearningDocs: DeepLearningDoc[];
  addDeepLearningDoc: (doc: Omit<DeepLearningDoc, 'id'>) => void;
  deleteDeepLearningDoc: (docId: string) => void;

  // Internationalization (i18n)
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (keyOrPhrase: keyof Translations | string) => string;
}

const ScadaContext = createContext<ScadaContextType | null>(null);

export const ScadaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [plcs, setPlcs] = useState<PlcDevice[]>(initialPlcs);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [alarmRules, setAlarmRules] = useState<AlarmRule[]>(initialAlarmRules);
  const [alarmEvents, setAlarmEvents] = useState<AlarmEvent[]>(initialAlarmEvents);
  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
  const [reports, setReports] = useState<ProductionReport[]>(initialReports);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [tagHistoryBuffer, setTagHistoryBuffer] = useState<Record<string, TagHistoryPoint[]>>({});
  
  // Notification & Email States
  const [emailConfig, setEmailConfig] = useState<EmailConfiguration>(initialEmailConfig);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfiguration>(initialTelegramConfig);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfiguration>(initialWebhookConfig);
  const [notificationContacts, setNotificationContacts] = useState<NotificationContact[]>(initialNotificationContacts);
  const [tagNotificationRules, setTagNotificationRules] = useState<TagNotificationRule[]>(initialTagNotificationRules);
  const [alarmNotificationRules, setAlarmNotificationRules] = useState<AlarmNotificationRule[]>(initialAlarmNotificationRules);
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>(initialNotificationTemplates);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistoryItem[]>(initialNotificationHistory);
  const [notificationQueue, setNotificationQueue] = useState<NotificationQueueItem[]>([]);

  // Dynamic Report States
  const [reportTemplates, setReportTemplates] = useState<ReportTemplateConfig[]>(initialReportTemplates);
  const [reportSchedules, setReportSchedules] = useState<ReportScheduleConfig[]>(initialReportSchedules);
  const [generatedReportArchive, setGeneratedReportArchive] = useState<GeneratedReportArchiveItem[]>(initialGeneratedReports);

  // Deep Learning Docs State
  const [deepLearningDocs, setDeepLearningDocs] = useState<DeepLearningDoc[]>(initialDeepLearningDocs);

  const addDeepLearningDoc = (doc: Omit<DeepLearningDoc, 'id'>) => {
    const newDoc: DeepLearningDoc = {
      ...doc,
      id: `doc-${Date.now()}`
    };
    setDeepLearningDocs(prev => [newDoc, ...prev]);
  };

  const deleteDeepLearningDoc = (docId: string) => {
    setDeepLearningDocs(prev => prev.filter(d => d.id !== docId));
  };

  // Language & Translation Helpers
  const setLanguage = (lang: LanguageCode) => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const t = (keyOrPhrase: keyof Translations | string): string => {
    return translateDynamic(String(keyOrPhrase), settings.language || 'vi');
  };

  // Tag Delay Violation Timers (for anti-chattering & persistence check)
  const tagViolationsRef = useRef<Record<string, number>>({});
  const tagRuleTriggeredRef = useRef<Record<string, number>>({});
  const alarmRuleDispatchedRef = useRef<Record<string, number>>({});
  
  // Rolling live communication logs
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([
    {
      id: 'log-01',
      plcId: 'plc-01',
      plcName: 'Line01_PLC_Keyence',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString('vi-VN'),
      type: 'info',
      message: 'Keyence KV-8000 MC Protocol socket connected on 192.168.1.10:8501 (Scan rate: 100ms)',
      latencyMs: 4
    },
    {
      id: 'log-02',
      plcId: 'plc-02',
      plcName: 'Line02_PLC_Mitsubishi',
      timestamp: new Date(Date.now() - 90000).toLocaleTimeString('vi-VN'),
      type: 'info',
      message: 'Mitsubishi iQ-R 3E frame handshake acknowledged (Station 0, Net 1)',
      latencyMs: 6
    },
    {
      id: 'log-03',
      plcId: 'plc-03',
      plcName: 'Line03_PLC_Siemens',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString('vi-VN'),
      type: 'info',
      message: 'Siemens S7-1500 ISO-on-TCP COTP connection open (Rack 0, Slot 1)',
      latencyMs: 5
    },
    {
      id: 'log-04',
      plcId: 'plc-04',
      plcName: 'Line04_PLC_Modbus',
      timestamp: new Date(Date.now() - 30000).toLocaleTimeString('vi-VN'),
      type: 'info',
      message: 'Modbus TCP Unit 1 poll loop initialized (Holding registers %MW100..%MW110)',
      latencyMs: 8
    }
  ]);
  
  const [aiChatHistory, setAiChatHistory] = useState<AiChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: `Xin chào **${initialUsers[0].name}**! Tôi là **HAT AI Copilot** – Trợ lý Giám sát & Chẩn đoán Thông minh của hệ thống HATSCADA.
Tôi đang kết nối trực tiếp với 5 bộ PLC (Keyence, Mitsubishi, Siemens, Modbus, OPC UA) và toàn bộ 18+ Tag công nghiệp của nhà máy.

Bạn có thể hỏi tôi bất kỳ điều gì:
- *"Tại sao máy SMT-03 đang báo động và cách xử lý?"*
- *"Phân tích nguyên nhân OEE ca sáng bị sụt giảm"*
- *"Alarm nào xuất hiện tần suất cao nhất hôm nay?"*
- *"Dự đoán bảo trì vòng bi trục chính Spindle máy CNC01"*`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Phân tích lỗi máy SMT-03',
        'Top Alarm nguy hiểm nhất hôm nay',
        'Báo cáo OEE toàn nhà máy',
        'Kiểm tra độ rung và nhiệt độ CNC-01'
      ]
    }
  ]);

  // Seed initial history points
  useEffect(() => {
    const initialBuffer: Record<string, TagHistoryPoint[]> = {};
    const now = Date.now();
    
    tags.forEach(tag => {
      const points: TagHistoryPoint[] = [];
      const baseVal = typeof tag.currentValue === 'number' ? tag.currentValue : 50;
      
      for (let i = 30; i >= 0; i--) {
        const t = new Date(now - i * 60 * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const noise = (Math.random() - 0.5) * (baseVal * 0.05);
        points.push({
          timestamp: t,
          value: parseFloat((baseVal + noise).toFixed(2)),
          quality: 'GOOD'
        });
      }
      initialBuffer[tag.id] = points;
    });

    setTagHistoryBuffer(initialBuffer);
  }, []);

  // Multi-PLC Independent Background Data Collection Engine
  useEffect(() => {
    if (!settings.simulationMode) return;

    const interval = setInterval(() => {
      const speed = settings.simulationSpeed || 1;
      const timestamp = new Date().toISOString();
      const timeLabel = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Map of PLC ID -> Online status
      const plcStatusMap = new Map<string, boolean>();
      plcs.forEach(p => {
        plcStatusMap.set(p.id, p.enabled && p.status === 'Connected');
      });

      // 1. Update Tags isolated by their parent PLC
      setTags(prevTags => {
        return prevTags.map(tag => {
          const isPlcOnline = tag.plcId ? plcStatusMap.get(tag.plcId) ?? true : true;

          if (!isPlcOnline) {
            return {
              ...tag,
              quality: 'BAD',
              lastUpdated: timestamp
            };
          }

          let nextValue = tag.currentValue;

          if (typeof tag.currentValue === 'number') {
            if (tag.name.includes('RPM') || tag.name.includes('Speed')) {
              const jitter = (Math.random() - 0.48) * 40 * speed;
              nextValue = Math.max(0, Math.round(tag.currentValue + jitter));
            } else if (tag.name.includes('Temp') || tag.name.includes('Optics')) {
              const drift = (Math.random() - 0.5) * 0.15 * speed;
              nextValue = parseFloat(Math.max(20, Math.min(130, tag.currentValue + drift)).toFixed(1));
            } else if (tag.name.includes('Pressure') || tag.name.includes('Vacuum')) {
              const drift = (Math.random() - 0.5) * 0.08 * speed;
              nextValue = parseFloat((tag.currentValue + drift).toFixed(2));
            } else if (tag.name.includes('Counter_OK') || tag.name.includes('Throughput') || tag.name.includes('Placement')) {
              if (Math.random() < 0.3 * speed) {
                nextValue = (tag.currentValue as number) + 1;
              }
            } else if (tag.name.includes('Counter_NG')) {
              if (Math.random() < 0.01 * speed) {
                nextValue = (tag.currentValue as number) + 1;
              }
            } else if (tag.name.includes('Power') || tag.name.includes('kW')) {
              const drift = (Math.random() - 0.5) * 0.4 * speed;
              nextValue = parseFloat(Math.max(0, tag.currentValue + drift).toFixed(1));
            } else {
              const drift = (Math.random() - 0.5) * 0.2 * speed;
              nextValue = parseFloat((tag.currentValue + drift).toFixed(2));
            }
          }

          return {
            ...tag,
            quality: 'GOOD',
            currentValue: nextValue,
            lastUpdated: timestamp
          };
        });
      });

      // 2. Update Machines Status, Counts, and Metrics
      setMachines(prevMachines => {
        return prevMachines.map(machine => {
          let updated = { ...machine };
          if (machine.status === 'Running') {
            updated.runTimeSeconds += 1 * speed;
            if (Math.random() < 0.3 * speed) {
              updated.okCount += 1;
              updated.totalCount += 1;
            }
            if (Math.random() < 0.008 * speed) {
              updated.ngCount += 1;
              updated.totalCount += 1;
            }
          } else if (machine.status === 'Alarm' || machine.status === 'Stop') {
            updated.downTimeSeconds += 1 * speed;
          } else if (machine.status === 'Idle') {
            updated.idleTimeSeconds += 1 * speed;
          }

          return updated;
        });
      });

      // 3. Update PLC communication packet telemetry per individual worker
      setPlcs(prevPlcs => {
        return prevPlcs.map(plc => {
          if (!plc.enabled || plc.status !== 'Connected') return plc;
          const packetsDelta = Math.floor(Math.random() * 4 + 1) * speed;
          const pingJitter = Math.floor(Math.random() * 4) + 3;
          return {
            ...plc,
            packetsSent: plc.packetsSent + packetsDelta,
            packetsReceived: plc.packetsReceived + packetsDelta,
            lastPingMs: pingJitter,
            lastUpdated: timestamp
          };
        });
      });

      // 4. Record to Historian Buffer
      setTagHistoryBuffer(prevBuffer => {
        const nextBuffer = { ...prevBuffer };
        tags.forEach(tag => {
          if (!tag.enableHistorian || typeof tag.currentValue !== 'number' || tag.quality !== 'GOOD') return;
          const existing = nextBuffer[tag.id] || [];
          const newPoints = [
            ...existing.slice(-40),
            {
              timestamp: timeLabel,
              value: tag.currentValue,
              quality: tag.quality
            }
          ];
          nextBuffer[tag.id] = newPoints;
        });
        return nextBuffer;
      });

    }, 1500 / (settings.simulationSpeed || 1));

    return () => clearInterval(interval);
  }, [settings.simulationMode, settings.simulationSpeed, tags, plcs]);

  // Alarm Evaluation Engine
  useEffect(() => {
    alarmRules.forEach(rule => {
      if (!rule.enabled) return;
      const targetTag = tags.find(t => t.id === rule.tagId);
      if (!targetTag || typeof targetTag.currentValue !== 'number') return;

      const val = targetTag.currentValue;
      let triggered = false;

      if (rule.condition === 'GreaterThan' && val > rule.limitValue) triggered = true;
      if (rule.condition === 'LessThan' && val < rule.limitValue) triggered = true;
      if (rule.condition === 'Equal' && val === rule.limitValue) triggered = true;
      if (rule.condition === 'Between' && rule.limitValueHigh && (val >= rule.limitValue && val <= rule.limitValueHigh)) triggered = true;

      const existingActive = alarmEvents.find(
        e => e.ruleId === rule.id && (e.status === 'Active' || e.status === 'Acknowledged')
      );

      if (triggered && !existingActive) {
        const targetMachine = machines.find(m => m.id === rule.machineId);
        const newAlarm: AlarmEvent = {
          id: `alarm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          ruleId: rule.id,
          alarmName: rule.name,
          machineId: rule.machineId,
          machineName: targetMachine ? `${targetMachine.name} (${targetMachine.code})` : 'Unknown Machine',
          tagName: targetTag.name,
          tagAddress: targetTag.address,
          value: val,
          limitValue: rule.limitValue,
          priority: rule.priority,
          message: rule.message,
          status: 'Active',
          triggeredAt: new Date().toISOString()
        };

        setAlarmEvents(prev => [newAlarm, ...prev]);

        // Auto update machine state to Alarm if critical
        if (rule.priority === 'Critical' && targetMachine) {
          setMachines(prev => prev.map(m => m.id === targetMachine.id ? { ...m, status: 'Alarm' } : m));
        }
      }
    });
  }, [tags, alarmRules, alarmEvents, machines]);

  // Aggregated Plant Metrics
  const activeAlarmsCount = useMemo(() => {
    return alarmEvents.filter(a => a.status === 'Active').length;
  }, [alarmEvents]);

  const plantPowerKw = useMemo(() => {
    return parseFloat(machines.reduce((acc, m) => acc + (m.powerKw || 0), 0).toFixed(1));
  }, [machines]);

  const totalShiftProduction = useMemo(() => {
    return machines.reduce((acc, m) => acc + m.totalCount, 0);
  }, [machines]);

  const plantOkRate = useMemo(() => {
    const total = machines.reduce((acc, m) => acc + m.totalCount, 0);
    const ok = machines.reduce((acc, m) => acc + m.okCount, 0);
    if (total === 0) return 100;
    return parseFloat(((ok / total) * 100).toFixed(1));
  }, [machines]);

  const calculateMachineOee = useCallback((machine: Machine): OeeMetrics => {
    const plannedProdMin = 480; // 8-hour shift
    const actualOperatingMin = Math.max(1, Math.round(machine.runTimeSeconds / 60));
    const downtimeMin = Math.round(machine.downTimeSeconds / 60);

    // Availability = Operating Time / Planned Time
    const availability = Math.min(100, Math.max(10, (actualOperatingMin / plannedProdMin) * 100));

    // Performance = Actual Count / (Target Output)
    const targetCount = Math.max(1, Math.round((actualOperatingMin * 60) / (machine.targetCycleTimeSec || 30)));
    const performance = Math.min(100, Math.max(20, (machine.totalCount / targetCount) * 100));

    // Quality = OK / Total
    const quality = machine.totalCount > 0 ? (machine.okCount / machine.totalCount) * 100 : 100;

    const oee = (availability * performance * quality) / 10000;

    return {
      machineId: machine.id,
      machineName: `${machine.name} (${machine.code})`,
      availability: parseFloat(availability.toFixed(1)),
      performance: parseFloat(performance.toFixed(1)),
      quality: parseFloat(quality.toFixed(1)),
      oee: parseFloat(oee.toFixed(1)),
      plannedProductionMinutes: plannedProdMin,
      actualOperatingMinutes: actualOperatingMin,
      downtimeMinutes: downtimeMin,
      plannedDowntimeMinutes: 30,
      unplannedDowntimeMinutes: Math.max(0, downtimeMin - 30),
      targetCount,
      actualCount: machine.totalCount,
      okCount: machine.okCount,
      ngCount: machine.ngCount,
      sixBigLosses: {
        equipmentFailureMin: Math.round(downtimeMin * 0.45),
        setupAndAdjustmentMin: Math.round(downtimeMin * 0.25),
        idlingAndMinorStopsMin: Math.round(downtimeMin * 0.15),
        reducedSpeedMin: Math.round(downtimeMin * 0.15),
        processDefectsCount: machine.ngCount,
        reducedYieldCount: Math.round(machine.ngCount * 0.3)
      }
    };
  }, []);

  const overallOee = useMemo(() => {
    if (machines.length === 0) return 85;
    const sum = machines.reduce((acc, m) => acc + calculateMachineOee(m).oee, 0);
    return parseFloat((sum / machines.length).toFixed(1));
  }, [machines, calculateMachineOee]);

  // Actions
  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) setCurrentUser(found);
  };

  const writeTagValue = (tagId: string, value: number | string | boolean): boolean => {
    // Check permission
    if (currentUser.role === 'Viewer') {
      alert('Tài khoản Viewer không có quyền ghi giá trị Tag PLC.');
      return false;
    }

    setTags(prev => prev.map(t => {
      if (t.id === tagId) {
        return {
          ...t,
          currentValue: value,
          quality: 'GOOD',
          lastUpdated: new Date().toISOString()
        };
      }
      return t;
    }));
    return true;
  };

  const addTag = (newTagData: Omit<Tag, 'id' | 'lastUpdated' | 'quality' | 'currentValue'>) => {
    const newTag: Tag = {
      ...newTagData,
      id: `tag-${Date.now()}`,
      currentValue: newTagData.dataType === 'Bool' ? false : 0,
      quality: 'GOOD',
      lastUpdated: new Date().toISOString()
    };
    setTags(prev => [...prev, newTag]);
  };

  const updateTag = (updatedTag: Tag) => {
    setTags(prev => prev.map(t => t.id === updatedTag.id ? updatedTag : t));
  };

  const deleteTag = (tagId: string) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
  };

  const toggleTagFavorite = (tagId: string) => {
    setTags(prev => prev.map(t => t.id === tagId ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  const addPlc = (plcData: Omit<PlcDevice, 'id' | 'packetsSent' | 'packetsReceived' | 'errorCount' | 'status' | 'lastPingMs'>) => {
    const newId = `plc-${Date.now()}`;
    const newPlc: PlcDevice = {
      ...plcData,
      id: newId,
      packetsSent: 0,
      packetsReceived: 0,
      errorCount: 0,
      status: 'Connected',
      lastPingMs: 5,
      enabled: plcData.enabled ?? true,
      timeoutMs: plcData.timeoutMs || 2000,
      retryCount: plcData.retryCount || 3,
      scanIntervalMs: plcData.scanIntervalMs || 250,
      lastUpdated: new Date().toISOString()
    };
    
    setPlcs(prev => [...prev, newPlc]);
    
    // Add communication log
    const newLog: CommunicationLog = {
      id: `log-${Date.now()}`,
      plcId: newId,
      plcName: newPlc.name,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      type: 'success',
      message: `Driver initialized: ${newPlc.brand} (${newPlc.protocol}) on ${newPlc.ipAddress}:${newPlc.port} [Scan interval: ${newPlc.scanIntervalMs}ms]`,
      latencyMs: 5
    };
    setCommunicationLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const updatePlc = (plc: PlcDevice) => {
    setPlcs(prev => prev.map(p => p.id === plc.id ? plc : p));
    const newLog: CommunicationLog = {
      id: `log-${Date.now()}`,
      plcId: plc.id,
      plcName: plc.name,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      type: 'info',
      message: `Cấu hình PLC '${plc.name}' đã cập nhật (IP: ${plc.ipAddress}:${plc.port}, Protocol: ${plc.protocol}, Scan: ${plc.scanIntervalMs}ms)`
    };
    setCommunicationLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const deletePlc = (plcId: string) => {
    const target = plcs.find(p => p.id === plcId);
    setPlcs(prev => prev.filter(p => p.id !== plcId));
    // Also unlink tags from this PLC
    setTags(prev => prev.map(t => t.plcId === plcId ? { ...t, plcId: '', quality: 'UNCERTAIN' } : t));
    
    if (target) {
      const newLog: CommunicationLog = {
        id: `log-${Date.now()}`,
        plcId: target.id,
        plcName: target.name,
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        type: 'warn',
        message: `Đã xóa thiết bị PLC '${target.name}' khỏi hệ thống SCADA.`
      };
      setCommunicationLogs(prev => [newLog, ...prev.slice(0, 49)]);
    }
  };

  const togglePlcEnabled = (plcId: string) => {
    setPlcs(prev => prev.map(p => {
      if (p.id !== plcId) return p;
      const nextEnabled = !p.enabled;
      const nextStatus = nextEnabled ? 'Connected' : 'Disconnected';
      
      const newLog: CommunicationLog = {
        id: `log-${Date.now()}`,
        plcId: p.id,
        plcName: p.name,
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        type: nextEnabled ? 'info' : 'warn',
        message: nextEnabled 
          ? `Worker communication '${p.name}' resumed. Polling active.` 
          : `Worker communication '${p.name}' disabled by user. Polling paused.`
      };
      setCommunicationLogs(logs => [newLog, ...logs.slice(0, 49)]);

      return {
        ...p,
        enabled: nextEnabled,
        status: nextStatus
      };
    }));
  };

  const reconnectPlc = (plcId: string) => {
    const target = plcs.find(p => p.id === plcId);
    if (!target) return;

    setPlcs(prev => prev.map(p => p.id === plcId ? { ...p, status: 'Connecting' } : p));
    
    const startLog: CommunicationLog = {
      id: `log-${Date.now()}`,
      plcId: target.id,
      plcName: target.name,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      type: 'info',
      message: `${target.name} reconnecting attempt 1/${target.retryCount || 3} to ${target.ipAddress}:${target.port}...`
    };
    setCommunicationLogs(prev => [startLog, ...prev.slice(0, 49)]);

    setTimeout(() => {
      const simulatedLatency = Math.floor(Math.random() * 8 + 3);
      setPlcs(prev => prev.map(p => p.id === plcId ? { 
        ...p, 
        status: 'Connected', 
        enabled: true,
        errorCount: 0,
        lastPingMs: simulatedLatency,
        lastUpdated: new Date().toISOString()
      } : p));

      const successLog: CommunicationLog = {
        id: `log-${Date.now() + 1}`,
        plcId: target.id,
        plcName: target.name,
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        type: 'success',
        message: `${target.name} reconnected successfully (Handshake OK, RTT: ${simulatedLatency}ms)`,
        latencyMs: simulatedLatency
      };
      setCommunicationLogs(prev => [successLog, ...prev.slice(0, 49)]);
    }, 1200);
  };

  const disconnectPlc = (plcId: string) => {
    const target = plcs.find(p => p.id === plcId);
    if (!target) return;

    setPlcs(prev => prev.map(p => p.id === plcId ? { ...p, status: 'Disconnected', errorCount: p.errorCount + 1 } : p));

    const discLog: CommunicationLog = {
      id: `log-${Date.now()}`,
      plcId: target.id,
      plcName: target.name,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      type: 'error',
      message: `[ALARM] ${target.name} connection lost at ${new Date().toLocaleTimeString('vi-VN')} (Socket closed/Timeout)`
    };
    setCommunicationLogs(prev => [discLog, ...prev.slice(0, 49)]);
  };

  const pingPlc = async (plcId: string): Promise<PingResult> => {
    const target = plcs.find(p => p.id === plcId);
    const ip = target ? target.ipAddress : '127.0.0.1';
    const name = target ? target.name : 'Unknown PLC';
    const port = target ? target.port : 502;
    const isOnline = target ? target.enabled && target.status === 'Connected' : true;

    // Simulate 4 ICMP/TCP probe packets
    const rtts = isOnline 
      ? [Math.floor(Math.random() * 5 + 3), Math.floor(Math.random() * 7 + 4), Math.floor(Math.random() * 6 + 3), Math.floor(Math.random() * 5 + 4)]
      : [0, 0, 0, 0];
    
    const sent = 4;
    const received = isOnline ? 4 : 0;
    const lossRate = isOnline ? 0 : 100;
    const avgRtt = isOnline ? parseFloat((rtts.reduce((a, b) => a + b, 0) / rtts.length).toFixed(1)) : 0;
    const minRtt = isOnline ? Math.min(...rtts) : 0;
    const maxRtt = isOnline ? Math.max(...rtts) : 0;

    const result: PingResult = {
      plcId,
      plcName: name,
      ip,
      port,
      packetsSent: sent,
      packetsReceived: received,
      lossRate,
      avgRtt,
      minRtt,
      maxRtt,
      history: rtts,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      status: isOnline ? (avgRtt > 30 ? 'Degraded' : 'Online') : 'Offline'
    };

    const pingLog: CommunicationLog = {
      id: `log-${Date.now()}`,
      plcId,
      plcName: name,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      type: isOnline ? 'info' : 'error',
      message: `Ping ${name} (${ip}:${port}): 4 packets, Avg RTT = ${avgRtt}ms, Loss = ${lossRate}%`,
      latencyMs: avgRtt
    };
    setCommunicationLogs(prev => [pingLog, ...prev.slice(0, 49)]);

    return result;
  };

  const testPlcConnection = async (ip: string, port: number, protocol: PlcProtocol): Promise<{ success: boolean; rtt: number; message: string }> => {
    // Quick probe simulation
    await new Promise(r => setTimeout(r, 600));
    const isLocalSubnet = ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.');
    
    if (isLocalSubnet) {
      const rtt = Math.floor(Math.random() * 8 + 3);
      return {
        success: true,
        rtt,
        message: `Socket handshake thành công với ${protocol} tại ${ip}:${port} (RTT: ${rtt}ms)`
      };
    } else {
      return {
        success: true,
        rtt: Math.floor(Math.random() * 20 + 12),
        message: `Kết nối gateway thành công tới ${ip}:${port} qua giao thức ${protocol}`
      };
    }
  };

  const addBatchPlcFleet = (count: number, brand: PlcBrand = 'Mitsubishi') => {
    const startIdx = plcs.length + 1;
    const newPlcs: PlcDevice[] = [];
    const newTags: Tag[] = [];

    const brandConfigs: Record<PlcBrand, { model: string; proto: PlcProtocol; port: number; addrPrefix: string }> = {
      Keyence: { model: 'KV-8000', proto: 'MC Protocol', port: 8501, addrPrefix: 'DM' },
      Mitsubishi: { model: 'MELSEC iQ-R (R08CPU)', proto: 'MC Protocol', port: 5000, addrPrefix: 'D' },
      Siemens: { model: 'SIMATIC S7-1500', proto: 'Siemens S7', port: 102, addrPrefix: 'DB1.DBD' },
      Modbus: { model: 'Modbus TCP Gateway', proto: 'Modbus TCP', port: 502, addrPrefix: '%MW' },
      OPC_UA: { model: 'OPC UA Server v2.4', proto: 'OPC UA', port: 4840, addrPrefix: 'ns=2;s=Tag' }
    };

    const cfg = brandConfigs[brand] || brandConfigs['Mitsubishi'];

    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const plcId = `plc-fleet-${Date.now()}-${idx}`;
      const name = `Fleet_Line${idx.toString().padStart(2, '0')}_PLC`;
      const ip = `192.168.${Math.floor(idx / 254) + 2}.${(idx % 254) + 1}`;

      const plc: PlcDevice = {
        id: plcId,
        name,
        brand,
        plcType: brand === 'Keyence' ? 'Keyence KV' : brand === 'Siemens' ? 'Siemens S7' : brand === 'Modbus' ? 'Modbus Device' : brand === 'OPC_UA' ? 'OPC UA Device' : 'Mitsubishi iQ-R',
        model: cfg.model,
        ipAddress: ip,
        port: cfg.port,
        protocol: cfg.proto,
        status: 'Connected',
        enabled: true,
        timeoutMs: 2000,
        retryCount: 3,
        scanIntervalMs: idx % 2 === 0 ? 250 : 500,
        lastPingMs: Math.floor(Math.random() * 8 + 3),
        packetsSent: Math.floor(Math.random() * 5000 + 1000),
        packetsReceived: Math.floor(Math.random() * 5000 + 990),
        errorCount: 0,
        factoryName: 'Factory A (Smart Machining & Assembly)',
        areaName: `Area ${((idx % 4) + 1).toString().padStart(2, '0')} - Industrial Cell`,
        lineName: `Line ${idx.toString().padStart(2, '0')} - Production`,
        description: `High-Density Fleet Managed PLC for Line ${idx}`
      };
      newPlcs.push(plc);

      // Create 2 standard tags per PLC
      newTags.push({
        id: `tag-${plcId}-speed`,
        name: `Line${idx.toString().padStart(2, '0')}.Conveyor_Speed`,
        description: `Line ${idx} conveyor motor speed`,
        plcId,
        address: `${cfg.addrPrefix}100`,
        dataType: 'Float',
        unit: 'm/min',
        scale: 1,
        offset: 0,
        scanIntervalMs: plc.scanIntervalMs,
        enableHistorian: true,
        historianRetentionDays: 30,
        isFavorite: false,
        currentValue: 24.5,
        quality: 'GOOD',
        lastUpdated: new Date().toISOString()
      });

      newTags.push({
        id: `tag-${plcId}-count`,
        name: `Line${idx.toString().padStart(2, '0')}.Output_Counter`,
        description: `Line ${idx} piece output counter`,
        plcId,
        address: `${cfg.addrPrefix}102`,
        dataType: 'DInt',
        unit: 'Pcs',
        scale: 1,
        offset: 0,
        scanIntervalMs: plc.scanIntervalMs,
        enableHistorian: true,
        historianRetentionDays: 365,
        isFavorite: false,
        currentValue: Math.floor(Math.random() * 400 + 100),
        quality: 'GOOD',
        lastUpdated: new Date().toISOString()
      });
    }

    setPlcs(prev => [...prev, ...newPlcs]);
    setTags(prev => [...prev, ...newTags]);

    const batchLog: CommunicationLog = {
      id: `log-${Date.now()}`,
      plcId: 'fleet-batch',
      plcName: 'Fleet Manager',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      type: 'success',
      message: `Đã mở rộng thêm ${count} PLC (${brand}) vào hệ thống. Tổng số PLC hiện tại: ${plcs.length + count} thiết bị.`
    };
    setCommunicationLogs(prev => [batchLog, ...prev.slice(0, 49)]);
  };

  const clearCommunicationLogs = () => {
    setCommunicationLogs([]);
  };

  // Factory -> Area -> Line -> Machine -> PLC -> Tag Hierarchy Tree
  const factoryHierarchy = useMemo<FactoryHierarchyItem[]>(() => {
    // Group machines and PLCs
    const onlinePlcs = plcs.filter(p => p.enabled && p.status === 'Connected').length;

    // Build hierarchy for Factory A
    const areas = [
      {
        id: 'area-01',
        name: 'Area 01 - Heavy Machining',
        code: 'AREA-01',
        lineNames: ['Line 01 - Precision Milling', 'Line 1 - Precision Milling'],
        machines: machines.filter(m => m.line.includes('Line 1') || m.line.includes('Line 01'))
      },
      {
        id: 'area-02',
        name: 'Area 02 - Robotic Fabrication',
        code: 'AREA-02',
        lineNames: ['Line 02 - Body Assembly', 'Line 2 - Body Assembly'],
        machines: machines.filter(m => m.line.includes('Line 2') || m.line.includes('Line 02'))
      },
      {
        id: 'area-03',
        name: 'Area 03 - Electronics Cleanroom',
        code: 'AREA-03',
        lineNames: ['Line 03 - Electronics SMT', 'Line 3 - Electronics SMT'],
        machines: machines.filter(m => m.line.includes('Line 3') || m.line.includes('Line 03'))
      },
      {
        id: 'area-04',
        name: 'Area 04 - Polymer Processing',
        code: 'AREA-04',
        lineNames: ['Line 04 - Plastic Molding', 'Line 4 - Plastic Molding'],
        machines: machines.filter(m => m.line.includes('Line 4') || m.line.includes('Line 04'))
      },
      {
        id: 'area-05',
        name: 'Area 05 - Packaging & Logistics',
        code: 'AREA-05',
        lineNames: ['Line 05 - Final Packaging', 'Line 5 - Final Packaging'],
        machines: machines.filter(m => m.line.includes('Line 5') || m.line.includes('Line 05'))
      }
    ];

    const areaNodes: FactoryHierarchyItem[] = areas.map(area => {
      const areaMachines = area.machines;
      const areaMachineIds = areaMachines.map(m => m.id);
      const areaPlcs = plcs.filter(p => p.areaName?.includes(area.code) || (p.machineId && areaMachineIds.includes(p.machineId)));
      const areaPlcIds = areaPlcs.map(p => p.id);
      const areaTags = tags.filter(t => (t.machineId && areaMachineIds.includes(t.machineId)) || (t.plcId && areaPlcIds.includes(t.plcId)));
      const areaAlarms = alarmEvents.filter(a => a.status === 'Active' && areaMachineIds.includes(a.machineId || '')).length;

      const lineNodes: FactoryHierarchyItem[] = areaMachines.map(machine => {
        const machinePlc = plcs.find(p => p.id === machine.plcId) || plcs.find(p => p.machineId === machine.id);
        const machineTags = tags.filter(t => t.machineId === machine.id || (machinePlc && t.plcId === machinePlc.id));

        const plcNode: FactoryHierarchyItem | undefined = machinePlc ? {
          id: `node-${machinePlc.id}`,
          name: machinePlc.name,
          code: machinePlc.ipAddress,
          type: 'PLC',
          status: machinePlc.status,
          metrics: {
            tagsCount: machineTags.length,
            val: `${machinePlc.protocol} (${machinePlc.lastPingMs}ms)`
          },
          children: machineTags.map(tag => ({
            id: `node-${tag.id}`,
            name: tag.name,
            code: tag.address,
            type: 'Tag',
            status: tag.quality,
            metrics: {
              val: `${tag.currentValue} ${tag.unit}`
            }
          }))
        } : undefined;

        const machineNode: FactoryHierarchyItem = {
          id: `node-${machine.id}`,
          name: machine.name,
          code: machine.code,
          type: 'Machine',
          status: machine.status,
          metrics: {
            oee: calculateMachineOee(machine).oee,
            speed: machine.currentSpeed,
            tagsCount: machineTags.length,
            alarmsCount: alarmEvents.filter(a => a.machineId === machine.id && a.status === 'Active').length
          },
          children: plcNode ? [plcNode] : []
        };

        return {
          id: `line-${machine.id}`,
          name: machine.line,
          code: machine.code.replace('-', '_LINE_'),
          type: 'Line',
          status: machine.status,
          metrics: {
            oee: calculateMachineOee(machine).oee,
            plcsCount: machinePlc ? 1 : 0,
            plcsOnline: machinePlc && machinePlc.status === 'Connected' ? 1 : 0,
            tagsCount: machineTags.length,
            alarmsCount: alarmEvents.filter(a => a.machineId === machine.id && a.status === 'Active').length
          },
          children: [machineNode]
        };
      });

      return {
        id: area.id,
        name: area.name,
        code: area.code,
        type: 'Area',
        status: areaAlarms > 0 ? 'Alarm' : 'Running',
        metrics: {
          plcsCount: areaPlcs.length,
          plcsOnline: areaPlcs.filter(p => p.status === 'Connected').length,
          tagsCount: areaTags.length,
          alarmsCount: areaAlarms
        },
        children: lineNodes
      };
    });

    return [
      {
        id: 'factory-01',
        name: 'Factory A (Smart Machining & Assembly)',
        code: 'HAT-FAC-01',
        type: 'Factory',
        status: activeAlarmsCount > 0 ? 'Alarm' : 'Running',
        metrics: {
          oee: overallOee,
          plcsCount: plcs.length,
          plcsOnline: onlinePlcs,
          tagsCount: tags.length,
          alarmsCount: activeAlarmsCount
        },
        children: areaNodes
      }
    ];
  }, [plcs, machines, tags, alarmEvents, activeAlarmsCount, overallOee, calculateMachineOee]);

  const controlMachine = (machineId: string, action: 'start' | 'stop' | 'reset' | 'maintenance') => {
    if (currentUser.role === 'Viewer') {
      alert('Quyền Viewer không được phép điều khiển máy.');
      return;
    }

    setMachines(prev => prev.map(m => {
      if (m.id !== machineId) return m;
      let newStatus: MachineStatus = m.status;
      if (action === 'start') newStatus = 'Running';
      if (action === 'stop') newStatus = 'Stop';
      if (action === 'reset') newStatus = 'Idle';
      if (action === 'maintenance') newStatus = 'Maintenance';

      return {
        ...m,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const updateMachine = (machine: Machine) => {
    setMachines(prev => prev.map(m => m.id === machine.id ? machine : m));
  };

  const createAlarmRule = (ruleData: Omit<AlarmRule, 'id'>) => {
    const newRule: AlarmRule = {
      ...ruleData,
      id: `rule-${Date.now()}`
    };
    setAlarmRules(prev => [...prev, newRule]);
  };

  const toggleAlarmRule = (ruleId: string) => {
    setAlarmRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteAlarmRule = (ruleId: string) => {
    setAlarmRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const acknowledgeAlarm = (alarmId: string, comment?: string) => {
    setAlarmEvents(prev => prev.map(a => {
      if (a.id === alarmId) {
        return {
          ...a,
          status: 'Acknowledged',
          acknowledgedAt: new Date().toISOString(),
          acknowledgedBy: `${currentUser.name} (${currentUser.role})`,
          comment: comment || a.comment
        };
      }
      return a;
    }));
  };

  const clearAlarm = (alarmId: string) => {
    setAlarmEvents(prev => prev.map(a => {
      if (a.id === alarmId) {
        return {
          ...a,
          status: 'Cleared',
          clearedAt: new Date().toISOString(),
          durationSeconds: Math.floor((Date.now() - new Date(a.triggeredAt).getTime()) / 1000)
        };
      }
      return a;
    }));
  };

  const triggerEmergencyAlarm = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return;

    setMachines(prev => prev.map(m => m.id === machineId ? { ...m, status: 'Alarm' } : m));

    const simAlarm: AlarmEvent = {
      id: `alarm-${Date.now()}`,
      ruleId: 'manual-trigger',
      alarmName: `Emergency Stop Interlock Activated (${machine.code})`,
      machineId: machine.id,
      machineName: `${machine.name} (${machine.code})`,
      tagName: `${machine.code}.E_Stop_Trip`,
      tagAddress: 'MR100.0',
      value: 1,
      limitValue: 0,
      priority: 'Critical',
      message: `Emergency Stop button physically engaged at operator console for ${machine.code}. Safety circuit tripped.`,
      status: 'Active',
      triggeredAt: new Date().toISOString()
    };

    setAlarmEvents(prev => [simAlarm, ...prev]);
  };

  const generateReport = (reportType: ProductionReport['reportType'], title: string, machineId?: string): ProductionReport => {
    const targetMachine = machineId ? machines.find(m => m.id === machineId) : null;
    const rep: ProductionReport = {
      id: `rep-${Date.now()}`,
      title: title || `${reportType} Report - ${new Date().toLocaleDateString('vi-VN')}`,
      reportType,
      dateRange: 'Hôm nay (Ca 1 & Ca 2)',
      generatedAt: new Date().toISOString(),
      generatedBy: `${currentUser.name} (${currentUser.role})`,
      machineId,
      summary: {
        totalProduction: targetMachine ? targetMachine.totalCount : totalShiftProduction,
        okRate: targetMachine && targetMachine.totalCount > 0 ? parseFloat(((targetMachine.okCount / targetMachine.totalCount) * 100).toFixed(1)) : plantOkRate,
        avgOee: targetMachine ? calculateMachineOee(targetMachine).oee : overallOee,
        totalDowntimeMinutes: targetMachine ? Math.round(targetMachine.downTimeSeconds / 60) : Math.round(machines.reduce((acc, m) => acc + m.downTimeSeconds, 0) / 60),
        totalAlarms: alarmEvents.length,
        energyConsumedKwh: targetMachine ? targetMachine.powerKw * 6.5 : plantPowerKw * 7.2
      },
      shiftBreakdown: [
        { shift: 'Ca 1 (06:00 - 14:00)', operator: 'Nguyen Van A / Tran Van B', output: Math.round(totalShiftProduction * 0.52), okRate: 98.9, oee: 86.4, downtimeMin: 35 },
        { shift: 'Ca 2 (14:00 - 22:00)', operator: 'Le Thi C / Pham Van D', output: Math.round(totalShiftProduction * 0.48), okRate: 98.1, oee: 82.2, downtimeMin: 68 }
      ]
    };

    setReports(prev => [rep, ...prev]);
    return rep;
  };

  const sendAiMessage = async (userPrompt: string) => {
    const userMsg: AiChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setAiChatHistory(prev => [...prev, userMsg]);

    // Build real-time system context for Gemini
    const systemContext = `
HATSCADA Live Industrial State:
- Overall Factory OEE: ${overallOee}% | Total Production: ${totalShiftProduction} pcs | OK Rate: ${plantOkRate}%
- Active Alarms (${activeAlarmsCount}): ${JSON.stringify(alarmEvents.filter(a => a.status === 'Active').map(a => ({ name: a.alarmName, machine: a.machineName, tag: a.tagName, val: a.value, limit: a.limitValue, priority: a.priority })))}
- Machines: ${JSON.stringify(machines.map(m => ({ code: m.code, name: m.name, status: m.status, rpm: m.currentSpeed, temp: m.temperature, press: m.pressure, ok: m.okCount, ng: m.ngCount, dtSec: m.downTimeSeconds })))}
- PLCs: ${JSON.stringify(plcs.map(p => ({ name: p.name, brand: p.brand, protocol: p.protocol, status: p.status, ip: p.ipAddress })))}
- Key Tags: ${JSON.stringify(tags.slice(0, 10).map(t => ({ name: t.name, addr: t.address, val: t.currentValue, unit: t.unit, quality: t.quality })))}
`;

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          systemContext,
          modelName: settings.geminiModel || 'gemini-3.7-flash',
          temperature: settings.geminiTemperature || 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi từ máy chủ AI');
      }

      const data = await response.json();
      const aiReply: AiChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          'Tạo báo cáo chi tiết cho ca này',
          'Kiểm tra danh sách Alarm đang kích hoạt',
          'Xem biểu đồ xu hướng nhiệt độ & áp suất'
        ]
      };

      setAiChatHistory(prev => [...prev, aiReply]);
    } catch (err: any) {
      console.error('AI Error:', err);
      const fallbackReply: AiChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `⚠️ **Thông báo kết nối AI Copilot:**\n${err.message || 'Không thể kết nối đến Google Gemini API.'}\n\n*Gợi ý:* Hãy kiểm tra cài đặt API Key trong phần Cấu hình AI (Settings -> AI Configuration).`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setAiChatHistory(prev => [...prev, fallbackReply]);
    }
  };

  const clearAiChat = () => {
    setAiChatHistory([]);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // ==========================================
  // NOTIFICATION ENGINE & BACKGROUND DISPATCH
  // ==========================================

  const updateEmailConfig = (newConfig: Partial<EmailConfiguration>) => {
    setEmailConfig(prev => ({ ...prev, ...newConfig }));
  };

  const updateTelegramConfig = (newConfig: Partial<TelegramConfiguration>) => {
    setTelegramConfig(prev => ({ ...prev, ...newConfig }));
  };

  const updateWebhookConfig = (newConfig: Partial<WebhookConfiguration>) => {
    setWebhookConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Helper to interpolate template string with runtime SCADA variables
  const interpolateTemplate = useCallback((templateStr: string, vars: Record<string, string | number>): string => {
    let result = templateStr;
    Object.entries(vars).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, String(value));
    });
    return result;
  }, []);

  // Dispatch background notification worker
  const dispatchManualNotification = useCallback(async (item: {
    channelType: NotificationChannelType;
    source: 'Alarm' | 'TagRule' | 'PLCEvent' | 'Production' | 'ScheduledReport' | 'Test';
    sourceName: string;
    recipients: string[];
    subject: string;
    message: string;
  }) => {
    const queueId = `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const historyId = `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const queueItem: NotificationQueueItem = {
      id: queueId,
      timestamp: new Date().toISOString(),
      channelType: item.channelType,
      source: item.source,
      sourceName: item.sourceName,
      recipients: item.recipients,
      subject: item.subject,
      message: item.message,
      body: item.message,
      createdAt: new Date().toISOString(),
      attempts: 1,
      maxAttempts: emailConfig.retryCount || 3,
      retryCount: 0,
      maxRetries: emailConfig.retryCount || 3,
      status: 'Processing'
    };

    setNotificationQueue(prev => [...prev, queueItem]);

    // Simulated Non-blocking Background Queue Processing with network latency
    setTimeout(() => {
      const latencyMs = Math.floor(Math.random() * 180 + 120);
      const isSuccess = Math.random() > 0.03; // 97% delivery success rate

      const histItem: NotificationHistoryItem = {
        id: historyId,
        timestamp: new Date().toISOString(),
        channelType: item.channelType,
        source: item.source,
        sourceName: item.sourceName,
        recipients: item.recipients,
        subject: item.subject,
        messagePreview: item.message.slice(0, 160) + (item.message.length > 160 ? '...' : ''),
        status: isSuccess ? 'Delivered' : 'Failed',
        errorMessage: isSuccess ? undefined : 'SMTP relay server returned 421 4.7.0 Connection rate limit exceeded (Will auto-retry)',
        latencyMs,
        retryCount: 0
      };

      setNotificationHistory(prev => [histItem, ...prev.slice(0, 199)]);
      setNotificationQueue(prev => prev.filter(q => q.id !== queueId));

      if (isSuccess && item.channelType === 'Email') {
        setEmailConfig(prev => ({
          ...prev,
          lastSentTime: new Date().toISOString(),
          totalSentCount: prev.totalSentCount + item.recipients.length
        }));
      }
    }, 400);
  }, [emailConfig.retryCount]);

  // SMTP Live Socket Simulation Test
  const sendTestEmail = async (targetEmail?: string): Promise<{ success: boolean; latencyMs: number; message: string; log: string[] }> => {
    const recipient = targetEmail || emailConfig.senderEmail || 'maintenance.lead@factory.hatscada.vn';
    const startTime = Date.now();

    const socketLogs: string[] = [
      `[CLIENT] Resolving DNS host for ${emailConfig.smtpServer}...`,
      `[CLIENT] Found IP: 142.250.186.108. Initiating TCP connection to port ${emailConfig.smtpPort}...`,
      `[SERVER] 220 ${emailConfig.smtpServer} ESMTP HATSCADA-Service Ready`,
      `[CLIENT] EHLO hatscada.local`,
      `[SERVER] 250-${emailConfig.smtpServer} at your service, [192.168.1.100]`,
      `[SERVER] 250-SIZE 35882577`,
      `[SERVER] 250-8BITMIME`,
      `[SERVER] 250-STARTTLS`,
      `[SERVER] 250-AUTH LOGIN PLAIN`,
      `[CLIENT] STARTTLS`,
      `[SERVER] 220 2.0.0 Ready to start TLS`,
      `[CLIENT] TLS 1.3 Handshake completed successfully. Cipher: TLS_AES_256_GCM_SHA384`,
      `[CLIENT] AUTH LOGIN`,
      `[SERVER] 334 VXNlcm5hbWU6`,
      `[CLIENT] <Encrypted Username Credential Sent>`,
      `[SERVER] 334 UGFzc3dvcmQ6`,
      `[CLIENT] <Encrypted Application Secret Token Sent>`,
      `[SERVER] 235 2.7.0 Authentication successful`,
      `[CLIENT] MAIL FROM: <${emailConfig.senderEmail}>`,
      `[SERVER] 250 2.1.0 Sender OK`,
      `[CLIENT] RCPT TO: <${recipient}>`,
      `[SERVER] 250 2.1.5 Recipient OK`,
      `[CLIENT] DATA`,
      `[SERVER] 354 Start mail input; end with <CRLF>.<CRLF>`,
      `[CLIENT] Subject: [TEST] HATSCADA System Email Delivery Test`,
      `[CLIENT] Date: ${new Date().toUTCString()}`,
      `[CLIENT] .`,
      `[SERVER] 250 2.0.0 OK ${Date.now()} - Message accepted for delivery (Latency: 142ms)`
    ];

    await new Promise(r => setTimeout(r, 600));
    const latency = Date.now() - startTime;

    // Update Email Configuration status
    setEmailConfig(prev => ({
      ...prev,
      connectionStatus: 'Connected',
      lastSentTime: new Date().toISOString(),
      totalSentCount: prev.totalSentCount + 1
    }));

    // Record to history
    const histItem: NotificationHistoryItem = {
      id: `test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      channelType: 'Email',
      source: 'Test',
      sourceName: 'SMTP Test Diagnostic',
      recipients: [recipient],
      subject: '[TEST] HATSCADA System Email Delivery Test',
      messagePreview: `Email server test successfully delivered via ${emailConfig.smtpServer}:${emailConfig.smtpPort} (${emailConfig.securityType})`,
      status: 'Delivered',
      latencyMs: latency,
      retryCount: 0
    };
    setNotificationHistory(prev => [histItem, ...prev]);

    return {
      success: true,
      latencyMs: latency,
      message: `Email kiểm tra đã gửi thành công tới ${recipient} qua ${emailConfig.smtpServer}:${emailConfig.smtpPort}`,
      log: socketLogs
    };
  };

  const sendTestTelegram = async (targetChatId?: string) => {
    const chatId = targetChatId || telegramConfig.chatId || '@hatscada_alerts';
    await new Promise(r => setTimeout(r, 450));

    setTelegramConfig(prev => ({
      ...prev,
      connectionStatus: 'Connected',
      lastSentTime: new Date().toISOString()
    }));

    const histItem: NotificationHistoryItem = {
      id: `tg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      channelType: 'Telegram',
      source: 'Test',
      sourceName: 'Telegram Bot Test',
      recipients: [chatId],
      subject: 'Telegram Bot Message Test',
      messagePreview: `🤖 [HATSCADA TEST] Kết nối Telegram Bot @${telegramConfig.botToken ? 'HATSCADA_Bot' : 'MockBot'} thành công.`,
      status: 'Delivered',
      latencyMs: 185,
      retryCount: 0
    };
    setNotificationHistory(prev => [histItem, ...prev]);

    return {
      success: true,
      latencyMs: 185,
      message: `Telegram test payload delivered to chat '${chatId}'`
    };
  };

  const sendTestWebhook = async (targetUrl?: string) => {
    const endpoint = targetUrl || webhookConfig.endpointUrl || 'https://mes.hatscada.vn/api/v1/scada/webhook';
    await new Promise(r => setTimeout(r, 380));

    setWebhookConfig(prev => ({
      ...prev,
      connectionStatus: 'Connected',
      lastSentTime: new Date().toISOString()
    }));

    const histItem: NotificationHistoryItem = {
      id: `wh-${Date.now()}`,
      timestamp: new Date().toISOString(),
      channelType: 'Webhook',
      source: 'Test',
      sourceName: 'REST Webhook Test',
      recipients: [endpoint],
      subject: 'HTTP POST JSON Test Payload',
      messagePreview: `POST 200 OK -> ${endpoint}`,
      status: 'Delivered',
      latencyMs: 145,
      retryCount: 0
    };
    setNotificationHistory(prev => [histItem, ...prev]);

    return {
      success: true,
      latencyMs: 145,
      message: `HTTP POST webhook dispatched to ${endpoint} with status 200 OK`
    };
  };

  // Notification Contacts CRUD
  const addContact = (contact: Omit<NotificationContact, 'id'>) => {
    const newContact: NotificationContact = {
      ...contact,
      id: `contact-${Date.now()}`
    };
    setNotificationContacts(prev => [...prev, newContact]);
  };

  const updateContact = (contact: NotificationContact) => {
    setNotificationContacts(prev => prev.map(c => c.id === contact.id ? contact : c));
  };

  const deleteContact = (contactId: string) => {
    setNotificationContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const toggleContactEnabled = (contactId: string) => {
    setNotificationContacts(prev => prev.map(c => c.id === contactId ? { ...c, enabled: !c.enabled } : c));
  };

  // Tag Notification Rules CRUD
  const addTagNotificationRule = (rule: Omit<TagNotificationRule, 'id' | 'triggerCount'>) => {
    const newRule: TagNotificationRule = {
      ...rule,
      id: `tag-rule-${Date.now()}`,
      triggerCount: 0
    };
    setTagNotificationRules(prev => [...prev, newRule]);
  };

  const updateTagNotificationRule = (rule: TagNotificationRule) => {
    setTagNotificationRules(prev => prev.map(r => r.id === rule.id ? rule : r));
  };

  const deleteTagNotificationRule = (ruleId: string) => {
    setTagNotificationRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const toggleTagNotificationRule = (ruleId: string) => {
    setTagNotificationRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  // Alarm Notification Rules CRUD
  const addAlarmNotificationRule = (rule: Omit<AlarmNotificationRule, 'id'>) => {
    const newRule: AlarmNotificationRule = {
      ...rule,
      id: `alarm-nrule-${Date.now()}`
    };
    setAlarmNotificationRules(prev => [...prev, newRule]);
  };

  const updateAlarmNotificationRule = (rule: AlarmNotificationRule) => {
    setAlarmNotificationRules(prev => prev.map(r => r.id === rule.id ? rule : r));
  };

  const deleteAlarmNotificationRule = (ruleId: string) => {
    setAlarmNotificationRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const toggleAlarmNotificationRule = (ruleId: string) => {
    setAlarmNotificationRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  // Templates CRUD
  const addNotificationTemplate = (template: Omit<NotificationTemplate, 'id'>) => {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: `tpl-${Date.now()}`
    };
    setNotificationTemplates(prev => [...prev, newTemplate]);
  };

  const updateNotificationTemplate = (template: NotificationTemplate) => {
    setNotificationTemplates(prev => prev.map(t => t.id === template.id ? template : t));
  };

  const deleteNotificationTemplate = (templateId: string) => {
    setNotificationTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const clearNotificationHistory = () => {
    setNotificationHistory([]);
  };

  const retryNotification = async (historyId: string) => {
    const item = notificationHistory.find(h => h.id === historyId);
    if (!item) return;

    setNotificationHistory(prev => prev.map(h => h.id === historyId ? { ...h, status: 'Processing' } : h));

    await new Promise(r => setTimeout(r, 500));

    setNotificationHistory(prev => prev.map(h => {
      if (h.id === historyId) {
        return {
          ...h,
          status: 'Delivered',
          retryCount: h.retryCount + 1,
          errorMessage: undefined,
          timestamp: new Date().toISOString()
        };
      }
      return h;
    }));
  };

  // ==========================================
  // REAL-TIME TAG NOTIFICATION RULE EVALUATOR
  // ==========================================
  useEffect(() => {
    const now = Date.now();

    tagNotificationRules.forEach(rule => {
      if (!rule.enabled) return;
      const targetTagId = rule.tagId || rule.sourceTagId;
      const targetTag = tags.find(t => t.id === targetTagId);
      if (!targetTag || typeof targetTag.currentValue !== 'number') return;

      const val = targetTag.currentValue;
      let isViolating = false;

      if ((rule.condition === 'GreaterThan' || rule.condition === '>') && val > rule.thresholdValue) isViolating = true;
      if ((rule.condition === 'LessThan' || rule.condition === '<') && val < rule.thresholdValue) isViolating = true;
      if ((rule.condition === 'Equal' || rule.condition === '=') && val === rule.thresholdValue) isViolating = true;
      if (rule.condition === 'Between' && rule.thresholdValueHigh && val >= rule.thresholdValue && val <= rule.thresholdValueHigh) isViolating = true;

      const violationKey = `${rule.id}-${targetTagId}`;
      const lastTriggerTime = tagRuleTriggeredRef.current[violationKey] || 0;

      if (isViolating) {
        if (!tagViolationsRef.current[violationKey]) {
          tagViolationsRef.current[violationKey] = now;
        }

        const violationDurationSec = (now - tagViolationsRef.current[violationKey]) / 1000;
        const cooldownMs = ((rule.delaySeconds || 5) + 60) * 1000; // Minimum 60s cooldown between spam alerts

        if (violationDurationSec >= (rule.delaySeconds || 0) && (now - lastTriggerTime) > cooldownMs) {
          tagRuleTriggeredRef.current[violationKey] = now;

          // Resolve Recipient Emails / Channels
          const contactIds = rule.recipientContactIds || rule.recipients || [];
          const customEmails = rule.recipientEmails || [];
          const resolvedRecipients = notificationContacts
            .filter(c => c.enabled && (contactIds.includes(c.id) || contactIds.includes(c.role) || contactIds.includes(c.department)))
            .map(c => c.email);

          const allRecipients = Array.from(new Set([...resolvedRecipients, ...customEmails]));
          if (allRecipients.length === 0) {
            allRecipients.push(emailConfig.senderEmail || 'maintenance@factory.hatscada.vn');
          }

          // Template Interpolation
          const template = notificationTemplates.find(t => t.id === (rule.templateId || rule.messageTemplateId)) || notificationTemplates[0];
          const severityLevel = rule.severity || rule.priority || 'High';
          const vars: Record<string, string | number> = {
            TagName: targetTag.name,
            TagAddress: targetTag.address,
            Value: val,
            Threshold: rule.thresholdValue,
            Unit: targetTag.unit || '',
            Timestamp: new Date().toLocaleString('vi-VN'),
            DelaySeconds: rule.delaySeconds || 0,
            Severity: severityLevel
          };

          const subject = interpolateTemplate(template ? template.subject : `[HATSCADA ${severityLevel.toUpperCase()}] Cảnh báo giá trị Tag ${targetTag.name}`, vars);
          const body = interpolateTemplate(template ? template.body : `Tag: {TagName}\nĐịa chỉ: {TagAddress}\nGiá trị hiện tại: {Value} {Unit}\nNgưỡng: {Threshold} {Unit}\nThời gian kích hoạt: {Timestamp}`, vars);

          // Update trigger count
          setTagNotificationRules(prev => prev.map(r => r.id === rule.id ? {
            ...r,
            triggerCount: (r.triggerCount || 0) + 1,
            lastTriggeredAt: new Date().toISOString()
          } : r));

          // Queue and Dispatch
          (rule.channels || ['Email']).forEach(ch => {
            dispatchManualNotification({
              channelType: ch,
              source: 'TagRule',
              sourceName: rule.name,
              recipients: allRecipients,
              subject,
              message: body
            });
          });
        }
      } else {
        // Tag back in normal zone
        delete tagViolationsRef.current[violationKey];
      }
    });
  }, [tags, tagNotificationRules, notificationContacts, notificationTemplates, interpolateTemplate, dispatchManualNotification, emailConfig.senderEmail]);

  // ==========================================
  // REAL-TIME ALARM NOTIFICATION DISPATCHER
  // ==========================================
  useEffect(() => {
    // Check recently triggered active alarms
    const activeAlarms = alarmEvents.filter(a => a.status === 'Active');
    const now = Date.now();

    activeAlarms.forEach(alarm => {
      const dispatchKey = `alarm-${alarm.id}`;
      if (alarmRuleDispatchedRef.current[dispatchKey]) return; // Already sent for this alarm event instance

      // Find matching notification rules
      const matchedRules = alarmNotificationRules.filter(r => {
        if (!r.enabled) return false;
        const condList = r.condition || r.conditions || ['OnTrigger'];
        if (Array.isArray(condList) && !condList.includes('OnTrigger')) return false;
        if (r.priority && r.priority !== 'All' && r.priority !== alarm.priority) return false;
        if (r.alarmRuleId && r.alarmRuleId !== 'All' && r.alarmRuleId !== alarm.ruleId) return false;
        return true;
      });

      if (matchedRules.length > 0) {
        alarmRuleDispatchedRef.current[dispatchKey] = now;

        matchedRules.forEach(rule => {
          // Anti-spam duplicate suppression
          if ((rule.rateLimitMinutes || 0) > 0 && rule.lastDispatchedAt) {
            const timeSinceLastDispatched = (now - new Date(rule.lastDispatchedAt).getTime()) / 60000;
            if (timeSinceLastDispatched < rule.rateLimitMinutes) {
              return; // Suppress duplicate notification
            }
          }

          // Resolve Contacts
          const contactIds = rule.recipientContactIds || rule.recipients || [];
          const customEmails = rule.recipientEmails || [];
          const resolvedRecipients = notificationContacts
            .filter(c => c.enabled && (contactIds.includes(c.id) || contactIds.includes(c.role) || contactIds.includes(c.department)))
            .map(c => c.email);

          const allRecipients = Array.from(new Set([...resolvedRecipients, ...customEmails]));
          if (allRecipients.length === 0) {
            allRecipients.push(emailConfig.senderEmail || 'alerts@factory.hatscada.vn');
          }

          const template = notificationTemplates.find(t => t.id === rule.templateId) || notificationTemplates[0];
          const vars: Record<string, string | number> = {
            AlarmName: alarm.alarmName,
            MachineName: alarm.machineName,
            TagName: alarm.tagName,
            TagAddress: alarm.tagAddress,
            Value: typeof alarm.value === 'boolean' ? (alarm.value ? 'ON' : 'OFF') : alarm.value,
            Limit: alarm.limitValue,
            Priority: alarm.priority,
            AlarmMessage: alarm.message,
            Timestamp: new Date(alarm.triggeredAt).toLocaleString('vi-VN')
          };

          const subject = interpolateTemplate(template ? template.subject : `[HATSCADA ${alarm.priority.toUpperCase()}] Báo động: ${alarm.alarmName}`, vars);
          const body = interpolateTemplate(template ? template.body : `BÁO ĐỘNG HỆ THỐNG SCADA\nMáy: {MachineName}\nNội dung: {AlarmMessage}\nGiá trị: {Value} | Giới hạn: {Limit}\nThời gian: {Timestamp}`, vars);

          // Update lastDispatchedAt
          setAlarmNotificationRules(prev => prev.map(r => r.id === rule.id ? { ...r, lastDispatchedAt: new Date().toISOString() } : r));

          // Send across configured channels
          (rule.channels || ['Email']).forEach(ch => {
            dispatchManualNotification({
              channelType: ch,
              source: 'Alarm',
              sourceName: `${rule.name} (${alarm.alarmName})`,
              recipients: allRecipients,
              subject,
              message: body
            });
          });
        });
      }
    });
  }, [alarmEvents, alarmNotificationRules, notificationContacts, notificationTemplates, interpolateTemplate, dispatchManualNotification, emailConfig.senderEmail]);

  // ==========================================
  // DYNAMIC REPORT MANAGEMENT ENGINE
  // ==========================================

  const addReportTemplate = (template: Omit<ReportTemplateConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: ReportTemplateConfig = {
      ...template,
      id: `rtpl-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setReportTemplates(prev => [...prev, newTemplate]);
  };

  const updateReportTemplate = (template: ReportTemplateConfig) => {
    const updated = { ...template, updatedAt: new Date().toISOString() };
    setReportTemplates(prev => prev.map(t => t.id === template.id ? updated : t));
  };

  const deleteReportTemplate = (templateId: string) => {
    setReportTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const addReportSchedule = (schedule: Omit<ReportScheduleConfig, 'id'>) => {
    const newSchedule: ReportScheduleConfig = {
      ...schedule,
      id: `rsched-${Date.now()}`
    };
    setReportSchedules(prev => [...prev, newSchedule]);
  };

  const updateReportSchedule = (schedule: ReportScheduleConfig) => {
    setReportSchedules(prev => prev.map(s => s.id === schedule.id ? schedule : s));
  };

  const deleteReportSchedule = (scheduleId: string) => {
    setReportSchedules(prev => prev.filter(s => s.id !== scheduleId));
  };

  const toggleReportSchedule = (scheduleId: string) => {
    setReportSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, enabled: !s.enabled } : s));
  };

  // Generate a dynamic customized report from a ReportTemplateConfig
  const generateCustomReport = useCallback((template: ReportTemplateConfig, timeRange?: ReportTimeRange): GeneratedReportArchiveItem => {
    const range = timeRange || template.defaultTimeRange || 'Today';
    const reportId = `rep-gen-${Date.now()}`;
    const generatedTime = new Date().toISOString();

    // Calculate metrics based on included sections and machines
    const targetMachines = template.targetMachineIds && template.targetMachineIds.length > 0 && !template.targetMachineIds.includes('All')
      ? machines.filter(m => template.targetMachineIds!.includes(m.id))
      : machines;

    const totalProd = targetMachines.reduce((acc, m) => acc + m.totalCount, 0);
    const totalOk = targetMachines.reduce((acc, m) => acc + m.okCount, 0);
    const okRate = totalProd > 0 ? parseFloat(((totalOk / totalProd) * 100).toFixed(1)) : 98.6;
    const avgOee = targetMachines.length > 0
      ? parseFloat((targetMachines.reduce((acc, m) => acc + calculateMachineOee(m).oee, 0) / targetMachines.length).toFixed(1))
      : overallOee;
    const totalDowntimeMin = Math.round(targetMachines.reduce((acc, m) => acc + m.downTimeSeconds, 0) / 60);
    const energyKwh = parseFloat((targetMachines.reduce((acc, m) => acc + m.powerKw, 0) * 7.5).toFixed(1));

    const archiveItem: GeneratedReportArchiveItem = {
      id: reportId,
      templateId: template.id,
      templateName: template.name,
      title: `${template.name} - ${range} (${new Date().toLocaleDateString('vi-VN')})`,
      category: template.category,
      timeRange: range,
      format: template.format,
      generatedAt: generatedTime,
      generatedBy: `${currentUser.name} (${currentUser.role})`,
      fileSizeKb: Math.floor(Math.random() * 450 + 250),
      summary: {
        totalProduction: totalProd,
        okRate,
        avgOee,
        totalDowntimeMinutes: totalDowntimeMin,
        totalAlarms: alarmEvents.length,
        energyConsumedKwh: energyKwh
      },
      machines: targetMachines.map(m => ({
        code: m.code,
        name: m.name,
        oee: calculateMachineOee(m).oee,
        total: m.totalCount,
        ok: m.okCount,
        ng: m.ngCount,
        downtimeMin: Math.round(m.downTimeSeconds / 60)
      })),
      alarmsBreakdown: alarmEvents.slice(0, 10).map(a => ({
        alarmName: a.alarmName,
        machine: a.machineName,
        priority: a.priority,
        triggeredAt: a.triggeredAt,
        status: a.status
      })),
      status: 'Ready'
    };

    setGeneratedReportArchive(prev => [archiveItem, ...prev]);
    return archiveItem;
  }, [machines, currentUser, calculateMachineOee, overallOee, alarmEvents]);

  // Execute a scheduled report on-demand and auto-email to recipients
  const executeReportScheduleNow = async (scheduleId: string): Promise<GeneratedReportArchiveItem> => {
    const schedule = reportSchedules.find(s => s.id === scheduleId);
    if (!schedule) throw new Error('Không tìm thấy lịch báo cáo');

    const template = reportTemplates.find(t => t.id === schedule.templateId) || reportTemplates[0];
    const generated = generateCustomReport(template, schedule.timeRange);

    // Update schedule lastRun
    setReportSchedules(prev => prev.map(s => s.id === scheduleId ? {
      ...s,
      lastRunAt: new Date().toISOString(),
      lastStatus: 'Success'
    } : s));

    // If email delivery is enabled in schedule, dispatch email automatically
    if (schedule.emailDelivery && schedule.recipientEmails.length > 0) {
      const emailBody = `Kính gửi Ban Quản Lý Nhà Máy,\n\nHệ thống HATSCADA gửi tới Quý vị bản Báo Cáo Tự Động định kỳ:\n` +
        `• Tên báo cáo: ${generated.title}\n` +
        `• Định dạng file: ${generated.format}\n` +
        `• Tổng sản lượng: ${generated.summary.totalProduction.toLocaleString('vi-VN')} pcs\n` +
        `• Tỷ lệ đạt chuẩn (OK Rate): ${generated.summary.okRate}%\n` +
        `• Chỉ số OEE trung bình: ${generated.summary.avgOee}%\n` +
        `• Thời gian dừng máy (Downtime): ${generated.summary.totalDowntimeMinutes} phút\n` +
        `• Năng lượng tiêu thụ: ${generated.summary.energyConsumedKwh} kWh\n\n` +
        `File đính kèm báo cáo dạng ${generated.format} (${generated.fileSizeKb} KB) đã được mã hóa và xuất tự động từ HATSCADA Historian DB.`;

      dispatchManualNotification({
        channelType: 'Email',
        source: 'ScheduledReport',
        sourceName: `${schedule.name} (${template.name})`,
        recipients: schedule.recipientEmails,
        subject: `[HATSCADA BÁO CÁO TỰ ĐỘNG] ${generated.title}`,
        message: emailBody
      });
    }

    return generated;
  };

  const emailReportToRecipients = async (reportArchiveId: string, recipientEmails: string[]): Promise<{ success: boolean; message: string }> => {
    const reportItem = generatedReportArchive.find(r => r.id === reportArchiveId);
    if (!reportItem) return { success: false, message: 'Báo cáo không tồn tại trong kho lưu trữ' };

    const emailBody = `Kính gửi Quý Trưởng Bộ Phận / Kỹ Sư Trực Ca,\n\n` +
      `Báo cáo sản xuất từ hệ thống HATSCADA đã được chia sẻ thủ công:\n` +
      `• Tiêu đề: ${reportItem.title}\n` +
      `• Phân loại: ${reportItem.category} | Thời gian: ${reportItem.timeRange}\n` +
      `• Sản lượng: ${reportItem.summary.totalProduction.toLocaleString('vi-VN')} pcs (OK: ${reportItem.summary.okRate}%)\n` +
      `• Hiệu suất tổng thể OEE: ${reportItem.summary.avgOee}%\n` +
      `• Người gửi: ${currentUser.name} (${currentUser.role})\n\n` +
      `File báo cáo: [${reportItem.title}.${reportItem.format.toLowerCase()}] (${reportItem.fileSizeKb} KB)`;

    await dispatchManualNotification({
      channelType: 'Email',
      source: 'ScheduledReport',
      sourceName: `Manual Report Share (${reportItem.title})`,
      recipients: recipientEmails,
      subject: `[BÁO CÁO SCADA CHIA SẺ] ${reportItem.title}`,
      message: emailBody
    });

    return {
      success: true,
      message: `Đã gửi báo cáo thành công tới ${recipientEmails.join(', ')}`
    };
  };

  // Tag Service Implementations (Req 51)
  const getTagsByMachine = useCallback((machineId: string): Tag[] => {
    return tags.filter(t => t.machineId === machineId);
  }, [tags]);

  const getTagsByPlc = useCallback((plcId: string): Tag[] => {
    return tags.filter(t => t.plcId === plcId);
  }, [tags]);

  const getTagsByLine = useCallback((lineName: string): Tag[] => {
    const lineMachines = machines.filter(m => m.line === lineName || m.line.includes(lineName));
    const mIds = lineMachines.map(m => m.id);
    return tags.filter(t => t.machineId && mIds.includes(t.machineId));
  }, [tags, machines]);

  const getTagHistory = useCallback((tagId: string): TagHistoryPoint[] => {
    return tagHistoryBuffer[tagId] || [];
  }, [tagHistoryBuffer]);

  const getScopedTags = useCallback((
    scopeMode: 'Current Machine' | 'Current PLC' | 'Current Line' | 'Entire Factory',
    scopeId?: string
  ): Tag[] => {
    if (scopeMode === 'Current Machine' && scopeId) {
      return tags.filter(t => t.machineId === scopeId);
    }
    if (scopeMode === 'Current PLC' && scopeId) {
      return tags.filter(t => t.plcId === scopeId);
    }
    if (scopeMode === 'Current Line' && scopeId) {
      const lineMachines = machines.filter(m => m.line === scopeId || m.line.includes(scopeId));
      const mIds = lineMachines.map(m => m.id);
      return tags.filter(t => t.machineId && mIds.includes(t.machineId));
    }
    return tags;
  }, [tags, machines]);

  return (
    <ScadaContext.Provider
      value={{
        machines,
        plcs,
        tags,
        alarmRules,
        alarmEvents,
        users,
        currentUser,
        reports,
        settings,
        aiChatHistory,
        tagHistoryBuffer,
        communicationLogs,
        activeAlarmsCount,
        overallOee,
        plantPowerKw,
        plantOkRate,
        totalShiftProduction,
        factoryHierarchy,
        emailConfig,
        telegramConfig,
        webhookConfig,
        notificationContacts,
        tagNotificationRules,
        alarmNotificationRules,
        notificationTemplates,
        notificationHistory,
        notificationQueue,
        reportTemplates,
        reportSchedules,
        generatedReportArchive,
        getTagsByMachine,
        getTagsByPlc,
        getTagsByLine,
        getTagHistory,
        getScopedTags,
        switchUser,
        writeTagValue,
        addTag,
        updateTag,
        deleteTag,
        toggleTagFavorite,
        addPlc,
        updatePlc,
        deletePlc,
        togglePlcEnabled,
        reconnectPlc,
        disconnectPlc,
        pingPlc,
        testPlcConnection,
        addBatchPlcFleet,
        clearCommunicationLogs,
        controlMachine,
        updateMachine,
        createAlarmRule,
        toggleAlarmRule,
        deleteAlarmRule,
        acknowledgeAlarm,
        clearAlarm,
        calculateMachineOee,
        generateReport,
        sendAiMessage,
        clearAiChat,
        updateSettings,
        triggerEmergencyAlarm,
        updateEmailConfig,
        updateTelegramConfig,
        updateWebhookConfig,
        sendTestEmail,
        sendTestTelegram,
        sendTestWebhook,
        addContact,
        updateContact,
        deleteContact,
        toggleContactEnabled,
        addTagNotificationRule,
        updateTagNotificationRule,
        deleteTagNotificationRule,
        toggleTagNotificationRule,
        addAlarmNotificationRule,
        updateAlarmNotificationRule,
        deleteAlarmNotificationRule,
        toggleAlarmNotificationRule,
        addNotificationTemplate,
        updateNotificationTemplate,
        deleteNotificationTemplate,
        clearNotificationHistory,
        retryNotification,
        dispatchManualNotification,
        addReportTemplate,
        updateReportTemplate,
        deleteReportTemplate,
        addReportSchedule,
        updateReportSchedule,
        deleteReportSchedule,
        toggleReportSchedule,
        executeReportScheduleNow,
        generateCustomReport,
        emailReportToRecipients,
        deepLearningDocs,
        addDeepLearningDoc,
        deleteDeepLearningDoc,
        language: settings.language,
        setLanguage,
        t
      }}
    >
      {children}
    </ScadaContext.Provider>
  );
};

export const useScada = () => {
  const context = useContext(ScadaContext);
  if (!context) throw new Error('useScada must be used within a ScadaProvider');
  return context;
};
