import {
  PlcDevice,
  Machine,
  Tag,
  AlarmRule,
  AlarmEvent,
  User,
  SystemSettings,
  ProductionReport,
  EmailConfiguration,
  TelegramConfiguration,
  WebhookConfiguration,
  NotificationContact,
  TagNotificationRule,
  AlarmNotificationRule,
  NotificationTemplate,
  NotificationHistoryItem,
  ReportTemplateConfig,
  ReportScheduleConfig,
  GeneratedReportArchiveItem,
  DeepLearningDoc
} from '../types/scada';

export const initialUsers: User[] = [
  {
    id: 'user-01',
    username: 'admin',
    name: 'Hoang (Lead SCADA Architect)',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    email: 'hoang.lead@hatscada.industrial.vn'
  },
  {
    id: 'user-02',
    username: 'engineer_nam',
    name: 'Nam Nguyen (Automation Eng)',
    role: 'Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    email: 'nam.nguyen@hatscada.industrial.vn'
  },
  {
    id: 'user-03',
    username: 'operator_tuan',
    name: 'Tuan Tran (Shift Leader)',
    role: 'Operator',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    email: 'tuan.tran@hatscada.industrial.vn'
  },
  {
    id: 'user-04',
    username: 'viewer_lan',
    name: 'Lan Pham (Plant Director)',
    role: 'Viewer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    email: 'lan.pham@hatscada.industrial.vn'
  }
];

export const initialPlcs: PlcDevice[] = [
  {
    id: 'plc-01',
    name: 'Line01_PLC_Keyence',
    brand: 'Keyence',
    plcType: 'Keyence KV',
    model: 'KV-8000 (Ethernet/IP + MC)',
    ipAddress: '192.168.1.10',
    port: 8501,
    protocol: 'MC Protocol',
    status: 'Connected',
    enabled: true,
    timeoutMs: 2000,
    retryCount: 3,
    scanIntervalMs: 100,
    lastPingMs: 4,
    packetsSent: 184290,
    packetsReceived: 184285,
    errorCount: 0,
    unitNumber: 0,
    factoryName: 'Factory A (Smart Machining & Assembly)',
    areaName: 'Area 01 - Heavy Machining',
    lineName: 'Line 01 - Precision Milling',
    machineId: 'm-01',
    description: 'Main Controller for CNC-01 High-Speed Machining Cell'
  },
  {
    id: 'plc-02',
    name: 'Line02_PLC_Mitsubishi',
    brand: 'Mitsubishi',
    plcType: 'Mitsubishi iQ-R',
    model: 'MELSEC iQ-R (R08CPU)',
    ipAddress: '192.168.1.20',
    port: 5000,
    protocol: 'MC Protocol',
    status: 'Connected',
    enabled: true,
    timeoutMs: 2000,
    retryCount: 3,
    scanIntervalMs: 250,
    lastPingMs: 6,
    packetsSent: 142100,
    packetsReceived: 142090,
    errorCount: 0,
    networkNumber: 1,
    factoryName: 'Factory A (Smart Machining & Assembly)',
    areaName: 'Area 02 - Robotic Fabrication',
    lineName: 'Line 02 - Body Assembly',
    machineId: 'm-02',
    description: 'Controller for ROBOT-02 6-Axis Robotic Welding Station'
  },
  {
    id: 'plc-03',
    name: 'Line03_PLC_Siemens',
    brand: 'Siemens',
    plcType: 'Siemens S7',
    model: 'SIMATIC S7-1500 (CPU 1515-2 PN)',
    ipAddress: '192.168.1.30',
    port: 102,
    protocol: 'Siemens S7',
    status: 'Connected',
    enabled: true,
    timeoutMs: 2000,
    retryCount: 3,
    scanIntervalMs: 100,
    lastPingMs: 5,
    packetsSent: 219800,
    packetsReceived: 219790,
    errorCount: 0,
    rack: 0,
    slot: 1,
    factoryName: 'Factory A (Smart Machining & Assembly)',
    areaName: 'Area 03 - Electronics Cleanroom',
    lineName: 'Line 03 - Electronics SMT',
    machineId: 'm-03',
    description: 'SMT-03 Surface Mount Technology Controller'
  },
  {
    id: 'plc-04',
    name: 'Line04_PLC_Modbus',
    brand: 'Modbus',
    plcType: 'Modbus Device',
    model: 'WAGO 750-881 Modbus Gateway',
    ipAddress: '192.168.1.40',
    port: 502,
    protocol: 'Modbus TCP',
    status: 'Connected',
    enabled: true,
    timeoutMs: 2500,
    retryCount: 3,
    scanIntervalMs: 500,
    lastPingMs: 8,
    packetsSent: 98400,
    packetsReceived: 98380,
    errorCount: 0,
    unitNumber: 1,
    factoryName: 'Factory A (Smart Machining & Assembly)',
    areaName: 'Area 04 - Polymer Processing',
    lineName: 'Line 04 - Plastic Molding',
    machineId: 'm-04',
    description: 'INJECT-04 350T Hydraulic Molding Machine Sensors'
  },
  {
    id: 'plc-05',
    name: 'Line05_PLC_OPCUA',
    brand: 'OPC_UA',
    plcType: 'OPC UA Device',
    model: 'B&R Automation OPC UA Server',
    ipAddress: '192.168.1.50',
    port: 4840,
    protocol: 'OPC UA',
    status: 'Connected',
    enabled: true,
    timeoutMs: 3000,
    retryCount: 3,
    scanIntervalMs: 1000,
    lastPingMs: 7,
    packetsSent: 115200,
    packetsReceived: 115195,
    errorCount: 0,
    factoryName: 'Factory A (Smart Machining & Assembly)',
    areaName: 'Area 05 - Packaging & Logistics',
    lineName: 'Line 05 - Final Packaging',
    machineId: 'm-05',
    description: 'PACK-05 Automated Case Packer & Palletizer'
  }
];

