export type MachineStatus = 'Running' | 'Idle' | 'Stop' | 'Alarm' | 'Maintenance';

export type PlcProtocol = 'MC Protocol' | 'OPC UA' | 'Modbus TCP' | 'Siemens S7' | 'EtherNet/IP';

export type PlcBrand = 'Keyence' | 'Mitsubishi' | 'Siemens' | 'Modbus' | 'OPC_UA';

export type PlcType =
  | 'Keyence KV'
  | 'Mitsubishi FX'
  | 'Mitsubishi Q'
  | 'Mitsubishi iQ-R'
  | 'Siemens S7'
  | 'Modbus Device'
  | 'OPC UA Device';

export type TagDataType = 'Bool' | 'Int' | 'DInt' | 'Float' | 'Double' | 'String';

export type TagQuality = 'GOOD' | 'BAD' | 'UNCERTAIN';

export type AlarmPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type AlarmCondition = 'GreaterThan' | 'LessThan' | 'Equal' | 'NotEqual' | 'Between' | 'StateChange';

export type AlarmStatus = 'Active' | 'Acknowledged' | 'Cleared';

export type UserRole = 'Admin' | 'Engineer' | 'Operator' | 'Maintenance' | 'Viewer';

export interface User {
  id: string;
  username: string;
  name: string;
  fullName?: string;
  role: UserRole;
  avatar: string;
  email: string;
}

export type AiMessage = AiChatMessage;

export interface CommunicationLog {
  id: string;
  plcId: string;
  plcName: string;
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'success';
  message: string;
  latencyMs?: number;
}

export interface PingResult {
  plcId: string;
  plcName: string;
  ip: string;
  port: number;
  packetsSent: number;
  packetsReceived: number;
  lossRate: number; // %
  avgRtt: number;
  minRtt: number;
  maxRtt: number;
  history: number[];
  timestamp: string;
  status: 'Online' | 'Offline' | 'Degraded';
}

export interface PlcDevice {
  id: string;
  name: string;
  brand: PlcBrand;
  plcType?: PlcType;
  model: string; // e.g. "KV-8000", "iQ-R R08CPU", "S7-1500 CPU 1515-2 PN"
  ipAddress: string;
  port: number;
  protocol: PlcProtocol;
  status: 'Connected' | 'Disconnected' | 'Connecting' | 'Error';
  enabled: boolean;
  timeoutMs: number; // default 2000ms
  retryCount: number; // default 3
  scanIntervalMs: number; // 100, 250, 500, 1000ms
  lastPingMs: number;
  packetsSent: number;
  packetsReceived: number;
  errorCount: number;
  lastUpdated?: string;
  connectedAt?: string;
  rack?: number;
  slot?: number;
  unitNumber?: number;
  networkNumber?: number;
  factoryId?: string;
  factoryName?: string;
  areaName?: string;
  lineName?: string;
  machineId?: string;
  description: string;
}

export interface FactoryHierarchyItem {
  id: string;
  name: string;
  code: string;
  type: 'Factory' | 'Area' | 'Line' | 'Machine' | 'PLC' | 'Tag';
  status?: string;
  metrics?: {
    oee?: number;
    plcsCount?: number;
    plcsOnline?: number;
    tagsCount?: number;
    alarmsCount?: number;
    speed?: number;
    val?: string | number | boolean;
  };
  children?: FactoryHierarchyItem[];
}

