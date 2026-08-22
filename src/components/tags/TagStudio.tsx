import React, { useState } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Database,
  Sliders,
  CheckCircle2,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';
import { Tag, TagDataType } from '../../types/scada';

export const TagStudio: React.FC = () => {
  const { tags, machines, plcs, addTag, updateTag, deleteTag, currentUser } = useScada();

  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    machineId: string;
    plcId: string;
    address: string;
    dataType: TagDataType;
    unit: string;
    scale: number;
    offset: number;
    scanIntervalMs: number;
    enableHistorian: boolean;
    historianRetentionDays: number;
  }>({
    name: '',
    description: '',
    machineId: machines[0]?.id || '',
    plcId: plcs[0]?.id || '',
    address: 'DM100',
    dataType: 'Float',
    unit: '°C',
    scale: 1,
    offset: 0,
    scanIntervalMs: 500,
    enableHistorian: true,
    historianRetentionDays: 30
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      machineId: machines[0]?.id || '',
      plcId: plcs[0]?.id || '',
      address: 'DM100',
      dataType: 'Float',
      unit: '°C',
      scale: 1,
      offset: 0,
      scanIntervalMs: 500,
      enableHistorian: true,
      historianRetentionDays: 30
    });
    setEditingTag(null);
    setIsCreating(true);
  };

  const handleOpenEdit = (tag: Tag) => {
    setFormData({
      name: tag.name,
      description: tag.description,
      machineId: tag.machineId,
      plcId: tag.plcId,
      address: tag.address,
      dataType: tag.dataType,
      unit: tag.unit,
      scale: tag.scale,
      offset: tag.offset,
      scanIntervalMs: tag.scanIntervalMs,
      enableHistorian: tag.enableHistorian,
      historianRetentionDays: tag.historianRetentionDays
    });
    setEditingTag(tag);
    setIsCreating(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      alert('Vui lòng nhập tên Tag và địa chỉ PLC.');
      return;
    }

    if (editingTag) {
      updateTag({
        ...editingTag,
        ...formData
      });
    } else {
      addTag(formData);
    }

    setIsCreating(false);
    setEditingTag(null);
  };

  const handleExportCsv = () => {
    const headers = 'ID,Name,Description,Machine,PLC,Address,DataType,Unit,ScanIntervalMs,Historian\n';
    const rows = tags.map(t =>
      `"${t.id}","${t.name}","${t.description}","${t.machineId}","${t.plcId}","${t.address}","${t.dataType}","${t.unit}",${t.scanIntervalMs},${t.enableHistorian}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HATSCADA_Tags_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Tags className="w-4 h-4" />
            <span>INDUSTRIAL TAG MANAGEMENT ENGINE</span>
          </div>
          <h1 className="text-xl font-black text-slate-100 mt-1">
            Quản Lý & Cấu Hình PLC Tags (Tag Studio)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cấu hình bộ nhớ thanh ghi PLC (Keyence DM/MR, Mitsubishi D/M, Siemens DB/MW, Modbus %MW)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Tag Mới</span>
          </button>
        </div>
      </div>

      {/* Tag List Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4">Tag Name</th>
                <th className="py-3 px-4">Machine & Line</th>
                <th className="py-3 px-4">PLC Controller</th>
                <th className="py-3 px-4">PLC Address</th>
                <th className="py-3 px-4">Data Type</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Scan Rate</th>
                <th className="py-3 px-4 text-center">Historian</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tags.map(tag => {
                const targetMachine = machines.find(m => m.id === tag.machineId);
                const targetPlc = plcs.find(p => p.id === tag.plcId);

                return (
                  <tr key={tag.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{tag.name}</div>
                      <div className="text-[11px] text-slate-400 font-sans">{tag.description}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-sans text-slate-300">
                        {targetMachine?.name || 'N/A'} ({targetMachine?.code})
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {targetPlc?.name}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 font-bold">
                        {tag.address}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {tag.dataType}
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {tag.unit || '—'}
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {tag.scanIntervalMs}ms
                    </td>

                    <td className="py-3 px-4 text-center">
                      {tag.enableHistorian ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                          {tag.historianRetentionDays}d Log
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">Disabled</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenEdit(tag)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                          title="Chỉnh sửa Tag"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa Tag ${tag.name}?`)) {
                              deleteTag(tag.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 transition-colors"
                          title="Xóa Tag"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Tag Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-slate-100">
                  {editingTag ? 'Chỉnh Sửa Cấu Hình Tag PLC' : 'Tạo Tag Công Nghiệp Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tag Name */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">
                    Tên Tag (Tag Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. CNC01.Spindle_RPM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">
                    Địa Chỉ Thanh Ghi PLC (Address) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="DM100, D500, DB1.DBD10, %MW100"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-400 font-mono font-bold focus:border-cyan-500 outline-none"
                  />
                </div>

                {/* Machine */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">
                    Gán vào Máy (Machine)
                  </label>
                  <select
                    value={formData.machineId}
                    onChange={e => setFormData({ ...formData, machineId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                  >
                    {machines.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.code} - {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PLC Controller */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">
                    Bộ Điều Khiển PLC (PLC Driver)
                  </label>
                  <select
                    value={formData.plcId}
                    onChange={e => setFormData({ ...formData, plcId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                  >
                    {plcs.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand} - {p.protocol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Data Type */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">
                    Kiểu Dữ Liệu (Data Type)
                  </label>
                  <select
                    value={formData.dataType}
                    onChange={e => setFormData({ ...formData, dataType: e.target.value as TagDataType })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                  >
                    <option value="Bool">Bool (1-bit Digital)</option>
                    <option value="Int">Int (16-bit Integer)</option>
                    <option value="DInt">DInt (32-bit Double Integer)</option>
                    <option value="Float">Float (32-bit IEEE 754)</option>
                    <option value="Double">Double (64-bit Real)</option>
                    <option value="String">String (ASCII Text)</option>
                  </select>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">
                    Đơn vị Đo (Engineering Unit)
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="°C, RPM, Bar, Pcs, kW, mm/s"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                  />
                </div>

                {/* Scan Interval */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">
                    Chu Kỳ Quét (Scan Interval)
                  </label>
                  <select
                    value={formData.scanIntervalMs}
                    onChange={e => setFormData({ ...formData, scanIntervalMs: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:border-cyan-500 outline-none"
                  >
                    <option value={100}>100 ms (High-Speed Motion)</option>
                    <option value={500}>500 ms (Standard Sensors)</option>
                    <option value={1000}>1000 ms (Counters / State)</option>
                    <option value={5000}>5000 ms (Slow Thermals)</option>
                  </select>
                </div>

                {/* Historian Retention */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">
                    Lưu Trữ Lịch Sử (Historian Retention)
                  </label>
                  <div className="flex items-center space-x-3 mt-2">
                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.enableHistorian}
                        onChange={e => setFormData({ ...formData, enableHistorian: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-700 text-cyan-500"
                      />
                      <span>Bật Historian Logging</span>
                    </label>

                    {formData.enableHistorian && (
                      <select
                        value={formData.historianRetentionDays}
                        onChange={e => setFormData({ ...formData, historianRetentionDays: Number(e.target.value) })}
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
                      >
                        <option value={7}>7 Ngày</option>
                        <option value={30}>30 Ngày</option>
                        <option value={365}>1 Năm</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">
                  Mô Tả Chức Năng (Description)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Cảm biến nhiệt độ trục chính Spindle CNC-01"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 cursor-pointer"
                >
                  {editingTag ? 'Cập Nhật Tag' : 'Lưu Tag Vào Hệ Thống'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
