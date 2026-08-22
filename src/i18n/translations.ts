export type LanguageCode = 'vi' | 'en' | 'ja' | 'zh';

export function translateDynamic(keyOrPhrase: string, lang: LanguageCode = 'vi'): string {
  if (!keyOrPhrase) return '';
  
  // 1. Check direct key in translations dictionary
  const dict = translations[lang] || translations.vi;
  if (keyOrPhrase in dict) {
    return (dict as unknown as Record<string, string>)[keyOrPhrase];
  }

  // 2. Check phraseMap
  if (phraseMap[keyOrPhrase] && phraseMap[keyOrPhrase][lang]) {
    return phraseMap[keyOrPhrase][lang];
  }

  // 3. Fallback to VI in phraseMap if present
  if (phraseMap[keyOrPhrase] && phraseMap[keyOrPhrase].vi) {
    return phraseMap[keyOrPhrase].vi;
  }

  // 4. Fallback to direct key in VI dict if present
  if (translations.vi[keyOrPhrase as keyof Translations]) {
    return translations.vi[keyOrPhrase as keyof Translations];
  }

  return keyOrPhrase;
}

const phraseMap: Record<string, Record<LanguageCode, string>> = {
  'Tất cả máy': { vi: 'Tất cả máy', en: 'All Machines', ja: 'すべての機器', zh: '所有设备' },
  'Tất cả PLC': { vi: 'Tất cả PLC', en: 'All PLCs', ja: 'すべてのPLC', zh: '所有 PLC' },
  'Tất cả loại tag': { vi: 'Tất cả loại tag', en: 'All Tag Types', ja: 'すべてのタグタイプ', zh: '所有 Tag 类型' },
  'Tất cả vị trí': { vi: 'Tất cả vị trí', en: 'All Locations', ja: 'すべての場所', zh: '所有位置' },
  'Lọc theo loại': { vi: 'Lọc theo loại', en: 'Filter by Type', ja: 'タイプでフィルター', zh: '按类型筛选' },
  'Khởi Động Máy': { vi: 'Khởi Động Máy', en: 'Start Machine', ja: '機器起動', zh: '启动设备' },
  'Dừng Máy Khẩn': { vi: 'Dừng Máy Khẩn', en: 'Emergency Stop', ja: '非常停止', zh: '紧急停止' },
  'Chuyển Bảo Trì': { vi: 'Chuyển Bảo Trì', en: 'Maintenance Mode', ja: 'メンテナンスモード', zh: '切换维护模式' },
  'Reset Lỗi PLC': { vi: 'Reset Lỗi PLC', en: 'Reset PLC Fault', ja: 'PLCエラーリセット', zh: '复位 PLC 故障' },
  'Chẩn Đoán AI': { vi: 'Chẩn Đoán AI', en: 'AI Diagnose', ja: 'AI診断', zh: 'AI 诊断' },
  'Thêm Tag Mới': { vi: 'Thêm Tag Mới', en: 'Add New Tag', ja: '新規タグ追加', zh: '添加新 Tag' },
  'Cưỡng Bức Giá Trị': { vi: 'Cưỡng Bức Giá Trị', en: 'Force Value', ja: '値強制設定', zh: '强制数值' },
  'Tạo Tag Mới': { vi: 'Tạo Tag Mới', en: 'Create New Tag', ja: '新規タグ作成', zh: '创建新 Tag' },
  'Export CSV': { vi: 'Xuất CSV', en: 'Export CSV', ja: 'CSV出力', zh: '导出 CSV' },
  'Xuất CSV': { vi: 'Xuất CSV', en: 'Export CSV', ja: 'CSV出力', zh: '导出 CSV' },
  'Xuất File CSV': { vi: 'Xuất File CSV', en: 'Export CSV File', ja: 'CSVファイル出力', zh: '导出 CSV 文件' },
  'Thêm PLC Mới': { vi: 'Thêm PLC Mới', en: 'Add New PLC', ja: '新規PLC追加', zh: '添加新 PLC' },
  'Kiểm Tra Ping': { vi: 'Kiểm Tra Ping', en: 'Ping Diagnostic', ja: 'Ping診断', zh: 'Ping 诊断' },
  'Soi Bộ Nhớ': { vi: 'Soi Bộ Nhớ', en: 'Memory Inspector', ja: 'メモリインスペクター', zh: '内存查看器' },
  'Cây Cấu Trúc Thiết Bị': { vi: 'Cây Cấu Trúc Thiết Bị', en: 'Equipment Hierarchy', ja: '機器階層構造', zh: '设备层级树' },
  'Cảnh Báo Đang Hoạt Động': { vi: 'Cảnh Báo Đang Hoạt Động', en: 'Active Alarms', ja: 'アクティブアラーム', zh: '活动报警' },
  'Lịch Sử Đã Xử Lý': { vi: 'Lịch Sử Đã Xử Lý', en: 'Alarm History', ja: 'アラーム履歴', zh: '报警历史' },
  'Cấu Hình Ngưỡng & Rules': { vi: 'Cấu Hình Ngưỡng & Rules', en: 'Threshold Rules', ja: 'しきい値ルール', zh: '阈值规则配置' },
  'Cấu Hình SMTP Mail Server': { vi: 'Cấu Hình SMTP Mail Server', en: 'SMTP Mail Server', ja: 'SMTPメールサーバー', zh: 'SMTP 邮件服务器' },
  'Cấu Hình Telegram Bot': { vi: 'Cấu Hình Telegram Bot', en: 'Telegram Bot Config', ja: 'Telegramボット', zh: 'Telegram 机器人配置' },
  'Cấu Hình Webhook API': { vi: 'Cấu Hình Webhook API', en: 'Webhook API Config', ja: 'Webhook API', zh: 'Webhook API 配置' },
  'Danh Sách Liên Hệ': { vi: 'Danh Sách Liên Hệ', en: 'Contact Directory', ja: '連絡先リスト', zh: '联系人列表' },
  'Mẫu Thông Báo': { vi: 'Mẫu Thông Báo', en: 'Notification Templates', ja: '通知テンプレート', zh: '通知模板' },
  'Nhật Ký Gửi': { vi: 'Nhật Ký Gửi', en: 'Dispatch Logs', ja: '送信ログ', zh: '发送日志' },
  'Tạo Báo Cáo Ngay': { vi: 'Tạo Báo Cáo Ngay', en: 'Generate Report Now', ja: '今すぐレポート生成', zh: '立即生成报表' },
  'Lịch Gửi Tự Động': { vi: 'Lịch Gửi Tự Động', en: 'Automated Schedules', ja: '自動送信スケジュール', zh: '自动发送计划' },
  'Kho Lưu Báo Cáo': { vi: 'Kho Lưu Báo Cáo', en: 'Report Archive', ja: 'レポートアーカイブ', zh: '报表归档库' },
  'Bàn Giao Ca': { vi: 'Bàn Giao Ca', en: 'Shift Handover Audit', ja: 'シフト引き継ぎ', zh: '交接班审计' },
  'Trợ Lý AI HAT Copilot': { vi: 'Trợ Lý AI HAT Copilot', en: 'HAT AI Copilot', ja: 'HAT AIコパイロット', zh: 'HAT AI 智能助手' },
  'Gửi': { vi: 'Gửi', en: 'Send', ja: '送信', zh: '发送' },
  'Xóa Lịch Sử Chat': { vi: 'Xóa Lịch Sử Chat', en: 'Clear History', ja: '履歴消去', zh: '清除历史' },
  'Cấu hình API Key Google Gemini AI': { vi: 'Cấu hình API Key Google Gemini AI', en: 'Google Gemini AI Key Config', ja: 'Google Gemini AIキー設定', zh: 'Google Gemini AI 密钥配置' },
  'Mô Phỏng PLC (Simulation Mode)': { vi: 'Mô Phỏng PLC (Simulation Mode)', en: 'PLC Simulation Mode', ja: 'PLCシミュレーションモード', zh: 'PLC 模拟模式' },
  'Âm Thanh Cảnh Báo': { vi: 'Âm Thanh Cảnh Báo', en: 'Sound Alerts', ja: '音声アラート', zh: '声音报警' },
  'Quản Lý Người Dùng & Phân Quyền': { vi: 'Quản Lý Người Dùng & Phân Quyền', en: 'User Management & Roles', ja: 'ユーザー管理＆権限', zh: '用户管理与权限' },
  'Chi tiết': { vi: 'Chi tiết', en: 'Details', ja: '詳細', zh: '详情' },
  'Sản lượng:': { vi: 'Sản lượng:', en: 'Output:', ja: '生産量:', zh: '产量:' },
  'Điều khiển': { vi: 'Điều khiển', en: 'Control', ja: '制御', zh: '控制' },
  'Tốc độ / RPM': { vi: 'Tốc độ / RPM', en: 'Speed / RPM', ja: '速度 / RPM', zh: '速度 / RPM' },
  'Nhiệt độ': { vi: 'Nhiệt độ', en: 'Temperature', ja: '温度', zh: '温度' },
  'Sự Cố Cảnh Báo Cần Xử Lý Ngay': { vi: 'Sự Cố Cảnh Báo Cần Xử Lý Ngay', en: 'Critical Alarms Requiring Action', ja: '即時対応が必要なアラーム', zh: '需要立即处理的紧急报警' },
  'Xem toàn bộ lịch sử cảnh báo': { vi: 'Xem toàn bộ lịch sử cảnh báo', en: 'View full alarm history', ja: '全アラーム履歴を表示', zh: '查看全部报警历史' },
  'Xác nhận': { vi: 'Xác nhận', en: 'Acknowledge', ja: '確認', zh: '确认' },
  'Phân tích AI': { vi: 'Phân tích AI', en: 'AI Analysis', ja: 'AI分析', zh: 'AI 分析' },
  'Giá trị:': { vi: 'Giá trị:', en: 'Value:', ja: '値:', zh: '数值:' },
  'Ngưỡng:': { vi: 'Ngưỡng:', en: 'Limit:', ja: 'しきい値:', zh: '阈值:' },
  'Sơ Đồ Dây Chuyền Sản Xuất Thời Gian Thực (Factory Floor Mimic)': {
    vi: 'Sơ Đồ Dây Chuyền Sản Xuất Thời Gian Thực (Factory Floor Mimic)',
    en: 'Real-Time Factory Floor Mimic Diagram',
    ja: 'リアルタイム生産ライン構造図 (Factory Floor Mimic)',
    zh: '实时生产线模拟示意图 (Factory Floor Mimic)'
  },
  'Cập nhật trực tiếp từ PLC Driver (100ms cycle)': {
    vi: 'Cập nhật trực tiếp từ PLC Driver (100ms cycle)',
    en: 'Live streaming from PLC Drivers (100ms scan cycle)',
    ja: 'PLCドライバーからのリアルタイム更新 (100ms周期)',
    zh: '从 PLC 驱动器实时更新 (100ms 周期)'
  },
  'Chi Tiết Máy & Trạng Thái PLC (Machine Cards)': {
    vi: 'Chi Tiết Trạng Thái Máy',
    en: 'Machine Status Details',
    ja: '機器状態の詳細',
    zh: '设备状态详情'
  },
  'TỔNG CỘNG': { vi: 'Tổng cộng', en: 'Total', ja: '合計', zh: '总计' },
  'TỐC ĐỘ': { vi: 'Tốc độ', en: 'Speed', ja: '速度', zh: '速度' },
  'NHIỆT ĐỘ': { vi: 'Nhiệt độ', en: 'Temperature', ja: '温度', zh: '温度' },
  'ÁP SUẤT': { vi: 'Áp suất', en: 'Pressure', ja: '圧力', zh: '压力' },
  'Sản lượng (OK / Total):': {
    vi: 'Sản lượng (OK / Tổng):',
    en: 'Output (OK / Total):',
    ja: '生産量 (OK / 合計):',
    zh: '产量 (合格 / 总计):'
  },
  'Cycle Time (Thực / Mục tiêu):': {
    vi: 'Cycle Time (Thực / Mục tiêu):',
    en: 'Cycle Time (Actual / Target):',
    ja: 'サイクルタイム (実績 / 目標):',
    zh: '周期时间 (实际 / 目标):'
  },
  'OEE Hiệu suất:': {
    vi: 'OEE Hiệu suất:',
    en: 'OEE Efficiency:',
    ja: 'OEE 効率:',
    zh: 'OEE 综合效率:'
  },
  'Chi Tiết Máy': { vi: 'Chi Tiết Máy', en: 'Machine Details', ja: '機器詳細', zh: '设备详情' },
  'Đang chạy': { vi: 'Đang chạy', en: 'Running', ja: '運転中', zh: '运行中' },
  'Chờ': { vi: 'Chờ', en: 'Idle', ja: '待機中', zh: '空闲' },
  'Dừng': { vi: 'Dừng', en: 'Stopped', ja: '停止中', zh: '停止' },
  'Cảnh báo': { vi: 'Cảnh báo', en: 'Alarm', ja: 'アラーム', zh: '报警' },
  'Bảo trì': { vi: 'Bảo trì', en: 'Maintenance', ja: 'メンテナンス', zh: '维护' },
  'Tổng cộng:': { vi: 'Tổng cộng:', en: 'Total:', ja: '合計:', zh: '总计:' },
  'Máy': { vi: 'Máy', en: 'Machines', ja: '台', zh: '台设备' }
};

