import React, { useState } from 'react';
import {
  Server,
  Radio,
  Plus,
  RefreshCw,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Power,
  Trash2,
  Edit,
  Search,
  Filter,
  Layers,
  Sparkles,
  Grid,
  List,
  Cpu,
  ArrowDownUp,
  Tag as TagIcon
} from 'lucide-react';
import { PlcDevice, PlcBrand } from '../../types/scada';
import { useScada } from '../../context/ScadaContext';

interface PlcOverviewGridProps {
  onEditPlc: (plc: PlcDevice) => void;
  onPingPlc: (plc: PlcDevice) => void;
  onOpenAddModal: () => void;
  onSelectPlcDetail?: (plcId: string) => void;
}

export const PlcOverviewGrid: React.FC<PlcOverviewGridProps> = ({
  onEditPlc,
  onPingPlc,
  onOpenAddModal,
  onSelectPlcDetail
}) => {
  const {
    plcs,
    tags,
    reconnectPlc,
    disconnectPlc,
    togglePlcEnabled,
    deletePlc,
    addBatchPlcFleet,
    currentUser
  } = useScada();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [batchCount, setBatchCount] = useState<number>(5);
  const [batchBrand, setBatchBrand] = useState<PlcBrand>('Mitsubishi');
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Filtered PLCs
  const filteredPlcs = plcs.filter(plc => {
    if (selectedBrand !== 'all' && plc.brand !== selectedBrand) return false;
    if (selectedStatus !== 'all' && plc.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        plc.name.toLowerCase().includes(q) ||
        plc.ipAddress.toLowerCase().includes(q) ||
        plc.model.toLowerCase().includes(q) ||
        plc.protocol.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalConnected = plcs.filter(p => p.enabled && p.status === 'Connected').length;
  const totalPackets = plcs.reduce((acc, p) => acc + p.packetsSent, 0);
  const totalErrors = plcs.reduce((acc, p) => acc + p.errorCount, 0);
  const avgPing = plcs.length > 0 
    ? (plcs.reduce((acc, p) => acc + (p.lastPingMs || 0), 0) / plcs.length).toFixed(1)
    : '0';

  const handleAddBatch = () => {
    addBatchPlcFleet(batchCount, batchBrand);
    setShowBatchModal(false);
  };

  const getBrandBadgeColor = (brand: PlcBrand) => {
    switch (brand) {
      case 'Keyence':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Mitsubishi':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Siemens':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Modbus':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'OPC_UA':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Statistics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Total Managed PLCs</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black font-mono text-slate-100">{plcs.length}</span>
            <span className="text-xs text-emerald-400 font-bold">
              ({totalConnected} Online)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {plcs.length - totalConnected > 0 ? `${plcs.length - totalConnected} offline/disabled` : '100% Health Status'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Packets Exchanged (Tx/Rx)</span>
            <ArrowDownUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-100">
            {totalPackets.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Asynchronous multi-worker streaming
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Average Round-Trip Latency</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-emerald-400">{avgPing}</span>
            <span className="text-xs font-mono text-slate-400">ms</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Microsecond jitter-free response
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Total Associated Tags</span>
            <TagIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-100">
            {tags.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Mapped 1:1 to PLC memory blocks
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm PLC theo tên, IP, model..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={e => setSelectedBrand(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="all">Tất cả Hãng PLC</option>
            <option value="Keyence">Keyence KV</option>
            <option value="Mitsubishi">Mitsubishi (FX/Q/iQ-R)</option>
            <option value="Siemens">Siemens S7</option>
            <option value="Modbus">Modbus TCP</option>
            <option value="OPC_UA">OPC UA</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="Connected">Đang kết nối (Connected)</option>
            <option value="Connecting">Đang bắt tay (Connecting)</option>
            <option value="Disconnected">Mất kết nối (Disconnected)</option>
          </select>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
              title="Xem dạng Lưới Thẻ"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
              title="Xem dạng Bảng Mật Độ Cao"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Batch Fleet Scalability Button */}
          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mở Rộng Fleet (+5/10/25 PLCs)</span>
          </button>

          {/* Add PLC button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm PLC Mới</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlcs.map(plc => {
            const isOnline = plc.enabled && plc.status === 'Connected';
            const linkedTagsCount = tags.filter(t => t.plcId === plc.id).length;

            return (
              <div
                key={plc.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group"
              >
                {/* Header info */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                          {plc.name}
                        </h4>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {plc.ipAddress}:{plc.port}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getBrandBadgeColor(plc.brand)}`}>
                      {plc.brand}
                    </span>
                  </div>

                  {/* Model & Protocol details */}
                  <div className="mt-3.5 space-y-1 text-xs">
                    <div className="text-slate-300 font-medium truncate">{plc.model}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Giao thức: <strong className="text-slate-200">{plc.protocol}</strong></span>
                      <span>Scan rate: <strong className="text-cyan-400 font-mono">{plc.scanIntervalMs || 250}ms</strong></span>
                    </div>
                  </div>

                  {/* Telemetry Bar */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">RTT Latency</div>
                      <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                        {isOnline ? `${plc.lastPingMs} ms` : '--'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Packets Tx</div>
                      <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                        {plc.packetsSent.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Tags Thu Thập</div>
                      <div className="text-xs font-mono font-bold text-purple-400 mt-0.5">
                        {linkedTagsCount} Tags
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls & Quick Actions */}
                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                  {/* Status indicator & Enable toggle */}
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : (plc.status === 'Connecting' ? 'bg-amber-400 animate-ping' : 'bg-rose-500')}`} />
                    <span className="text-xs font-bold text-slate-300">
                      {plc.enabled ? plc.status : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Ping button */}
                    <button
                      onClick={() => onPingPlc(plc)}
                      title="Kiểm tra Ping mạng"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    </button>

                    {/* Enable / Disable worker */}
                    <button
                      onClick={() => togglePlcEnabled(plc.id)}
                      title={plc.enabled ? 'Vô hiệu hóa PLC worker' : 'Kích hoạt PLC worker'}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${plc.enabled ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    {/* Reconnect / Disconnect */}
                    {plc.status === 'Connected' ? (
                      <button
                        onClick={() => disconnectPlc(plc.id)}
                        title="Ngắt kết nối thử nghiệm"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-950/40 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => reconnectPlc(plc.id)}
                        title="Kết nối lại (Reconnect)"
                        className="p-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      onClick={() => onEditPlc(plc)}
                      title="Sửa cấu hình PLC"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc chắn muốn xóa PLC '${plc.name}'?`)) {
                          deletePlc(plc.id);
                        }
                      }}
                      title="Xóa PLC khỏi hệ thống"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">PLC Name</th>
                  <th className="px-4 py-3">Hãng / Loại</th>
                  <th className="px-4 py-3">IP Address : Port</th>
                  <th className="px-4 py-3">Giao thức</th>
                  <th className="px-4 py-3">Scan Rate</th>
                  <th className="px-4 py-3">RTT Latency</th>
                  <th className="px-4 py-3">Packets Tx</th>
                  <th className="px-4 py-3">Errors</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredPlcs.map(plc => {
                  const isOnline = plc.enabled && plc.status === 'Connected';
                  return (
                    <tr key={plc.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center space-x-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                          <span className={`text-[11px] font-bold ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {plc.enabled ? plc.status : 'Disabled'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-100">{plc.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getBrandBadgeColor(plc.brand)}`}>
                          {plc.brand}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-cyan-400">{plc.ipAddress}:{plc.port}</td>
                      <td className="px-4 py-2.5 text-slate-300">{plc.protocol}</td>
                      <td className="px-4 py-2.5 text-purple-400">{plc.scanIntervalMs || 250} ms</td>
                      <td className="px-4 py-2.5 text-emerald-400">{isOnline ? `${plc.lastPingMs} ms` : '--'}</td>
                      <td className="px-4 py-2.5 text-slate-200">{plc.packetsSent.toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <span className={plc.errorCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {plc.errorCount}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right space-x-1.5">
                        <button
                          onClick={() => onPingPlc(plc)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 cursor-pointer"
                        >
                          Ping
                        </button>
                        <button
                          onClick={() => onEditPlc(plc)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Xóa PLC '${plc.name}'?`)) deletePlc(plc.id);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950 text-rose-400 cursor-pointer"
                        >
                          Xóa
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

      {/* Batch Fleet Scalability Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Mở Rộng Fleet PLC Công Nghiệp Quy Mô Lớn
                </h3>
                <p className="text-xs text-slate-400">
                  Tự động sinh 5, 10, 25 đến 100+ PLCs với driver và tag tương ứng
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Số Lượng PLC Cần Thêm</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 25, 50].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setBatchCount(cnt)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${batchCount === cnt ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                    >
                      +{cnt} PLCs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Hãng & Giao Thức Mẫu</label>
                <select
                  value={batchBrand}
                  onChange={e => setBatchBrand(e.target.value as PlcBrand)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-medium"
                >
                  <option value="Mitsubishi">Mitsubishi MELSEC iQ-R (MC Protocol Port 5000)</option>
                  <option value="Keyence">Keyence KV-8000 (MC Protocol Port 8501)</option>
                  <option value="Siemens">Siemens S7-1500 (ISO-on-TCP Port 102)</option>
                  <option value="Modbus">Modbus TCP Gateway (Port 502)</option>
                  <option value="OPC_UA">OPC UA Industrial Server (Port 4840)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 text-[11px] text-purple-300">
                <strong>Khả năng mở rộng kiến trúc Clean Architecture:</strong>
                <p className="text-slate-400 mt-0.5">
                  Mỗi PLC được khởi tạo sẽ có địa chỉ IP riêng biệt, 2 Tag thu thập độc lập và luồng polling nền riêng biệt, chứng minh khả năng mở rộng không giới hạn của HATSCADA.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddBatch}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                Tạo Fleet {batchCount} PLCs Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