export interface Machine {
  id: string;
  code: string;
  name: string;
  line: string;
  type: string;
  plcId: string;
  status: MachineStatus;
  runTimeSeconds: number;
  downTimeSeconds: number;
  idleTimeSeconds: number;
  cycleTimeSec: number;
  targetCycleTimeSec: number;
  currentSpeed: number; // e.g., RPM or Parts/min
  targetSpeed: number;
  totalCount: number;
  okCount: number;
  ngCount: number;
  temperature: number;
  pressure: number;
  vibration: number;
  powerKw: number;
  operatorName: string;
  currentJob: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  description: string;
  factoryId?: string;
  areaId?: string;
  lineName?: string;
  machineId?: string;
  plcId: string;
  address: string; // e.g., "DM100", "D200", "DB1.DBD10", "%MW100", "ns=2;s=Motor.Temp"
  dataType: TagDataType;
  unit: string;
  scale: number;
  offset: number;
  scanIntervalMs: number; // 100, 500, 1000, 5000
  enableHistorian: boolean;
  historianRetentionDays: number;
  isFavorite?: boolean;
  currentValue: number | string | boolean;
  quality: TagQuality;
  lastUpdated: string;
}

export interface TagHistoryPoint {
  timestamp: string;
  value: number;
  quality: TagQuality;
}

export interface AlarmRule {
  id: string;
  name: string;
  tagId: string;
  machineId: string;
  condition: AlarmCondition;
  limitValue: number;
  limitValueHigh?: number; // for Between
  priority: AlarmPriority;
  message: string;
  enabled: boolean;
  soundAlert: boolean;
  autoAcknowledge: boolean;
}

export interface AlarmEvent {
  id: string;
  ruleId: string;
  alarmName: string;
  machineId: string;
  machineName: string;
  tagName: string;
  tagAddress: string;
  value: number | string | boolean;
  limitValue: number;
  priority: AlarmPriority;
  message: string;
  status: AlarmStatus;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  clearedAt?: string;
  comment?: string;
  durationSeconds?: number;
}

export interface OeeMetrics {
  machineId: string;
  machineName: string;
  availability: number; // %
  performance: number; // %
  quality: number; // %
  oee: number; // %
  plannedProductionMinutes: number;
  actualOperatingMinutes: number;
  downtimeMinutes: number;
  plannedDowntimeMinutes: number;
  unplannedDowntimeMinutes: number;
  targetCount: number;
  actualCount: number;
  okCount: number;
  ngCount: number;
  sixBigLosses: {
    equipmentFailureMin: number;
    setupAndAdjustmentMin: number;
    idlingAndMinorStopsMin: number;
    reducedSpeedMin: number;
    processDefectsCount: number;
    reducedYieldCount: number;
  };
}

export interface ProductionReport {
  id: string;
  title: string;
  reportType: 'Production' | 'Alarm' | 'Energy' | 'OEE' | 'Custom';
  dateRange: string;
  generatedAt: string;
  generatedBy: string;
  machineId?: string;
  summary: {
    totalProduction: number;
    okRate: number;
    avgOee: number;
    totalDowntimeMinutes: number;
    totalAlarms: number;
    energyConsumedKwh: number;
  };
  shiftBreakdown: Array<{
    shift: string;
    operator: string;
    output: number;
    okRate: number;
    oee: number;
    downtimeMin: number;
  }>;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  suggestedActions?: string[];
  metricsSnapshot?: {
    machineCode?: string;
    oee?: number;
    activeAlarmsCount?: number;
    status?: MachineStatus;
  };
}

export type LanguageCode = 'vi' | 'en' | 'ja' | 'zh';

export interface DeepLearningDoc {
  id: string;
  title: string;
  fileName: string;
  fileSizeKb: number;
  fileType: 'PDF' | 'DOCX' | 'TXT' | 'SOP' | 'PLC_MAP';
  category: 'Equipment Manual' | 'Troubleshooting Guide' | 'Error Code Index' | 'PLC Memory Map' | 'Maintenance SOP';
  targetMachineCode?: string;
  targetMachineId?: string;
  contentSnippet: string;
  uploadedAt: string;
  uploadedBy: string;
  indexedInRAG: boolean;
  vectorChunkCount: number;
  tags: string[];
}

export interface SystemSettings {
  language: LanguageCode;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  simulationMode: boolean;
  simulationSpeed: number; // 1x, 2x, 5x
  historianRetentionDays: number;
  geminiApiKey: string;
  geminiModel: string;
  geminiTemperature: number;
  geminiMaxTokens: number;
  enableThinking: boolean;
  enableRagKnowledgeBase?: boolean;
}

