import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Sliders,
  Shield,
  Layers,
  Radio,
  Cpu
} from 'lucide-react';
import { PlcDevice, PlcBrand, PlcProtocol, PlcType } from '../../types/scada';
import { useScada } from '../../context/ScadaContext';

interface PlcConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlc?: PlcDevice | null;
}

const BRAND_DEFAULTS: Record<PlcType, {
  brand: PlcBrand;
  model: string;
  protocol: PlcProtocol;
  defaultPort: number;
  scanIntervalMs: number;
  addrHint: string;
}> = {
  'Keyence KV': {
    brand: 'Keyence',
    model: 'KV-8000 (Ethernet/IP + MC Protocol)',
    protocol: 'MC Protocol',
    defaultPort: 8501,
    scanIntervalMs: 100,
    addrHint: 'DM, EM, MR, LR registers'
  },
  'Mitsubishi FX': {
    brand: 'Mitsubishi',
    model: 'MELSEC-F FX5U (Ethernet)',
    protocol: 'MC Protocol',
    defaultPort: 5000,
    scanIntervalMs: 250,
    addrHint: 'D, W, M, Y, X registers'
  },
  'Mitsubishi Q': {
    brand: 'Mitsubishi',
    model: 'MELSEC-Q Q06UDEH',
    protocol: 'MC Protocol',
    defaultPort: 5000,
    scanIntervalMs: 250,
    addrHint: 'D, W, M, R registers'
  },
  'Mitsubishi iQ-R': {
    brand: 'Mitsubishi',
    model: 'MELSEC iQ-R (R08CPU)',
    protocol: 'MC Protocol',
    defaultPort: 5000,
    scanIntervalMs: 250,
    addrHint: 'D, W, M, ZR registers'
  },
  'Siemens S7': {
    brand: 'Siemens',
    model: 'SIMATIC S7-1500 (CPU 1515-2 PN)',
    protocol: 'Siemens S7',
    defaultPort: 102,
    scanIntervalMs: 100,
    addrHint: 'DB, M, I, Q data blocks'
  },
  'Modbus Device': {
    brand: 'Modbus',
    model: 'Modbus TCP / RTU Gateway',
    protocol: 'Modbus TCP',
    defaultPort: 502,
    scanIntervalMs: 500,
    addrHint: '%MW, %M, 40001+ registers'
  },
  'OPC UA Device': {
    brand: 'OPC_UA',
    model: 'Standard OPC UA Server v1.04',
    protocol: 'OPC UA',
    defaultPort: 4840,
    scanIntervalMs: 1000,
    addrHint: 'ns=2;s=Device.TagName'
  }
};