export interface Translations {
  // Navigation & Sections
  monitoring: string;
  controlEngineering: string;
  analyticsMes: string;
  intelligence: string;
  deepLearningFolder: string;
  
  mainDashboard: string;
  machinesTwin: string;
  liveTagMonitor: string;
  tagManagement: string;
  plcCommunication: string;
  alarmManagement: string;
  notificationCenter: string;
  historianDatabase: string;
  oeeAnalytics: string;
  reportManagement: string;
  aiCopilot: string;
  globalSettings: string;

  // Header & Status
  plantOee: string;
  output: string;
  plcRackOnline: string;
  driversSync: string;
  role: string;
  languageSelect: string;
  soundAlerts: string;

  // Common Controls & Statuses
  search: string;
  filter: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  upload: string;
  close: string;
  back: string;
  next: string;
  confirm: string;
  status: string;
  online: string;
  offline: string;
  active: string;
  idle: string;
  alarm: string;
  running: string;
  maintenance: string;

  // Factory Command Center & Dashboard
  factoryCommandCenter: string;
  factoryTitle: string;
  factorySubtitle: string;
  aiQuickEval: string;
  viewOeeDetail: string;
  targetOutput: string;
  shiftOutput: string;
  powerUsage: string;
  runningLines: string;
  activeAlarmsCountLabel: string;
  machineStatusOverview: string;
  machineCode: string;
  speed: string;
  okRate: string;
  temperature: string;
  actions: string;
  diagnoseAi: string;