// ==========================================
// 30-35. NOTIFICATION & EMAIL SYSTEM TYPES
// ==========================================

export type NotificationChannelType = 'Email' | 'Telegram' | 'Webhook' | 'SMS';

export interface EmailConfiguration {
  id?: string;
  smtpServer: string;
  smtpPort?: number;
  port?: number;
  securityType?: 'TLS' | 'SSL' | 'STARTTLS' | 'None';
  authUsername?: string;
  authPassword?: string;
  username?: string;
  password?: string;
  encryptedPassword?: string;
  enableSSL?: boolean;
  enableTLS?: boolean;
  senderEmail: string;
  senderDisplayName?: string;
  senderName?: string;
  enabled?: boolean;
  connectionStatus: 'Connected' | 'Error' | 'Untested' | 'Testing' | 'Disconnected';
  lastSentTime?: string;
  lastError?: string;
  totalSentCount: number;
  retryCount?: number;
}

export interface TelegramConfiguration {
  enabled: boolean;
  botToken: string;
  chatId?: string;
  defaultChatId?: string;
  lastSentTime?: string;
  lastError?: string;
}

export interface WebhookConfiguration {
  enabled: boolean;
  endpointUrl: string;
  authHeaderName?: string;
  authHeaderValue?: string;
  lastSentTime?: string;
  lastError?: string;
}

export interface NotificationContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  telegramChatId?: string;
  department: string;
  role: string;
  shift?: 'All' | 'Ca 1 (06:00 - 14:00)' | 'Ca 2 (14:00 - 22:00)' | 'Ca 3 (22:00 - 06:00)' | string;
  enabled: boolean;
  avatarColor?: string;
}

export type TagConditionOperator = '>' | '<' | '=' | '!=' | 'Between' | 'GreaterThan' | 'LessThan' | 'Equal';

export interface TagNotificationRule {
  id: string;
  name: string;
  tagId?: string;
  sourceTagId?: string;
  tagName?: string;
  condition: TagConditionOperator;
  thresholdValue: number;
  thresholdValueHigh?: number; // for Between
  delaySeconds: number; // anti-chattering suppression
  priority?: AlarmPriority;
  severity?: AlarmPriority;
  templateId?: string;
  messageTemplateId?: string;
  customMessage?: string;
  recipientContactIds?: string[];
  recipientEmails?: string[];
  recipients?: string[]; // Contact IDs or Emails
  channels: NotificationChannelType[];
  enabled: boolean;
  lastTriggeredAt?: string;
  triggerCount: number;
}

export interface AlarmNotificationRule {
  id: string;
  name: string;
  priority?: AlarmPriority | 'All';
  alarmRuleId?: string;
  specificAlarmRuleId?: string;
  channels: NotificationChannelType[];
  condition?: ('OnTrigger' | 'OnAcknowledge' | 'OnClear' | 'OnReturnNormal' | 'RepeatedAlarm')[];
  conditions?: ('OnTrigger' | 'OnAcknowledge' | 'OnClear' | 'OnReturnNormal' | 'RepeatedAlarm')[];
  recipientContactIds?: string[];
  recipientEmails?: string[];
  recipients?: string[]; // Contact IDs
  telegramChatId?: string;
  webhookUrl?: string;
  templateId?: string;
  enabled: boolean;
  rateLimitMinutes: number; // Anti-spam suppression e.g. 5-10 mins
  lastDispatchedAt?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  description?: string;
  variables: string[]; // e.g. ["MachineName", "PLCName", "TagName", "Value", "Limit", "Timestamp"]
}

export interface NotificationHistoryItem {
  id: string;
  timestamp: string;
  channelType: NotificationChannelType;
  source: 'Alarm' | 'TagRule' | 'PLCEvent' | 'Production' | 'ScheduledReport' | 'Test' | string;
  sourceName: string;
  recipients: string[];
  subject: string;
  message?: string;
  messagePreview?: string;
  status: 'Sent' | 'Delivered' | 'Failed' | 'Retrying' | 'Queued' | 'Processing';
  errorMessage?: string;
  latencyMs?: number;
  retryCount: number;
}