export const initialMachines: Machine[] = [
  {
    id: 'm-01',
    code: 'CNC-01',
    name: '5-Axis High Precision CNC',
    line: 'Line 1 - Precision Milling',
    type: 'Milling Station',
    plcId: 'plc-01',
    status: 'Running',
    runTimeSeconds: 24800,
    downTimeSeconds: 1200,
    idleTimeSeconds: 1800,
    cycleTimeSec: 42.5,
    targetCycleTimeSec: 40.0,
    currentSpeed: 12500, // Spindle RPM
    targetSpeed: 12000,
    totalCount: 580,
    okCount: 568,
    ngCount: 12,
    temperature: 68.4,
    pressure: 6.2,
    vibration: 1.8,
    powerKw: 18.5,
    operatorName: 'Nguyen Van A',
    currentJob: 'JOB-2026-TITANIUM-AERO-01',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'm-02',
    code: 'ROBOT-02',
    name: '6-Axis Laser Welding Cell',
    line: 'Line 2 - Body Assembly',
    type: 'Robotic Cell',
    plcId: 'plc-02',
    status: 'Running',
    runTimeSeconds: 26100,
    downTimeSeconds: 600,
    idleTimeSeconds: 1100,
    cycleTimeSec: 28.0,
    targetCycleTimeSec: 26.0,
    currentSpeed: 100, // % Speed override
    targetSpeed: 100,
    totalCount: 920,
    okCount: 912,
    ngCount: 8,
    temperature: 74.2,
    pressure: 5.8,
    vibration: 2.1,
    powerKw: 24.2,
    operatorName: 'Tran Van B',
    currentJob: 'JOB-2026-CHASSIS-WELD',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'm-03',
    code: 'SMT-03',
    name: 'High-Speed SMT Pick & Place',
    line: 'Line 3 - Electronics SMT',
    type: 'Electronic Assembly',
    plcId: 'plc-03',
    status: 'Alarm',
    runTimeSeconds: 18200,
    downTimeSeconds: 7200,
    idleTimeSeconds: 2400,
    cycleTimeSec: 1.8,
    targetCycleTimeSec: 1.5,
    currentSpeed: 42000, // Components/hour
    targetSpeed: 45000,
    totalCount: 38400,
    okCount: 37950,
    ngCount: 450,
    temperature: 88.6,
    pressure: 6.5,
    vibration: 3.4,
    powerKw: 12.0,
    operatorName: 'Le Thi C',
    currentJob: 'JOB-2026-ECU-MAINBOARD',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'm-04',
    code: 'INJECT-04',
    name: '350T Hydraulic Injection Molding',
    line: 'Line 4 - Plastic Molding',
    type: 'Injection Molding',
    plcId: 'plc-04',
    status: 'Running',
    runTimeSeconds: 25400,
    downTimeSeconds: 1400,
    idleTimeSeconds: 1000,
    cycleTimeSec: 18.5,
    targetCycleTimeSec: 18.0,
    currentSpeed: 180, // Clamping Bar
    targetSpeed: 175,
    totalCount: 1350,
    okCount: 1324,
    ngCount: 26,
    temperature: 215.0, // Barrel melt temp °C
    pressure: 142.0, // Bar
    vibration: 2.8,
    powerKw: 45.0,
    operatorName: 'Pham Van D',
    currentJob: 'JOB-2026-HOUSING-ABS',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'm-05',
    code: 'PACK-05',
    name: 'Automated Case Packer & Palletizer',
    line: 'Line 5 - Final Packaging',
    type: 'Packaging Line',
    plcId: 'plc-05',
    status: 'Idle',
    runTimeSeconds: 21000,
    downTimeSeconds: 2400,
    idleTimeSeconds: 4400,
    cycleTimeSec: 12.0,
    targetCycleTimeSec: 11.5,
    currentSpeed: 30, // Boxes/min
    targetSpeed: 35,
    totalCount: 1720,
    okCount: 1715,
    ngCount: 5,
    temperature: 42.1,
    pressure: 6.0,
    vibration: 1.2,
    powerKw: 14.5,
    operatorName: 'Hoang Van E',
    currentJob: 'JOB-2026-BOX-PALLET-05',
    updatedAt: new Date().toISOString()
  }
];

export const initialTags: Tag[] = [
  // CNC-01 (Keyence KV-8000)
  {
    id: 'tag-01',
    name: 'CNC01.Spindle_RPM',
    description: 'Main spindle rotation speed',
    machineId: 'm-01',
    plcId: 'plc-01',
    address: 'DM100',
    dataType: 'Float',
    unit: 'RPM',
    scale: 1,
    offset: 0,
    scanIntervalMs: 100,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: true,
    currentValue: 12480,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tag-02',
    name: 'CNC01.Spindle_Temp',
    description: 'Spindle bearing thermal probe',
    machineId: 'm-01',
    plcId: 'plc-01',
    address: 'DM102',
    dataType: 'Float',
    unit: '°C',
    scale: 1,
    offset: 0,
    scanIntervalMs: 500,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: true,
    currentValue: 68.4,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tag-03',
    name: 'CNC01.Coolant_Pressure',
    description: 'Through-spindle coolant pressure',
    machineId: 'm-01',
    plcId: 'plc-01',
    address: 'DM104',
    dataType: 'Float',
    unit: 'Bar',
    scale: 1,
    offset: 0,
    scanIntervalMs: 500,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: false,
    currentValue: 6.2,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tag-04',
    name: 'CNC01.Counter_OK',
    description: 'Good production piece counter',
    machineId: 'm-01',
    plcId: 'plc-01',
    address: 'DM200',
    dataType: 'DInt',
    unit: 'Pcs',
    scale: 1,
    offset: 0,
    scanIntervalMs: 1000,
    enableHistorian: true,
    historianRetentionDays: 365,
    isFavorite: true,
    currentValue: 568,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tag-05',
    name: 'CNC01.Counter_NG',
    description: 'Defective piece counter',
    machineId: 'm-01',
    plcId: 'plc-01',
    address: 'DM202',
    dataType: 'DInt',
    unit: 'Pcs',
    scale: 1,
    offset: 0,
    scanIntervalMs: 1000,
    enableHistorian: true,
    historianRetentionDays: 365,
    isFavorite: true,
    currentValue: 12,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tag-06',
    name: 'CNC01.Cycle_Time',
    description: 'Active machining cycle duration',
    machineId: 'm-01',
    plcId: 'plc-01',
    address: 'DM204',
    dataType: 'Float',
    unit: 's',
    scale: 1,
    offset: 0,
    scanIntervalMs: 500,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: false,
    currentValue: 42.5,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tag-07',
    name: 'CNC01.Machine_Status',
    description: 'PLC operational status word (1:Run, 2:Idle, 3:Stop, 4:Alarm)',
    machineId: 'm-01',
    plcId: 'plc-01',
    address: 'MR000',
    dataType: 'Int',
    unit: 'Code',
    scale: 1,
    offset: 0,
    scanIntervalMs: 100,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: true,
    currentValue: 1,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tag-08',
    name: 'CNC01.Power_kW',
    description: 'Real-time electrical power',
    machineId: 'm-01',
    plcId: 'plc-01',
    address: 'DM300',
    dataType: 'Float',
    unit: 'kW',
    scale: 1,
    offset: 0,
    scanIntervalMs: 1000,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: false,
    currentValue: 18.5,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },

  // ROBOT-02 (Mitsubishi MELSEC iQ-R)
  {
    id: 'tag-09',
    name: 'ROBOT02.Laser_Power',
    description: 'Laser welding output intensity',
    machineId: 'm-02',
    plcId: 'plc-02',
    address: 'D500',
    dataType: 'Float',
    unit: 'kW',
    scale: 1,
    offset: 0,
    scanIntervalMs: 100,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: true,
    currentValue: 4.8,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tag-10',
    name: 'ROBOT02.Optics_Temp',
    description: 'Laser collimator optics temperature',
    machineId: 'm-02',
    plcId: 'plc-02',
    address: 'D502',
    dataType: 'Float',
    unit: '°C',
    scale: 1,
    offset: 0,
    scanIntervalMs: 500,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: true,
    currentValue: 74.2,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tag-11',
    name: 'ROBOT02.ShieldGas_Flow',
    description: 'Argon shielding gas flow rate',
    machineId: 'm-02',
    plcId: 'plc-02',
    address: 'D504',
    dataType: 'Float',
    unit: 'L/min',
    scale: 1,
    offset: 0,
    scanIntervalMs: 500,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: false,
    currentValue: 18.2,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tag-12',
    name: 'ROBOT02.Counter_OK',
    description: 'Welded chassis OK count',
    machineId: 'm-02',
    plcId: 'plc-02',
    address: 'D600',
    dataType: 'DInt',
    unit: 'Pcs',
    scale: 1,
    offset: 0,
    scanIntervalMs: 1000,
    enableHistorian: true,
    historianRetentionDays: 365,
    isFavorite: true,
    currentValue: 912,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },

  // SMT-03 (Siemens S7-1500)
  {
    id: 'tag-13',
    name: 'SMT03.Feeder_Temp',
    description: 'Nozzle head motor drive temp',
    machineId: 'm-03',
    plcId: 'plc-03',
    address: 'DB1.DBD10',
    dataType: 'Float',
    unit: '°C',
    scale: 1,
    offset: 0,
    scanIntervalMs: 100,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: true,
    currentValue: 88.6, // High alarm!
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tag-14',
    name: 'SMT03.Vacuum_Pressure',
    description: 'Pick nozzle vacuum level',
    machineId: 'm-03',
    plcId: 'plc-03',
    address: 'DB1.DBD14',
    dataType: 'Float',
    unit: 'kPa',
    scale: 1,
    offset: 0,
    scanIntervalMs: 100,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: true,
    currentValue: -78.4,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tag-15',
    name: 'SMT03.Placement_Speed',
    description: 'Component placement throughput',
    machineId: 'm-03',
    plcId: 'plc-03',
    address: 'DB1.DBD20',
    dataType: 'DInt',
    unit: 'CPH',
    scale: 1,
    offset: 0,
    scanIntervalMs: 500,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: true,
    currentValue: 42000,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },

  // INJECT-04 (Modbus TCP)
  {
    id: 'tag-16',
    name: 'INJECT04.Barrel_Melt_Temp',
    description: 'Zone 1 plasticizing cylinder temp',
    machineId: 'm-04',
    plcId: 'plc-04',
    address: '%MW100',
    dataType: 'Float',
    unit: '°C',
    scale: 1,
    offset: 0,
    scanIntervalMs: 500,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: true,
    currentValue: 215.0,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tag-17',
    name: 'INJECT04.Hydraulic_Pressure',
    description: 'Injection hydraulic circuit pressure',
    machineId: 'm-04',
    plcId: 'plc-04',
    address: '%MW102',
    dataType: 'Float',
    unit: 'Bar',
    scale: 1,
    offset: 0,
    scanIntervalMs: 100,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: true,
    currentValue: 142.0,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  },

  // PACK-05 (OPC UA)
  {
    id: 'tag-18',
    name: 'PACK05.Boxes_Per_Minute',
    description: 'Case throughput rate',
    machineId: 'm-05',
    plcId: 'plc-05',
    address: 'ns=2;s=Packer.Throughput',
    dataType: 'Float',
    unit: 'Bpm',
    scale: 1,
    offset: 0,
    scanIntervalMs: 1000,
    enableHistorian: true,
    historianRetentionDays: 30,
    isFavorite: true,
    currentValue: 30.0,
    quality: 'GOOD',
    lastUpdated: new Date().toISOString()
  }
];