  // Digital Twin & Machines
  digitalTwinTitle: string;
  digitalTwinDesc: string;
  machineGrid: string;
  controlPanel: string;
  startMachine: string;
  stopMachine: string;
  maintenanceMode: string;
  resetError: string;
  cycleTime: string;
  spindleSpeed: string;
  vibrationRms: string;
  hydraulicPressure: string;

  // Tags (Live & Studio)
  liveTagTitle: string;
  liveTagDesc: string;
  tagStudioTitle: string;
  tagStudioDesc: string;
  tagAddress: string;
  tagName: string;
  dataType: string;
  currentValue: string;
  unit: string;
  quality: string;
  driverName: string;
  scanRate: string;
  writeTag: string;
  forceValue: string;
  addTag: string;
  editTag: string;
  readOnly: string;

  // PLC Communication
  plcTitle: string;
  plcDesc: string;
  rackStatus: string;
  ipAddress: string;
  protocol: string;
  scanCycle: string;
  connect: string;
  disconnect: string;
  memoryInspector: string;
  pingDiagnostic: string;
  hierarchyExplorer: string;

  // Alarms
  alarmTitle: string;
  alarmDesc: string;
  activeAlarmsTab: string;
  alarmHistoryTab: string;
  severity: string;
  timestamp: string;
  acknowledge: string;
  clearAlarm: string;
  suppress: string;
  exportCsv: string;

  // Historian & OEE
  historianTitle: string;
  historianDesc: string;
  timeRange: string;
  last1Hour: string;
  last8Hours: string;
  last24Hours: string;
  last7Days: string;
  minValue: string;
  maxValue: string;
  avgValue: string;
  oeeTitle: string;
  oeeDesc: string;
  availability: string;
  performance: string;
  qualityRate: string;
  sixBigLosses: string;
  downtimeAnalysis: string;

  // AI Copilot & Knowledge Base
  aiApiKeyConfig: string;
  apiKeyPrompt: string;
  testConnection: string;
  modelSelect: string;
  temperatureLabel: string;
  knowledgeBaseTitle: string;
  knowledgeBaseDesc: string;
  uploadEquipmentDoc: string;
  docCategory: string;
  targetDevice: string;
  indexedStatus: string;
  vectorChunks: string;
  previewDoc: string;
  ragContextActive: string;

  // Email & Notifications
  emailConfigTitle: string;
  smtpServer: string;
  smtpPort: string;
  senderEmail: string;
  recipientList: string;
  testEmail: string;
  sendEmailReport: string;
  emailSubject: string;
  emailBody: string;
  emailSentSuccess: string;
  emailSentError: string;

  // Reports
  generateReport: string;
  reportArchive: string;
  downloadReport: string;
  emailReportToRecipients: string;
  shiftReportTitle: string;
  exportPdf: string;
  exportExcel: string;
}