export interface NotificationQueueItem {
  id: string;
  timestamp: string;
  createdAt?: string;
  channelType: NotificationChannelType;
  source: string;
  sourceName?: string;
  recipients: string[];
  subject: string;
  message?: string;
  body?: string;
  isHtml?: boolean;
  status: 'Pending' | 'Sending' | 'Retrying' | 'Completed' | 'Failed' | 'Processing';
  attempts: number;
  maxAttempts: number;
  maxRetries?: number;
  retryCount?: number;
  nextRetryTime?: string;
  error?: string;
}

// ==========================================
// 36-41. REPORT MANAGEMENT SYSTEM TYPES
// ==========================================

export type ReportCategory = 'Production' | 'OEE' | 'Alarm' | 'ShiftHandover' | 'Energy' | 'Machine' | 'PLC' | 'Custom';
export type ReportType = ReportCategory;
export type ReportTimeRange = 'CurrentShift' | 'Today' | 'Yesterday' | 'PreviousDay' | 'ThisWeek' | 'ThisMonth' | 'Weekly' | 'Monthly' | 'Custom' | string;
export type ReportWidgetType = 'KpiCards' | 'LineChart' | 'BarChart' | 'Table' | 'AiExecutiveSummary' | 'AlarmLosses' | string;
export type ReportFormat = 'PDF' | 'Excel' | 'CSV' | 'HTML';
export type ReportOutputFormat = ReportFormat;
export type ReportScheduleFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'ShiftEnd' | 'ShiftBased' | 'Hourly';

export interface ReportTemplateConfig {
  id: string;
  name: string;
  description?: string;
  category?: ReportCategory;
  reportType?: ReportType;
  format?: ReportOutputFormat;
  defaultTimeRange?: ReportTimeRange;
  includeSections?: string[];
  targetMachineIds?: string[];
  chartTypes?: string[];
  dataSource?: {
    machineIds: string[]; // All or specific machine IDs
    plcIds: string[];
    tagIds: string[];
    includeAlarms: boolean;
  };
  timeRange?: ReportTimeRange;
  widgets?: ReportWidgetType[];
  customTitle?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportScheduleConfig {
  id: string;
  name: string;
  templateId?: string;
  reportTemplateId?: string;
  frequency: ReportScheduleFrequency;
  executionTime: string; // "08:00", "17:00", etc.
  dayOfWeek?: number; // 1 = Monday for weekly
  dayOfMonth?: number; // 1 = First day for monthly
  formats?: ReportFormat[];
  timeRange?: ReportTimeRange;
  emailDelivery?: boolean;
  recipientContactIds?: string[];
  recipientEmails?: string[];
  recipients?: string[]; // Contact IDs or emails
  emailSubject?: string;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  status?: 'Active' | 'Paused' | 'Error';
}

export interface GeneratedReportArchiveItem {
  id: string;
  scheduleId?: string;
  templateId?: string;
  templateName?: string;
  title?: string;
  reportName?: string;
  category?: ReportCategory;
  reportType?: ReportType;
  format?: ReportFormat;
  formats?: ReportFormat[];
  generatedAt: string;
  generatedBy?: string;
  timeRange?: string;
  fileSizeKb: number;
  recipients?: string[];
  status: 'Generated' | 'Emailed' | 'Failed' | 'Ready';
  downloadData?: string;
  summary?: {
    totalProduction: number;
    okRate: number;
    avgOee: number;
    totalDowntimeMinutes: number;
    totalAlarms?: number;
    energyConsumedKwh?: number;
  };
  machines?: Array<{
    code: string;
    name: string;
    oee: number;
    total: number;
    ok: number;
    ng: number;
    downtimeMin: number;
  }>;
  alarmsBreakdown?: any[];
}