export const initialAlarmRules: AlarmRule[] = [
  {
    id: 'rule-01',
    name: 'SMT03 Feeder Motor Over-Temperature',
    tagId: 'tag-13',
    machineId: 'm-03',
    condition: 'GreaterThan',
    limitValue: 80.0,
    priority: 'Critical',
    message: 'SMT Nozzle head motor temperature exceeded safe threshold (80.0°C)',
    enabled: true,
    soundAlert: true,
    autoAcknowledge: false
  },
  {
    id: 'rule-02',
    name: 'CNC01 Spindle Temperature Warning',
    tagId: 'tag-02',
    machineId: 'm-01',
    condition: 'GreaterThan',
    limitValue: 70.0,
    priority: 'High',
    message: 'CNC01 Spindle bearing temperature elevated (>70°C). Check lubrication.',
    enabled: true,
    soundAlert: true,
    autoAcknowledge: false
  },
  {
    id: 'rule-03',
    name: 'CNC01 Low Coolant Pressure',
    tagId: 'tag-03',
    machineId: 'm-01',
    condition: 'LessThan',
    limitValue: 4.5,
    priority: 'Medium',
    message: 'Coolant pressure below minimum flow requirement (4.5 Bar)',
    enabled: true,
    soundAlert: false,
    autoAcknowledge: false
  },
  {
    id: 'rule-04',
    name: 'ROBOT02 Optics Thermal Warning',
    tagId: 'tag-10',
    machineId: 'm-02',
    condition: 'GreaterThan',
    limitValue: 75.0,
    priority: 'High',
    message: 'Laser collimator optics temperature exceeding threshold (>75°C)',
    enabled: true,
    soundAlert: true,
    autoAcknowledge: false
  },
  {
    id: 'rule-05',
    name: 'INJECT04 High Hydraulic Pressure Alert',
    tagId: 'tag-17',
    machineId: 'm-04',
    condition: 'GreaterThan',
    limitValue: 155.0,
    priority: 'Critical',
    message: 'Hydraulic pressure approaching relief valve safety limit (>155 Bar)',
    enabled: true,
    soundAlert: true,
    autoAcknowledge: false
  }
];

export const initialAlarmEvents: AlarmEvent[] = [
  {
    id: 'alarm-01',
    ruleId: 'rule-01',
    alarmName: 'SMT03 Feeder Motor Over-Temperature',
    machineId: 'm-03',
    machineName: 'High-Speed SMT Pick & Place (SMT-03)',
    tagName: 'SMT03.Feeder_Temp',
    tagAddress: 'DB1.DBD10',
    value: 88.6,
    limitValue: 80.0,
    priority: 'Critical',
    message: 'SMT Nozzle head motor temperature exceeded safe threshold (80.0°C)',
    status: 'Active',
    triggeredAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    comment: 'Line stopped automatically by safety interlock.'
  },
  {
    id: 'alarm-02',
    ruleId: 'rule-04',
    alarmName: 'ROBOT02 Optics Thermal Warning',
    machineId: 'm-02',
    machineName: '6-Axis Laser Welding Cell (ROBOT-02)',
    tagName: 'ROBOT02.Optics_Temp',
    tagAddress: 'D502',
    value: 74.2,
    limitValue: 75.0,
    priority: 'High',
    message: 'ROBOT02 Optics thermal sensor approached upper threshold (75.0°C)',
    status: 'Acknowledged',
    triggeredAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    acknowledgedBy: 'Tran Van B (Operator)',
    comment: 'Auxiliary chiller unit engaged. Temperature stabilizing.'
  },
  {
    id: 'alarm-03',
    ruleId: 'rule-03',
    alarmName: 'CNC01 Low Coolant Pressure',
    machineId: 'm-01',
    machineName: '5-Axis High Precision CNC (CNC-01)',
    tagName: 'CNC01.Coolant_Pressure',
    tagAddress: 'DM104',
    value: 4.1,
    limitValue: 4.5,
    priority: 'Medium',
    message: 'CNC-01 Coolant hydraulic pressure dropped below minimum operating limit (4.5 bar)',
    status: 'Cleared',
    triggeredAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    acknowledgedBy: 'Nguyen Van A',
    clearedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    durationSeconds: 1500,
    comment: 'Filter mesh cleaned and coolant reservoir topped off.'
  }
];