export const translations: Record<LanguageCode, Translations> = {
  vi: {
    monitoring: 'GIÁM SÁT SẢN XUẤT',
    controlEngineering: 'ĐIỀU KHIỂN & KỸ THUẬT',
    analyticsMes: 'PHÂN TÍCH & DỮ LIỆU MES',
    intelligence: 'TRÍ TUỆ NHÂN TẠO & RAG',
    deepLearningFolder: 'Thư Mục Deep Learning',

    mainDashboard: 'Tổng Quan Nhà Máy',
    machinesTwin: 'Digital Twin & Thiết Bị',
    liveTagMonitor: 'Giám Sát Tag Trực Tuyến',
    tagManagement: 'Quản Lý Cấu Hình Tag',
    plcCommunication: 'Truyền Thông PLC',
    alarmManagement: 'Quản Lý Cảnh Báo',
    notificationCenter: 'Trung Tâm Thông Báo & Mail',
    historianDatabase: 'Cơ Sở Dữ Liệu Historian',
    oeeAnalytics: 'Phân Tích OEE & Losses',
    reportManagement: 'Quản Lý Báo Cáo',
    aiCopilot: 'HAT AI Copilot',
    globalSettings: 'Cấu Hình Hệ Thống',

    plantOee: 'OEE TOÀN XƯỞNG',
    output: 'SẢN LƯỢNG',
    plcRackOnline: 'TỦ PLC: TRỰC TUYẾN',
    driversSync: '5 DRIVERS KẾT NỐI',
    role: 'VAI TRÒ',
    languageSelect: 'Ngôn Ngữ',
    soundAlerts: 'Âm Thanh Cảnh Báo',

    search: 'Tìm kiếm...',
    filter: 'Lọc',
    save: 'Lưu Lại',
    cancel: 'Hủy Bỏ',
    delete: 'Xóa',
    edit: 'Chỉnh Sửa',
    upload: 'Tải Lên File',
    close: 'Đóng',
    back: 'Quay Lại',
    next: 'Tiếp Theo',
    confirm: 'Xác Nhận',
    status: 'Trạng Thái',
    online: 'Trực Tuyến',
    offline: 'Ngoại Tuyến',
    active: 'Kích Hoạt',
    idle: 'Chờ Máy',
    alarm: 'Báo Động',
    running: 'Đang Chạy',
    maintenance: 'Bảo Trì',

    factoryCommandCenter: 'TRUNG TÂM ĐIỀU HÀNH SẢN XUẤT SMART FACTORY',
    factoryTitle: 'Giám Sát & Điều Khiển Toàn Nhà Máy',
    factorySubtitle: 'Kết nối các dây chuyền tự động hóa qua Keyence MC Protocol, Siemens S7, Mitsubishi & OPC UA',
    aiQuickEval: 'AI Đánh Giá Nhanh Toàn Xưởng',
    viewOeeDetail: 'Xem Chi Tiết OEE',
    targetOutput: 'Mục Tiêu Sản Lượng',
    shiftOutput: 'Sản Lượng Ca Hiện Tại',
    powerUsage: 'Công Suất Tiêu Thụ',
    runningLines: 'Dây Chuyển Đang Hoạt Động',
    activeAlarmsCountLabel: 'Cảnh Báo Đang Kích Hoạt',
    machineStatusOverview: 'Tổng Quan Trạng Thái Máy',
    machineCode: 'Mã Máy',
    speed: 'Tốc Độ Chạy',
    okRate: 'Tỷ Lệ Hàng Đạt (OK)',
    temperature: 'Nhiệt Độ Trục',
    actions: 'Thao Tác',
    diagnoseAi: 'Chẩn Đoán AI',

    digitalTwinTitle: 'Mô Phỏng Digital Twin & Điều Khiển Máy',
    digitalTwinDesc: 'Giám sát 3D thời gian thực, thông số trục chính, cảm biến rung động & điều khiển chạy/dừng khẩn',
    machineGrid: 'Lưới Thiết Bị Nhà Máy',
    controlPanel: 'Bảng Điều Khiển Thiết Bị',
    startMachine: 'Khởi Động Máy',
    stopMachine: 'Dừng Máy Khẩn',
    maintenanceMode: 'Chuyển Bảo Trì',
    resetError: 'Reset Lỗi PLC',
    cycleTime: 'Thời Gian Chu Kỳ',
    spindleSpeed: 'Tốc Độ Spindle',
    vibrationRms: 'Độ Rung RMS',
    hydraulicPressure: 'Áp Suất Thủy Lực',

    liveTagTitle: 'Giám Sát Tag Trực Tuyến Thời Gian Thực',
    liveTagDesc: 'Theo dõi giá trị thanh ghi PLC, chất lượng tín hiệu & ghi đè cưỡng bức',
    tagStudioTitle: 'Quản Lý Danh Mục & Địa Chỉ Tag SCADA',
    tagStudioDesc: 'Cấu hình địa chỉ PLC memory map, thang đo Scaling, cảnh báo ngưỡng High/Low',
    tagAddress: 'Địa Chỉ PLC',
    tagName: 'Tên Tag SCADA',
    dataType: 'Kiểu Dữ Liệu',
    currentValue: 'Giá Trị Hiện Tại',
    unit: 'Đơn Vị',
    quality: 'Chất Lượng Tín Hiệu',
    driverName: 'Driver Truyền Thông',
    scanRate: 'Chu Kỳ Quét (ms)',
    writeTag: 'Ghi Giá Trị',
    forceValue: 'Cưỡng Bức Giá Trị',
    addTag: 'Thêm Tag Mới',
    editTag: 'Sửa Tag',
    readOnly: 'Chỉ Đọc',

    plcTitle: 'Tủ Truyền Thông PLC & Driver Mạng Industrial Network',
    plcDesc: 'Giám sát kết nối Keyence KV, Siemens S7-1500, Mitsubishi Q-Series & Modbus TCP Server',
    rackStatus: 'Trạng Thái Tủ Rack',
    ipAddress: 'Địa Chỉ IP',
    protocol: 'Giao Thức',
    scanCycle: 'Chu Kỳ Quét PLC',
    connect: 'Kết Nối',
    disconnect: 'Ngắt Kết Nối',
    memoryInspector: 'Soi Bộ Nhớ PLC',
    pingDiagnostic: 'Kiểm Tra Ping Network',
    hierarchyExplorer: 'Cây Cấu Trúc Thiết Bị',

    alarmTitle: 'Trung Tâm Giám Sát & Xử Lý Cảnh Báo SCADA',
    alarmDesc: 'Tự động phát hiện lỗi quá nhiệt, áp suất, dừng khẩn và thông báo thời gian thực',
    activeAlarmsTab: 'Cảnh Báo Đang Kích Hoạt',
    alarmHistoryTab: 'Lịch Sử Cảnh Báo',
    severity: 'Mức Độ Nghiêm Trọng',
    timestamp: 'Thời Gian',
    acknowledge: 'Xác Nhận Lỗi (Ack)',
    clearAlarm: 'Xóa Cảnh Báo',
    suppress: 'Bỏ Qua Cảnh Báo',
    exportCsv: 'Xuất File CSV',

    historianTitle: 'Cơ Sở Dữ Liệu Historian & Trend Đồ Thị',
    historianDesc: 'Lưu trữ chuỗi thời gian time-series, truy vấn lịch sử biến số SCADA',
    timeRange: 'Khoảng Thời Gian',
    last1Hour: '1 Giờ Qua',
    last8Hours: '8 Giờ Qua (1 Ca)',
    last24Hours: '24 Giờ Qua (1 Ngày)',
    last7Days: '7 Ngày Qua',
    minValue: 'Giá Trị Nhỏ Nhất',
    maxValue: 'Giá Trị Lớn Nhất',
    avgValue: 'Giá Trị Trung Bình',
    oeeTitle: 'Phân Tích OEE & Losses Nhà Máy',
    oeeDesc: 'Đánh giá Availability, Performance, Quality và 6 tổn thất lớn trong sản xuất',
    availability: 'Mức Khả Dụng (A)',
    performance: 'Hiệu Suất Vận Hành (P)',
    qualityRate: 'Tỷ Lệ Chất Lượng (Q)',
    sixBigLosses: '6 Loss Lớn Trong Sản Xuất',
    downtimeAnalysis: 'Phân Tích Nguyên Nhân Dừng Máy',

    aiApiKeyConfig: 'Cấu Hình API Key Google Gemini AI',
    apiKeyPrompt: 'Nhập API Key Gemini (VD: AIzaSy...):',
    testConnection: 'Kiểm Tra Kết Nối AI',
    modelSelect: 'Chọn Mô Hình AI Gemini:',
    temperatureLabel: 'Độ Linh Hoạt (Temperature):',
    knowledgeBaseTitle: 'Thư Mục Tài Liệu Deep Learning (RAG)',
    knowledgeBaseDesc: 'Lưu trữ tài liệu thiết bị, sổ tay PLC & quy trình xử lý lỗi cho AI Copilot',
    uploadEquipmentDoc: 'Tải Lên Tài Liệu Thiết Bị',
    docCategory: 'Danh Mục Tài Liệu',
    targetDevice: 'Thiết Bị Mục Tiêu',
    indexedStatus: 'Đã Đánh Chỉ Mục RAG',
    vectorChunks: 'Số Lượng Vector Chunks',
    previewDoc: 'Xem Nội Dung Tài Liệu',
    ragContextActive: 'Đã Kích Hoạt RAG Knowledge Context',

    emailConfigTitle: 'Cấu Hình Máy Chủ Email SMTP',
    smtpServer: 'Máy Chủ SMTP',
    smtpPort: 'Cổng SMTP',
    senderEmail: 'Email Gửi',
    recipientList: 'Danh Sách Người Nhận',
    testEmail: 'Gửi Email Thử Nghiệm',
    sendEmailReport: 'Gửi Báo Cáo Qua Email',
    emailSubject: 'Tiêu Đề Email',
    emailBody: 'Nội Dung Email',
    emailSentSuccess: 'Đã Gửi Email Thành Công!',
    emailSentError: 'Thất Bại Khi Gửi Email!',

    generateReport: 'Tạo Báo Cáo',
    reportArchive: 'Kho Lưu Báo Cáo',
    downloadReport: 'Tải Báo Cáo',
    emailReportToRecipients: 'Gửi Email Cho Người Nhận',
    shiftReportTitle: 'Báo Cáo Sản Xuất Ca & OEE',
    exportPdf: 'Xuất File PDF',
    exportExcel: 'Xuất File Excel'
  },
  en: {
    monitoring: 'PRODUCTION MONITORING',
    controlEngineering: 'CONTROL & ENGINEERING',
    analyticsMes: 'ANALYTICS & MES DATA',
    intelligence: 'AI & DEEP LEARNING RAG',
    deepLearningFolder: 'Deep Learning Knowledge',

    mainDashboard: 'Plant Main Dashboard',
    machinesTwin: 'Digital Twin & Equipment',
    liveTagMonitor: 'Live Tag Monitor',
    tagManagement: 'Tag Studio Management',
    plcCommunication: 'PLC Communication',
    alarmManagement: 'Alarm Management',
    notificationCenter: 'Notification & Email Center',
    historianDatabase: 'Historian Database',
    oeeAnalytics: 'OEE & Loss Analytics',
    reportManagement: 'Report Management',
    aiCopilot: 'HAT AI Copilot',
    globalSettings: 'Global Configuration',

    plantOee: 'PLANT OEE',
    output: 'OUTPUT',
    plcRackOnline: 'PLC RACK: ONLINE',
    driversSync: '5 DRIVERS CONNECTED',
    role: 'ROLE',
    languageSelect: 'Language',
    soundAlerts: 'Sound Alerts',

    search: 'Search...',
    filter: 'Filter',
    save: 'Save Changes',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    upload: 'Upload Document',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    confirm: 'Confirm',
    status: 'Status',
    online: 'Online',
    offline: 'Offline',
    active: 'Active',
    idle: 'Idle',
    alarm: 'Alarm',
    running: 'Running',
    maintenance: 'Maintenance',

    factoryCommandCenter: 'SMART FACTORY COMMAND CENTER',
    factoryTitle: 'Plant-Wide Monitoring & Control',
    factorySubtitle: 'Automated lines connected via Keyence MC Protocol, Siemens S7, Mitsubishi & OPC UA',
    aiQuickEval: 'AI Plant Health Triage',
    viewOeeDetail: 'View OEE Breakdown',
    targetOutput: 'Shift Output Target',
    shiftOutput: 'Current Shift Production',
    powerUsage: 'Power Consumption',
    runningLines: 'Active Production Lines',
    activeAlarmsCountLabel: 'Active Alarms',
    machineStatusOverview: 'Machine Status Overview',
    machineCode: 'Machine Code',
    speed: 'Operating Speed',
    okRate: 'Quality OK Rate',
    temperature: 'Spindle Temp',
    actions: 'Actions',
    diagnoseAi: 'AI Diagnose',

    digitalTwinTitle: 'Digital Twin Simulation & Machine Control',
    digitalTwinDesc: 'Real-time 3D monitoring, spindle metrics, vibration sensors & E-stop control',
    machineGrid: 'Plant Equipment Grid',
    controlPanel: 'Equipment Control Panel',
    startMachine: 'Start Machine',
    stopMachine: 'Emergency Stop',
    maintenanceMode: 'Maintenance Mode',
    resetError: 'Reset PLC Fault',
    cycleTime: 'Cycle Time',
    spindleSpeed: 'Spindle Speed',
    vibrationRms: 'Vibration RMS',
    hydraulicPressure: 'Hydraulic Pressure',

    liveTagTitle: 'Real-Time Live Tag Monitor',
    liveTagDesc: 'Track PLC registers, signal quality & force override values',
    tagStudioTitle: 'SCADA Tag Studio & Address Management',
    tagStudioDesc: 'Configure PLC memory map addresses, scaling, and high/low threshold alarms',
    tagAddress: 'PLC Address',
    tagName: 'SCADA Tag Name',
    dataType: 'Data Type',
    currentValue: 'Current Value',
    unit: 'Unit',
    quality: 'Signal Quality',
    driverName: 'Communication Driver',
    scanRate: 'Scan Cycle (ms)',
    writeTag: 'Write Value',
    forceValue: 'Force Value',
    addTag: 'Add New Tag',
    editTag: 'Edit Tag',
    readOnly: 'Read Only',

    plcTitle: 'PLC Communication Rack & Industrial Drivers',
    plcDesc: 'Monitor Keyence KV, Siemens S7-1500, Mitsubishi Q-Series & Modbus TCP drivers',
    rackStatus: 'Rack Status',
    ipAddress: 'IP Address',
    protocol: 'Protocol',
    scanCycle: 'Scan Cycle',
    connect: 'Connect',
    disconnect: 'Disconnect',
    memoryInspector: 'Memory Inspector',
    pingDiagnostic: 'Ping Diagnostics',
    hierarchyExplorer: 'Hierarchy Explorer',

    alarmTitle: 'SCADA Alarm Triage & Incident Center',
    alarmDesc: 'Automated detection for overheat, pressure loss, emergency trips, and real-time alerts',
    activeAlarmsTab: 'Active Alarms',
    alarmHistoryTab: 'Alarm History Logs',
    severity: 'Severity',
    timestamp: 'Timestamp',
    acknowledge: 'Acknowledge (Ack)',
    clearAlarm: 'Clear Alarm',
    suppress: 'Suppress Alarm',
    exportCsv: 'Export CSV',

    historianTitle: 'Historian Time-Series Database & Trends',
    historianDesc: 'High-speed time-series storage and historical trend analytics for SCADA tags',
    timeRange: 'Time Range',
    last1Hour: 'Last 1 Hour',
    last8Hours: 'Last 8 Hours (1 Shift)',
    last24Hours: 'Last 24 Hours (1 Day)',
    last7Days: 'Last 7 Days',
    minValue: 'Minimum Value',
    maxValue: 'Maximum Value',
    avgValue: 'Average Value',
    oeeTitle: 'OEE & Loss Analytics Dashboard',
    oeeDesc: 'Evaluate Availability, Performance, Quality, and Six Big Losses in production',
    availability: 'Availability (A)',
    performance: 'Performance (P)',
    qualityRate: 'Quality Rate (Q)',
    sixBigLosses: 'Six Big Losses',
    downtimeAnalysis: 'Downtime Root Cause Analysis',

    aiApiKeyConfig: 'Google Gemini AI API Key Configuration',
    apiKeyPrompt: 'Enter Gemini API Key (e.g., AIzaSy...):',
    testConnection: 'Test AI Connection',
    modelSelect: 'Select Gemini AI Model:',
    temperatureLabel: 'Temperature Creativity:',
    knowledgeBaseTitle: 'Deep Learning Document Base (RAG)',
    knowledgeBaseDesc: 'Equipment manuals, PLC guides & troubleshooting docs for AI Copilot',
    uploadEquipmentDoc: 'Upload Equipment Manual',
    docCategory: 'Document Category',
    targetDevice: 'Target Machine',
    indexedStatus: 'RAG Vector Indexed',
    vectorChunks: 'Vector Chunks Count',
    previewDoc: 'Preview Document Content',
    ragContextActive: 'RAG Knowledge Context Active',

    emailConfigTitle: 'SMTP Email Server Configuration',
    smtpServer: 'SMTP Host',
    smtpPort: 'SMTP Port',
    senderEmail: 'Sender Email Address',
    recipientList: 'Recipient Contacts',
    testEmail: 'Send Test Email',
    sendEmailReport: 'Send Report via Email',
    emailSubject: 'Email Subject',
    emailBody: 'Email Body',
    emailSentSuccess: 'Email Dispatched Successfully!',
    emailSentError: 'Email Dispatch Failed!',

    generateReport: 'Generate Report',
    reportArchive: 'Report Archive',
    downloadReport: 'Download File',
    emailReportToRecipients: 'Email Report to Recipients',
    shiftReportTitle: 'Shift Production & OEE Audit Report',
    exportPdf: 'Export PDF',
    exportExcel: 'Export Excel'
  },
  ja: {
    monitoring: '生産監視',
    controlEngineering: '制御＆エンジニアリング',
    analyticsMes: 'MESデータ＆分析',
    intelligence: 'AI＆ディープラーニングRAG',
    deepLearningFolder: 'ディープラーニング文書',

    mainDashboard: '工場メインダッシュボード',
    machinesTwin: 'デジタルツイン＆機器',
    liveTagMonitor: 'リアルタイムタグ監視',
    tagManagement: 'タグスタジオ管理',
    plcCommunication: 'PLC通信ドライバ',
    alarmManagement: 'アラーム管理',
    notificationCenter: '通知＆メールセンター',
    historianDatabase: 'ヒストリアンデータベース',
    oeeAnalytics: 'OEE・ロス分析',
    reportManagement: 'レポート管理',
    aiCopilot: 'HAT AIコパイロット',
    globalSettings: 'グローバルシステム設定',

    plantOee: '工場全体OEE',
    output: '生産量',
    plcRackOnline: 'PLCラック: オンライン',
    driversSync: '5ドライバ接続完了',
    role: '権限',
    languageSelect: '言語選択',
    soundAlerts: '音声アラート',

    search: '検索...',
    filter: 'フィルター',
    save: '保存する',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    upload: 'ファイルをアップロード',
    close: '閉じる',
    back: '戻る',
    next: '次へ',
    confirm: '確認',
    status: 'ステータス',
    online: 'オンライン',
    offline: 'オフライン',
    active: 'アクティブ',
    idle: '待機中',
    alarm: 'アラーム',
    running: '運転中',
    maintenance: 'メンテナンス中',

    factoryCommandCenter: 'スマートファクトリー統合コマンドセンター',
    factoryTitle: '工場全体のリアルタイム監視＆制御',
    factorySubtitle: 'Keyence MC Protocol、Siemens S7、Mitsubishi Qシリーズ、OPC UA経由で自動化ラインを同期',
    aiQuickEval: 'AI工場健全性診断',
    viewOeeDetail: 'OEE詳細表示',
    targetOutput: '目標生産量',
    shiftOutput: '現在のシフト生産量',
    powerUsage: '消費電力',
    runningLines: '稼働中ライン数',
    activeAlarmsCountLabel: 'アクティブアラーム',
    machineStatusOverview: '機器ステータス概要',
    machineCode: '機器コード',
    speed: '稼働速度',
    okRate: '良品率 (OK)',
    temperature: '主軸温度',
    actions: '操作',
    diagnoseAi: 'AI診断',

    digitalTwinTitle: 'デジタルツインシミュレーション＆機器制御',
    digitalTwinDesc: '3Dリアルタイム監視、主軸データ、振動センサーおよび非常停止制御',
    machineGrid: '工場設備グリッド',
    controlPanel: '設備制御パネル',
    startMachine: '機器起動',
    stopMachine: '非常停止',
    maintenanceMode: 'メンテナンスモード',
    resetError: 'PLCエラーリセット',
    cycleTime: 'サイクルタイム',
    spindleSpeed: '主軸回転数',
    vibrationRms: '振動RMS',
    hydraulicPressure: '油圧圧力',

    liveTagTitle: 'リアルタイムタグ監視',
    liveTagDesc: 'PLCレジスタ値、信号品質および手動オーバーライドの監視',
    tagStudioTitle: 'SCADAタグスタジオ＆アドレス管理',
    tagStudioDesc: 'PLCメモリマップアドレス、スケーリング、上限/下限アラーム閾値の設定',
    tagAddress: 'PLCアドレス',
    tagName: 'SCADAタグ名',
    dataType: 'データ型',
    currentValue: '現在値',
    unit: '単位',
    quality: '信号品質',
    driverName: '通信ドライバ',
    scanRate: 'スキャン周期 (ms)',
    writeTag: '値書き込み',
    forceValue: '値強制設定',
    addTag: '新規タグ追加',
    editTag: 'タグ編集',
    readOnly: '読み取り専用',

    plcTitle: 'PLC通信ラック＆産業用ネットワークドライバ',
    plcDesc: 'Keyence KV、Siemens S7-1500、Mitsubishi Qシリーズ、Modbus TCPのリアルタイム監視',
    rackStatus: 'ラックステータス',
    ipAddress: 'IPアドレス',
    protocol: 'プロトコル',
    scanCycle: 'スキャン周期',
    connect: '接続',
    disconnect: '切断',
    memoryInspector: 'メモリインスペクター',
    pingDiagnostic: 'Pingネットワーク診断',
    hierarchyExplorer: '階層エクスプローラー',

    alarmTitle: 'SCADAアラーム管理＆障害対応センター',
    alarmDesc: '過熱、圧力低下、非常停止の自動検知およびリアルタイムアラート',
    activeAlarmsTab: '発生中アラーム',
    alarmHistoryTab: 'アラーム履歴ログ',
    severity: '重大度',
    timestamp: '発生日時',
    acknowledge: '確認 (Ack)',
    clearAlarm: 'アラーム解除',
    suppress: '抑制',
    exportCsv: 'CSV出力',

    historianTitle: 'ヒストリアン時系列データベース＆トレンド分析',
    historianDesc: 'SCADAタグデータの高速時系列ストレージおよび履歴分析',
    timeRange: '時間範囲',
    last1Hour: '過去1時間',
    last8Hours: '過去8時間 (1シフト)',
    last24Hours: '過去24時間 (1日)',
    last7Days: '過去7日間',
    minValue: '最小値',
    maxValue: '最大値',
    avgValue: '平均値',
    oeeTitle: 'OEE＆ロス分析ダッシュボード',
    oeeDesc: '稼働率、性能稼働率、良品率および製造現場の6大ロスの詳細評価',
    availability: '稼働率 (A)',
    performance: '性能稼働率 (P)',
    qualityRate: '良品率 (Q)',
    sixBigLosses: '製造現場の6大ロス',
    downtimeAnalysis: '停止原因の要因分析',

    aiApiKeyConfig: 'Google Gemini AI APIキー設定',
    apiKeyPrompt: 'Gemini APIキーを入力 (例: AIzaSy...):',
    testConnection: 'AI接続テスト',
    modelSelect: 'Gemini AIモデル選択:',
    temperatureLabel: '創造性パラメーター (Temperature):',
    knowledgeBaseTitle: 'ディープラーニングナレッジベース (RAG)',
    knowledgeBaseDesc: 'AIコパイロット用の設備マニュアル、PLC手順書、エラー対応ナレッジ',
    uploadEquipmentDoc: '設備マニュアルアップロード',
    docCategory: '文書カテゴリー',
    targetDevice: '対象機器',
    indexedStatus: 'RAGインデックス作成済み',
    vectorChunks: 'ベクトルチャンク数',
    previewDoc: '文書プレビュー',
    ragContextActive: 'RAGナレッジコンテキスト有効化',

    emailConfigTitle: 'SMTPメールサーバー設定',
    smtpServer: 'SMTPサーバー',
    smtpPort: 'SMTPポート',
    senderEmail: '送信元メールアドレス',
    recipientList: '受信者リスト',
    testEmail: 'テストメール送信',
    sendEmailReport: 'メールでレポート送信',
    emailSubject: '件名',
    emailBody: 'メール本文',
    emailSentSuccess: 'メール送信に成功しました！',
    emailSentError: 'メール送信に失敗しました！',

    generateReport: 'レポート生成',
    reportArchive: 'レポートアーカイブ',
    downloadReport: 'ダウンロード',
    emailReportToRecipients: '受信者にメール送信',
    shiftReportTitle: 'シフト生産＆OEEレポート',
    exportPdf: 'PDF出力',
    exportExcel: 'Excel出力'
  },
  zh: {
    monitoring: '生产监控',
    controlEngineering: '控制与工程',
    analyticsMes: '分析与 MES 数据',
    intelligence: '人工智能与深度学习 RAG',
    deepLearningFolder: '深度学习知识库',

    mainDashboard: '工厂主仪表板',
    machinesTwin: '数字孪生与设备',
    liveTagMonitor: '实时 Tag 监控',
    tagManagement: 'Tag 变量管理',
    plcCommunication: 'PLC 通讯驱动',
    alarmManagement: '报警管理',
    notificationCenter: '通知与邮件中心',
    historianDatabase: 'Historian 历史数据库',
    oeeAnalytics: 'OEE 与损耗分析',
    reportManagement: '报表管理',
    aiCopilot: 'HAT AI 智能助手',
    globalSettings: '全局系统配置',

    plantOee: '全厂 OEE',
    output: '产量',
    plcRackOnline: 'PLC 机架: 在线',
    driversSync: '5 个驱动已同步',
    role: '角色',
    languageSelect: '语言',
    soundAlerts: '声音报警',

    search: '搜索...',
    filter: '筛选',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    upload: '上传文件',
    close: '关闭',
    back: '返回',
    next: '下一步',
    confirm: '确认',
    status: '状态',
    online: '在线',
    offline: '离线',
    active: '已激活',
    idle: '待机',
    alarm: '报警',
    running: '运行中',
    maintenance: '维护中',

    factoryCommandCenter: '智慧工厂生产指挥中心',
    factoryTitle: '全厂实时监控与集中控制',
    factorySubtitle: '通过 Keyence MC Protocol、Siemens S7、Mitsubishi Q 与 OPC UA 协议同步自动化产线',
    aiQuickEval: 'AI 全厂健康评估',
    viewOeeDetail: '查看 OEE 详情',
    targetOutput: '目标产量',
    shiftOutput: '当前班次产量',
    powerUsage: '耗电功率',
    runningLines: '运行中的产线',
    activeAlarmsCountLabel: '当前触发的报警',
    machineStatusOverview: '设备状态总览',
    machineCode: '设备编号',
    speed: '运行速度',
    okRate: '合格率 (OK)',
    temperature: '主轴温度',
    actions: '操作',
    diagnoseAi: 'AI 诊断',

    digitalTwinTitle: '数字孪生仿真与设备控制',
    digitalTwinDesc: '3D 实时监控、主轴参数、振动传感器与急停控制',
    machineGrid: '工厂设备矩阵',
    controlPanel: '设备控制面板',
    startMachine: '启动设备',
    stopMachine: '紧急停止',
    maintenanceMode: '切换维护模式',
    resetError: '复位 PLC 故障',
    cycleTime: '节拍时间',
    spindleSpeed: '主轴转速',
    vibrationRms: '振动 RMS',
    hydraulicPressure: '液压压力',

    liveTagTitle: '实时 Tag 变量监控',
    liveTagDesc: '监控 PLC 寄存器数值、信号质量与强制覆盖控制',
    tagStudioTitle: 'SCADA Tag 变量配置与地址管理',
    tagStudioDesc: '配置 PLC 内存映射地址、缩放比例 Scaling 与高/低阈值报警',
    tagAddress: 'PLC 地址',
    tagName: 'SCADA Tag 名称',
    dataType: '数据类型',
    currentValue: '当前数值',
    unit: '单位',
    quality: '信号质量',
    driverName: '通讯驱动',
    scanRate: '扫描周期 (ms)',
    writeTag: '写入数值',
    forceValue: '强制数值',
    addTag: '添加新 Tag',
    editTag: '编辑 Tag',
    readOnly: '只读',

    plcTitle: 'PLC 通讯机架与工业网络驱动',
    plcDesc: '实时监控 Keyence KV、Siemens S7-1500、Mitsubishi Q 系列与 Modbus TCP 驱动',
    rackStatus: '机架状态',
    ipAddress: 'IP 地址',
    protocol: '通讯协议',
    scanCycle: '扫描周期',
    connect: '连接',
    disconnect: '断开连接',
    memoryInspector: '内存查看器',
    pingDiagnostic: 'Ping 网络诊断',
    hierarchyExplorer: '设备层级树',

    alarmTitle: 'SCADA 报警监控与事故处理中心',
    alarmDesc: '自动检测过热、压力异常、紧急停机与实时预警',
    activeAlarmsTab: '活动中的报警',
    alarmHistoryTab: '报警历史日志',
    severity: '严重程度',
    timestamp: '发生时间',
    acknowledge: '确认报警 (Ack)',
    clearAlarm: '清除报警',
    suppress: '抑制报警',
    exportCsv: '导出 CSV',

    historianTitle: 'Historian 时序数据库与趋势图',
    historianDesc: 'SCADA Tag 变量的高速时序存储与历史趋势分析',
    timeRange: '时间范围',
    last1Hour: '最近 1 小时',
    last8Hours: '最近 8 小时 (1 班次)',
    last24Hours: '最近 24 小时 (1 天)',
    last7Days: '最近 7 天',
    minValue: '最小值',
    maxValue: '最大值',
    avgValue: '平均值',
    oeeTitle: 'OEE 与损耗分析仪表板',
    oeeDesc: '评估时间稼动率 Availability、性能稼动率 Performance、合格率 Quality 与六大损耗',
    availability: '时间稼动率 (A)',
    performance: '性能稼动率 (P)',
    qualityRate: '合格率 (Q)',
    sixBigLosses: '生产六大损耗',
    downtimeAnalysis: '停机根本原因分析',

    aiApiKeyConfig: 'Google Gemini AI API 密钥配置',
    apiKeyPrompt: '输入 Gemini API 密钥 (例如: AIzaSy...):',
    testConnection: '测试 AI 连接',
    modelSelect: '选择 Gemini AI 模型:',
    temperatureLabel: '温度参数 (Temperature):',
    knowledgeBaseTitle: '深度学习文档知识库 (RAG)',
    knowledgeBaseDesc: '存放设备手册、PLC 寄存器图谱与故障排除指南，供 AI 助手智能问答',
    uploadEquipmentDoc: '上传设备文档',
    docCategory: '文档分类',
    targetDevice: '目标设备',
    indexedStatus: '已完成 RAG 向量索引',
    vectorChunks: '向量 Chunk 数量',
    previewDoc: '预览文档内容',
    ragContextActive: 'RAG 知识库上下文已生效',

    emailConfigTitle: 'SMTP 邮件服务器配置',
    smtpServer: 'SMTP 服务器',
    smtpPort: 'SMTP 端口',
    senderEmail: '发件人邮箱',
    recipientList: '收件人列表',
    testEmail: '发送测试邮件',
    sendEmailReport: '通过邮件发送报表',
    emailSubject: '邮件主题',
    emailBody: '邮件正文',
    emailSentSuccess: '邮件发送成功！',
    emailSentError: '邮件发送失败！',

    generateReport: '生成报表',
    reportArchive: '报表归档库',
    downloadReport: '下载文件',
    emailReportToRecipients: '邮件发送给收件人',
    shiftReportTitle: '班次生产与 OEE 审计报表',
    exportPdf: '导出 PDF',
    exportExcel: '导出 Excel'
  }
};