export const PlcConfigModal: React.FC<PlcConfigModalProps> = ({
  isOpen,
  onClose,
  initialPlc
}) => {
  const { addPlc, updatePlc, testPlcConnection, machines } = useScada();

  const [plcType, setPlcType] = useState<PlcType>(initialPlc?.plcType || 'Keyence KV');
  const [name, setName] = useState(initialPlc?.name || 'Line01_PLC_Main');
  const [brand, setBrand] = useState<PlcBrand>(initialPlc?.brand || 'Keyence');
  const [model, setModel] = useState(initialPlc?.model || 'KV-8000 (Ethernet/IP + MC)');
  const [ipAddress, setIpAddress] = useState(initialPlc?.ipAddress || '192.168.1.10');
  const [port, setPort] = useState<number>(initialPlc?.port || 8501);
  const [protocol, setProtocol] = useState<PlcProtocol>(initialPlc?.protocol || 'MC Protocol');
  const [enabled, setEnabled] = useState<boolean>(initialPlc?.enabled ?? true);
  const [timeoutMs, setTimeoutMs] = useState<number>(initialPlc?.timeoutMs || 2000);
  const [retryCount, setRetryCount] = useState<number>(initialPlc?.retryCount || 3);
  const [scanIntervalMs, setScanIntervalMs] = useState<number>(initialPlc?.scanIntervalMs || 100);
  const [unitNumber, setUnitNumber] = useState<number>(initialPlc?.unitNumber ?? 0);
  const [networkNumber, setNetworkNumber] = useState<number>(initialPlc?.networkNumber ?? 1);
  const [rack, setRack] = useState<number>(initialPlc?.rack ?? 0);
  const [slot, setSlot] = useState<number>(initialPlc?.slot ?? 1);
  const [machineId, setMachineId] = useState<string>(initialPlc?.machineId || '');
  const [areaName, setAreaName] = useState<string>(initialPlc?.areaName || 'Area 01 - Heavy Machining');
  const [lineName, setLineName] = useState<string>(initialPlc?.lineName || 'Line 01 - Precision Milling');
  const [description, setDescription] = useState(initialPlc?.description || 'Primary PLC Controller');

  // Connection Test State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; rtt: number; message: string } | null>(null);

  useEffect(() => {
    if (initialPlc) {
      setPlcType(initialPlc.plcType || (initialPlc.brand === 'Keyence' ? 'Keyence KV' : initialPlc.brand === 'Siemens' ? 'Siemens S7' : initialPlc.brand === 'Modbus' ? 'Modbus Device' : initialPlc.brand === 'OPC_UA' ? 'OPC UA Device' : 'Mitsubishi iQ-R'));
      setName(initialPlc.name);
      setBrand(initialPlc.brand);
      setModel(initialPlc.model);
      setIpAddress(initialPlc.ipAddress);
      setPort(initialPlc.port);
      setProtocol(initialPlc.protocol);
      setEnabled(initialPlc.enabled ?? true);
      setTimeoutMs(initialPlc.timeoutMs || 2000);
      setRetryCount(initialPlc.retryCount || 3);
      setScanIntervalMs(initialPlc.scanIntervalMs || 250);
      setUnitNumber(initialPlc.unitNumber ?? 0);
      setNetworkNumber(initialPlc.networkNumber ?? 1);
      setRack(initialPlc.rack ?? 0);
      setSlot(initialPlc.slot ?? 1);
      setMachineId(initialPlc.machineId || '');
      setAreaName(initialPlc.areaName || 'Area 01 - Heavy Machining');
      setLineName(initialPlc.lineName || 'Line 01 - Precision Milling');
      setDescription(initialPlc.description);
      setTestResult(null);
    } else {
      // Defaults for brand
      const d = BRAND_DEFAULTS['Keyence KV'];
      setPlcType('Keyence KV');
      setName(`Line${(Math.floor(Math.random() * 90) + 10)}_PLC_KV8000`);
      setBrand(d.brand);
      setModel(d.model);
      setIpAddress(`192.168.1.${Math.floor(Math.random() * 200 + 10)}`);
      setPort(d.defaultPort);
      setProtocol(d.protocol);
      setEnabled(true);
      setTimeoutMs(2000);
      setRetryCount(3);
      setScanIntervalMs(d.scanIntervalMs);
      setMachineId('');
      setDescription('High-Performance Industrial Controller');
      setTestResult(null);
    }
  }, [initialPlc, isOpen]);

  const handlePlcTypeChange = (selected: PlcType) => {
    setPlcType(selected);
    const defaults = BRAND_DEFAULTS[selected];
    if (defaults) {
      setBrand(defaults.brand);
      setModel(defaults.model);
      setProtocol(defaults.protocol);
      setPort(defaults.defaultPort);
      setScanIntervalMs(defaults.scanIntervalMs);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testPlcConnection(ipAddress, port, protocol);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        rtt: 0,
        message: err.message || 'Không thể thiết lập socket handshake'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ipAddress.trim()) return;

    const payload = {
      name: name.trim(),
      brand,
      plcType,
      model: model.trim(),
      ipAddress: ipAddress.trim(),
      port: Number(port),
      protocol,
      enabled,
      timeoutMs: Number(timeoutMs),
      retryCount: Number(retryCount),
      scanIntervalMs: Number(scanIntervalMs),
      unitNumber: Number(unitNumber),
      networkNumber: Number(networkNumber),
      rack: Number(rack),
      slot: Number(slot),
      machineId: machineId || undefined,
      areaName,
      lineName,
      factoryName: 'Factory A (Smart Machining & Assembly)',
      description: description.trim()
    };

    if (initialPlc) {
      updatePlc({
        ...initialPlc,
        ...payload
      });
    } else {
      addPlc(payload);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {initialPlc ? 'Chỉnh Sửa Cấu Hình PLC Controller' : 'Thêm Thiết Bị PLC Mới (Multi-PLC Manager)'}
              </h2>
              <p className="text-xs text-slate-400">
                Cấu hình thông số mạng, Driver giao tiếp độc lập, polling rate & ánh xạ thiết bị
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: PLC Identification & Type */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>1. Thông Tin Nhận Diện & Loại PLC</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  PLC Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ví dụ: Line01_PLC_Main"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Định danh duy nhất trong toàn hệ thống HATSCADA</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  PLC Type / Dòng PLC <span className="text-rose-400">*</span>
                </label>
                <select
                  value={plcType}
                  onChange={e => handlePlcTypeChange(e.target.value as PlcType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors font-medium"
                >
                  <option value="Keyence KV">Keyence KV (KV-8000, KV-XG02, KV-7500)</option>
                  <option value="Mitsubishi iQ-R">Mitsubishi iQ-R (R08CPU, R16CPU)</option>
                  <option value="Mitsubishi Q">Mitsubishi Q (Q03UDE, Q06UDEH)</option>
                  <option value="Mitsubishi FX">Mitsubishi FX (FX5U, FX3U)</option>
                  <option value="Siemens S7">Siemens S7 (S7-1500, S7-1200, S7-300)</option>
                  <option value="Modbus Device">Modbus Device (Modbus TCP / RTU Gateway)</option>
                  <option value="OPC UA Device">OPC UA Device (B&R / Beckhoff / Ignition)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Model / Firmware Version</label>
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="e.g. KV-8000 CPU v2.1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Communication Protocol</label>
                <select
                  value={protocol}
                  onChange={e => setProtocol(e.target.value as PlcProtocol)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="MC Protocol">MC Protocol (QnA 3E / 4E Frame Binary)</option>
                  <option value="Siemens S7">Siemens S7 (ISO-on-TCP COTP RFC1006)</option>
                  <option value="Modbus TCP">Modbus TCP (Port 502 / Function 03, 04, 06, 16)</option>
                  <option value="OPC UA">OPC UA (Binary TCP opc.tcp://)</option>
                  <option value="EtherNet/IP">EtherNet/IP (CIP Explicit / Implicit)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Network Parameters & Socket */}
          <div className="space-y-4 pt-3 border-t border-slate-800/80">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>2. Thông Số Kết Nối Socket & Network Driver</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  IP Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ipAddress}
                  onChange={e => setIpAddress(e.target.value)}
                  placeholder="192.168.1.10"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Port Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={port}
                  onChange={e => setPort(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Scan Rate (Interval)</label>
                <select
                  value={scanIntervalMs}
                  onChange={e => setScanIntervalMs(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value={50}>50 ms (Ultra High-Speed)</option>
                  <option value={100}>100 ms (Fast Real-time)</option>
                  <option value={250}>250 ms (Standard Production)</option>
                  <option value={500}>500 ms (Medium Cycle)</option>
                  <option value={1000}>1000 ms (1s Slow Poll)</option>
                  <option value={2000}>2000 ms (2s Telemetry)</option>
                </select>
              </div>
            </div>

            {/* Protocol specific options */}
            {(brand === 'Siemens' || brand === 'Mitsubishi' || brand === 'Keyence' || brand === 'Modbus') && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {brand === 'Siemens' && (
                  <>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Rack Number</label>
                      <input
                        type="number"
                        value={rack}
                        onChange={e => setRack(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Slot Number</label>
                      <input
                        type="number"
                        value={slot}
                        onChange={e => setSlot(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                      />
                    </div>
                  </>
                )}

                {(brand === 'Mitsubishi' || brand === 'Keyence') && (
                  <>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Network No.</label>
                      <input
                        type="number"
                        value={networkNumber}
                        onChange={e => setNetworkNumber(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Station/Unit No.</label>
                      <input
                        type="number"
                        value={unitNumber}
                        onChange={e => setUnitNumber(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                      />
                    </div>
                  </>
                )}

                {brand === 'Modbus' && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Modbus Unit ID / Slave ID</label>
                    <input
                      type="number"
                      value={unitNumber}
                      onChange={e => setUnitNumber(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Timeout (ms)</label>
                  <input
                    type="number"
                    value={timeoutMs}
                    onChange={e => setTimeoutMs(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Retry Count (Auto-Reconnect)</label>
                  <input
                    type="number"
                    value={retryCount}
                    onChange={e => setRetryCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Test Connection Button & Status Feedback */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={isTesting || !ipAddress}
                  onClick={handleTestConnection}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Zap className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Đang Kiểm Tra Socket...' : 'Test Connection (Kiểm tra kết nối)'}</span>
                </button>
              </div>

              {testResult && (
                <div className={`flex items-center space-x-2 text-xs font-medium ${testResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Machine & Hierarchy Mapping */}
          <div className="space-y-4 pt-3 border-t border-slate-800/80">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>3. Ánh Xạ Phân Cấp Nhà Máy (Factory → Line → Machine)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Khu Vực Sản Xuất (Area)</label>
                <input
                  type="text"
                  value={areaName}
                  onChange={e => setAreaName(e.target.value)}
                  placeholder="Area 01 - Heavy Machining"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dây Chuyền (Production Line)</label>
                <input
                  type="text"
                  value={lineName}
                  onChange={e => setLineName(e.target.value)}
                  placeholder="Line 01 - Precision Milling"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Liên Kết Máy (Digital Twin Machine)</label>
                <select
                  value={machineId}
                  onChange={e => setMachineId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Chưa gán máy cụ thể --</option>
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name} ({m.line})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ghi Chú Mô Tả Vị Trí / Chức Năng</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Mô tả chức năng điều khiển của PLC này trong dây chuyền..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Enable Worker Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <div className="text-xs font-bold text-slate-200">Kích Hoạt Worker Giao Tiếp (Enable Background Polling)</div>
                <div className="text-[11px] text-slate-400">
                  Khi bật, SCADA engine sẽ duy trì luồng polling nền độc lập cho PLC này.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={e => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
            >
              {initialPlc ? 'Lưu Cấu Hình' : 'Khởi Tạo PLC Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