export const initialReports: ProductionReport[] = [
  {
    id: 'rep-01',
    title: 'Daily Smart Factory Production & OEE Audit',
    reportType: 'Production',
    dateRange: 'Today (Shift 1 & Shift 2)',
    generatedAt: new Date().toISOString(),
    generatedBy: 'Hoang (Admin)',
    summary: {
      totalProduction: 42370,
      okRate: 98.7,
      avgOee: 84.6,
      totalDowntimeMinutes: 126,
      totalAlarms: 14,
      energyConsumedKwh: 480.2
    },
    shiftBreakdown: [
      { shift: 'Shift 1 (Morning 06:00 - 14:00)', operator: 'Nguyen Van A / Tran Van B', output: 21850, okRate: 99.1, oee: 88.2, downtimeMin: 34 },
      { shift: 'Shift 2 (Afternoon 14:00 - 22:00)', operator: 'Le Thi C / Pham Van D', output: 20520, okRate: 98.3, oee: 81.0, downtimeMin: 92 }
    ]
  }
];

export const initialSettings: SystemSettings = {
  language: 'vi',
  theme: 'dark',
  soundEnabled: true,
  simulationMode: true,
  simulationSpeed: 1,
  historianRetentionDays: 30,
  geminiApiKey: '',
  geminiModel: 'gemini-3.7-flash',
  geminiTemperature: 0.7,
  geminiMaxTokens: 2048,
  enableThinking: false
};

// ==========================================
// 30-35. INITIAL NOTIFICATION DATA
// ==========================================

export const initialEmailConfig: EmailConfiguration = {
  id: 'email-cfg-01',
  smtpServer: 'smtp.gmail.com',
  port: 587,
  username: 'scada-alerts@hat-automation.vn',
  password: '••••••••••••••••',
  enableSSL: false,
  enableTLS: true,
  senderName: 'HATSCADA Smart Alarm System',
  senderEmail: 'scada-alerts@hat-automation.vn',
  enabled: true,
  connectionStatus: 'Connected',
  lastSentTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  lastError: undefined,
  totalSentCount: 148
};

export const initialTelegramConfig: TelegramConfiguration = {
  enabled: true,
  botToken: '6829104821:AAH8a9K_uQ-x92jL0qXwN7',
  defaultChatId: '-1001892348123', // HAT Industrial Maintenance Channel
  lastSentTime: new Date(Date.now() - 25 * 60 * 1000).toISOString()
};

export const initialWebhookConfig: WebhookConfiguration = {
  enabled: true,
  endpointUrl: 'https://mes.hat-industrial.vn/api/v1/scada/events',
  authHeaderName: 'X-SCADA-API-KEY',
  authHeaderValue: 'hat_sec_live_98234190',
  lastSentTime: new Date(Date.now() - 5 * 60 * 1000).toISOString()
};

export const initialNotificationContacts: NotificationContact[] = [
  {
    id: 'contact-01',
    name: 'Hoàng Quốc Bảo (Senior Architect)',
    email: 'hoang.lead@hat-automation.vn',
    phone: '+84 908 123 456',
    department: 'Automation',
    role: 'SCADA Lead & System Architect',
    enabled: true,
    avatarColor: 'bg-cyan-600'
  },
  {
    id: 'contact-02',
    name: 'Nguyễn Văn Tuấn (Maintenance Head)',
    email: 'tuan.maintenance@hat-automation.vn',
    phone: '+84 912 345 678',
    department: 'Maintenance',
    role: 'Trưởng Phòng Cơ Điện & Bảo Trì',
    enabled: true,
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'contact-03',
    name: 'Trần Phi Hùng (Production Manager)',
    email: 'hung.production@hat-automation.vn',
    phone: '+84 983 234 567',
    department: 'Production',
    role: 'Quản Lý Xưởng Sản Xuất',
    enabled: true,
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'contact-04',
    name: 'Lê Quang Minh (Automation Eng)',
    email: 'minh.plc@hat-automation.vn',
    phone: '+84 977 456 789',
    department: 'Automation',
    role: 'Kỹ Sư Lập Trình PLC & Mạng OT',
    enabled: true,
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'contact-05',
    name: 'Đặng Mai Lan (Quality Manager)',
    email: 'lan.qa@hat-automation.vn',
    phone: '+84 934 567 890',
    department: 'Quality',
    role: 'Trưởng Phòng Đảm Bảo Chất Lượng QA/QC',
    enabled: true,
    avatarColor: 'bg-purple-600'
  },
  {
    id: 'contact-06',
    name: 'Vũ Nam Hải (Plant Director)',
    email: 'hai.director@hat-automation.vn',
    phone: '+84 903 999 888',
    department: 'Executive',
    role: 'Giám Đốc Nhà Máy',
    enabled: true,
    avatarColor: 'bg-rose-600'
  }
];

