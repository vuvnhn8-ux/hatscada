import React, { useState } from 'react';
import { useScada } from '../../context/ScadaContext';
import {
  FileText,
  Printer,
  Download,
  Bot,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    machines,
    alarmEvents,
    overallOee,
    plantPowerKw,
    plantOkRate,
    totalShiftProduction,
    currentUser
  } = useScada();

  const [shiftName, setShiftName] = useState('Ca 1 (06:00 - 14:00)');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [aiReportContent, setAiReportContent] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

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
        setAiReportContent('Không thể tạo báo cáo tự động.');
      }
    } catch (err) {
      console.error(err);
      setAiReportContent('Lỗi kết nối AI Backend Server. Vui lòng kiểm tra lại cấu hình API key.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <FileText className="w-4 h-4" />
            <span>EXECUTIVE INDUSTRIAL REPORTING STUDIO</span>
          </div>
          <h1 className="text-xl font-black text-slate-100 mt-1">
            Báo Cáo Sản Xuất & Bàn Giao Ca (Shift Handover Report)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng hợp dữ liệu OEE, sự cố dừng máy, sản lượng và tạo báo cáo AI tự động cho Ban Giám Đốc
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateAiReport}
            disabled={isGeneratingAi}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGeneratingAi ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isGeneratingAi ? 'Đang Tạo Báo Cáo AI...' : 'Tạo Báo Cáo Ca Với AI'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Report Customization Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">Ngày Báo Cáo:</span>
          <input
            type="date"
            value={reportDate}
            onChange={e => setReportDate(e.target.value)}
            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Ca Sản Xuất:</span>
          <select
            value={shiftName}
            onChange={e => setShiftName(e.target.value)}
            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200"
          >
            <option value="Ca 1 (06:00 - 14:00)">Ca 1 (06:00 - 14:00)</option>
            <option value="Ca 2 (14:00 - 22:00)">Ca 2 (14:00 - 22:00)</option>
            <option value="Ca 3 (22:00 - 06:00)">Ca 3 (22:00 - 06:00)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Người Lập:</span>
          <span className="text-cyan-400 font-bold">{currentUser.fullName || currentUser.name} ({currentUser.role})</span>
        </div>
      </div>

      {/* Printable Report Paper / Dashboard */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 max-w-5xl mx-auto">
        {/* Report Header */}
        <div className="border-b-2 border-slate-700 pb-4 flex items-start justify-between">
          <div>
            <div className="text-xs font-bold tracking-widest text-cyan-400 uppercase font-mono">
              HOANG AUTOMATION TECHNOLOGY SCADA (HATSCADA)
            </div>
            <h2 className="text-2xl font-black text-slate-100 mt-1">
              BÁO CÁO TỔNG HỢP VẬN HÀNH SẢN XUẤT
            </h2>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              {shiftName} • Ngày {reportDate} • Xưởng Tự Động Hóa Số 1
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-400">
            <div>MÃ BÁO CÁO: <strong className="text-slate-200">HAT-RPT-{reportDate.replace(/-/g, '')}-01</strong></div>
            <div>THỜI GIAN IN: {new Date().toLocaleTimeString('vi-VN')}</div>
          </div>
        </div>

        {/* AI Executive Summary Block (if generated) */}
        {aiReportContent && (
          <div className="p-5 rounded-xl bg-indigo-950/40 border border-indigo-700/60 text-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>TÓM TẮT ĐIỀU HÀNH TỰ ĐỘNG BẰNG AI (EXECUTIVE SUMMARY)</span>
            </div>
            <div className="text-xs leading-relaxed whitespace-pre-line font-sans text-slate-300">
              {aiReportContent}
            </div>
          </div>
        )}

        {/* KPI Numbers Matrix */}
        <div className="grid grid-cols-4 gap-3 text-center font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-500">HIỆU SUẤT OEE TOÀN XƯỞNG</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{overallOee}%</div>
            <div className="text-[10px] text-slate-500">Mục tiêu: 82%</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-500">TỔNG SẢN LƯỢNG CA</div>
            <div className="text-2xl font-black text-cyan-400 mt-1">{totalShiftProduction.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">Pcs đạt chuẩn</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-500">TỈ LỆ CHẤT LƯỢNG (OK RATE)</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">{plantOkRate}%</div>
            <div className="text-[10px] text-slate-500">Phế phẩm &lt; 2.5%</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-500">ĐIỆN NĂNG TIÊU THỤ</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{plantPowerKw * 8}</div>
            <div className="text-[10px] text-slate-500">kWh trong ca</div>
          </div>
        </div>

        {/* Machines Breakdown Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
            1. Tình Trạng Chi Tiết Các Máy & Dây Chuyền:
          </h3>
          <table className="w-full text-left text-xs font-mono border border-slate-800">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="p-2.5">Mã Máy</th>
                <th className="p-2.5">Tên Thiết Bị</th>
                <th className="p-2.5">Trạng Thái</th>
                <th className="p-2.5 text-right">Sản Lượng (OK/Total)</th>
                <th className="p-2.5 text-right">Nhiệt Độ TB</th>
                <th className="p-2.5">Người Vận Hành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {machines.map(m => (
                <tr key={m.id} className="hover:bg-slate-800/30">
                  <td className="p-2.5 font-bold text-cyan-400">{m.code}</td>
                  <td className="p-2.5 text-slate-200">{m.name}</td>
                  <td className="p-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      {m.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-right text-slate-200">{m.okCount} / {m.totalCount}</td>
                  <td className="p-2.5 text-right text-slate-300">{m.temperature}°C</td>
                  <td className="p-2.5 text-slate-400">{m.operatorName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Alarms & Incidents Log */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
            2. Danh Sách Sự Cố Cảnh Báo Ghi Nhận Trong Ca:
          </h3>
          <table className="w-full text-left text-xs font-mono border border-slate-800">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="p-2.5">Thời Gian</th>
                <th className="p-2.5">Mức Độ</th>
                <th className="p-2.5">Máy</th>
                <th className="p-2.5">Nội Dung Sự Cố</th>
                <th className="p-2.5">Xác Nhận Bởi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {alarmEvents.slice(0, 5).map(a => (
                <tr key={a.id}>
                  <td className="p-2.5 text-slate-400">{new Date(a.triggeredAt).toLocaleTimeString('vi-VN')}</td>
                  <td className="p-2.5 font-bold text-rose-400">{a.priority}</td>
                  <td className="p-2.5 text-slate-300">{a.machineName}</td>
                  <td className="p-2.5 text-slate-200">{a.message}</td>
                  <td className="p-2.5 text-slate-400">{a.acknowledgedBy || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Handover Signatures */}
        <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-8 text-center text-xs font-mono">
          <div>
            <div className="text-slate-400">TRƯỞNG CA BÀN GIAO</div>
            <div className="mt-12 text-slate-200 font-bold">{currentUser.fullName || currentUser.name}</div>
          </div>
          <div>
            <div className="text-slate-400">TRƯỞNG CA NHẬN BÀN GIAO</div>
            <div className="mt-12 text-slate-500">(Ký & Ghi rõ họ tên)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