export const initialNotificationTemplates: NotificationTemplate[] = [
  {
    id: 'tmpl-alarm-critical',
    name: 'Critical Alarm Trigger (Khẩn Cấp)',
    type: 'Email',
    subject: '[HATSCADA CRITICAL] {Priority} Alarm: {AlarmMessage} tại {MachineName}',
    body: `<div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 8px;">
  <div style="border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 16px;">
    <h2 style="color: #ef4444; margin: 0; font-size: 20px;">⚠️ CẢNH BÁO SỰ CỐ CÔNG NGHIỆP CẤP ĐỘ {Priority}</h2>
    <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Hệ thống SCADA tự động phát hiện vượt ngưỡng an toàn.</p>
  </div>
  
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr style="border-bottom: 1px solid #1e293b;">
      <td style="padding: 8px 0; color: #94a3b8; width: 140px;">Thiết Bị / Máy:</td>
      <td style="padding: 8px 0; font-weight: bold; color: #38bdf8;">{MachineName}</td>
    </tr>
    <tr style="border-bottom: 1px solid #1e293b;">
      <td style="padding: 8px 0; color: #94a3b8;">PLC Điều Khiển:</td>
      <td style="padding: 8px 0; color: #cbd5e1;">{PLCName}</td>
    </tr>
    <tr style="border-bottom: 1px solid #1e293b;">
      <td style="padding: 8px 0; color: #94a3b8;">Biến Quét (Tag):</td>
      <td style="padding: 8px 0; color: #e2e8f0;"><code>{TagName}</code> ({TagAddress})</td>
    </tr>
    <tr style="border-bottom: 1px solid #1e293b;">
      <td style="padding: 8px 0; color: #94a3b8;">Giá Trị Hiện Tại:</td>
      <td style="padding: 8px 0; color: #ef4444; font-weight: bold; font-size: 16px;">{Value} {Unit} (Ngưỡng: {Limit} {Unit})</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #94a3b8;">Thời Điểm Kích Hoạt:</td>
      <td style="padding: 8px 0; color: #cbd5e1;">{Timestamp}</td>
    </tr>
  </table>

  <div style="margin-top: 20px; padding: 14px; background-color: #1e1b4b; border-left: 4px solid #6366f1; border-radius: 4px;">
    <strong style="color: #a5b4fc;">Hướng Dẫn Kỹ Thuật (SOP):</strong>
    <p style="margin: 6px 0 0 0; color: #c7d2fe; font-size: 13px;">Vui lòng mở HATSCADA Alarm Center để xác nhận sự cố (ACK) và kiểm tra tủ điện điều khiển.</p>
  </div>
</div>`,
    isHtml: true,
    description: 'Mẫu email cảnh báo sự cố khẩn cấp gửi tức thời cho đội bảo trì & vận hành',
    variables: ['MachineName', 'PLCName', 'TagName', 'TagAddress', 'Value', 'Limit', 'Unit', 'Priority', 'AlarmMessage', 'Timestamp']
  },
  {
    id: 'tmpl-alarm-cleared',
    name: 'Alarm Cleared / Return Normal (Đã Phục Hồi)',
    type: 'Email',
    subject: '[HATSCADA NORMAL] Sự cố tại {MachineName} đã được giải quyết',
    body: `<div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 8px;">
  <div style="border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 16px;">
    <h2 style="color: #10b981; margin: 0; font-size: 20px;">✅ THIẾT BỊ ĐÃ TRỞ LẠI TRẠNG THÁI BÌNH THƯỜNG</h2>
    <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Sự cố {AlarmMessage} đã phục hồi về vùng an toàn.</p>
  </div>
  <p style="color: #cbd5e1; font-size: 14px;">Máy <strong>{MachineName}</strong> ({PLCName}) hiện ghi nhận giá trị <strong>{Value} {Unit}</strong> tại thời điểm <strong>{Timestamp}</strong>.</p>
</div>`,
    isHtml: true,
    description: 'Email thông báo khi thông số thiết bị trở về trạng thái an toàn',
    variables: ['MachineName', 'PLCName', 'TagName', 'Value', 'Unit', 'AlarmMessage', 'Timestamp']
  },
  {
    id: 'tmpl-tag-warning',
    name: 'Tag Threshold Advisory (Cảnh Báo Vượt Ngưỡng Biến)',
    type: 'Email',
    subject: '[HATSCADA TAG ADVISORY] {TagName} vượt mức {Limit}',
    body: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #020617; color: #f1f5f9; border-radius: 8px;">
  <h3 style="color: #f59e0b; margin-top: 0;">⚠️ Cảnh Báo Giám Sát Tag Vận Hành</h3>
  <p>Biến <strong>{TagName}</strong> ({TagAddress}) trên thiết bị <strong>{MachineName}</strong> đạt mức <strong>{Value}</strong> (Ngưỡng định chuẩn: {Limit}).</p>
  <p style="color: #94a3b8; font-size: 12px;">Thời gian ghi nhận: {Timestamp}</p>
</div>`,
    isHtml: true,
    description: 'Mẫu thông báo khi một Tag tùy chỉnh vượt ngưỡng cảnh báo giám sát',
    variables: ['MachineName', 'TagName', 'TagAddress', 'Value', 'Limit', 'Timestamp']
  },
  {
    id: 'tmpl-report-delivery',
    name: 'Automated Report Delivery (Báo Cáo Tự Động)',
    type: 'Email',
    subject: '[HATSCADA REPORT] {ReportName} - {Timestamp}',
    body: `<div style="font-family: Arial, sans-serif; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 8px;">
  <h2 style="color: #38bdf8; margin: 0;">📊 BÁO CÁO ĐIỀU HÀNH SẢN XUẤT TỰ ĐỘNG</h2>
  <p style="color: #94a3b8; margin: 6px 0 16px 0;">Được lập tự động từ HATSCADA Industrial Engine.</p>
  <p>Kính gửi Quý Ban Điều Hành,</p>
  <p>Hệ thống trân trọng gửi đính kèm file báo cáo <strong>{ReportName}</strong> cho ca sản xuất vừa qua.</p>
  <p style="color: #64748b; font-size: 12px; margin-top: 24px;">HATSCADA Manufacturing Execution System • Generated at {Timestamp}</p>
</div>`,
    isHtml: true,
    description: 'Mẫu email định kỳ gửi đính kèm file PDF/Excel cho Ban Quản Lý',
    variables: ['ReportName', 'Timestamp', 'ShiftName', 'TotalProduction', 'AvgOee']
  }
];

export const initialTagNotificationRules: TagNotificationRule[] = [
  {
    id: 'tag-rule-01',
    name: 'Motor Spindle Temperature High Alert',
    tagId: 'tag-04',
    sourceTagId: 'tag-04',
    tagName: 'CNC01.Spindle_Temp',
    condition: '>',
    thresholdValue: 70.0,
    delaySeconds: 10,
    priority: 'High',
    severity: 'High',
    templateId: 'tmpl-tag-warning',
    messageTemplateId: 'tmpl-tag-warning',
    customMessage: 'Nhiệt độ Spindle CNC-01 vượt quá 70°C liên tục trong 10 giây!',
    recipientContactIds: ['contact-02', 'contact-04'],
    recipientEmails: ['tuan.maintenance@hat-automation.vn', 'minh.plc@hat-automation.vn'],
    recipients: ['contact-02', 'contact-04'],
    channels: ['Email', 'Telegram'],
    enabled: true,
    lastTriggeredAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    triggerCount: 3
  },
  {
    id: 'tag-rule-02',
    name: 'Hydraulic Tank Low Level Warning',
    tagId: 'tag-08',
    sourceTagId: 'tag-08',
    tagName: 'PACK01.Air_Pressure',
    condition: '<',
    thresholdValue: 5.0,
    delaySeconds: 15,
    priority: 'Medium',
    severity: 'Medium',
    templateId: 'tmpl-tag-warning',
    messageTemplateId: 'tmpl-tag-warning',
    customMessage: 'Áp suất khí nén cấp cho máy đóng gói PACK-01 sụt giảm dưới 5.0 bar.',
    recipientContactIds: ['contact-02'],
    recipientEmails: ['tuan.maintenance@hat-automation.vn'],
    recipients: ['contact-02'],
    channels: ['Email'],
    enabled: true,
    lastTriggeredAt: undefined,
    triggerCount: 0
  },
  {
    id: 'tag-rule-03',
    name: 'Robot Welding Joint 3 High Thermal',
    tagId: 'tag-03',
    sourceTagId: 'tag-03',
    tagName: 'ROBOT02.Joint3_Temp',
    condition: '>',
    thresholdValue: 75.0,
    delaySeconds: 5,
    priority: 'Critical',
    severity: 'Critical',
    templateId: 'tmpl-alarm-critical',
    messageTemplateId: 'tmpl-alarm-critical',
    customMessage: 'Khớp Robot ROBOT-02 nóng quá mức 75°C!',
    recipientContactIds: ['contact-01', 'contact-02', 'contact-04'],
    recipientEmails: ['hoang.lead@hat-automation.vn', 'tuan.maintenance@hat-automation.vn', 'minh.plc@hat-automation.vn'],
    recipients: ['contact-01', 'contact-02', 'contact-04'],
    channels: ['Email', 'Telegram', 'Webhook'],
    enabled: true,
    lastTriggeredAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    triggerCount: 1
  }
];

export const initialAlarmNotificationRules: AlarmNotificationRule[] = [
  {
    id: 'alarm-notif-01',
    name: 'All Critical Priority Alarms (Khẩn Cấp Toàn Xưởng)',
    priority: 'Critical',
    alarmRuleId: 'All',
    channels: ['Email', 'Telegram', 'Webhook'],
    condition: ['OnTrigger', 'OnReturnNormal'],
    conditions: ['OnTrigger', 'OnReturnNormal'],
    recipientContactIds: ['contact-01', 'contact-02', 'contact-03', 'contact-04', 'contact-06'],
    recipientEmails: ['hoang.lead@hat-automation.vn', 'tuan.maintenance@hat-automation.vn', 'hung.production@hat-automation.vn', 'minh.plc@hat-automation.vn', 'hai.director@hat-automation.vn'],
    recipients: ['contact-01', 'contact-02', 'contact-03', 'contact-04', 'contact-06'],
    telegramChatId: '-1001892348123',
    webhookUrl: 'https://mes.hat-industrial.vn/api/v1/scada/events',
    templateId: 'tmpl-alarm-critical',
    enabled: true,
    rateLimitMinutes: 2,
    lastDispatchedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 'alarm-notif-02',
    name: 'High Priority Alarms (Sự Cố Ngừng Máy)',
    priority: 'High',
    alarmRuleId: 'All',
    channels: ['Email', 'Telegram'],
    condition: ['OnTrigger'],
    conditions: ['OnTrigger'],
    recipientContactIds: ['contact-02', 'contact-03', 'contact-04'],
    recipientEmails: ['tuan.maintenance@hat-automation.vn', 'hung.production@hat-automation.vn', 'minh.plc@hat-automation.vn'],
    recipients: ['contact-02', 'contact-03', 'contact-04'],
    telegramChatId: '-1001892348123',
    templateId: 'tmpl-alarm-critical',
    enabled: true,
    rateLimitMinutes: 5,
    lastDispatchedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString()
  }
];

export const initialNotificationHistory: NotificationHistoryItem[] = [
  {
    id: 'notif-hist-01',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    channelType: 'Email',
    source: 'Alarm',
    sourceName: 'ROBOT-02 High Temperature Warning',
    recipients: ['tuan.maintenance@hat-automation.vn', 'minh.plc@hat-automation.vn'],
    subject: '[HATSCADA CRITICAL] High Alarm: ROBOT-02 Optics thermal sensor approached threshold tại Robot Hàn Khung Xe (ROBOT-02)',
    message: 'Nhiệt độ khớp trục Robot ROBOT-02 vượt 75.0°C. Vui lòng kiểm tra dung dịch bôi trơn và quạt giải nhiệt động cơ.',
    status: 'Sent',
    latencyMs: 142,
    retryCount: 0
  },
  {
    id: 'notif-hist-02',
    timestamp: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
    channelType: 'Telegram',
    source: 'Alarm',
    sourceName: 'ROBOT-02 High Temperature Warning',
    recipients: ['Telegram Group: HAT Industrial Maintenance Channel'],
    subject: 'CRITICAL ALARM: ROBOT-02',
    message: '⚠️ [ALARM TRIGGER] ROBOT02.Joint3_Temp = 74.2°C (Limit: 75.0°C). Trạng thái: High Priority.',
    status: 'Sent',
    latencyMs: 88,
    retryCount: 0
  },
  {
    id: 'notif-hist-03',
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    channelType: 'Email',
    source: 'TagRule',
    sourceName: 'Motor Spindle Temperature High Alert',
    recipients: ['tuan.maintenance@hat-automation.vn'],
    subject: '[HATSCADA TAG ADVISORY] CNC01.Spindle_Temp vượt mức 70',
    message: 'Biến CNC01.Spindle_Temp trên máy 5-Axis CNC đạt mức 72.4°C (Ngưỡng quy định: 70°C).',
    status: 'Sent',
    latencyMs: 156,
    retryCount: 0
  },
  {
    id: 'notif-hist-04',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    channelType: 'Email',
    source: 'ScheduledReport',
    sourceName: 'Daily Production & Shift Summary',
    recipients: ['hung.production@hat-automation.vn', 'hai.director@hat-automation.vn'],
    subject: '[HATSCADA REPORT] Daily Production & Shift Summary - 2026-08-22',
    message: 'Đính kèm bản báo cáo PDF sản lượng ca 1 với tổng OEE 88.2%, tổng sản lượng 21,850 linh kiện.',
    status: 'Sent',
    latencyMs: 310,
    retryCount: 0
  },
  {
    id: 'notif-hist-05',
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    channelType: 'Webhook',
    source: 'PLCEvent',
    sourceName: 'PLC-02 Heartbeat Ping Degraded',
    recipients: ['https://mes.hat-industrial.vn/api/v1/scada/events'],
    subject: 'PLC Heartbeat Event',
    message: 'Payload: {"event": "PLC_PING_SLOW", "plcId": "plc-02", "rttMs": 142.5}',
    status: 'Sent',
    latencyMs: 65,
    retryCount: 0
  }
];

// ==========================================
// 36-41. INITIAL REPORT DATA
// ==========================================

export const initialReportTemplates: ReportTemplateConfig[] = [
  {
    id: 'rep-tmpl-01',
    name: 'Báo Cáo Sản Xuất & OEE Ca Tiêu Chuẩn (Shift OEE Audit)',
    category: 'Production',
    description: 'Tổng hợp sản lượng OK/NG, hiệu suất tổng thể thiết bị OEE, 6 tổn thất lớn và điện năng tiêu thụ',
    reportType: 'Production',
    format: 'PDF',
    defaultTimeRange: 'CurrentShift',
    includeSections: ['KPI_Summary', 'Machine_Comparison', 'Shift_Breakdown'],
    targetMachineIds: ['All'],
    chartTypes: ['BarChart', 'LineChart'],
    dataSource: {
      machineIds: ['m-01', 'm-02', 'm-03', 'm-04', 'm-05'],
      plcIds: ['plc-01', 'plc-02', 'plc-03', 'plc-04', 'plc-05'],
      tagIds: ['tag-01', 'tag-02', 'tag-04', 'tag-05', 'tag-07'],
      includeAlarms: true
    },
    timeRange: 'CurrentShift',
    widgets: ['KpiCards', 'LineChart', 'BarChart', 'Table', 'AiExecutiveSummary', 'AlarmLosses'],
    customTitle: 'BÁO CÁO TỔNG HỢP HIỆU SUẤT SẢN XUẤT THEO CA',
    author: 'Hoàng Quốc Bảo (Admin)',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rep-tmpl-02',
    name: 'Báo Cáo Phân Tích Sự Cố & Dừng Máy (Alarm & Downtime Pareto)',
    category: 'Alarm',
    description: 'Phân tích tần suất sự cố, thời gian MTTR/MTBF, tỷ lệ phân bố lỗi theo từng máy và cụm chấp hành',
    reportType: 'Alarm',
    format: 'Excel',
    defaultTimeRange: 'Today',
    includeSections: ['KPI_Summary', 'Machine_Comparison', 'Alarm_Pareto'],
    targetMachineIds: ['All'],
    chartTypes: ['BarChart'],
    dataSource: {
      machineIds: ['m-01', 'm-02', 'm-03'],
      plcIds: ['plc-01', 'plc-02', 'plc-03'],
      tagIds: [],
      includeAlarms: true
    },
    timeRange: 'Today',
    widgets: ['KpiCards', 'BarChart', 'Table', 'AiExecutiveSummary', 'AlarmLosses'],
    customTitle: 'BÁO CÁO PHÂN TÍCH SỰ CỐ DỪNG MÁY & ROOT-CAUSE',
    author: 'Nguyễn Văn Tuấn (Maintenance Head)',
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rep-tmpl-03',
    name: 'Báo Cáo Tiêu Thụ Năng Lượng & Phụ Tải Xưởng (Power & Energy Audit)',
    category: 'Energy',
    description: 'Giám sát công suất tiêu thụ kW, năng lượng kWh theo ca, so sánh mức tiêu hao theo từng mã sản phẩm',
    reportType: 'Energy',
    format: 'PDF',
    defaultTimeRange: 'Weekly',
    includeSections: ['KPI_Summary', 'Machine_Comparison'],
    targetMachineIds: ['All'],
    chartTypes: ['LineChart'],
    dataSource: {
      machineIds: ['m-01', 'm-02', 'm-04'],
      plcIds: ['plc-01', 'plc-04'],
      tagIds: ['tag-07'],
      includeAlarms: false
    },
    timeRange: 'Weekly',
    widgets: ['KpiCards', 'LineChart', 'Table'],
    customTitle: 'BÁO CÁO ĐO LƯỜNG NĂNG LƯỢNG ĐIỆN NHÀ MÁY THÔNG MINH',
    author: 'Lê Quang Minh (Automation Eng)',
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialReportSchedules: ReportScheduleConfig[] = [
  {
    id: 'sched-01',
    name: 'Gửi Tự Động Báo Cáo Cuối Ca 1 (Shift 1 End)',
    templateId: 'rep-tmpl-01',
    reportTemplateId: 'rep-tmpl-01',
    timeRange: 'CurrentShift',
    frequency: 'Daily',
    executionTime: '14:00',
    formats: ['PDF', 'Excel'],
    emailDelivery: true,
    recipientContactIds: ['contact-03', 'contact-06'],
    recipientEmails: ['hung.production@hat-automation.vn', 'hai.director@hat-automation.vn'],
    recipients: ['contact-03', 'contact-06'],
    emailSubject: '[HATSCADA REPORT] Báo Cáo Sản Xuất Bàn Giao Ca 1',
    enabled: true,
    lastRunAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    nextRunAt: 'Hôm nay 14:00',
    status: 'Active'
  },
  {
    id: 'sched-02',
    name: 'Gửi Tự Động Báo Cáo Cuối Ngày 17:00 (Daily Executive Digest)',
    templateId: 'rep-tmpl-01',
    reportTemplateId: 'rep-tmpl-01',
    timeRange: 'Today',
    frequency: 'Daily',
    executionTime: '17:00',
    formats: ['PDF', 'Excel', 'CSV'],
    emailDelivery: true,
    recipientContactIds: ['contact-01', 'contact-02', 'contact-03', 'contact-06'],
    recipientEmails: ['hoang.lead@hat-automation.vn', 'tuan.maintenance@hat-automation.vn', 'hung.production@hat-automation.vn', 'hai.director@hat-automation.vn'],
    recipients: ['contact-01', 'contact-02', 'contact-03', 'contact-06'],
    emailSubject: '[HATSCADA REPORT] Tổng Kết Sản Xuất Toàn Nhà Máy Trong Ngày',
    enabled: true,
    lastRunAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    nextRunAt: 'Hôm nay 17:00',
    status: 'Active'
  },
  {
    id: 'sched-03',
    name: 'Báo Cáo Sự Cố & Bảo Trì Hàng Tuần (Weekly Maintenance Review)',
    templateId: 'rep-tmpl-02',
    reportTemplateId: 'rep-tmpl-02',
    timeRange: 'Weekly',
    frequency: 'Weekly',
    executionTime: '08:00',
    dayOfWeek: 1, // Thứ 2
    formats: ['PDF'],
    emailDelivery: true,
    recipientContactIds: ['contact-02', 'contact-04', 'contact-06'],
    recipientEmails: ['tuan.maintenance@hat-automation.vn', 'minh.plc@hat-automation.vn', 'hai.director@hat-automation.vn'],
    recipients: ['contact-02', 'contact-04', 'contact-06'],
    emailSubject: '[HATSCADA REPORT] Báo Cáo Định Kỳ Sự Cố & Kế Hoạch Bảo Trì Tuần',
    enabled: true,
    lastRunAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    nextRunAt: 'Thứ Hai 08:00',
    status: 'Active'
  }
];

export const initialGeneratedReports: GeneratedReportArchiveItem[] = [
  {
    id: 'gen-rep-01',
    scheduleId: 'sched-02',
    templateId: 'rep-tmpl-01',
    templateName: 'Báo Cáo Sản Xuất & OEE Ca Tiêu Chuẩn',
    title: 'Báo Cáo Tổng Hợp Sản Xuất & OEE - Ca 1 & Ca 2',
    reportName: 'Báo Cáo Tổng Hợp Sản Xuất & OEE - Ca 1 & Ca 2',
    category: 'Production',
    reportType: 'Production',
    format: 'PDF',
    formats: ['PDF', 'Excel'],
    timeRange: 'Today',
    generatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    generatedBy: 'Schedule Engine (Daily 17:00)',
    fileSizeKb: 1420,
    recipients: ['hung.production@hat-automation.vn', 'hai.director@hat-automation.vn'],
    status: 'Ready',
    summary: {
      totalProduction: 42370,
      okRate: 98.7,
      avgOee: 84.6,
      totalDowntimeMinutes: 126,
      totalAlarms: 14,
      energyConsumedKwh: 480.2
    },
    machines: [
      { code: 'CNC-01', name: '5-Axis High Precision CNC', oee: 88.4, total: 9200, ok: 9110, ng: 90, downtimeMin: 22 },
      { code: 'ROBOT-02', name: '6-Axis Laser Welding Cell', oee: 82.1, total: 8450, ok: 8320, ng: 130, downtimeMin: 45 },
      { code: 'SMT-03', name: 'SMT Pick-and-Place Mounter', oee: 89.2, total: 12400, ok: 12280, ng: 120, downtimeMin: 18 },
      { code: 'PACK-04', name: 'High-Speed Automated Packaging', oee: 85.0, total: 7200, ok: 7100, ng: 100, downtimeMin: 25 },
      { code: 'AGV-05', name: 'Smart Warehouse AGV Fleet', oee: 78.5, total: 5120, ok: 5040, ng: 80, downtimeMin: 16 }
    ]
  },
  {
    id: 'gen-rep-02',
    scheduleId: 'sched-01',
    templateId: 'rep-tmpl-01',
    templateName: 'Báo Cáo Sản Xuất & OEE Ca Tiêu Chuẩn',
    title: 'Báo Cáo Bàn Giao Ca 1 Sáng',
    reportName: 'Báo Cáo Bàn Giao Ca 1 Sáng',
    category: 'Production',
    reportType: 'Production',
    format: 'PDF',
    formats: ['PDF'],
    timeRange: 'CurrentShift',
    generatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    generatedBy: 'Trần Phi Hùng (Operator)',
    fileSizeKb: 840,
    recipients: ['hung.production@hat-automation.vn'],
    status: 'Ready',
    summary: {
      totalProduction: 21850,
      okRate: 99.1,
      avgOee: 88.2,
      totalDowntimeMinutes: 34,
      totalAlarms: 4,
      energyConsumedKwh: 242.0
    },
    machines: [
      { code: 'CNC-01', name: '5-Axis High Precision CNC', oee: 91.2, total: 4700, ok: 4670, ng: 30, downtimeMin: 8 },
      { code: 'ROBOT-02', name: '6-Axis Laser Welding Cell', oee: 86.5, total: 4300, ok: 4260, ng: 40, downtimeMin: 12 }
    ]
  },
  {
    id: 'gen-rep-03',
    scheduleId: 'sched-03',
    templateId: 'rep-tmpl-02',
    templateName: 'Báo Cáo Phân Tích Sự Cố & Dừng Máy',
    title: 'Báo Cáo Sự Cố Dừng Máy & Six Big Losses Tuần 34',
    reportName: 'Báo Cáo Sự Cố Dừng Máy & Six Big Losses Tuần 34',
    category: 'Alarm',
    reportType: 'Alarm',
    format: 'Excel',
    formats: ['PDF', 'Excel'],
    timeRange: 'Weekly',
    generatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    generatedBy: 'Schedule Engine (Weekly 08:00)',
    fileSizeKb: 2150,
    recipients: ['tuan.maintenance@hat-automation.vn', 'minh.plc@hat-automation.vn'],
    status: 'Ready',
    summary: {
      totalProduction: 185400,
      okRate: 98.4,
      avgOee: 83.2,
      totalDowntimeMinutes: 480,
      totalAlarms: 38,
      energyConsumedKwh: 2140.5
    }
  }
];

export const initialDeepLearningDocs: DeepLearningDoc[] = [
  {
    id: 'doc-01',
    title: 'Sổ Tay Hướng Dẫn Sửa Lỗi Spindle Quá Nhiệt & Rung Động CNC-01',
    fileName: 'CNC01_Spindle_Maintenance_Guide.pdf',
    fileSizeKb: 1240,
    fileType: 'PDF',
    category: 'Equipment Manual',
    targetMachineCode: 'CNC-01',
    contentSnippet: `HƯỚNG DẪN XỬ LÝ LỖI TRỤC CHÍNH (SPINDLE) MÁY CNC-01:
1. Triệu chứng: Nhiệt độ Spindle vượt 80°C hoặc rung động > 4.5 mm/s (Tag: CNC01.Spindle_Temp, CNC01.Vibration_RMS).
2. Nguyên nhân phổ biến:
   - Thiếu dầu bôi trơn hệ thống làm mát chiller.
   - Vòng bi Spindle bị mòn sau > 8000 giờ chạy.
   - Dao cắt bị mẻ gãy gây lệch tâm cơ khí.
3. Quy trình khắc phục sự cố khẩn cấp:
   - Bước 1: Nhấn STOP ngắt chạy tự động, bật bơm làm mát xả Chiller về 18°C.
   - Bước 2: Kiểm tra áp suất khí nén siết dao (Ngưỡng 0.5 - 0.6 MPa).
   - Bước 3: Nếu nhiệt độ không giảm sau 5 phút, tiến hành thay mỡ bôi trơn Isoflex NBU 15 cho vòng bi.
   - Bước 4: Kiểm tra mã lỗi PLC Keyence KV-8000 tại ô nhớ DM100 (Bít 04 active: Alarm Spindle Overheat).`,
    uploadedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    uploadedBy: 'Nguyễn Văn Tuấn (Trưởng Phòng Bảo Trì)',
    indexedInRAG: true,
    vectorChunkCount: 18,
    tags: ['CNC-01', 'Spindle', 'Overheat', 'Vibration', 'Keyence']
  },
  {
    id: 'doc-02',
    title: 'Bảng Bít Cảnh Báo Lỗi & Sơ Đồ Thanh Ghi PLC Keyence KV-8000',
    fileName: 'Keyence_KV8000_Alarm_Memory_Map.pdf',
    fileSizeKb: 850,
    fileType: 'PLC_MAP',
    category: 'PLC Memory Map',
    targetMachineCode: 'Line 01 - Keyence KV',
    contentSnippet: `BẢNG THANH GHI BÁO LỖI PLC KEYENCE KV-8000 (MC PROTOCOL):
- DM100: Mức tốc độ Spindle hiện tại (0 - 12000 RPM)
- DM102: Nhiệt độ trục chính CNC (°C) - Ngưỡng báo động High: 80°C
- DM104: Tốc độ cấp phôi Feedrate (mm/min)
- MR10000: Bít báo động Dừng Khẩn Emergency Stop (0 = Normal, 1 = Tripped)
- MR10001: Bít báo động Áp Suất Dầu Khí Nén Thấp (< 0.4 MPa)
- MR10002: Bít báo động Quá Tải Động Cơ Servo Trục Z (Servo Alarm Code 0x22)
- MR10003: Bít lỗi truyền thông EtherNet/IP với Robot gắp phôi ROBOT-02`,
    uploadedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    uploadedBy: 'Lê Quang Minh (Kỹ Sư PLC)',
    indexedInRAG: true,
    vectorChunkCount: 12,
    tags: ['Keyence', 'KV-8000', 'MC_Protocol', 'Register_Map', 'DM100']
  },
  {
    id: 'doc-03',
    title: 'Quy Trình Chuẩn SOP Xử Lý Lỗi Dây Chuyền Hàn Laser ROBOT-02',
    fileName: 'SOP_Laser_Welding_ROBOT02_Troubleshooting.docx',
    fileSizeKb: 1420,
    fileType: 'SOP',
    category: 'Troubleshooting Guide',
    targetMachineCode: 'ROBOT-02',
    contentSnippet: `SOP BẢO TRÌ & SỬA LỖI MÁY HÀN LASER 6 TỤC ROBOT-02:
1. Lỗi áp suất khí bảo vệ Argon thấp (Tag: ROBOT02.ShieldGas_Flow < 12 L/min):
   - Kiểm tra van giảm áp đường ống khí chính xưởng.
   - Vệ sinh bép phun bọc xỉ hàn (Nozzle Tip).
2. Lỗi công suất chùm Laser giảm đột ngột (Tag: ROBOT02.Laser_Power_Kw):
   - Thay kính bảo vệ (Protective Window Lens) bị cháy đen.
   - Kiểm tra nhiệt độ nước làm mát Chiller Laser (Duy trì 20°C ± 1°C).
3. Lỗi lệch tọa độ đường hàn (Positional Drift):
   - Chạy chương trình Calib TCP (Tool Center Point) cho Robot Fanuc/Yaskawa.`,
    uploadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    uploadedBy: 'Trần Phi Hùng (Trưởng Ca Sản Xuất)',
    indexedInRAG: true,
    vectorChunkCount: 15,
    tags: ['ROBOT-02', 'Laser_Welding', 'ShieldGas', 'Argon', 'SOP']
  }
];

